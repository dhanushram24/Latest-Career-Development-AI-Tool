'use client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import supabase from '@/app/config/supabaseClient';
import EmployeeDetail from "./components/EmployeeDetails";
import SearchBar from "./components/SearchBar";
import Upskill from "./upskill/page";
import InternalJobPosting from "./InternalJobPosting/page";
import LogoutButton from "./components/LogoutButton";

type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
};

type EmployeeData = {
  [name: string]: SkillEntry[];
};

// Simplified HomePage Component with more basic styling
function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-4">Welcome to SkillMatrix</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upskill Tile - Simplified */}
        <div 
          onClick={() => navigate('/upskill')}
          className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Upskilling Plan</h2>
          <p className="text-center text-gray-600">Enhance your skills and career path</p>
        </div>
        
        {/* Internal Job Postings Tile - Simplified */}
        <div 
          onClick={() => navigate('/jobs')}
          className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Internal Job Postings</h2>
          <p className="text-center text-gray-600">Find opportunities within the organization</p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [employees, setEmployees] = useState<EmployeeData>({});
  const { data: session, status } = useSession();
  const navigate = useNavigate();
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/signin';
    }
  }, [status, navigate]);
  
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const { data, error } = await supabase
          .from('dhanush')
          .select('*');

        if (error) {
          console.error("Supabase error:", error);
        } else if (data && data.length > 0) {
          // Organize data by employee name
          const employeeData: EmployeeData = {};
          data.forEach((entry: SkillEntry) => {
            if (!employeeData[entry.Name]) {
              employeeData[entry.Name] = [];
            }
            employeeData[entry.Name].push(entry);
          });

          setEmployees(employeeData);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    if (status === 'authenticated') {
      fetchEmployeeData();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600">SkillMatrix</span>
              </Link>
              <nav className="ml-6 flex space-x-4">
                <Link to="/upskill" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  Upskilling Plan
                </Link>
                <Link to="/jobs" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  Internal Job Postings
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <SearchBar employees={employees} />
              <LogoutButton className="ml-2" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="py-6">
        <Routes>
          {/* Home page with tiles */}
          <Route path="/" element={<HomePage />} />
          
          {/* Main routes */}
          <Route path="/upskill" element={<Upskill />} />
          <Route path="/jobs" element={<InternalJobPosting />} />
          
          {/* Employee detail routes */}
          <Route path="/employee/:employeeId" element={<EmployeeDetail />} />
          <Route path="/employee/:employeeId/skills" element={<EmployeeDetail defaultTab="skills" />} />
          <Route path="/employee/:employeeId/top-skills" element={<EmployeeDetail defaultTab="top-skills" />} />
          <Route path="/employee/:employeeId/improvement-areas" element={<EmployeeDetail defaultTab="improvement-areas" />} />
          <Route path="/employee/:employeeId/development" element={<EmployeeDetail defaultTab="development" />} />
        </Routes>
      </main>
      
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SkillMatrix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;