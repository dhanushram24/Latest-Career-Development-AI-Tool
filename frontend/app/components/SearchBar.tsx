import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  employees: {
    [name: string]: {
      id: number;
      Name: string;
      Domain: string;
      Category: string;
      'Sub Category': string;
      'Skill Rate': number;
      'Interest Rate': number;
    }[];
  };
}

const SearchBar: React.FC<SearchBarProps> = ({ employees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{name: string; domain: string}[]>([]);
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setShowResults(false);
      setResults([]);
      return;
    }
    
    const termLower = term.toLowerCase();
    // Create a map to store unique employees with their domains
    const uniqueResults = new Map<string, string>();

    // First check if the search term matches a specific domain
    const isDomainSearch = Object.values(employees).some(employeeSkills => 
      employeeSkills.some(skill => 
        skill.Domain.toLowerCase() === termLower || 
        skill.Domain.toLowerCase().includes(termLower)
      )
    );

    // Search through all employees
    Object.keys(employees).forEach(name => {
      const employeeData = employees[name];
      
      // If we're doing a domain search, only include employees with matching domain
      if (isDomainSearch) {
        const hasMatchingDomain = employeeData.some(skill => 
          skill.Domain.toLowerCase() === termLower ||
          skill.Domain.toLowerCase().includes(termLower)
        );
        
        if (hasMatchingDomain) {
          // Find the matching domain to display
          const matchingDomain = employeeData.find(skill => 
            skill.Domain.toLowerCase() === termLower ||
            skill.Domain.toLowerCase().includes(termLower)
          )?.Domain || employeeData[0].Domain;
          
          uniqueResults.set(name, matchingDomain);
        }
      } 
      // If not a domain search, check for name matches
      else if (name.toLowerCase().includes(termLower)) {
        uniqueResults.set(name, employeeData[0].Domain);
      }
    });

    // Convert map to array for rendering
    const filteredResults = Array.from(uniqueResults).map(([name, domain]) => ({
      name,
      domain
    }));

    setResults(filteredResults);
    setShowResults(true);
  };

  const handleResultClick = (name: string) => {
    const encodedName = encodeURIComponent(name);
    navigate(`/employee/${encodedName}/skills`);
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div className="flex items-center rounded-md bg-gray-100 px-3 py-2">
        <svg className="h-5 w-5 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or domain..."
          className="ml-2 bg-transparent outline-none w-48 placeholder-gray-600 cursor-text text-gray-800 focus:border-b focus:border-blue-500"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setShowResults(true)}
          onBlur={() => {
            // Delay hiding results to allow for clicks
            setTimeout(() => setShowResults(false), 200);
          }}
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (searchTerm || results.length > 0) && (
        <div className="absolute mt-1 w-full bg-white shadow-lg rounded-md z-10 max-h-60 overflow-y-auto border border-gray-200">
          {results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.name}
                className="py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleResultClick(result.name)}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-3">
                  <span className="text-blue-600 font-semibold text-xl">{result.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{result.name}</p>
                  <p className="text-sm text-gray-500">
                    {result.domain}
                  </p>
                </div>
              </div>
            ))
          ) : (
            searchTerm && (
              <div className="px-4 py-2 text-gray-500">
                No employees found
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;