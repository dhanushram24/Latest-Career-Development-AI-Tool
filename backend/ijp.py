import os
import sys
import PyPDF2
from supabase import create_client
import google.generativeai as genai
from dotenv import load_dotenv
import pandas as pd
import json
import uuid
import hashlib
import traceback
 
# Load environment variables
load_dotenv()
 
# Configure Google Generative AI (Gemini)
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    print("Error: GOOGLE_API_KEY environment variable not set")
    sys.exit(1)
 
genai.configure(api_key=GOOGLE_API_KEY)
 
# Configure Supabase
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase environment variables not set")
    sys.exit(1)
 
# Initialize Supabase client
try:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    sys.exit(1)
 
class JobMatchingSystem:
    def __init__(self):
        try:
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            self.employees_data = None
            self.employee_mapping = {}  # To store employee_id -> real name mapping
            self.processed_data_file = "employee_skills_processed.json"
            self.final = "employee_score.json"
            print("JobMatchingSystem initialized successfully")
        except Exception as e:
            print(f"Error initializing JobMatchingSystem: {e}")
            traceback.print_exc()
   
    def extract_text_from_pdf(self, file_path):
        """Extract text content from a PDF file."""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            traceback.print_exc()
            return None
   
    def fetch_employee_skills(self):
        """Fetch employee skills data from Supabase."""
        try:
            print("Fetching employee skills...")
            # Fetch employee skills from the skill_matrix table
            response = supabase_client.table('dhanush').select('*').execute()
            
            if hasattr(response, 'data') and response.data:
                # Convert to DataFrame for easier manipulation
                df = pd.DataFrame(response.data)
                print(f"Successfully fetched {len(df)} employee skills records")
                return df
            else:
                print("No employee skills data found in Supabase")
                return pd.DataFrame()  # Return an empty DataFrame instead of None
        except Exception as e:
            print(f"Error fetching employee skills: {e}")
            traceback.print_exc()
            return pd.DataFrame()  # Return an empty DataFrame on error
    
    def generate_employee_id(self, name):
        """Generate a unique ID for each employee based on their name."""
        if not name:
            print("Warning: Empty name provided to generate_employee_id")
            return f"EMP_UNKNOWN_{uuid.uuid4().hex[:6]}"
            
        if name not in self.employee_mapping:
            # Create a deterministic but anonymized ID using hash
            hash_obj = hashlib.md5(name.encode())
            short_hash = hash_obj.hexdigest()[:8]
            employee_id = f"EMP_{short_hash}"
            self.employee_mapping[name] = employee_id
        
        return self.employee_mapping[name]
    
    def process_and_structure_employee_data(self, employees_data):
        """ Process employee data into a structured format and anonymize. Updated structure: {employee_id: {domain: {category: {subcategory: {skill_rate: X, interest_rate: Y}}}}}}"""
        try:
            structured_data = {}
            
            if employees_data.empty:
                print("Warning: Empty employee data provided")
                return {}
                
            # Group by employee
            for _, row in employees_data.iterrows():
                # Check if the Name column exists
                if "Name" not in row:
                    print(f"Warning: 'Name' column missing in row: {row}")
                    continue
                    
                name = row["Name"]
                employee_id = self.generate_employee_id(name)
                
                if employee_id not in structured_data:
                    structured_data[employee_id] = {}
                
                # Check for required columns
                required_columns = ["Domain", "Category", "Sub Category", "Skill Rate", "Interest Rate"]
                if not all(col in row for col in required_columns):
                    print(f"Warning: Missing required columns in row: {row}")
                    continue
                
                domain = row["Domain"]
                category = row["Category"]
                subcategory = row["Sub Category"]
                skill_rate = row["Skill Rate"]
                interest_rate = row["Interest Rate"]
                
                # Create nested structure
                if domain not in structured_data[employee_id]:
                    structured_data[employee_id][domain] = {}
                
                if category not in structured_data[employee_id][domain]:
                    structured_data[employee_id][domain][category] = {}
                
                if subcategory not in structured_data[employee_id][domain][category]:
                    structured_data[employee_id][domain][category][subcategory] = {}
                
                # Add skill with its ratings
                structured_data[employee_id][domain][category][subcategory] = {
                    "skill_rate": skill_rate,
                    "interest_rate": interest_rate
                }
            
            # Save to file
            with open(self.processed_data_file, 'w') as f:
                json.dump(structured_data, f, indent=2)
            
            print(f"Processed employee data saved to {self.processed_data_file}")
            return structured_data
        except Exception as e:
            print(f"Error processing employee data: {e}")
            traceback.print_exc()
            return {}
    
    def get_reverse_mapping(self):
        """Get mapping from employee_id back to real name."""
        try:
            return {v: k for k, v in self.employee_mapping.items()}
        except Exception as e:
            print(f"Error getting reverse mapping: {e}")
            return {}
   
    def extract_skills_from_jd(self, jd_text):
        """
        Use Gemini to extract required skills from job description.
        Returns a list of skills or raises an exception if skills cannot be extracted.
        """
        output="""{
  "Skills": [
    {
      "Domain": "Cloud Computing",
      "Category": "Practice and Technologies",
      "Sub-category": "Cloud Platforms",
      "Skill_Description": "Experience with cloud platforms like Azure and GCP."
    },{...},
    ...
    ]
    }
    """

        prompt = f"""
        Extract the following key technical skills, tools, and technologies from the job description. Return the output strictly in JSON format, with no additional explanation or text.

        - Categorize the skills as 'Practice and Technologies' or 'Tools and Platforms.'
        - For each skill, include the following fields:
            - "Domain" (e.g., Data Engineering, DevOps, Cloud Computing)
            - "Category" (e.g., Practice and Technologies, Tools and Platforms)
            - "Sub-category" (same as Skill_Name)
            - "Skill_Description" (a short description of what the skill entails, if available)

        The job description is as follows:
        {jd_text}

        output format: {output}

        Only return the JSON output. Do not include any other text, explanations, or instructions.
        """

        try:
            print("Extracting skills from job description...")
            response = self.model.generate_content(prompt)
            print("Received response from Gemini")
            
            skills_text = response.text.strip()
            if not skills_text:
                raise ValueError("Empty response received from Gemini.")

            # Clean up the response to ensure it's valid JSON
            skills_text = skills_text.replace('```json', '').replace('```', '').strip()

            # Parse the JSON response
            skills_data = json.loads(skills_text)

            # Check if the expected "Skills" key is present in the response
            if "Skills" not in skills_data:
                raise ValueError("Skills data not found in the response")

            skills = skills_data["Skills"]  # Extract the list of skills

            if not skills or not isinstance(skills, list) or len(skills) == 0:
                raise ValueError("No skills were extracted from the job description")

            # Validate the structure of each skill entry
            for skill in skills:
                if not isinstance(skill, dict):
                    raise ValueError("Invalid skill format: skill entries must be dictionaries")
                if "Domain" not in skill or "Category" not in skill or "Sub-category" not in skill or "Skill_Description" not in skill:
                    raise ValueError("Invalid skill format: missing required fields")
            
            print(f"Successfully extracted {len(skills)} skills")
            return skills
        except Exception as e:
            print(f"Error extracting skills with Gemini: {str(e)}")
            traceback.print_exc()
            raise RuntimeError(f"Failed to extract skills from job description: {str(e)}")
    
    def match_employees_with_gemini(self, required_skills, structured_employee_data, batch_size=None):
        """Match employees based on their skills."""
        try:
            if not structured_employee_data:
                print("No employee data available for matching.")
                return []

            # Set batch size
            if batch_size is None:
                batch_size = len(structured_employee_data)
            
            all_results = []

            # Process the employee data in batches
            items = list(structured_employee_data.items())
            for i in range(0, len(items), batch_size):
                employee_batch = dict(items[i:i + batch_size])

                # Process this batch with Gemini
                matches = self._process_employee_batch(required_skills, employee_batch)
                if matches:  # Only append if matches is not None or empty
                    all_results.extend(matches)

            if not all_results:
                print("No matching results found")
                return []

            # Sort results by match_score
            sorted_results = sorted(all_results, key=lambda x: x.get('match_score', 0), reverse=True)

            # Save all sorted results to a file
            with open(self.final, 'w') as f:
                json.dump(sorted_results, f, indent=2)

            print(f"Successfully matched {len(sorted_results)} employees")
            return sorted_results
        except Exception as e:
            print(f"Error matching employees: {e}")
            traceback.print_exc()
            return []

    def _process_employee_batch(self, required_skills, employee_batch):
        """Process a single batch of employees."""
        try:
            if not required_skills or not employee_batch:
                print("Warning: Empty required skills or employee batch")
                return []
                
            required_skills_json = json.dumps(required_skills)
            employee_batch_json = json.dumps(employee_batch)
            employee_data = """{
                employee_id: {
                    domain: {
                        category: {
                            subcategory: {
                                skill_rate: X, interest_rate: Y
                            }
                        }
                    }
                }
            }"""
            output_structure = """
            {
                "employee_id": "EMP_ID",
                "match_score": 85.5 (example),
                "matching_skills": [
                    {"skill": "Skill Name", "skill_rate": 4, "interest_rate": 5},
                    {...}
                ] (Skills that matched with the required skill),
                "missing_skills": ["Skill Name", ...] (Skills that did not match with the required skill)
            },
            ...
            """
            prompt = f"""
            I need you to match employees to a job description based on their skills.

            Here are the required skills extracted from the job description:
            {required_skills_json}

            Here is the employee skill data structured as:
            {employee_data}

            Data:
            {employee_batch_json}

            Instructions:
            - Match each employee to the required skills.
            - A skill is considered matched if:
            - The Sub-category (skill) matches exactly or is conceptually very close.
            - For required skills description that describe broader experiences (e.g., "Experience with cloud platforms like Azure and GCP"), consider it matched if the employee has skills in the mentioned technologies/tools/platforms (eg. Azure, GCP) individually.
            - and don't confuse between the Sub-category and Skill_Description they both are same. the Skill_Description is a brief description about the Sub-category.

            General Knowledge Rule:
            - If an employee knows a broad platform, ecosystem, or core technology (e.g., Azure, GCP, AWS, Kubernetes, Docker, GitHub, Linux):
            - Assume they have working familiarity with related core services, sub-tools, and common extensions.
            - Do NOT list features, services, or basic tools under that platform/ecosystem as missing skills.
            - Only list highly specialized or advanced features as missing, **if there is no direct evidence** that the employee knows them.

            Scoring:
            - For each employee, calculate a normalized match score out of 100 points based on:
            1. Skill coverage (how many required skills matched)
            2. Proficiency (Skill Rate) for matching skills
            3. Interest level (Interest Rate) for matching skills
            - Use this formula:
            Match Score = (0.6 * Average Skill Rate of matching skills + 0.3 * Average Interest Rate of matching skills + 0.1 * Coverage) / (3 + 1.5 + 0.1) * 100
            - Where Coverage = Number of matching skills / Total required skills

            Return Format:
            Return a JSON array of employee match results with detailed matching skills including their ratings, like this:
            {output_structure}

            Important:
            - For grouped or descriptive required skills, do not list them in "missing_skills" if the individual technologies mentioned are matched.
            - Only list truly missing individual skills.
            - Make sure to include skill_rate and interest_rate for each matched skill.
            - Do not return any extra explanation, only the JSON array.
            """

            print("Processing employee batch with Gemini...")
            response = self.model.generate_content(prompt)
            matches_text = response.text

            # Clean up the response to get valid JSON
            matches_text = matches_text.replace('```json', '').replace('```', '').strip()

            # Parse the JSON
            matches = json.loads(matches_text)
            print(f"Successfully processed batch of {len(matches)} matches")
            
            return matches
        except Exception as e:
            print(f"Error processing employee batch with Gemini: {e}")
            error_msg = "No response" if 'response' not in locals() else response.text
            print(f"Response text: {error_msg}")
            traceback.print_exc()
            return []
   
    def run(self, pdf_path=None):
        """Main function to run the job matching system."""
        if pdf_path is None:
            print("No PDF path provided.")
            return
        
        try:
            # Extract text from the PDF
            jd_text = self.extract_text_from_pdf(pdf_path)
            if not jd_text:
                print("Failed to extract text from PDF.")
                return

            # Extract skills from the job description
            required_skills = self.extract_skills_from_jd(jd_text)
            if not required_skills:
                print("Failed to extract skills from job description.")
                return

            # Fetch employee skills
            employees_data = self.fetch_employee_skills()
            if employees_data.empty:
                print("Failed to fetch employee data.")
                return

            # Process and structure employee data
            structured_employee_data = self.process_and_structure_employee_data(employees_data)
            if not structured_employee_data:
                print("Failed to process employee data.")
                return

            # Match employees to the job requirements
            matched_employees = self.match_employees_with_gemini(required_skills, structured_employee_data)

            return {
                "required_skills": required_skills,
                "matched_employees": matched_employees
            }
            
        except Exception as e:
            print(f"Error running job matching system: {e}")
            traceback.print_exc()
            return None