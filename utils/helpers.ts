/**
 * Converts a string to Sentence Case (Title Case).
 *
 * Example:
 * ```ts
 * toProperCase("hello dementa") // "Hello Dementa"
 * ```
 *
 * @param {string} str - The input string to convert.
 * @returns {string} A new string with each word capitalized.
 */
export function toProperCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}



export const fetchStudentData = async () => {
  const response = await fetch(`${API_BASE_URL}/students`);

  if (!response.ok) {
    throw new Error('Failed to fetch students data');
  }

  const result = await response.json();
  return result.data;
};

