/**
 * Input validation utilities for CLI options.
 * @module lib/validator
 */

/**
 * Validates CLI options against allowed values.
 * @param {Object} options - CLI options object.
 * @param {Object} validationRules - Validation rules from config.
 * @param {string[]} validationRules.frameworks - Valid framework values.
 * @param {string[]} validationRules.views - Valid view engine values.
 * @returns {Object} Validation result with isValid and errors.
 */
export const validateOptions = (options, validationRules) => {
  const errors = [];

  if (options.framework && !validationRules.frameworks.includes(options.framework)) {
    errors.push(`Invalid framework: ${options.framework}. Valid options: ${validationRules.frameworks.join(', ')}`);
  }

  if (options.view && !validationRules.views.includes(options.view)) {
    errors.push(`Invalid view engine: ${options.view}. Valid options: ${validationRules.views.join(', ')}`);
  }

  if (options.framework === 'node' && options.view) {
    errors.push('View engines are only supported with the express framework. Use --framework express or remove --view.');
  }

  if (options.port !== undefined && options.port !== null) {
    const portNum = Number(options.port);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      errors.push(`Invalid port: ${options.port}. Port must be an integer between 1 and 65535.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
