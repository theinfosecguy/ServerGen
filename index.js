/**
 * ServerGen - Node.js/Express application scaffolding tool.
 * @module servergen
 */

const AppGenerator = require('./lib/app_generator');
const { getConfig } = require('./lib/config');
const { validateOptions, handleValidationErrors } = require('./lib/validator');
const fsHelper = require('./lib/build_helper');
const fileCreator = require('./lib/file_generator');
const displayer = require('./lib/log_display');
const fileName = require('./lib/fileName');
const { handleError, withErrorHandling } = require('./lib/error_handler');

module.exports = {
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
