const path = require("path");
const fs_helper = require("../lib/build_helper");
const fs = require("fs-extra");

const generateMVC = function (folderDir) {
  // todo: Create Function for Views & View Engine
  // fs_helper.createDir(folderDir, "views");
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
  switch (view) {
    case "ejs":
      let basePath = path.join(viewsDir, "ve_ejs.ejs");
      fs_helper.buildFilewithContents(
        basePath,
        path.join(folderDir, "views"),
        "ve_ejs.ejs"
      );
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

exports.handleViews = handleViews;
exports.createExpressApp = createExpressApp;
exports.createNodeApp = createNodeApp;
exports.generateMVC = generateMVC;
