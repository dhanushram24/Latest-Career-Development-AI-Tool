from fastapi import FastAPI, Request, status, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import List, Dict, Optional
import openai
from collections import defaultdict

load_dotenv()
app = FastAPI()

# Configure CORS for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI API - modern approach
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("WARNING: OPENAI_API_KEY not found in environment variables")

# Data models
class SkillEntry(BaseModel):
    id: int
    Name: str
    Domain: str
    Category: str
    Sub_Category: str
    Skill_Rate: float
    Interest_Rate: float

class Mentor(BaseModel):
    name: str
    title: str
    domains: List[str]
    skill_level: float
    compatibility: float

class RecommendationRequest(BaseModel):
    employeeName: str
    skills: List[SkillEntry]

class MentorRequest(BaseModel):
    employeeName: str
    employeeDomains: List[str]
    employeeSkills: Dict[str, float]

class CourseRecommendation(BaseModel):
    bio: str
    courses: List[Dict[str, str]]

class MentorRecommendation(BaseModel):
    mentors: List[Mentor]

# Mock mentor database - replace with actual DB in production
MENTORS = [
    {
        "name": "Ravi Kumar",
        "title": "Principal Engineer",
        "domains": ["Engineering", "Data Science", "Cloud Architecture"],
        "skills": {"Java": 4.8, "Python": 4.5, "AWS": 4.9, "System Design": 4.8, "Leadership": 4.7}
    },
    {
        "name": "Priya Singh",
        "title": "Senior Data Scientist",
        "domains": ["Data Science", "Machine Learning", "Statistics"],
        "skills": {"Python": 4.7, "ML": 4.9, "Statistics": 4.8, "Data Visualization": 4.6}
    },
    {
        "name": "Alex Johnson",
        "title": "Engineering Manager",
        "domains": ["Engineering", "Project Management", "Leadership"],
        "skills": {"Java": 4.5, "Leadership": 4.9, "Project Management": 4.8, "Mentoring": 4.7}
    },
    {
        "name": "Sarah Williams",
        "title": "UX Design Lead",
        "domains": ["Design", "UI/UX", "Product Development"],
        "skills": {"UI Design": 4.9, "User Research": 4.7, "Figma": 4.8, "Product Thinking": 4.6}
    },
    {
        "name": "Michael Chen",
        "title": "Technical Architect",
        "domains": ["Architecture", "Cloud", "Infrastructure"],
        "skills": {"System Design": 4.9, "AWS": 4.8, "Cloud Architecture": 4.9, "Microservices": 4.7}
    }
]

# Mock course recommendations by domain
MOCK_COURSES = {
    "Engineering": [
        {"title": "Advanced Software Architecture", "platform": "Coursera", "description": "Learn design patterns and architecture principles."},
        {"title": "Full Stack Development", "platform": "Udemy", "description": "Build complete web applications from front to back end."},
        {"title": "Cloud Native Applications", "platform": "LinkedIn Learning", "description": "Deploy applications using modern cloud practices."}
    ],
    "Data Science": [
        {"title": "Machine Learning Fundamentals", "platform": "Coursera", "description": "From algorithms to implementation in Python."},
        {"title": "Advanced Data Analysis", "platform": "edX", "description": "Statistical methods for complex datasets."},
        {"title": "Big Data Processing", "platform": "Udemy", "description": "Work with Spark and distributed computing."}
    ],
    "Design": [
        {"title": "UX Research Methods", "platform": "Coursera", "description": "Learn to conduct effective user research."},
        {"title": "UI Design Principles", "platform": "Udemy", "description": "Create beautiful and functional interfaces."},
        {"title": "Design Systems at Scale", "platform": "LinkedIn Learning", "description": "Build and maintain design systems for organizations."}
    ],
    "Management": [
        {"title": "Agile Leadership", "platform": "Coursera", "description": "Lead teams using agile methodologies."},
        {"title": "Project Management Professional", "platform": "Udemy", "description": "Prepare for PMP certification."},
        {"title": "Team Building Strategies", "platform": "LinkedIn Learning", "description": "Create high-performing cohesive teams."}
    ]
}

def generate_mock_recommendations(domain, sub_category, employee_name):
    """Generate mock course recommendations when OpenAI API fails"""
    domain_key = next((k for k in MOCK_COURSES.keys() if k.lower() in domain.lower()), "Engineering")
    courses = MOCK_COURSES.get(domain_key, MOCK_COURSES["Engineering"])
    
    bio = f"{employee_name} shows potential for growth in {domain}, particularly in {sub_category}. With targeted learning, they could develop expertise in this area."
    
    return {
        "bio": bio,
        "courses": courses
    }

@app.get("/test-env")
async def test_env():
    """Test if environment variables are loaded correctly"""
    api_key = os.getenv("OPENAI_API_KEY", "")
    return {
        "api_key_set": bool(api_key),  # Returns True if key exists
        "api_key_length": len(api_key) if api_key else 0,  # Length for verification
        "api_key_masked": f"{api_key[:5]}...{api_key[-4:]}" if len(api_key) > 9 else "" # Safely show part of key
    }

