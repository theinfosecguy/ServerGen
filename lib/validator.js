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
  const framework = options.framework;
  const hasValidFramework = !framework || validationRules.frameworks.includes(framework);
  const isExpress = framework === 'express' || !framework;

  if (framework && !validationRules.frameworks.includes(framework)) {
    errors.push(`Invalid framework: ${framework}. Valid options: ${validationRules.frameworks.join(', ')}`);
  }

  if (options.view && !validationRules.views.includes(options.view)) {
    errors.push(`Invalid view engine: ${options.view}. Valid options: ${validationRules.views.join(', ')}`);
  }

  if (hasValidFramework && !isExpress && options.view) {
    errors.push('View engines are only supported with the express framework. Use --framework express or remove --view.');
  }

  if (hasValidFramework && !isExpress && options.db) {
    errors.push('The --db option (Mongoose) is only supported with the express framework. Use --framework express or remove --db.');
  }

  if (framework === 'node' && options.openapi) {
    errors.push('The --openapi option is only supported with the express and hono frameworks. Use --framework express, --framework hono, or remove --openapi.');
  }

  if (framework === 'node' && options.typescript) {
    errors.push('The --typescript option is only supported with the express and hono frameworks. Use --framework express, --framework hono, or remove --typescript.');
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
