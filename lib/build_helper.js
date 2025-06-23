var path = require('path');
var mkdirp = require('mkdirp');
const fs = require('fs-extra');
const chalk = require('chalk');

var createDir = function (appDir, folderName) {
  let dName = path.join(appDir, folderName);
  mkdirp.sync(dName);
};

var buildFilewithContents = function (readFrom, folderDir, fileName) {
  // Read file content from the File ( from source dir)
  var fileContent = fs.readFileSync(readFrom, 'utf-8');
  // Write content to the file
  fs.writeFileSync(path.join(folderDir, fileName), fileContent);
};

const buildFolderforApp = function (folderDir) {
  try {
    fs.mkdirSync(folderDir);
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.error(
        chalk.red(`Directory ${folderDir} already exists,Please Try Again`)
      );
      process.exit(1);
    } else {
      throw err;
    }
  }
};

exports.buildFolderforApp = buildFolderforApp;
exports.createDir = createDir;
exports.buildFilewithContents = buildFilewithContents;
