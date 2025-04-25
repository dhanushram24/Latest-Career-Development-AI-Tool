'use client';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import supabase from '@/app/config/supabaseClient';
import Upskill from "./pages/Upskill";
import InternalJobPosting from "./pages/InternalJobPosting";
import EmployeeDetail from "./components/EmployeeDetails";
import SearchBar from "./components/SearchBar";

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

function App() {
  const [employees, setEmployees] = useState<EmployeeData>({});

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

    fetchEmployeeData();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <span className="text-2xl font-bold text-blue-600">SkillMatrix</span>
                </Link>
                <nav className="ml-6 flex space-x-4">
                  <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    Upskilling Plan
                  </Link>
                  <Link to="/jobs" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    Internal Job Postings
                  </Link>
                </nav>
              </div>
              
              {/* Search Bar */}
              <div className="flex items-center">
                <SearchBar employees={employees} />
              </div>
            </div>
          </div>
        </header>
        
        <main className="py-6">
          <Routes>
            {/* Main routes */}
            <Route path="/" element={<Upskill />} />
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
    </BrowserRouter>
  );
}

export default App;