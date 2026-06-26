import {
  isMongoDatabase,
  isPostgresDatabase,
  normalizeDatabaseOption,
  normalizeOrmOption,
} from './database.js';

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
  const db = normalizeDatabaseOption(options.db);
  const orm = normalizeOrmOption(options.orm);

  if (framework && !validationRules.frameworks.includes(framework)) {
    errors.push(`Invalid framework: ${framework}. Valid options: ${validationRules.frameworks.join(', ')}`);
  }

  if (options.view && !validationRules.views.includes(options.view)) {
    errors.push(`Invalid view engine: ${options.view}. Valid options: ${validationRules.views.join(', ')}`);
  }

  if (hasValidFramework && !isExpress && options.view) {
    errors.push('View engines are only supported with the express framework. Use --framework express or remove --view.');
  }

  if (db && db !== 'mongodb' && db !== 'postgres') {
    errors.push(`Invalid database: ${options.db}. Valid options: mongodb, postgres.`);
  }

  if (orm && orm !== 'prisma') {
    errors.push(`Invalid ORM: ${options.orm}. Valid options: prisma.`);
  }

  if (orm && db !== 'postgres') {
    errors.push('The --orm option is only supported with --db postgres. Use --db postgres --orm prisma or remove --orm.');
  }

  if (hasValidFramework && !isExpress && isMongoDatabase(db)) {
    errors.push('The --db mongodb option is only supported with the express framework. Use --framework express or remove --db.');
  }

  if (hasValidFramework && !isExpress && isPostgresDatabase(db)) {
    errors.push('The --db postgres option is only supported with Express TypeScript apps. Use --framework express --typescript --db postgres --orm prisma.');
  }

  if (isPostgresDatabase(db) && orm !== 'prisma') {
    errors.push('The --db postgres option requires --orm prisma.');
  }

  if (isPostgresDatabase(db) && !options.typescript) {
    errors.push('The --db postgres option currently requires --typescript.');
  }

  if (isPostgresDatabase(db) && options.view) {
    errors.push('The --db postgres option is API-only and does not support --view yet. Remove --view or use --db mongodb.');
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
