#!/usr/bin/env node

/**
 * ServerGen CLI - Generates Node.js/Express application scaffolding.
 * @module bin/servergen
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';
import { program } from 'commander';
import { getConfig } from '../lib/config.js';
import { validateOptions, handleValidationErrors } from '../lib/validator.js';
import AppGenerator from '../lib/app_generator.js';
import * as fsHelper from '../lib/build_helper.js';
import * as fileCreator from '../lib/file_generator.js';
import * as displayer from '../lib/log_display.js';
import * as fileName from '../lib/fileName.js';
import * as logger from '../lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const config = getConfig(__dirname, process.cwd());

program
  .version(pkg.version)
  .option('-f, --framework <type>', 'Enter Name of Framework: Node | Express')
  .requiredOption('-n, --name <type>', 'Enter Name of App')
  .option('-v --view <type>', 'Name of View Engine: Pug | Jade | EJS | HBS')
  .option('--db', 'Install Mongoose & the Folder Directory for it')
  .option('-p, --port <number>', 'Set default port for the app', '3000')
  .option('--skip-install', 'Skip npm install step')
  .option('--debug', 'Enable debug logging')
  .parse(process.argv);

const options = program.opts();

if (options.debug) {
  logger.enableDebug();
}

logger.debug('CLI options received', options);

const validationResult = validateOptions(options, config.validation);
handleValidationErrors(validationResult);

const appName = fileName.cleanAppName(options.name);
const port = parseInt(options.port, 10) || 3000;
const skipInstall = options.skipInstall || false;

logger.debug('Parsed configuration', { appName, port, framework: options.framework, skipInstall });

/**
 * Main function to run the application generator.
 */
const main = async () => {
  const generator = new AppGenerator(
    {
      appName,
      framework: options.framework,
      view: options.view,
      db: options.db,
      port,
      skipInstall,
      config,
    },
    {
      fsHelper,
      fileCreator,
      displayer,
      logger,
    }
  );

  try {
    await generator.generate();
  } catch (err) {
    logger.error('Generation failed', err);
    process.exit(1);
  }
};

main();
