#!/usr/bin/env node

/**
 * ServerGen CLI - Generates Node.js/Express application scaffolding.
 * @module bin/servergen
 */

const chalk = require('chalk');
const program = require('commander');
const pkg = require('../package.json');
const path = require('path');
const cwd = process.cwd();
const fs_helper = require('../lib/build_helper');
const file_creator = require('../lib/file_generator');
const displayer = require('../lib/log_display');
const { exec } = require('child_process');
const fileName = require('../lib/fileName');
const util = require('util');

program
  .version(pkg.version)
  .option('-f, --framework <type>', 'Enter Name of Framework: Node | Express')
  .requiredOption('-n, --name <type>', 'Enter Name of App')
  .option('-v --view <type>', 'Name of View Engine: Pug | Jade | EJS | HBS')
  .option('--db', 'Install Mongoose & the Folder Directory for it')
  .parse(process.argv);

const options = program.opts();

const VALID_FRAMEWORKS = ['node', 'express'];
const VALID_VIEWS = ['ejs', 'jade', 'pug', 'hbs'];

if (options.framework && !VALID_FRAMEWORKS.includes(options.framework)) {
  console.error(chalk.red(`Invalid framework: ${options.framework}. Valid options: ${VALID_FRAMEWORKS.join(', ')}`));
  process.exit(1);
}

if (options.view && !VALID_VIEWS.includes(options.view)) {
  console.error(chalk.red(`Invalid view engine: ${options.view}. Valid options: ${VALID_VIEWS.join(', ')}`));
  process.exit(1);
}

const appName = fileName.cleanAppName(options.name);
const folderDir = path.join(cwd, appName);
const templatesDirExpress = path.join(__dirname, '..', 'templates', 'express');
const templatesDirNode = path.join(__dirname, '..', 'templates', 'node');
const viewsDir = path.join(__dirname, '..', 'templates', 'express', 'views');

// Create Directory with the App Name
fs_helper.buildFolderforApp(folderDir);

options.framework == 'node'
  ? file_creator.createNodeApp(
      templatesDirNode,
      folderDir,
      appName,
      options.view,
      options.db
    )
  : file_creator.createExpressApp(
      templatesDirExpress,
      folderDir,
      appName,
      options.view,
      options.db
    );

// Handle View Flag
file_creator.handleViews(folderDir, viewsDir, options.view);

if (options.db) {
  file_creator.handleConfig(folderDir, templatesDirExpress);
}

// Use correct template directory based on framework
const activeTemplatesDir = options.framework === 'node' ? templatesDirNode : templatesDirExpress;
file_creator.addGitIgnore(folderDir, activeTemplatesDir);
file_creator.addDockerSupport(folderDir, activeTemplatesDir);

displayer.beginMessage(appName);
console.log('Installing required NPM Packages. This might take a while.');

const execPromise = util.promisify(exec);

execPromise(`cd ${folderDir} && npm install`)
  .then(() => {
    console.log(chalk.green('\nNPM Packages Installed Successfully'));
    displayer.endMessage(appName);
  })
  .catch((err) => {
    console.log(chalk.red('\nError: ' + err));
  });
