/**
 * Filename utilities for sanitizing app names.
 * @module lib/fileName
 */

/**
 * Sanitizes the application name by converting to lowercase
 * and removing all non-alphanumeric characters.
 * @param {string} str - The raw application name input.
 * @returns {string} The sanitized application name.
 */
const cleanAppName = (str) => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

module.exports = {
  cleanAppName,
};
