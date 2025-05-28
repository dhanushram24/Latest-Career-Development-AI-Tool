from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import supabase
import json
import traceback
import re

app = Flask(__name__)
# More comprehensive CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"]
    }
})

# Load environment variables
load_dotenv()

# Configure the Gemini API
genai_api_key = os.getenv('GEMINI_API_KEY')
if not genai_api_key:
    print("WARNING: Gemini API key not found in environment variables")
else:
    genai.configure(api_key=genai_api_key)
    print(f"Gemini API key configured successfully")
    
    # Try to list available models to diagnose issues
    try:
        models = genai.list_models()
        print("Available Gemini models:")
        for model in models:
            print(f" - {model.name}")
    except Exception as e:
        print(f"Error listing models: {str(e)}")

# Configure Supabase connection
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if not supabase_url or not supabase_key:
    print("WARNING: Supabase credentials not found in environment variables")
    supabase_client = None
else:
    # Initialize Supabase client
    supabase_client = supabase.create_client(supabase_url, supabase_key)
    print("Supabase client configured successfully")

# Add health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "gemini_configured": bool(genai_api_key),
        "supabase_configured": bool(supabase_client)
    })

@app.route('/api/ai-assistant', methods=['POST', 'OPTIONS'])
def ai_assistant():
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    
    print("Received AI assistant request")
    
    try:
        request_data = request.json
        print(f"Request data: {request_data}")
        
        if not request_data:
            return jsonify({"error": "No request data provided"}), 400
        
        user_message = request_data.get('message', '')
        user_role = request_data.get('userRole', 'user')
        user_email = request_data.get('userEmail', '')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Fetch employee data from Supabase
        employee_data = fetch_employee_data()
        if not employee_data:
            return jsonify({
                "response": "Sorry, I couldn't fetch employee data at the moment. Please check your database connection and try again.",
                "data": None,
                "visualizations": None
            })
        
        # Check if Gemini API key is configured
        if not genai_api_key:
            print("Gemini API key not configured, using rule-based responses")
            response_data = handle_query_rule_based(user_message, employee_data, user_role)
            return jsonify(response_data)
        
        try:
            # Use enhanced Gemini API for intelligent responses
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Enhanced analysis prompt with visualization detection
            analysis_prompt = f"""
            You are an expert AI Career Assistant analyzing employee data queries. Your role is to understand user intent and determine if visualizations are needed.

            CONTEXT:
            - User Query: "{user_message}"
            - User Role: {user_role}
            - Available Employee Data: {len(employee_data)} employees
            - Data Fields: Name, Domain, Category, Sub Category (skill name), Skill Rate (1-5), Interest Rate (1-5), Access (admin/user), Email

            VISUALIZATION DETECTION:
            Check if the user is asking for:
            - Charts, graphs, plots, visualizations
            - Heatmaps, distribution analysis
            - Trends, patterns, comparisons
            - Statistical analysis, breakdowns
            - Keywords like: "show chart", "graph", "heatmap", "visualize", "plot", "distribution", "breakdown", "analysis"

            TASK: Analyze the user query and determine the exact type of analysis needed.

            QUERY TYPES TO CONSIDER:
            1. "top_performers" - Finding highest skilled employees
            2. "skill_search" - Looking for specific skills or technologies
            3. "domain_filter" - Filtering by domain/department
            4. "upskilling_needs" - Finding employees who need training (low skill + high interest)
            5. "skill_distribution" - Understanding skill spread across teams
            6. "general_info" - General questions about the workforce
            7. "employee_details" - Specific employee information
            8. "comparison" - Comparing skills, domains, or performance
            9. "recommendations" - Suggesting career paths or improvements
            10. "statistics" - Data analysis and trends
            11. "visualization_request" - User explicitly wants charts/graphs/heatmaps

            RESPONSE FORMAT:
            Return ONLY a valid JSON object with this exact structure:
            {{
                "query_type": "one_of_the_types_above",
                "needs_visualization": true_or_false,
                "visualization_type": "chart_type_if_needed", // Options: "bar_chart", "pie_chart", "line_chart", "heatmap", "scatter_plot", "radar_chart"
                "filters": {{
                    "domain": "exact_domain_name_if_mentioned",
                    "category": "category_if_specified",
                    "skill_name": "skill_or_technology_mentioned",
                    "min_skill_rate": minimum_skill_level_if_specified,
                    "max_skill_rate": maximum_skill_level_if_specified,
                    "min_interest_rate": minimum_interest_if_specified,
                    "access_level": "admin_or_user_if_specified"
                }},
                "limit": number_of_results_to_show,
                "sort_by": "field_to_sort_by",
                "sort_order": "asc_or_desc",
                "context": "brief_summary_of_what_user_wants"
            }}
            """
            
            analysis_response = model.generate_content(analysis_prompt)
            analysis_content = analysis_response.text.strip()
            
            # Clean up JSON response with better parsing
            analysis_result = clean_and_parse_json(analysis_content)
            
            if not analysis_result:
                print("Failed to parse analysis JSON, using rule-based approach")
                response_data = handle_query_rule_based(user_message, employee_data, user_role)
                return jsonify(response_data)
            
            print(f"Query analysis: {analysis_result}")
            
            # Process the query based on analysis
            processed_data = process_employee_query(employee_data, analysis_result)
            
            # Generate visualizations if requested
            visualizations = None
            if analysis_result.get('needs_visualization', False):
                visualizations = generate_visualizations(processed_data, analysis_result, employee_data)
            
            # Enhanced natural language response generation
            response_prompt = f"""
            You are a professional AI Career Assistant providing insights about employee data. Generate a helpful, conversational, and informative response.

            CONTEXT:
            - User asked: "{user_message}"
            - Query analysis: {analysis_result}
            - Results found: {len(processed_data)} employees
            - User role: {user_role}
            - Visualization generated: {bool(visualizations)}

            DATA SUMMARY:
            {generate_data_summary(processed_data, analysis_result)}

            INSTRUCTIONS:
            1. Start with a direct acknowledgment of what the user asked
            2. Provide key insights from the data
            3. Be conversational but professional
            4. Include relevant statistics or patterns
            5. If visualizations were generated, mention them
            6. Suggest follow-up questions if appropriate
            7. Keep response concise (2-4 sentences)
            8. Don't repeat the raw data - just insights and summary

            TONE: Helpful, professional, insightful

            Generate your response:
            """
            
            response_generation = model.generate_content(response_prompt)
            ai_response = response_generation.text.strip()
            
            return jsonify({
                "response": ai_response,
                "data": {"employees": processed_data} if processed_data else None,
                "visualizations": visualizations
            })
            
        except Exception as gemini_error:
            print(f"Gemini API error: {str(gemini_error)}")
            # Fall back to rule-based responses
            response_data = handle_query_rule_based(user_message, employee_data, user_role)
            return jsonify(response_data)
            
    except Exception as e:
        print(f"Error in AI assistant: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "response": "Sorry, I encountered an error while processing your request. Please try again.",
            "data": None,
            "visualizations": None
        }), 500

