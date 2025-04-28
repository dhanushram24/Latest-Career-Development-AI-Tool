from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from ijp import JobMatchingSystem
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the job matching system
matcher = JobMatchingSystem()

@app.route('/api/extract-skills', methods=['POST'])
def extract_skills():
    """Extract skills from uploaded job description PDF"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and file.filename.endswith('.pdf'):
        # Save the uploaded file to a temporary location
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, file.filename)
        file.save(temp_path)
        
        try:
            # Extract text from PDF
            jd_text = matcher.extract_text_from_pdf(temp_path)
            
            if jd_text is None or jd_text.strip() == "":
                return jsonify({'error': 'Failed to extract text from the PDF or the PDF is empty'}), 400
            
            # Extract skills from job description
            required_skills = matcher.extract_skills_from_jd(jd_text)
            
            # Clean up temporary file
            os.remove(temp_path)
            os.rmdir(temp_dir)
            
            # Get job title and department from the text if possible
            job_title = "Unknown"
            department = "Unknown"
            
            lines = jd_text.split('\n')
            for i, line in enumerate(lines):
                if "Role Title:" in line or "Job Title:" in line:
                    job_title = line.replace("Role Title:", "").replace("Job Title:", "").strip()
                if "Team:" in line or "Department:" in line:
                    department = line.replace("Team:", "").replace("Department:", "").strip()
            
            return jsonify({
                'jobTitle': job_title,
                'department': department,
                'requiredSkills': required_skills
            })
            
        except Exception as e:
            print(f"Error processing file: {str(e)}")
            traceback.print_exc()  # Print the full traceback for debugging
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file format. Only PDF files are accepted.'}), 400

@app.route('/api/fetch-employees', methods=['GET'])
def fetch_employees():
    """Fetch all employee skills from the database"""
    try:
        # Fetch employee skills
        raw_employees_data = matcher.fetch_employee_skills()
        
        if raw_employees_data is None:
            return jsonify({'error': 'Failed to fetch employee data'}), 500
        
        # Check if raw_employees_data is a DataFrame
        if not hasattr(raw_employees_data, 'to_dict'):
            return jsonify({'error': 'Employee data is not in expected format'}), 500
        
        # Convert DataFrame to list of dictionaries
        employees_list = raw_employees_data.to_dict('records')
        
        return jsonify({'employees': employees_list})
        
    except Exception as e:
        print(f"Error fetching employees: {str(e)}")
        traceback.print_exc()  # Print the full traceback for debugging
        return jsonify({'error': f'Error fetching employees: {str(e)}'}), 500

@app.route('/api/match-employees', methods=['POST'])
def match_employees():
    """Match employees to job requirements"""
    try:
        data = request.json
        if not data or 'requiredSkills' not in data:
            return jsonify({'error': 'No required skills provided'}), 400
        
        required_skills = data['requiredSkills']
        min_skill_rating = data.get('minSkillRating', 3)  # Default to 3 if not provided
        
        # Fetch employee skills
        raw_employees_data = matcher.fetch_employee_skills()
        
        if raw_employees_data is None:
            return jsonify({'error': 'Failed to fetch employee data'}), 500
        
        # Process and structure employee data
        structured_employee_data = matcher.process_and_structure_employee_data(raw_employees_data)
        
        if not structured_employee_data:
            return jsonify({'error': 'Failed to process employee data'}), 500
        
        # Match employees using Gemini
        matched_employees = matcher.match_employees_with_gemini(required_skills, structured_employee_data)
        
        if matched_employees is None:
            return jsonify({'error': 'Failed to match employees'}), 500
        
        # Get reverse mapping for real names
        id_to_name = matcher.get_reverse_mapping()
        
        # Transform the response to match frontend expectations
        formatted_matches = []
        for employee in matched_employees:
            emp_id = employee.get('employee_id', 'Unknown')
            real_name = id_to_name.get(emp_id, "Unknown")
            
            # Process matching skills
            matching_skills = []
            for skill in employee.get('matching_skills', []):
                if isinstance(skill, dict):
                    matching_skills.append({
                        'skill': skill.get('skill', ''),
                        'rating': skill.get('skill_rate', 3),
                        'matchConfidence': 1.0,  # Default confidence
                        'interestRate': skill.get('interest_rate', 3)
                    })
                else:
                    # If skill is just a string
                    matching_skills.append({
                        'skill': skill,
                        'rating': 3,  # Default rating
                        'matchConfidence': 1.0,  # Default confidence
                        'interestRate': 3  # Default interest
                    })
            
            # Filter out employees that don't meet the minimum skill rating
            valid_skills = [s for s in matching_skills if s['rating'] >= min_skill_rating]
            
            # Only include employees with at least one valid skill
            if valid_skills:
                formatted_matches.append({
                    'name': real_name,
                    'id': emp_id,
                    'matchedSkills': valid_skills,
                    'missingSkills': employee.get('missing_skills', []),
                    'overallMatch': employee.get('match_score', 0)
                })
        
        return jsonify({'matches': formatted_matches})
        
    except Exception as e:
        print(f"Error matching employees: {str(e)}")
        traceback.print_exc()  # Print the full traceback for debugging
        return jsonify({'error': f'Error matching employees: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)