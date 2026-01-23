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
