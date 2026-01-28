/**
 * Error handling utilities.
 * @module lib/error_handler
 */

import chalk from 'chalk';

/**
 * Handles errors with consistent formatting.
 * @param {Error} err - The error object.
 * @param {string} context - Context description for the error.
 */
export const handleError = (err, context = '') => {
  const message = context ? `${context}: ${err.message}` : err.message;
  console.error(chalk.red(`\nError: ${message}`));
};

/**
 * Wraps an async function with error handling.
 * @param {Function} fn - Async function to wrap.
 * @returns {Function} Wrapped function.
 */
export const withErrorHandling = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };
};
