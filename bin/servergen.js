#!/usr/bin/env node

/**
 * ServerGen CLI - Generates Node.js/Express application scaffolding.
 * @module bin/servergen
 */

const program = require('commander');
const pkg = require('../package.json');
const { getConfig } = require('../lib/config');
const { validateOptions, handleValidationErrors } = require('../lib/validator');
const AppGenerator = require('../lib/app_generator');
const fsHelper = require('../lib/build_helper');
const fileCreator = require('../lib/file_generator');
const displayer = require('../lib/log_display');
const fileName = require('../lib/fileName');

const config = getConfig(__dirname, process.cwd());

program
  .version(pkg.version)
  .option('-f, --framework <type>', 'Enter Name of Framework: Node | Express')
  .requiredOption('-n, --name <type>', 'Enter Name of App')
  .option('-v --view <type>', 'Name of View Engine: Pug | Jade | EJS | HBS')
  .option('--db', 'Install Mongoose & the Folder Directory for it')
  .parse(process.argv);

const options = program.opts();

const validationResult = validateOptions(options, config.validation);
handleValidationErrors(validationResult);

const appName = fileName.cleanAppName(options.name);

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
      config,
    },
    {
      fsHelper,
      fileCreator,
      displayer,
    }
  );

  try {
    await generator.generate();
  } catch (err) {
    process.exit(1);
  }
};

main();
