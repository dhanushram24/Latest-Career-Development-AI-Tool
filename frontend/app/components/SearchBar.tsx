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
  const [results, setResults] = useState<{name: string; domain: string; subCategory?: string}[]>([]);
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
    // Create a map to store unique employees with their domains and subcategories
    const uniqueResults = new Map<string, {domain: string; subCategory?: string}>();

    // Search through all employees
    Object.keys(employees).forEach(name => {
      const employeeData = employees[name];
      let found = false;
      
      // First priority: Check if the search term matches the employee name
      if (name.toLowerCase().includes(termLower)) {
        uniqueResults.set(name, { domain: employeeData[0].Domain });
        found = true;
      }
      
      // If not found by name, check for domain or subcategory matches
      if (!found) {
        // Look for matching skills by domain or subcategory
        const matchingSkill = employeeData.find(skill => 
          skill.Domain.toLowerCase().includes(termLower) || 
          skill['Sub Category'].toLowerCase().includes(termLower)
        );
        
        // If found a matching skill, add to results
        if (matchingSkill) {
          // Determine if it's a domain or subcategory match for display purposes
          const isSubCategoryMatch = matchingSkill['Sub Category'].toLowerCase().includes(termLower);
          
          uniqueResults.set(name, { 
            domain: matchingSkill.Domain,
            subCategory: isSubCategoryMatch ? matchingSkill['Sub Category'] : undefined
          });
        }
      }
    });

    // Convert map to array for rendering
    const filteredResults = Array.from(uniqueResults).map(([name, data]) => ({
      name,
      domain: data.domain,
      subCategory: data.subCategory
    }));

    setResults(filteredResults);
    setShowResults(filteredResults.length > 0);
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
          placeholder="Search by name, domain or sub category..."
          className="ml-2 bg-transparent outline-none w-80 placeholder-gray-600 cursor-text text-gray-800 focus:border-b focus:border-blue-500"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => {
            if (searchTerm.trim() !== '') {
              setShowResults(true);
            }
          }}
          onBlur={() => {
            // Delay hiding results to allow for clicks
            setTimeout(() => setShowResults(false), 200);
          }}
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchTerm && (
        <div className="absolute mt-1 w-full bg-white shadow-lg rounded-md z-10 max-h-60 overflow-y-auto border border-gray-200">
          {results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.name}
                className="py-2 px-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleResultClick(result.name)}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-3">
                  <span className="text-blue-600 font-semibold text-xl">{result.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{result.name}</p>
                  <p className="text-sm text-gray-500">
                    {result.domain}
                    {result.subCategory && ` - ${result.subCategory}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">
              No employees found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;