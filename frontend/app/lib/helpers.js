/**
 * Determines job compatibility status based on match score
 * @param {number} matchScore - The overall match score percentage (0-100)
 * @returns {object} An object containing status text and color class
 */
export function getJobCompatibilityStatus(matchScore) {
  if (matchScore >= 80) {
    return { status: "Perfect Match", color: "text-green-600" };
  } else if (matchScore >= 60) {
    return { status: "Good Match", color: "text-blue-600" };
  } else if (matchScore >= 40) {
    return { status: "Potential Match", color: "text-yellow-600" };
  } else {
    return { status: "Needs Upskilling", color: "text-red-600" };
  }
}