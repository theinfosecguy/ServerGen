const path = require("path");
const fs_helper = require("../lib/build_helper");
const fs = require("fs-extra");

const generateMVC = function (folderDir) {
  fs_helper.createDir(folderDir, "model");
  fs_helper.createDir(folderDir, "controllers");
  fs_helper.createDir(folderDir, "routes");
};

const generatePackage4Express = function (templatesDir, folderDir, appName) {
  let basePath = path.join(templatesDir, "package.json");
  fs_helper.buildFilewithContents(basePath, folderDir, "package.json");
  const pJson = path.join(folderDir, "package.json");
  const file = require(pJson);
  file.name = appName;
  fs.writeFile(pJson, JSON.stringify(file), function writeJSON(err) {
    if (err) return console.log(err);
  });
};

const generatePackage4Node = function (templatesDir, folderDir, appName) {
  let basePath = path.join(templatesDir, "package.json");
  fs_helper.buildFilewithContents(basePath, folderDir, "package.json");
  const pJson = path.join(folderDir, "package.json");
  const file = require(pJson);
  file.name = appName;
  fs.writeFile(pJson, JSON.stringify(file), function writeJSON(err) {
    if (err) return console.log(err);
  });
};

const createExpressApp = function (templatesDir, folderDir, appName) {
  let basePath = path.join(templatesDir, "index.js");
  fs_helper.buildFilewithContents(basePath, folderDir, "index.js");
  generateMVC(folderDir);
  generatePackage4Express(templatesDir, folderDir, appName);
  console.log("Express App in making");
};

const createNodeApp = function (templatesDir, folderDir, appName) {
  let basePath = path.join(templatesDir, "index.js");
  fs_helper.buildFilewithContents(basePath, folderDir, "index.js");
  generateMVC(folderDir);
  generatePackage4Node(templatesDir, folderDir, appName);
  console.log("Node App in making");
};

const handleViews = function (folderDir, viewsDir, view) {
  fs_helper.createDir(folderDir, "views");
  let basePath = path.join(viewsDir, `ve_${view}.${view}`);
  updateIndexFile(folderDir, view);
  console.log("view is", view);
  switch (view) {
    case "ejs":
      addDependencies(folderDir, "ejs", "^3.1.6");
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
      addDependencies(folderDir, "jade", "^1.11.0");
      break;
    case "pug":
      fs_helper.buildFilewithContents(
        basePath,
        path.join(folderDir, "views"),
        "ve_pug.pug"
      );
      addDependencies(folderDir, "pug", "^3.0.2");
      break;
    case "hbs":
      fs_helper.buildFilewithContents(
        basePath,
        path.join(folderDir, "views"),
        "ve_hbs.hbs"
      );
      addDependencies(folderDir, "hbs", "^4.1.1");
      break;
  }
};

const updateIndexFile = function (path1, view_name) {
  const view_string = `app.set('view engine','${view_name}') \n app.set('views', path.join(__dirname, 'views'));`;
  const jsFile = path.join(path1, "index.js");
  fs.readFile(jsFile, "utf8", function (err, data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace(/null/g, view_string);
    fs.writeFile(jsFile, result, "utf8", function (err) {
      if (err) return console.log(err);
    });
  });
};

const addDependencies = function (folderDir, Name, Version) {
  const pJson = path.join(folderDir, "package.json");
  const file = require(pJson);
  file.dependencies[`${Name}`] = `${Version}`;
  fs.writeFile(pJson, JSON.stringify(file), function writeJSON(err) {
    if (err) return console.log(err);
  });
};

const handleConfig = function (folderDir, templatesDir) {
  // Adding Dependency for Mongoose in package.jsons
  addDependencies(folderDir, "mongoose", "^5.11.12");
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

exports.handleConfig = handleConfig;
exports.handleViews = handleViews;
exports.createExpressApp = createExpressApp;
exports.createNodeApp = createNodeApp;
exports.generateMVC = generateMVC;
exports.addGitIgnore = addGitIgnore;
