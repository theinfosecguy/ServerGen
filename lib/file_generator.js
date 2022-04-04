const path = require("path");
const fs_helper = require("../lib/build_helper");
const fs = require("fs-extra");
const { option } = require("commander");

const generateMVC = function (folderDir, templatesDir) {

  let dirs = ["controllers", "model", "routes"];

  dirs.forEach((dir) => {
    let dirPath = path.join(folderDir, dir);
    fs.ensureDirSync(dirPath);
  });

  let basePath = path.join(templatesDir, "routes", "index.js");
  fs_helper.buildFilewithContents(
    basePath,
    path.join(folderDir, "routes"),
    "index.js"
  );
};

const generatePackage4Express = function (folderDir, appName, view, config) {
  var pkg = {
    name: appName,
    version: "1.0.0",
    description: "",
    main: "index.js",
    scripts: {
      start: "nodemon index.js",
    },
    dependencies: {
      express: "^4.17.1",
      nodemon: "^2.0.7",
      cors: "^2.8.5",
    },
  };
  switch (view) {
    case "ejs":
      pkg["dependencies"][view] = "^3.1.6";
      break;
    case "jade":
      pkg["dependencies"][view] = "^1.11.0";
      break;
    case "pug":
      pkg["dependencies"][view] = "^3.0.2";
      break;
    case "hbs":
      pkg["dependencies"][view] = "^4.1.1";
      break;
  }

  // Adding Dependency for Mongoose in package.json
  if (config) {
    pkg["dependencies"]["mongoose"] = "^5.11.12";
  }
  fs.writeFile(
    path.join(folderDir, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n"
  );
};

const generatePackage4Node = function (folderDir, appName, view, config) {
  var pkg = {
    name: appName,
    version: "1.0.0",
    description: "",
    main: "index.js",
    scripts: {
      start: "nodemon index.js",
    },
    dependencies: {
      nodemon: "^2.0.7",
      cors: "^2.8.5",
    },
  };
  switch (view) {
    case "ejs":
      pkg["dependencies"][view] = "^3.1.6";
      break;
    case "jade":
      pkg["dependencies"][view] = "^1.11.0";
      break;
    case "pug":
      pkg["dependencies"][view] = "^3.0.2";
      break;
    case "hbs":
      pkg["dependencies"][view] = "^4.1.1";
      break;
  }

  // Adding Dependency for Mongoose in package.json
  if (config) {
    pkg["dependencies"]["mongoose"] = "^5.11.12";
  }
  fs.writeFile(
    path.join(folderDir, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n"
  );
};

const createExpressApp = function (
  templatesDir,
  folderDir,
  appName,
  view,
  config
) {
  let basePath = path.join(templatesDir, "index.js");
  fs_helper.buildFilewithContents(basePath, folderDir, "index.js");
  generateMVC(folderDir, templatesDir);
  generatePackage4Express(folderDir, appName, view, config);
  console.log("Generating Express application..");
};

const createNodeApp = function (
  templatesDir,
  folderDir,
  appName,
  view,
  config
) {
  let basePath = path.join(templatesDir, "index.js");
  fs_helper.buildFilewithContents(basePath, folderDir, "index.js");
  generateMVC(folderDir, templatesDir);
  generatePackage4Node(folderDir, appName, view, config);
  console.log("Generating NodeJS application..");
};

const handleViews = function (folderDir, viewsDir, view) {

  fs_helper.createDir(folderDir, "views");
  let basePath = path.join(viewsDir, `ve_${view}.${view}`);
  if(view){
    manageViews(folderDir, view, true);
    switch (view) {
      case "ejs":
        fs_helper.buildFilewithContents(
          basePath,
          path.join(folderDir, "views"),
          "ve_ejs.ejs"
        );
        break;
      case "jade":
        fs_helper.buildFilewithContents(
          basePath,
          path.join(folderDir, "views"),
          "ve_jade.jade"
        );
        break;
      case "pug":
        fs_helper.buildFilewithContents(
          basePath,
          path.join(folderDir, "views"),
          "ve_pug.pug"
        );
        break;
      case "hbs":
        fs_helper.buildFilewithContents(
          basePath,
          path.join(folderDir, "views"),
          "ve_hbs.hbs"
        );
        break;
    }
  }else{
    console.log("No Views Selected")
    manageViews(folderDir, view, false);
    return;
  }
};

const manageViews = function (path1, view_name, addView) {
  const view_string = `app.set('view engine','${view_name}') \n app.set('views', path.join(__dirname, 'views'));`;
  const jsFile = path.join(path1, "index.js");
  fs.readFile(jsFile, "utf8", function (err, data) {
    if (err) {
      return console.log(err);
    }
    // Replace comment
    if(addView){
      var result = data.replace("// Views", view_string);
    }else{
      var result = data.replace("// Views", "");
    }
    fs.writeFile(jsFile, result, "utf8", function (err) {
      if (err) return console.log(err);
    });
  });
};


const handleConfig = function (folderDir, templatesDir) {
  console.log("Configuring Mongoose..");
  fs_helper.createDir(folderDir, "config");
  // Generating Config File from templates
  let basePath = path.join(templatesDir, "config", "mongoose.js");
  fs_helper.buildFilewithContents(
    basePath,
    path.join(folderDir, "config"),
    "mongoose.js"
  );
  // Adding Config Dir in Index.js
  let newIndexPath = path.join(templatesDir, "index(config).js");
  fs_helper.buildFilewithContents(newIndexPath, folderDir, "index.js");
};

const addGitIgnore = function (folderDir, templatesDir) {
  let basePath = path.join(templatesDir, ".gitignore");
  fs_helper.buildFilewithContents(basePath, folderDir, ".gitignore");
};


const addDockerSupport = function (folderDir, templatesDir) {
  // Add Docker File
  let basePath = path.join(templatesDir, "Dockerfile");
  fs_helper.buildFilewithContents(basePath, folderDir, "Dockerfile");

  // Add dockerignore File
  basePath = path.join(templatesDir, ".dockerignore");
  fs_helper.buildFilewithContents(basePath, folderDir, ".dockerignore");
};


module.exports = {
  createExpressApp,
  createNodeApp,
  handleViews,
  handleConfig,
  addGitIgnore,
  addDockerSupport,
};
