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
import { validateOptions } from '../lib/validator.js';
import { createGenerator } from '../index.js';
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
  .option('-v, --view <type>', 'Name of View Engine: Pug | EJS | HBS')
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
if (!validationResult.isValid) {
  validationResult.errors.forEach((error) => logger.error(error));
  process.exit(1);
}

const appName = fileName.cleanAppName(options.name);

if (!appName) {
  logger.error(
    'App name must contain at least one alphanumeric character. Please provide a valid name.'
  );
  process.exit(1);
}

const port = parseInt(options.port, 10) || 3000;
const skipInstall = options.skipInstall || false;

logger.debug('Parsed configuration', { appName, port, framework: options.framework, skipInstall });

/**
 * Main function to run the application generator.
 */
const main = async () => {
  const generator = createGenerator({
    appName,
    framework: options.framework,
    view: options.view,
    db: options.db,
    port,
    skipInstall,
    config,
  });

  try {
    await generator.generate();
  } catch (err) {
    logger.error(err.message, err);
    process.exit(1);
  }
};

main();