def generate_visualizations(processed_data, analysis_result, all_employee_data):
    """Generate visualization data based on the query and processed data"""
    try:
        visualization_type = analysis_result.get('visualization_type', 'bar_chart')
        visualizations = []
        
        if not processed_data and not all_employee_data:
            return None
        
        data_to_use = processed_data if processed_data else all_employee_data
        
        # Skill Distribution Bar Chart
        if visualization_type in ['bar_chart', 'chart']:
            skill_counts = {}
            for emp in data_to_use:
                skill = emp.get('Sub Category', 'Unknown')
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
            
            # Sort by count and take top 10
            top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            
            visualizations.append({
                "type": "bar_chart",
                "title": "Top Skills Distribution",
                "data": {
                    "labels": [skill for skill, count in top_skills],
                    "datasets": [{
                        "label": "Number of Employees",
                        "data": [count for skill, count in top_skills],
                        "backgroundColor": "rgba(59, 130, 246, 0.6)",
                        "borderColor": "rgba(59, 130, 246, 1)",
                        "borderWidth": 1
                    }]
                }
            })
        
        # Domain Distribution Pie Chart
        if visualization_type in ['pie_chart', 'chart'] or len(visualizations) < 2:
            domain_counts = {}
            for emp in data_to_use:
                domain = emp.get('Domain', 'Unknown')
                domain_counts[domain] = domain_counts.get(domain, 0) + 1
            
            visualizations.append({
                "type": "pie_chart",
                "title": "Domain Distribution",
                "data": {
                    "labels": list(domain_counts.keys()),
                    "datasets": [{
                        "data": list(domain_counts.values()),
                        "backgroundColor": [
                            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", 
                            "#9966FF", "#FF9F40", "#FF6384", "#C9CBCF"
                        ]
                    }]
                }
            })
        
        # Skill vs Interest Heatmap
        if visualization_type == 'heatmap' or 'heatmap' in analysis_result.get('context', '').lower():
            # Create skill-interest matrix
            skill_interest_matrix = {}
            for emp in data_to_use:
                skill_rate = emp.get('Skill Rate', 0)
                interest_rate = emp.get('Interest Rate', 0)
                key = f"{skill_rate},{interest_rate}"
                skill_interest_matrix[key] = skill_interest_matrix.get(key, 0) + 1
            
            heatmap_data = []
            for skill in range(1, 6):
                row = []
                for interest in range(1, 6):
                    count = skill_interest_matrix.get(f"{skill},{interest}", 0)
                    row.append(count)
                heatmap_data.append(row)
            
            visualizations.append({
                "type": "heatmap",
                "title": "Skill vs Interest Level Heatmap",
                "data": {
                    "matrix": heatmap_data,
                    "xLabels": ["1", "2", "3", "4", "5"],
                    "yLabels": ["1", "2", "3", "4", "5"],
                    "xTitle": "Interest Level",
                    "yTitle": "Skill Level"
                }
            })
        
        # Skill Level Distribution
        if len(visualizations) < 3:
            skill_levels = {}
            for emp in data_to_use:
                level = emp.get('Skill Rate', 0)
                skill_levels[f"Level {level}"] = skill_levels.get(f"Level {level}", 0) + 1
            
            visualizations.append({
                "type": "radar_chart",
                "title": "Skill Level Distribution",
                "data": {
                    "labels": ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
                    "datasets": [{
                        "label": "Number of Employees",
                        "data": [
                            skill_levels.get("Level 1", 0),
                            skill_levels.get("Level 2", 0),
                            skill_levels.get("Level 3", 0),
                            skill_levels.get("Level 4", 0),
                            skill_levels.get("Level 5", 0)
                        ],
                        "backgroundColor": "rgba(34, 197, 94, 0.2)",
                        "borderColor": "rgba(34, 197, 94, 1)",
                        "pointBackgroundColor": "rgba(34, 197, 94, 1)",
                        "borderWidth": 2
                    }]
                }
            })
        
        return visualizations if visualizations else None
        
    except Exception as e:
        print(f"Error generating visualizations: {str(e)}")
        return None

