/**
 * Build helper utilities for file and directory operations.
 * @module lib/build_helper
 */

import path from 'path';
import fs from 'fs-extra';

/**
 * Creates a directory inside the specified app directory.
 * @param {string} appDir - The base application directory path.
 * @param {string} folderName - The name of the folder to create.
 */
export const createDir = (appDir, folderName) => {
  const dName = path.join(appDir, folderName);
  fs.ensureDirSync(dName);
};

/**
 * Copies file contents from source to destination.
 * @param {string} readFrom - The source file path to read from.
 * @param {string} folderDir - The destination directory path.
 * @param {string} fileName - The name of the file to create.
 */
export const buildFilewithContents = (readFrom, folderDir, fileName) => {
  const fileContent = fs.readFileSync(readFrom, 'utf-8');
  fs.ensureDirSync(folderDir);
  fs.writeFileSync(path.join(folderDir, fileName), fileContent);
};

/**
 * Creates the main application folder.
 * @param {string} folderDir - The path of the folder to create.
 * @throws {Error} If the folder already exists or cannot be created. Callers
 *   (e.g. the CLI) decide how to report the failure and whether to exit.
 */
export const buildFolderforApp = (folderDir) => {
  try {
    fs.mkdirSync(folderDir);
  } catch (err) {
    if (err.code === 'EEXIST') {
      throw new Error(
        `Directory ${folderDir} already exists. Choose a different app name or remove the existing directory.`
      );
    }
    throw err;
  }
};
