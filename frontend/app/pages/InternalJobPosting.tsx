'use client';
import { useState, useEffect } from 'react';
import supabase from '@/app/config/supabaseClient';
import { Link } from 'react-router-dom';

type JobPosting = {
  id: number;
  title: string;
  department: string;
  location: string;
  skillsRequired: string[];
  description: string;
};

type EmployeeData = {
  id: number;
  name: string;
  skills: string[];
  experience: string[];
  interests: string[];
};

function InternalJobPosting() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredJobPostings, setFilteredJobPostings] = useState<JobPosting[]>([]);

  useEffect(() => {
    const fetchJobPostings = async () => {
      const { data, error } = await supabase.from('job_postings').select('*');
      if (error) {
        console.error('Error fetching job postings:', error);
      } else {
        setJobPostings(data);
        setFilteredJobPostings(data); // Initially show all postings
      }
    };

    const fetchEmployees = async () => {
      const { data, error } = await supabase.from('employees').select('*');
      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        setEmployees(data);
      }
    };

    fetchJobPostings();
    fetchEmployees();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setFilteredJobPostings(
        jobPostings.filter(
          (job) =>
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.department.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setFilteredJobPostings(jobPostings);
    }
  };

  // Match employees to job postings based on skills and interests
  const matchCandidatesToJobs = (job: JobPosting) => {
    return employees.filter((employee) =>
      job.skillsRequired.some((requiredSkill) =>
        employee.skills.includes(requiredSkill)
      )
    );
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Internal Job Postings</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for jobs"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Job Postings List */}
      <div className="space-y-4">
        {filteredJobPostings.map((job) => {
          const matchedEmployees = matchCandidatesToJobs(job);

          return (
            <div key={job.id} className="border p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-blue-600">{job.title}</h3>
                <span className="text-sm text-gray-500">{job.department}</span>
              </div>
              <p className="mt-2 text-gray-700">{job.description}</p>
              <p className="mt-2 text-sm text-gray-600">
                Location: <strong>{job.location}</strong>
              </p>

              {/* Candidate Suggestions */}
              {matchedEmployees.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800">Potential Candidates:</h4>
                  <ul className="space-y-2 mt-2">
                    {matchedEmployees.map((employee) => (
                      <li key={employee.id} className="flex items-center justify-between">
                        <Link
                          to={`/employee/${employee.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {employee.name}
                        </Link>
                        <span className="text-sm text-gray-500">Skills: {employee.skills.join(', ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matchedEmployees.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">No suitable candidates found.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InternalJobPosting;
