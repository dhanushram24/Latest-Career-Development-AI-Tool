// Updated page.tsx for the main app with role-based SearchBar and AI ChatBot
'use client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import supabase from '@/app/config/supabaseClient';
import EmployeeDetail from "./components/EmployeeDetails";
import SearchBar from "./components/SearchBar";
import AIChatBot from "./components/ai-chat/AIChatBot";
import Upskill from "./upskill/page";
import InternalJobPosting from "./selfupskilling/page";
import LogoutButton from "./components/LogoutButton";

type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
  Access?: string; // Added Access property to track user role
  Email?: string;  // Added Email property
};

type EmployeeData = {
  [name: string]: SkillEntry[];
};

type UserRole = 'admin' | 'user' | null;

// Simplified HomePage Component with role-based features and AI ChatBot
function HomePage({ userRole, userEmail }: { userRole: UserRole, userEmail: string | null }) {
  const navigate = useNavigate();
  const [showChatBot, setShowChatBot] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 justify-center ">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-4">Welcome to Career Development AI</h1>
      <p className="text-center text-gray-500 mb-6">Logged in as: {userEmail} ({userRole})</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Upskill Tile - Only visible to admins */}
          {userRole === 'admin' && (
            <div 
              onClick={() => navigate('/upskill')}
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 border-blue-500"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">Upskilling Plan</h2>
              <p className="text-center text-gray-600 mb-4">Enhance your team&apos;s skills and career paths</p>
              <div className="text-center">
                <span className="inline-flex items-center text-blue-600 font-medium">
                  Manage Plans
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          )}
       {/* Self Upskilling Tile - Only visible to regular users */}
          {userRole === 'user' && (
            <div 
              onClick={() => navigate('/selfupskilling')}
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 border-green-500"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">Self Upskilling</h2>
              <p className="text-center text-gray-600 mb-4">Develop your skills and advance your career</p>
              <div className="text-center">
                <span className="inline-flex items-center text-green-600 font-medium">
                  Explore Options
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          )}
      </div>

      {/* AI Assistant Info Card */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">AI Career Assistant</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Get personalized career guidance, skill recommendations, and answers to your professional development questions.
        </p>
        <button 
          onClick={() => setShowChatBot(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Chat with AI Assistant</span>
        </button>
      </div>

      {/* AI ChatBot Modal/Overlay */}
      {showChatBot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI Career Assistant</span>
              </h2>
              <button 
                onClick={() => setShowChatBot(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIChatBot userRole={userRole} userEmail={userEmail} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const [employees, setEmployees] = useState<EmployeeData>({});
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
          
          // Determine user role from the data based on their email
          if (session?.user?.email) {
            const currentUserEmail = session.user.email;
            setUserEmail(currentUserEmail);
            
            // Find the first entry with the matching email to determine role
            const userEntry = data.find((entry: SkillEntry) => 
              entry.Email?.toLowerCase() === currentUserEmail.toLowerCase()
            );
            
            if (userEntry && userEntry.Access) {
              setUserRole(userEntry.Access as UserRole);
            } else {
              console.error("User role not found in data");
              // Default to user role if not found
              setUserRole('user');
            }
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    if (status === 'authenticated') {
      fetchEmployeeData();
    }
  }, [status, session]);

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600">SkillMatrix</span>
              </Link>
              <nav className="ml-6 flex space-x-4">
                {/* Only show navigation links based on user role */}
                {userRole === 'admin' && (
                  <Link 
                    to="/upskill" 
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
                    bg-blue-600 hover:bg-blue-700 text-white
                    transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                    Upskilling Plan
                  </Link>
                )}
                {userRole === 'user' && (
                  <Link 
                    to="/selfupskilling" 
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
                    bg-blue-600 hover:bg-blue-700 text-white
                    transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                    Self Upskilling
                  </Link>
                )}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Pass the userRole and userEmail to SearchBar component */}
              <SearchBar employees={employees} userRole={userRole} userEmail={userEmail} />
              <LogoutButton className="ml-2" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow py-6">
        <Routes>
          {/* Home page with role-based tiles */}
          <Route path="/" element={<HomePage userRole={userRole} userEmail={userEmail} />} />
          
          {/* Protected routes based on user role */}
          {userRole === 'admin' ? (
            <Route path="/upskill" element={<Upskill />} />
          ) : (
            <Route path="/selfupskilling" element={<InternalJobPosting />} />
          )}
          
          {/* Redirect unauthorized access */}
          <Route path="/upskill" element={userRole === 'admin' ? <Upskill /> : <UnauthorizedAccess />} />
          <Route path="/selfupskilling" element={userRole === 'user' ? <InternalJobPosting /> : <UnauthorizedAccess />} />
          
          {/* Employee detail routes */}
          <Route path="/employee/:employeeId" element={<EmployeeDetail />} />
          <Route path="/employee/:employeeId/skills" element={<EmployeeDetail defaultTab="skills" />} />
          <Route path="/employee/:employeeId/top-skills" element={<EmployeeDetail defaultTab="top-skills" />} />
          <Route path="/employee/:employeeId/improvement-areas" element={<EmployeeDetail defaultTab="improvement-areas" />} />
          <Route path="/employee/:employeeId/development" element={<EmployeeDetail defaultTab="development" />} />
        </Routes>
      </main>
      
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SkillMatrix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Component to show unauthorized access message
function UnauthorizedAccess() {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      </div>
      <button 
        onClick={() => navigate('/')} 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Return to Dashboard
      </button>
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