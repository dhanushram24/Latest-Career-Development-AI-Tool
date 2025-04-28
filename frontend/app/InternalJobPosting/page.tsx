'use client';
import { useState, useEffect, useRef } from 'react';

// API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Type definitions
type RequiredSkill = {
  Domain: string;
  Category: string;
  'Sub-category': string;
  Skill_Description: string;
};

type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
};

type MatchedSkill = {
  skill: string;
  rating: number;
  matchConfidence: number;
  interestRate: number;
};

type MatchedEmployee = {
  name: string;
  id: string;
  matchedSkills: MatchedSkill[];
  missingSkills: string[];
  overallMatch: number;
};

export default function SimpleJobMatching() {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [employeeSkills, setEmployeeSkills] = useState<SkillEntry[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<RequiredSkill[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [requiredSkillRating, setRequiredSkillRating] = useState(3);
  const [matchedEmployees, setMatchedEmployees] = useState<MatchedEmployee[]>([]);
  const [apiResponse, setApiResponse] = useState<any>(null); // For debugging
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch employee skills on component mount
  useEffect(() => {
    const fetchEmployeeSkills = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/fetch-employees`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Employee data from API:", data);
        
        if (data.employees) {
          setEmployeeSkills(data.employees);
          console.log(`Successfully loaded ${data.employees.length} employees`);
        } else {
          console.warn("No employees data in API response");
        }
      } catch (error) {
        console.error("Error fetching employee skills:", error);
        setError(`Failed to fetch employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeSkills();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Extract skills from PDF
  const processFile = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      // Step 1: Upload file and extract skills
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      console.log("Uploading file and extracting skills...");
      const extractResponse = await fetch(`${API_BASE_URL}/extract-skills`, {
        method: 'POST',
        body: formData,
      });
      
      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to extract skills');
      }
      
      const extractData = await extractResponse.json();
      console.log("Skills extraction response:", extractData);
      
      // Update state with extracted information
      setJobTitle(extractData.jobTitle);
      setDepartment(extractData.department);
      setExtractedSkills(extractData.requiredSkills);
      
      // Step 2: Match employees to the extracted skills
      await matchEmployeesToSkills(extractData.requiredSkills);
      
    } catch (error) {
      console.error("Error processing file:", error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Match employees to skills
  const matchEmployeesToSkills = async (skills: RequiredSkill[]) => {
    try {
      console.log("Matching employees to skills...");
      console.log("Required skills:", skills);
      console.log("Min skill rating:", requiredSkillRating);
      
      const response = await fetch(`${API_BASE_URL}/match-employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requiredSkills: skills,
          minSkillRating: requiredSkillRating
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to match employees');
      }
      
      const data = await response.json();
      console.log("API Response for matched employees:", data);
      console.log("Number of matches returned:", data.matches ? data.matches.length : 0);
      
      // Store the full API response for debugging
      setApiResponse(data);
      
      if (data.matches && data.matches.length > 0) {
        // Sort by overallMatch and take top 10
        const topMatches = data.matches
          .sort((a: MatchedEmployee, b: MatchedEmployee) => b.overallMatch - a.overallMatch)
          .slice(0, 10);
        setMatchedEmployees(topMatches);
        setExpandedEmployee(null); // Reset expanded employee when getting new matches
      } else {
        setMatchedEmployees([]);
        console.warn("No matches returned from API");
      }
    } catch (error) {
      console.error("Error matching employees:", error);
      setError(`Error matching employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMatchedEmployees([]);
    }
  };

  // Re-match when skill rating changes
  useEffect(() => {
    if (extractedSkills.length > 0) {
      matchEmployeesToSkills(extractedSkills);
    }
  }, [requiredSkillRating]);

  // Toggle employee details expansion
  const toggleEmployeeDetails = (employeeId: string) => {
    if (expandedEmployee === employeeId) {
      setExpandedEmployee(null);
    } else {
      setExpandedEmployee(employeeId);
    }
  };

  // Get color for skill rating
  const getSkillRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Internal Job Matching System</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-2xl font-semibold mb-5 text-blue-800">Upload Job Description PDF</h2>
        <div className="flex items-center mb-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
          >
            Select File
          </button>
          <span className="text-gray-600">
            {selectedFile ? selectedFile.name : "No file selected"}
          </span>
        </div>
        <button
          onClick={processFile}
          disabled={!selectedFile || isLoading}
          className={`w-full px-4 py-2 rounded-md ${
            !selectedFile || isLoading ? 'bg-gray-300' : 'bg-blue-600'
          } text-white`}
        >
          {isLoading ? 'Processing...' : 'Extract Skills & Find Matches'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {extractedSkills.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-2 text-indigo-700">{jobTitle}</h2>
          <p className="text-gray-700 mb-4">Department: {department}</p>
          
          <h3 className="font-medium mb-3 text-lg text-gray-800">Required Skills:</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {extractedSkills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {skill['Sub-category']}
                <span className="ml-1 text-xs text-blue-500">({skill.Domain})</span>
              </span>
            ))}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Minimum Skill Rating Required:
            </label>
            <select
              value={requiredSkillRating}
              onChange={(e) => {
                setRequiredSkillRating(Number(e.target.value));
              }}
              className="border border-gray-400 rounded-md p-2 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Debug info about loaded employees */}
      {/* <div className="bg-yellow-50 border border-yellow-300 p-4 rounded mb-6">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <p>Employees loaded: {employeeSkills.length}</p>
        <p>Matched employees: {matchedEmployees.length}</p>
        {matchedEmployees.length === 0 && apiResponse && (
          <div>
            <p className="font-bold mt-2">API Response:</p>
            <pre className="bg-gray-100 p-2 mt-1 text-xs overflow-auto max-h-40">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div> */}

      {matchedEmployees.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-5 text-blue-800">Top {matchedEmployees.length} Matched Employees</h2>
          
          <div className="space-y-4">
            {matchedEmployees.map((employee, index) => (
              <div 
                key={index} 
                className={`p-5 rounded-md border shadow-sm ${
                  employee.overallMatch >= 70 ? 'border-green-400 bg-green-50' : 
                  employee.overallMatch >= 40 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div 
                  className="flex justify-between items-center cursor-pointer" 
                  onClick={() => toggleEmployeeDetails(employee.id)}
                >
                  <div>
                    <h3 className={`font-semibold text-lg ${
                      employee.overallMatch >= 70 ? 'text-green-800' : 
                      employee.overallMatch >= 40 ? 'text-yellow-800' : 'text-gray-800'
                    }`}>{employee.name}</h3>
                    <p className="text-sm text-gray-600">Employee ID: {employee.id}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-bold ${
                      employee.overallMatch >= 70 ? 'text-green-600' : 
                      employee.overallMatch >= 40 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {Math.round(employee.overallMatch)}% Match
                    </span>
                    <span className="text-sm text-blue-600 underline mt-1">
                      {expandedEmployee === employee.id ? 'Hide Details' : 'Show Details'}
                    </span>
                  </div>
                </div>
                
                {expandedEmployee === employee.id && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="mb-4">
                      <h4 className="font-medium mb-3 text-gray-800">Matched Skills ({employee.matchedSkills.length})</h4>
                      <div className="space-y-3 pl-2">
                        {employee.matchedSkills.map((skill, idx) => (
                          <div key={idx} className="flex justify-between text-sm items-center">
                            <span className="font-medium text-gray-800">{skill.skill}</span>
                            <div>
                              <span className={`mr-4 ${getSkillRatingColor(skill.rating)}`}>
                                Skill: {skill.rating}/5
                              </span>
                              <span className="text-purple-600">
                                Interest: {skill.interestRate}/5
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {employee.missingSkills.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-gray-800">Skills Gap ({employee.missingSkills.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {employee.missingSkills.map((skill, idx) => (
                            <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        extractedSkills.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">No Matches Found</h2>
            <p className="text-gray-700">Try adjusting the minimum skill rating to a lower value.</p>
          </div>
        )
      )}
    </div>
  );
}