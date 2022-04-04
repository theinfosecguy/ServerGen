#!/usr/bin/env node

const chalk = require("chalk");
const program = require("commander");
const pkg = require("../package.json");
const path = require("path");
const cwd = process.cwd();
const fs_helper = require("../lib/build_helper");
const file_creator = require("../lib/file_generator");
const displayer = require("../lib/log_display");
const { exec } = require("child_process");
const fileName = require("../lib/fileName");
const util = require("util");

program
  .version(pkg.version)
  .option("-f, --framework <type>", "Enter Name of Framework: Node | Express")
  .requiredOption("-n, --name <type>", "Enter Name of App")
  .option("-v --view <type>", "Name of View Engine: Pug | Jade | EJS | HBS")
  .option("--db ", "Install Mongoose & the Folder Directory for it")
  .parse(process.argv);

const options = program.opts();
const appName = fileName.cleanAppName(options.name);
const folderDir = path.join(cwd, appName);
const templatesDirExpress = path.join(__dirname, "..", "templates", "express");
const templatesDirNode = path.join(__dirname, "..", "templates", "node");
const viewsDir = path.join(__dirname, "..", "templates", "express", "views");

// Create Directory with the App Name
fs_helper.buildFolderforApp(folderDir);

options.framework == "node"
  ? file_creator.createNodeApp(
      templatesDirNode,
      folderDir,
      appName,
      options.view,
      options.Db
    )
  : file_creator.createExpressApp(
      templatesDirExpress,
      folderDir,
      appName,
      options.view,
      options.Db
    );

// Handle View Flag
file_creator.handleViews(folderDir, viewsDir, options.view)

options.Db ? file_creator.handleConfig(folderDir, templatesDirExpress) : null;

file_creator.addGitIgnore(folderDir, templatesDirExpress);

displayer.beginMessage(appName);
console.log("Installing required NPM Packages. This might take a while.\n");

const execPromise = util.promisify(exec);

execPromise(`cd ${folderDir} && npm install`)
  .then(() => {
    console.log(chalk.green("\nNPM Packages Installed Successfully"));
    displayer.endMessage(appName);
  })
  .catch(err => {
    console.log(chalk.red("\nError: " + err));
});