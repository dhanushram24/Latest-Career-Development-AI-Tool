import React, { useRef, ChangeEvent } from 'react';
import ErrorAlert from './common/ErrorAlert';

interface JobUploadSectionProps {
  selectedFile: File | null;
  setSelectedFile: (file: File) => void;
  processFile: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function JobUploadSection({ 
  selectedFile, 
  setSelectedFile,
  processFile,
  isLoading,
  error
}: JobUploadSectionProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-xl p-6 mb-8 border border-blue-100 relative overflow-hidden transition duration-300 hover:shadow-xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full -mr-32 -mt-32 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-full -ml-16 -mb-16 opacity-20"></div>
      
      <div className="relative z-10">
        {/* Heading with gradient */}
        <h2 className="text-2xl font-bold mb-2 flex items-center text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Job Match Analyzer
        </h2>
        
        {/* Description with improved styling */}
        <p className="text-gray-600 mb-6 pl-8 border-l-2 border-blue-300 italic">
          Upload a job description PDF to analyze your skill match and discover opportunities that align with your expertise.
        </p>
        
        {/* Upload container with improved visuals */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch mb-6">
          <div className="flex-grow w-full">
            <label className="block w-full cursor-pointer">
              <div className={`bg-white border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                ${selectedFile 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                
                {/* Conditional icons based on file selection state */}
                {selectedFile ? (
                  <div className="bg-green-100 rounded-full p-3 inline-block mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="bg-blue-100 rounded-full p-3 inline-block mb-2 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                
                {/* File status message */}
                {selectedFile ? (
                  <div>
                    <p className="text-lg font-medium text-green-700">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis
                    </p>
                    <p className="mt-3 text-xs text-blue-600 underline">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop your job description here
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or click to browse your files
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                      Supports PDF files up to 10MB
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
          </div>
          
          {/* Analyze button with improved styling */}
          <div className="flex flex-col justify-center">
            <button
              onClick={processFile}
              disabled={!selectedFile || isLoading}
              className={`relative px-8 py-4 rounded-xl text-white font-medium text-lg
                shadow-md transition-all duration-300 transform
                ${!selectedFile || isLoading 
                  ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-1'}`}
            >
              {/* Button inner content */}
              <div className="flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Analyze Job Fit</span>
                  </>
                )}
              </div>
              
              {/* Animated wave effect on hover */}
              {!isLoading && selectedFile && (
                <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden invisible group-hover:visible">
                  <div className="w-full h-full bg-white/20 animate-pulse"></div>
                </div>
              )}
            </button>
            
            {/* Help text */}
            <p className="text-xs text-center text-gray-500 mt-2">
              {selectedFile && !isLoading ? "Click to evaluate your skill match" : 
               isLoading ? "AI analyzing your job fit..." : "Upload a job description first"}
            </p>
          </div>
        </div>
        
        {/* File type notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium">For best results:</p>
            <ul className="list-disc list-inside ml-1 mt-1 text-blue-600 text-xs">
              <li>Upload complete job descriptions with detailed requirements</li>
              <li>Ensure the PDF is text-searchable (not scanned images)</li>
              <li>Include skills, qualifications, and responsibilities sections</li>
            </ul>
          </div>
        </div>
        
        {/* Error display with improved styling */}
        {error && (
          <div className="mt-4 animate-fade-in">
            <ErrorAlert message={error} />
          </div>
        )}
      </div>
    </div>
  );
}