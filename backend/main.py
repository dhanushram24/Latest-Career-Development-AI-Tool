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
# More permissive CORS configuration for development
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Load environment variables
load_dotenv()

# Configure the Gemini API
genai_api_key = os.getenv('GEMINI_API_KEY')
if not genai_api_key:
    print("ERROR: Gemini API key not found in environment variables")
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

# Initialize Supabase client
supabase_client = supabase.create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

@app.route('/api/recommend-courses', methods=['POST'])
def recommend_courses():
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
            # Use Gemini API for course recommendations
            model = genai.GenerativeModel('gemini-1.0-pro')
            
            # Prepare the prompt for Gemini
            prompt = f"""
            Generate three course recommendations for someone with the following skill profile:
            
            Skill Name: {skill_data.get('Sub Category', 'Unknown')}
            Domain: {skill_data.get('Domain', 'Unknown')}
            Category: {skill_data.get('Category', 'Unknown')}
            Current Skill Level: {skill_data.get('Skill Rate', 0)}/5
            Interest Level: {skill_data.get('Interest Rate', 0)}/5
            
            For each course, provide:
            1. Title
            2. Provider (like Coursera, Udemy, Pluralsight, etc.)
            3. Description (2-3 sentences)
            4. Level (Beginner/Intermediate/Advanced based on current skill)
            5. Duration (in weeks)
            6. Rating (between 4.0 and 5.0)
            7. 3 features of the course
            8. Match score (between 0.7 and 0.98)
            
            Format the response as a valid JSON array with exactly 3 course objects. Return ONLY the JSON array with no additional text, markdown formatting, or explanation.
            
            The JSON structure should be exactly like this example:
            [
              {
                "title": "Course Title",
                "provider": "Provider Name",
                "description": "Course description.",
                "level": "Intermediate",
                "duration": "8 weeks",
                "rating": 4.7,
                "features": ["Feature 1", "Feature 2", "Feature 3"],
                "matchScore": 0.85
              }
            ]
            """
            
            print("Sending request to Gemini API")
            # Generate content with Gemini
            response = model.generate_content(prompt)
            print("Received response from Gemini API")
            
            # Extract the JSON from the response
            content = response.text
            print(f"Raw content: {content}")
            
            # Clean up the response if needed
            json_pattern = r'\[\s*\{.*\}\s*\]'
            json_match = re.search(json_pattern, content, re.DOTALL)
            
            if json_match:
                content = json_match.group(0)
            elif "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            try:
                # Parse the JSON
                parsed_content = json.loads(content)
                print(f"Successfully parsed JSON content with {len(parsed_content)} courses")
                
                # Return valid JSON response
                return jsonify(parsed_content)
            except json.JSONDecodeError as json_error:
                print(f"JSON decode error: {str(json_error)}")
                print(f"Problematic content: {content}")
                # Fall back to generated courses
                fallback_courses = generate_fallback_courses(skill_data)
                return jsonify(fallback_courses)
                
        except Exception as gemini_error:
            print(f"Gemini API error: {str(gemini_error)}")
            # Fall back to generated courses instead of returning an error
            fallback_courses = generate_fallback_courses(skill_data)
            return jsonify(fallback_courses)
            
    except Exception as e:
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        # Even in case of unexpected errors, try to return something useful
        try:
            fallback_courses = generate_fallback_courses({"Sub Category": "Skill"})
            return jsonify(fallback_courses)
        except:
            return jsonify({"error": str(e)}), 500
        
def generate_fallback_courses(skill_data):
    """Generate fallback course recommendations when Gemini API fails"""
    skill_name = skill_data.get('Sub Category', 'Skill')
    domain = skill_data.get('Domain', 'Technology')
    category = skill_data.get('Category', 'General')
    skill_level = skill_data.get('Skill Rate', 3)
    
    # Determine appropriate level
    level = "Beginner" if skill_level <= 2 else "Intermediate" if skill_level <= 3 else "Advanced"
    next_level = "Intermediate" if level == "Beginner" else "Advanced"
    
    # Generate courses based on skill data
    courses = [
        {
            "title": f"{skill_name} Fundamentals",
            "provider": "Coursera",
            "description": f"A comprehensive introduction to {skill_name} in the {domain} field. Learn the essential concepts and practices used by professionals.",
            "level": level,
            "duration": "6 weeks",
            "rating": 4.7,
            "features": ["Hands-on projects", "Expert instructors", "Flexible schedule"],
            "matchScore": 0.95
        },
        {
            "title": f"Advanced {skill_name} Techniques",
            "provider": "Udemy",
            "description": f"Take your {skill_name} skills to the next level with this advanced course. Master practical techniques used in real-world {category} scenarios.",
            "level": next_level,
            "duration": "8 weeks",
            "rating": 4.5,
            "features": ["Real-world case studies", "Project-based learning", "Career guidance"],
            "matchScore": 0.85
        },
        {
            "title": f"{skill_name} Professional Certification",
            "provider": "LinkedIn Learning",
            "description": f"Get certified in {skill_name} with this comprehensive program. Enhance your career prospects in the {domain} domain with industry-recognized credentials.",
            "level": level,
            "duration": "10 weeks",
            "rating": 4.8,
            "features": ["Industry certification", "Networking opportunities", "Job placement assistance"],
            "matchScore": 0.78
        }
    ]
    
    return courses

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)