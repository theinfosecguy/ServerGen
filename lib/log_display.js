const chalk = require('chalk');

const beginMessage = function (appName) {
  console.log(
    chalk.bold.blue(`\nYour App ${appName} is being created, please wait..\n`)
  );
};

const endMessage = function (appName) {
  console.log(chalk.cyan(`cd ${appName}`));
  console.log(chalk.cyan(`npm start`));
  console.log(chalk.cyan('Happy Hacking :)'));
};

exports.endMessage = endMessage;
exports.beginMessage = beginMessage;
