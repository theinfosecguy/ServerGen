#!/usr/bin/env node

console.log("Project on branch by Keshav started !");

const program = require('commander');
const pkg = require('../package.json');
const path = require('path');
const mkdirp = require('mkdirp');
const cwd = process.cwd();

const fs_helper = require('../lib/createFolder');

program
  .version(pkg.version)
  .option('-f, --framework <type>', 'Enter Name of Framework')
  .requiredOption('-n, --name <type>', 'Enter Name of App')
  .option('--mvc <type>', 'Enter 0 if MVC Dir Structure is not needed')
  .parse(process.argv)


const options = program.opts();
const appName = options.name;
const folderDir = path.join(cwd, appName);

// Create Directory with the App Name
mkdirp.sync(folderDir);

// Create Folders for MVC if MVC Flag is set
if(options.mvc != 0){
    fs_helper.createDir(folderDir, "views");
    fs_helper.createDir(folderDir, "model");
    fs_helper.createDir(folderDir, "controllers");
}