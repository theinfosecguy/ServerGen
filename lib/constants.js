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
  ejs: '^6.0.1',
  pug: '^3.0.4',
  hbs: '^4.2.1',
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
  nodemon: '^3.1.14',
  cors: '^2.8.6',
  express: '^5.2.1',
  mongoose: '^9.7.0',
  dotenv: '^17.4.2',
  supertest: '^7.2.2',
  typescript: '^5.9.3',
  tsx: '^4.21.0',
  '@types/node': '^24.10.1',
  '@types/express': '^5.0.5',
  '@types/cors': '^2.8.19',
  '@types/supertest': '^6.0.3',
};
