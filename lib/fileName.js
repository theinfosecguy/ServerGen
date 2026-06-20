/**
 * Filename utilities for sanitizing app names.
 * @module lib/fileName
 */

/**
 * Sanitizes the application name by converting to lowercase,
 * preserving single hyphen separators, and removing unsafe path characters.
 * @param {string} str - The raw application name input.
 * @returns {string} The sanitized application name.
 */
export const cleanAppName = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};
