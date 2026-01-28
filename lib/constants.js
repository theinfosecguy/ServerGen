/**
 * Application constants for ServerGen.
 * @module lib/constants
 */

/**
 * Log levels for controlling output verbosity.
 * @readonly
 * @enum {number}
 */
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * Supported view engine versions for generated apps.
 * @constant {Object.<string, string>}
 */
export const VIEW_ENGINES = {
  ejs: '^3.1.10',
  jade: '^1.11.0',
  pug: '^3.0.3',
  hbs: '^4.2.0',
};

/**
 * List of valid view engine names.
 * @constant {string[]}
 */
export const VALID_VIEWS = Object.keys(VIEW_ENGINES);

/**
 * Default dependency versions for generated apps.
 * @constant {Object.<string, string>}
 */
export const DEPENDENCY_VERSIONS = {
  nodemon: '^3.1.0',
  cors: '^2.8.5',
  express: '^4.21.0',
  mongoose: '^8.5.0',
  fastify: '^5.2.1',
  '@fastify/cors': '^11.0.0',
  '@fastify/formbody': '^8.0.2',
  '@fastify/helmet': '^13.0.1',
  '@fastify/view': '^10.0.1',
};
