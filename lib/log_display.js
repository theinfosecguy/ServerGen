const chalk = require("chalk");

const endMessage = function (appName) {
  console.log(
    chalk.bold.blue(
      `\nYour App ${appName} has been created successfully by Make-Server!!\n`
    )
  );
  console.log(chalk.green("Get into the Directory & Install Modules:"));
  console.log(chalk.cyan(`cd ${appName}`));
  console.log(chalk.cyan("Happy Hacking :)"));
};

exports.endMessage = endMessage;
