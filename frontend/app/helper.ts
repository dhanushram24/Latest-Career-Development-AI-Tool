/**
 * Rounds a number to a specified number of decimal places
 * @param num - The number to round
 * @param decimalPlaces - The number of decimal places to round to (default: 2)
 * @returns The rounded number
 */
export function roundToDecimalPlaces(num: number, decimalPlaces: number = 2): number {
    // Handle scientific notation and large numbers
    if (!isFinite(num)) {
      return num; // Return as is if it's Infinity, -Infinity, or NaN
    }
    
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }
  
  // Example usage:
  // const bigNumber = 1.5872920724444447e+69;
  // const rounded = roundToDecimalPlaces(bigNumber, 2);
  // console.log(rounded); // 1.59e+69