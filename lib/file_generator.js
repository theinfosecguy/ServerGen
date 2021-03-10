const path = require("path");
const fs_helper = require("../lib/build_helper");
const fs = require("fs-extra");

const generateMVC = function (folderDir, templatesDir) {
  fs_helper.createDir(folderDir, "model");
  fs_helper.createDir(folderDir, "controllers");
  fs_helper.createDir(folderDir, "routes");
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
    version: "0.0.0",
    description: "",
    main: "index.js",
    scripts: {
      start: "node ./bin/www",
    },
    dependencies: {
      express: "^4.17.1",
      nodemon: "^2.0.7",
    },
  };
  switch (view) {
    case "ejs":
      pkg["dependencies"][view] = "^4.17.1";
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
};

const createNodeApp = function (templatesDir, folderDir, appName) {
  let basePath = path.join(templatesDir, "index.js");
  fs_helper.buildFilewithContents(basePath, folderDir, "index.js");
  generateMVC(folderDir, templatesDir);
  generatePackage4Node(templatesDir, folderDir, appName);
  console.log("Node App in making");
};

const handleViews = function (folderDir, viewsDir, view) {
  fs_helper.createDir(folderDir, "views");
  let basePath = path.join(viewsDir, `ve_${view}.${view}`);
  updateIndexFile(folderDir, view);
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

const handleConfig = function (folderDir, templatesDir) {
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
