/**
 * ServerGen - Node.js/Express application scaffolding tool.
 * @module servergen
 */

import AppGenerator from './lib/app_generator.js';
import { getConfig } from './lib/config.js';
import { validateOptions, handleValidationErrors } from './lib/validator.js';
import * as fsHelper from './lib/build_helper.js';
import * as fileCreator from './lib/file_generator.js';
import * as displayer from './lib/log_display.js';
import * as fileName from './lib/fileName.js';
import { handleError, withErrorHandling } from './lib/error_handler.js';

export {
  AppGenerator,
  getConfig,
  validateOptions,
  handleValidationErrors,
  fsHelper,
  fileCreator,
  displayer,
  fileName,
  handleError,
  withErrorHandling,
};