def clean_and_parse_json(content):
    """Enhanced JSON parsing with multiple fallback strategies"""
    try:
        # Strategy 1: Direct JSON parsing
        return json.loads(content)
    except:
        pass
    
    try:
        # Strategy 2: Extract JSON from markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        return json.loads(content)
    except:
        pass
    
    try:
        # Strategy 3: Find JSON pattern with regex
        json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
        json_match = re.search(json_pattern, content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
    except:
        pass
    
    # Strategy 4: Return None if all parsing fails
    return None

def generate_data_summary(data, analysis_result):
    """Generate a summary of the processed data for better context"""
    if not data:
        return "No employees found matching the criteria."
    
    summary_parts = []
    
    # Basic count
    summary_parts.append(f"Found {len(data)} employees")
    
    # Domain distribution if relevant
    domains = {}
    skill_rates = []
    interest_rates = []
    
    for emp in data:
        domain = emp.get('Domain', 'Unknown')
        domains[domain] = domains.get(domain, 0) + 1
        skill_rates.append(emp.get('Skill Rate', 0))
        interest_rates.append(emp.get('Interest Rate', 0))
    
    if len(domains) > 1:
        top_domain = max(domains, key=domains.get)
        summary_parts.append(f"Most from {top_domain} ({domains[top_domain]} employees)")
    
    # Skill statistics
    if skill_rates:
        avg_skill = sum(skill_rates) / len(skill_rates)
        summary_parts.append(f"Average skill rating: {avg_skill:.1f}/5")
    
    return ". ".join(summary_parts)

def process_employee_query(employee_data, analysis_result):
    """Enhanced employee data processing with better filtering and sorting"""
    try:
        query_type = analysis_result.get('query_type', 'general_info')
        filters = analysis_result.get('filters', {})
        limit = analysis_result.get('limit', 10)
        sort_by = analysis_result.get('sort_by', 'Skill Rate')
        sort_order = analysis_result.get('sort_order', 'desc')
        
        # Start with all data
        filtered_data = employee_data.copy()
        
        # Apply filters with fuzzy matching
        if filters.get('domain'):
            domain_filter = filters['domain'].lower()
            filtered_data = [emp for emp in filtered_data 
                           if domain_filter in emp.get('Domain', '').lower()]
        
        if filters.get('category'):
            category_filter = filters['category'].lower()
            filtered_data = [emp for emp in filtered_data 
                           if category_filter in emp.get('Category', '').lower()]
        
        if filters.get('skill_name'):
            skill_filter = filters['skill_name'].lower()
            filtered_data = [emp for emp in filtered_data 
                           if (skill_filter in emp.get('Sub Category', '').lower() or
                               skill_filter in emp.get('Category', '').lower() or
                               skill_filter in emp.get('Domain', '').lower())]
        
        if filters.get('min_skill_rate'):
            min_skill = filters['min_skill_rate']
            filtered_data = [emp for emp in filtered_data 
                           if emp.get('Skill Rate', 0) >= min_skill]
        
        if filters.get('max_skill_rate'):
            max_skill = filters['max_skill_rate']
            filtered_data = [emp for emp in filtered_data 
                           if emp.get('Skill Rate', 0) <= max_skill]
        
        if filters.get('min_interest_rate'):
            min_interest = filters['min_interest_rate']
            filtered_data = [emp for emp in filtered_data 
                           if emp.get('Interest Rate', 0) >= min_interest]
        
        if filters.get('access_level'):
            access_filter = filters['access_level'].lower()
            filtered_data = [emp for emp in filtered_data 
                           if emp.get('Access', '').lower() == access_filter]
        
        # Apply query-specific logic
        if query_type == 'top_performers':
            filtered_data.sort(key=lambda x: (x.get('Skill Rate', 0), x.get('Interest Rate', 0)), reverse=True)
        elif query_type == 'upskilling_needs':
            # High interest but lower skill
            filtered_data = [emp for emp in filtered_data 
                           if emp.get('Skill Rate', 0) <= 3 and emp.get('Interest Rate', 0) >= 3]
            filtered_data.sort(key=lambda x: (x.get('Interest Rate', 0), -x.get('Skill Rate', 0)), reverse=True)
        elif query_type == 'skill_search':
            filtered_data.sort(key=lambda x: x.get('Skill Rate', 0), reverse=True)
        else:
            # Default sorting based on analysis
            if sort_by in ['Skill Rate', 'Interest Rate']:
                filtered_data.sort(key=lambda x: x.get(sort_by, 0), reverse=(sort_order == 'desc'))
            else:
                filtered_data.sort(key=lambda x: str(x.get(sort_by, '')), reverse=(sort_order == 'desc'))
        
        # Apply limit
        return filtered_data[:limit]
        
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        return employee_data[:10]  # Return first 10 as fallback

def fetch_employee_data():
    """Fetch all employee data from Supabase"""
    try:
        if not supabase_client:
            print("Supabase client not configured")
            return get_sample_employee_data()
            
        response = supabase_client.table('dhanush').select('*').execute()
        
        if response.data:
            print(f"Fetched {len(response.data)} employee records")
            return response.data
        else:
            print("No employee data found")
            return get_sample_employee_data()
            
    except Exception as e:
        print(f"Error fetching employee data: {str(e)}")
        return get_sample_employee_data()

def get_sample_employee_data():
    """Return sample employee data for testing when database is not available"""
    return [
        {
            "Name": "John Doe",
            "Domain": "Data Science",
            "Category": "Programming",
            "Sub Category": "Python",
            "Skill Rate": 4,
            "Interest Rate": 5,
            "Access": "user",
            "Email": "john.doe@example.com"
        },
        {
            "Name": "Jane Smith",
            "Domain": "Web Development",
            "Category": "Frontend",
            "Sub Category": "React",
            "Skill Rate": 5,
            "Interest Rate": 4,
            "Access": "user",
            "Email": "jane.smith@example.com"
        },
        {
            "Name": "Mike Johnson",
            "Domain": "Data Science",
            "Category": "Machine Learning",
            "Sub Category": "TensorFlow",
            "Skill Rate": 3,
            "Interest Rate": 5,
            "Access": "admin",
            "Email": "mike.johnson@example.com"
        },
        {
            "Name": "Sarah Wilson",
            "Domain": "Web Development",
            "Category": "Backend",
            "Sub Category": "Node.js",
            "Skill Rate": 4,
            "Interest Rate": 3,
            "Access": "user",
            "Email": "sarah.wilson@example.com"
        },
        {
            "Name": "David Brown",
            "Domain": "AI",
            "Category": "Deep Learning",
            "Sub Category": "PyTorch",
            "Skill Rate": 5,
            "Interest Rate": 5,
            "Access": "admin",
            "Email": "david.brown@example.com"
        },
        {
            "Name": "Lisa Garcia",
            "Domain": "Data Science",
            "Category": "Analytics",
            "Sub Category": "Power BI",
            "Skill Rate": 2,
            "Interest Rate": 4,
            "Access": "user",
            "Email": "lisa.garcia@example.com"
        },
        {
            "Name": "Tom Anderson",
            "Domain": "Web Development",
            "Category": "Full Stack",
            "Sub Category": "Angular",
            "Skill Rate": 3,
            "Interest Rate": 3,
            "Access": "user",
            "Email": "tom.anderson@example.com"
        }
    ]

def handle_query_rule_based(user_message, employee_data, user_role):
    """Enhanced rule-based query handling with better pattern matching"""
    message_lower = user_message.lower()
    
    # Check for visualization keywords
    viz_keywords = ['chart', 'graph', 'heatmap', 'visualize', 'plot', 'distribution', 'breakdown']
    needs_viz = any(keyword in message_lower for keyword in viz_keywords)
    
    # Top performers query
    if any(keyword in message_lower for keyword in ['top', 'best', 'highest', 'skilled', 'performer', 'excellent']):
        sorted_data = sorted(employee_data, key=lambda x: (x.get('Skill Rate', 0), x.get('Interest Rate', 0)), reverse=True)
        limited_data = sorted_data[:10]
        
        visualizations = None
        if needs_viz:
            visualizations = generate_visualizations(limited_data, {'visualization_type': 'bar_chart'}, employee_data)
        
        return {
            "response": f"Here are the top {len(limited_data)} employees with the highest skill ratings. These employees have demonstrated excellent proficiency in their respective domains and show strong engagement.",
            "data": {"employees": limited_data},
            "visualizations": visualizations
        }
    
    # Default response with visualization if requested
    response_data = {
        "response": f"I found {len(employee_data)} employees in our database. I can help you find specific skills, identify top performers, or suggest training opportunities. Try being more specific about what you're looking for!",
        "data": {"employees": employee_data[:5]}
    }
    
    if needs_viz:
        response_data["visualizations"] = generate_visualizations(employee_data[:20], {'visualization_type': 'bar_chart'}, employee_data)
    
    return response_data

@app.route('/api/recommend-courses', methods=['POST', 'OPTIONS'])
def recommend_courses():
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    print("Received request for course recommendations")
    
    try:
        skill_data = request.json
        print(f"Request data: {skill_data}")
        
        if not skill_data:
            print("No skill data provided")
            return jsonify({"error": "No skill data provided"}), 400
        
        # Check if Gemini API key is configured
        if not genai_api_key:
            print("Gemini API key not configured, using fallback recommendations")
            fallback_courses = generate_fallback_courses(skill_data)
            return jsonify(fallback_courses)
        
        try:
            # Enhanced course recommendation with Gemini
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Enhanced prompt for better course recommendations
            prompt = f"""
            You are an expert learning and development consultant. Generate exactly 3 personalized course recommendations based on the following employee profile:

            EMPLOYEE PROFILE:
            - Skill: {skill_data.get('Sub Category', 'Unknown')}
            - Domain: {skill_data.get('Domain', 'Unknown')}
            - Category: {skill_data.get('Category', 'Unknown')}
            - Current Skill Level: {skill_data.get('Skill Rate', 0)}/5
            - Interest Level: {skill_data.get('Interest Rate', 0)}/5

            REQUIREMENTS:
            1. Courses should be progressive (beginner to advanced based on current skill level)
            2. Mix different providers (Coursera, Udemy, Pluralsight, LinkedIn Learning, edX)
            3. Include practical, hands-on courses
            4. Consider current industry trends and demands
            5. Match the employee's interest level and career progression

            COURSE STRUCTURE (return exactly this JSON format):
            [
              {{
                "title": "Specific and descriptive course title",
                "provider": "Well-known platform name",
                "description": "2-3 sentences describing course content and benefits",
                "level": "Beginner/Intermediate/Advanced",
                "duration": "X weeks",
                "rating": 4.X (between 4.0-5.0),
                "features": ["Practical feature 1", "Practical feature 2", "Practical feature 3"],
                "matchScore": 0.XX (between 0.75-0.98, higher for better matches)
              }}
            ]

            IMPORTANT: Return ONLY the JSON array. No additional text, explanations, or markdown formatting.
            """
            
            print("Sending enhanced request to Gemini API")
            response = model.generate_content(prompt)
            print("Received response from Gemini API")
            
            # Enhanced JSON parsing
            content = response.text
            print(f"Raw content: {content}")
            
            parsed_content = clean_and_parse_json(content)
            
            if parsed_content and isinstance(parsed_content, list) and len(parsed_content) >= 3:
                print(f"Successfully parsed {len(parsed_content)} course recommendations")
                return jsonify(parsed_content[:3])  # Ensure exactly 3 courses
            else:
                print("Failed to parse valid course JSON, using fallback")
                fallback_courses = generate_fallback_courses(skill_data)
                return jsonify(fallback_courses)
                
        except Exception as gemini_error:
            print(f"Gemini API error: {str(gemini_error)}")
            fallback_courses = generate_fallback_courses(skill_data)
            return jsonify(fallback_courses)
            
    except Exception as e:
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        try:
            fallback_courses = generate_fallback_courses({"Sub Category": "General Skills"})
            return jsonify(fallback_courses)
        except:
            return jsonify({"error": str(e)}), 500
        
def generate_fallback_courses(skill_data):
    """Enhanced fallback course recommendations"""
    skill_name = skill_data.get('Sub Category', 'Professional Skills')
    domain = skill_data.get('Domain', 'Technology')
    category = skill_data.get('Category', 'General')
    skill_level = skill_data.get('Skill Rate', 3)
    interest_level = skill_data.get('Interest Rate', 3)
    
    # Determine appropriate levels
    if skill_level <= 2:
        levels = ["Beginner", "Intermediate", "Intermediate"]
    elif skill_level <= 3:
        levels = ["Intermediate", "Advanced", "Advanced"]
    else:
        levels = ["Advanced", "Expert", "Specialized"]
    
    # Calculate match scores based on interest and skill gap
    base_score = 0.75 + (interest_level * 0.04)
    
    courses = [
        {
            "title": f"Complete {skill_name} Mastery Course",
            "provider": "Coursera",
            "description": f"Master {skill_name} from fundamentals to advanced applications in {domain}. This comprehensive course includes hands-on projects and real-world case studies to build practical expertise.",
            "level": levels[0],
            "duration": "8 weeks",
            "rating": 4.7,
            "features": ["Hands-on projects", "Industry mentors", "Certificate of completion"],
            "matchScore": round(base_score + 0.15, 2)
        },
        {
            "title": f"Professional {skill_name} for {category}",
            "provider": "Udemy",
            "description": f"Advance your {skill_name} skills with this professional-grade course designed for {category} specialists. Learn industry best practices and cutting-edge techniques.",
            "level": levels[1],
            "duration": "6 weeks",
            "rating": 4.5,
            "features": ["Real-world projects", "Lifetime access", "Expert instructor"],
            "matchScore": round(base_score + 0.08, 2)
        },
        {
            "title": f"{skill_name} Certification Program",
            "provider": "LinkedIn Learning",
            "description": f"Get certified in {skill_name} with this comprehensive program. Boost your career prospects with industry-recognized credentials and practical skills.",
            "level": levels[2],
            "duration": "10 weeks",
            "rating": 4.8,
            "features": ["Industry certification", "Career guidance", "Networking opportunities"],
            "matchScore": round(base_score, 2)
        }
    ]
    
    return courses

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Enhanced Flask server on port {port}")
    print(f"CORS enabled for frontend URLs")
    print(f"Health check available at: http://localhost:{port}/api/health")
    app.run(host='0.0.0.0', port=port, debug=True)