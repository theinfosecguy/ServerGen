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
  .name('servergen')
  .description('Scaffold a Node.js or Express application.')
  .version(pkg.version)
  .argument('[name]', 'name of the app to create (alternative to --name)')
  .option('-n, --name <name>', 'name of the app to create')
  .option('-f, --framework <type>', 'framework: express | node', 'express')
  .option('-v, --view <type>', 'view engine (express only): ejs | pug | hbs')
  .option('--db', 'add Mongoose and a MongoDB config (express only)')
  .option('--typescript', 'generate an Express TypeScript app')
  .option('-p, --port <number>', 'port for the generated app (1-65535)', '3000')
  .option('--skip-install', 'skip the npm install step')
  .option('--debug', 'enable debug logging')
  .addHelpText(
    'after',
    `
Examples:
  $ servergen my-api                  create an Express app (default)
  $ servergen my-api -f node          create a Node app
  $ servergen my-api -v ejs           Express app with the EJS view engine
  $ servergen my-api --db             Express app with Mongoose/MongoDB
  $ servergen my-api --typescript     Express app with TypeScript
  $ servergen my-api -p 8080          use a custom port
  $ servergen my-api --skip-install   scaffold without running npm install
  $ servergen --name my-api           name via flag (equivalent to positional)`
  )
  .parse(process.argv);

const options = program.opts();
const positionalName = program.args[0];

if (options.debug) {
  logger.enableDebug();
}

logger.debug('CLI options received', { ...options, positionalName });

const validationResult = validateOptions(options, config.validation);
if (!validationResult.isValid) {
  validationResult.errors.forEach((error) => logger.error(error));
  process.exit(1);
}

// Resolve the app name from the positional argument or the --name flag.
if (positionalName && options.name && positionalName !== options.name) {
  logger.error(
    `Conflicting app names: "${positionalName}" (positional) and "${options.name}" (--name). Provide only one.`
  );
  process.exit(1);
}

const rawName = positionalName || options.name;

if (!rawName) {
  logger.error(
    'Missing app name. Provide it as a positional argument (servergen my-api) or with --name.'
  );
  process.exit(1);
}

const appName = fileName.cleanAppName(rawName);

if (!appName) {
  logger.error(
    'App name must contain at least one alphanumeric character. Please provide a valid name.'
  );
  process.exit(1);
}

const port = parseInt(options.port, 10) || 3000;
const skipInstall = options.skipInstall || false;

logger.debug('Parsed configuration', { appName, port, framework: options.framework, skipInstall, typescript: options.typescript });

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
    typescript: options.typescript,
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
