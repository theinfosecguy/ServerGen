/**
 * Build helper utilities for file and directory operations.
 * @module lib/build_helper
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

/**
 * Creates a directory inside the specified app directory.
 * @param {string} appDir - The base application directory path.
 * @param {string} folderName - The name of the folder to create.
 */
const createDir = (appDir, folderName) => {
  const dName = path.join(appDir, folderName);
  fs.ensureDirSync(dName);
};

/**
 * Copies file contents from source to destination.
 * @param {string} readFrom - The source file path to read from.
 * @param {string} folderDir - The destination directory path.
 * @param {string} fileName - The name of the file to create.
 */
const buildFilewithContents = (readFrom, folderDir, fileName) => {
  const fileContent = fs.readFileSync(readFrom, 'utf-8');
  fs.writeFileSync(path.join(folderDir, fileName), fileContent);
};

/**
 * Creates the main application folder. Exits if folder already exists.
 * @param {string} folderDir - The path of the folder to create.
 */
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