@app.post("/recommend/courses", response_model=CourseRecommendation)
async def recommend_courses(request: RecommendationRequest):
    # Validate request
    if not request.skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one skill must be provided"
        )
    
    # Identify weak and high-interest skills
    weak_skills = [
        f"{s.Sub_Category} (Rated {s.Skill_Rate}/5)"
        for s in request.skills
        if s.Skill_Rate < 3
    ]
    
    high_interest_skills = [
        f"{s.Sub_Category} (Interest {s.Interest_Rate}/5)"
        for s in request.skills
        if s.Interest_Rate > 3 and s.Skill_Rate < s.Interest_Rate
    ]

    # Create prompt for OpenAI
    prompt = f"""
Generate a professional bio and course recommendations for {request.employeeName}.

Employee Skills Information:
- Domains: {', '.join(set(s.Domain for s in request.skills))}
- Weak skills: {', '.join(weak_skills) if weak_skills else "None"}
- High interest areas: {', '.join(high_interest_skills) if high_interest_skills else "None"}

Provide:
1. A brief professional bio highlighting the employee's strengths (2-3 sentences)
2. 3-5 specific course recommendations from platforms like Coursera, Udemy, LinkedIn Learning, or edX to address their skill gaps and interests
3. For each course, include: title, platform, and a brief (1 sentence) explanation of its benefit

Format the courses as a structured list with "Course Recommendations:" as a header, and number each course.
"""

    # Check if API key is available
    if not api_key:
        print("No OpenAI API key available. Using mock recommendations.")
        domain = request.skills[0].Domain if request.skills else "Engineering"
        sub_category = request.skills[0].Sub_Category if request.skills else "General Skills"
        return generate_mock_recommendations(domain, sub_category, request.employeeName)
    
    try:
        # Call OpenAI API with error handling and timeouts
        client = openai.OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a talent development advisor that specializes in career growth and upskilling."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800,
            timeout=10  # 10 second timeout
        )
        
        content = response.choices[0].message.content

        # Parse the response
        sections = content.split("\n\n", 1)
        bio = sections[0].replace("Bio:", "").strip()
        
        # Simple parsing for courses with improved robustness
        courses_text = sections[1].strip() if len(sections) > 1 else ""
        course_list = []
        
        # Try to parse course recommendations with better handling of different formats
        if "Course Recommendations:" in courses_text:
            courses_part = courses_text.split("Course Recommendations:")[1].strip()
            course_items = [item for item in courses_part.split("\n") if item.strip()]
            
            for item in course_items:
                # Look for numbered items like "1.", "1)", or "1 -"
                if item.strip() and any(char.isdigit() for char in item[:3]):
                    # Try to split by colon first
                    if ":" in item:
                        parts = item.split(":", 1)
                        title_parts = parts[0].strip().split(".", 1)
                        course_title = title_parts[1].strip() if len(title_parts) > 1 else parts[0].strip()
                        description = parts[1].strip()
                    # Otherwise try to parse based on platform names
                    else:
                        # Find the platform name in the text
                        platform_pos = -1
                        found_platform = ""
                        for p in ["Coursera", "Udemy", "LinkedIn Learning", "edX", "Pluralsight"]:
                            pos = item.lower().find(p.lower())
                            if pos > 0 and (platform_pos == -1 or pos < platform_pos):
                                platform_pos = pos
                                found_platform = p
                        
                        if platform_pos > 0:
                            # Extract title (assuming it comes before platform)
                            title_text = item[:platform_pos].strip()
                            # Remove number prefix like "1. " or "2) "
                            while title_text and (not title_text[0].isalpha()):
                                title_text = title_text[1:].strip()
                            course_title = title_text
                            description = item[platform_pos:].strip()
                        else:
                            # Fallback if platform not found
                            course_title = item.strip()
                            description = "Check course details for more information."
                    
                    # Extract platform if possible
                    platform = "Online Learning Platform"
                    for p in ["Coursera", "Udemy", "LinkedIn Learning", "edX", "Pluralsight"]:
                        if p.lower() in description.lower():
                            platform = p
                            break
                            
                    course_list.append({
                        "title": course_title,
                        "platform": platform,
                        "description": description
                    })
        
        # If parsing failed or no courses found, create fallback courses based on domain
        if not course_list:
            print("Course parsing failed, using fallback courses")
            # Use the first domain from skills for fallback courses
            domain = next(iter(set(s.Domain for s in request.skills)), "Engineering")
            domain_key = next((k for k in MOCK_COURSES.keys() if k.lower() in domain.lower()), "Engineering")
            course_list = MOCK_COURSES.get(domain_key, MOCK_COURSES["Engineering"])
        
        return {
            "bio": bio,
            "courses": course_list
        }
        
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        # Use mock data for fallback
        domain = request.skills[0].Domain if request.skills else "Engineering"
        sub_category = request.skills[0].Sub_Category if request.skills else "General Skills"
        return generate_mock_recommendations(domain, sub_category, request.employeeName)

@app.post("/recommend/mentors", response_model=MentorRecommendation)
async def recommend_mentors(request: MentorRequest):
    # Match algorithm to find suitable mentors
    mentor_matches = []
    
    for mentor in MENTORS:
        # Calculate domain overlap
        domain_overlap = len(set(request.employeeDomains) & set(mentor["domains"]))
        
        # Calculate skill compatibility
        skill_compatibility = 0
        overlap_count = 0
        
        for skill, employee_level in request.employeeSkills.items():
            if skill in mentor["skills"]:
                # Give higher weight to mentors with much higher skill level than employee
                mentor_level = mentor["skills"][skill]
                if mentor_level > employee_level:
                    skill_compatibility += (mentor_level - employee_level)
                    overlap_count += 1
        
        # Calculate overall compatibility score
        domain_score = domain_overlap * 0.4
        skill_score = (skill_compatibility / max(1, overlap_count)) * 0.6
        total_score = domain_score + skill_score
        
        # Add to potential mentors list
        mentor_matches.append(Mentor(
            name=mentor["name"],
            title=mentor["title"],
            domains=mentor["domains"],
            skill_level=sum(mentor["skills"].values()) / len(mentor["skills"]),
            compatibility=total_score
        ))
    
    # Sort by compatibility score and return top 3
    mentor_matches.sort(key=lambda x: x.compatibility, reverse=True)
    
    return {"mentors": mentor_matches[:3]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)