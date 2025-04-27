// apiService.js
// Define the API base URL - this should point to your Flask server
const API_BASE_URL = 'http://localhost:5000/api'; // Update this to match your Flask server URL

export const getCourseRecommendations = async (skill) => {
    try {
      console.log('Sending request to API:', `${API_BASE_URL}/recommend-courses`);
      console.log('Request payload:', JSON.stringify(skill));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
      
      const response = await fetch(`${API_BASE_URL}/recommend-courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(skill),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!Array.isArray(data)) {
        console.error('API returned non-array data:', data);
        // Return empty array instead of throwing
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching course recommendations:', error);
      // Return empty array instead of rethrowing
      return [];
    }
};