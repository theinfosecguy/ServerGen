/**
 * ServerGen - Node.js/Express application scaffolding tool.
 * @module servergen
 */

import AppGenerator from './lib/app_generator.js';
import { getConfig } from './lib/config.js';
import { validateOptions } from './lib/validator.js';
import * as fsHelper from './lib/build_helper.js';
import * as fileCreator from './lib/file_generator.js';
import * as displayer from './lib/log_display.js';
import * as fileName from './lib/fileName.js';
import { handleError, withErrorHandling } from './lib/error_handler.js';
import * as logger from './lib/logger.js';

/**
 * Creates an AppGenerator wired with the default library dependencies.
 * Acts as the composition root so callers (the CLI or programmatic users)
 * do not have to assemble the dependency bundle themselves.
 * @param {Object} options - Generation options (see AppGenerator constructor).
 * @returns {AppGenerator} A ready-to-use generator instance.
 */
const createGenerator = (options) => {
  return new AppGenerator(options, { fsHelper, fileCreator, displayer, logger });
};

export {
  AppGenerator,
  createGenerator,
  getConfig,
  validateOptions,
  fsHelper,
  fileCreator,
  displayer,
  fileName,
  handleError,
  withErrorHandling,
  logger,
};
