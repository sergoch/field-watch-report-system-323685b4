
/**
 * Utility functions to convert between snake_case (database) and camelCase (frontend) naming conventions
 */

// Convert snake_case to camelCase
export const snakeToCamel = (str: string): string => 
  str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

// Convert camelCase to snake_case
export const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

// Convert object keys from snake_case to camelCase
export const convertToCamelCase = <T extends object>(obj: any): T => {
  if (obj === null || typeof obj !== 'object') return obj as T;
  
  if (Array.isArray(obj)) {
    return obj.map(convertToCamelCase) as unknown as T;
  }
  
  const result: any = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    // Handle nested objects/arrays
    if (value !== null && typeof value === 'object') {
      value = convertToCamelCase(value);
    }
    
    // Convert key to camelCase
    const camelKey = snakeToCamel(key);
    result[camelKey] = value;
  });
  
  return result as T;
};

// Convert object keys from camelCase to snake_case for Supabase operations
export const convertToSnakeCase = <T extends object>(obj: any): T => {
  if (obj === null || typeof obj !== 'object') return obj as T;
  
  if (Array.isArray(obj)) {
    return obj.map(convertToSnakeCase) as unknown as T;
  }
  
  const result: any = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    // Handle nested objects/arrays
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      value = convertToSnakeCase(value);
    }
    
    // Convert key to snake_case
    const snakeKey = camelToSnake(key);
    result[snakeKey] = value;
  });
  
  return result as T;
};
