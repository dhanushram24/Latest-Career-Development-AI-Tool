'use client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/app/config/supabaseClient';

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

export default function Upskill() {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [employees, setEmployees] = useState<EmployeeData>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        console.log("Auth session:", authData);

        const { data, error } = await supabase
          .from('dhanush')
          .select('*');

        if (error) {
          setFetchError(`Could not fetch the data: ${error.message}`);
          console.error("Supabase error:", error);
        } else if (!data || data.length === 0) {
          setFetchError(null);
        } else {
          setFetchError(null);

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
        setFetchError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEmployeeClick = (name: string) => {
    const encodedName = encodeURIComponent(name);
    navigate(`/employee/${encodedName}/skills`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">Employee Skill Matrix</h1>

      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{fetchError}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-700">Loading employee data...</p>
        </div>
      )}

      {!isLoading && employees && Object.keys(employees).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.keys(employees).map((name) => (
            <div 
              key={name}
              onClick={() => handleEmployeeClick(name)}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-16"></div>
              <div className="p-5">
                <div className="bg-white p-3 rounded-full shadow-md w-16 h-16 flex items-center justify-center -mt-12 mb-3 mx-auto">
                  <span className="text-2xl font-bold text-blue-600">{name.charAt(0)}</span>
                </div>
                <h2 className="text-xl font-bold text-center text-gray-800 mb-2">{name}</h2>
                <div className="text-center text-sm text-gray-600">
                  <p>{employees[name].length} skills</p>
                  <p>Primary domain: {employees[name][0].Domain}</p>
                </div>
                <button className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition">
                  View Skills
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!employees || Object.keys(employees).length === 0) && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">No employee data available.</p>
        </div>
      )}
    </div>
  );
}
