/**
 * Display utilities for console output messages.
 * @module lib/log_display
 */

const chalk = require('chalk');

/**
 * Displays the initial message when app creation starts.
 * @param {string} appName - The name of the application being created.
 */
const beginMessage = (appName) => {
  console.log(
    chalk.bold.blue(`\nYour App ${appName} is being created, please wait..\n`)
  );
};

/**
 * Displays the completion message with next steps.
 * @param {string} appName - The name of the created application.
 */
const endMessage = (appName) => {
  console.log(chalk.cyan(`cd ${appName}`));
  console.log(chalk.cyan(`npm start`));
  console.log(chalk.cyan('Happy Hacking :)'));
};

module.exports = {
  endMessage,
  beginMessage,
};
