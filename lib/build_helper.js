const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const chalk = require('chalk');

const createDir = (appDir, folderName) => {
  const dName = path.join(appDir, folderName);
  mkdirp.sync(dName);
};

const buildFilewithContents = (readFrom, folderDir, fileName) => {
  const fileContent = fs.readFileSync(readFrom, 'utf-8');
  fs.writeFileSync(path.join(folderDir, fileName), fileContent);
};

const buildFolderforApp = (folderDir) => {
  try {
    fs.mkdirSync(folderDir);
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.error(
        chalk.red(`Directory ${folderDir} already exists, Please Try Again`)
      );
      process.exit(1);
    } else {
      throw err;
    }
  }
};

module.exports = {
  buildFolderforApp,
  createDir,
  buildFilewithContents,
};
