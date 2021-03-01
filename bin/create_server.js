#!/usr/bin/env node

console.log("Project on branch by Keshav started !");

const program = require('commander');
const pkg = require('../package.json');
const path = require('path');
const mkdirp = require('mkdirp');
const cwd = process.cwd();
const fs = require('fs-extra');
const fs_helper = require('../lib/build_helper');
const file_creator = require('../lib/file_generator');

program
  .version(pkg.version)
  .option('-f, --framework <type>', 'Enter Name of Framework')
  .requiredOption('-n, --name <type>', 'Enter Name of App')
  .option('--views <type>', 'Which View Engine to use!')
  .parse(process.argv)


const options = program.opts();
const appName = options.name;
const folderDir = path.join(cwd, appName);
const templatesDirExpress = path.join(__dirname, "..",'templates', "express");
const templatesDirNode = path.join(__dirname, "..",'templates', "node");

// Create Directory with the App Name
mkdirp.sync(folderDir);

// Create views for MVC if MVC Flag is set
//Todo - Views setup

options.framework == 'node'? file_creator.createNodeApp(templatesDirNode, folderDir) : file_creator.createExpressApp(templatesDirExpress, folderDir)
