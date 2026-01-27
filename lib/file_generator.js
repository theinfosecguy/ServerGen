const path = require('path');
const fs_helper = require('../lib/build_helper');
const fs = require('fs-extra');

const VIEW_ENGINES = {
  ejs: '^3.1.10',
  jade: '^1.11.0',
  pug: '^3.0.3',
  hbs: '^4.2.0',
};

const VALID_VIEWS = Object.keys(VIEW_ENGINES);

const generateMVC = (folderDir, templatesDir) => {
  const dirs = ['controllers', 'model', 'routes'];

  dirs.forEach((dir) => {
    const dirPath = path.join(folderDir, dir);
    fs.ensureDirSync(dirPath);
  });

  const routesPath = path.join(templatesDir, 'routes', 'index.js');
  if (fs.existsSync(routesPath)) {
    fs_helper.buildFilewithContents(
      routesPath,
      path.join(folderDir, 'routes'),
      'index.js'
    );
  }
};

const generatePackage = (folderDir, appName, view, config, framework) => {
  const pkg = {
    name: appName,
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      start: 'nodemon index.js',
    },
    dependencies: {
      nodemon: '^3.1.0',
      cors: '^2.8.5',
    },
  };

  if (framework === 'express') {
    pkg.dependencies.express = '^4.21.0';
  }

  if (view && VIEW_ENGINES[view]) {
    pkg.dependencies[view] = VIEW_ENGINES[view];
  }

  if (config) {
    pkg.dependencies.mongoose = '^8.5.0';
  }

  fs.writeFileSync(
    path.join(folderDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n'
  );
};

const createExpressApp = (templatesDir, folderDir, appName, view, config) => {
  const basePath = path.join(templatesDir, 'index.js');
  fs_helper.buildFilewithContents(basePath, folderDir, 'index.js');
  generateMVC(folderDir, templatesDir);
  generatePackage(folderDir, appName, view, config, 'express');
  console.log('Generating Express application..');
};

const createNodeApp = (templatesDir, folderDir, appName, view, config) => {
  const basePath = path.join(templatesDir, 'index.js');
  fs_helper.buildFilewithContents(basePath, folderDir, 'index.js');
  generateMVC(folderDir, templatesDir);
  generatePackage(folderDir, appName, view, config, 'node');
  console.log('Generating NodeJS application..');
};

const handleViews = (folderDir, viewsDir, view) => {
  fs_helper.createDir(folderDir, 'views');

  if (!view) {
    console.log('No Views Selected');
    manageViews(folderDir, view, false);
    return;
  }

  if (!VALID_VIEWS.includes(view)) {
    console.log(`Invalid view engine: ${view}. Valid options: ${VALID_VIEWS.join(', ')}`);
    return;
  }

  manageViews(folderDir, view, true);
  const basePath = path.join(viewsDir, `ve_${view}.${view}`);
  fs_helper.buildFilewithContents(
    basePath,
    path.join(folderDir, 'views'),
    `ve_${view}.${view}`
  );
};

const manageViews = (folderPath, viewName, addView) => {
  const viewString = `app.set('view engine','${viewName}') \n app.set('views', path.join(__dirname, 'views'));`;
  const jsFile = path.join(folderPath, 'index.js');

  try {
    let data = fs.readFileSync(jsFile, 'utf8');
    if (addView) {
      data = data.replace('// Views', viewString);
    } else {
      data = data.replace('// Views', '');
    }
    fs.writeFileSync(jsFile, data, 'utf8');
  } catch (err) {
    console.log(err);
  }
};

const handleConfig = (folderDir, templatesDir) => {
  console.log('Configuring Mongoose..');
  fs_helper.createDir(folderDir, 'config');
  const basePath = path.join(templatesDir, 'config', 'mongoose.js');
  fs_helper.buildFilewithContents(
    basePath,
    path.join(folderDir, 'config'),
    'mongoose.js'
  );
  const newIndexPath = path.join(templatesDir, 'index(config).js');
  fs_helper.buildFilewithContents(newIndexPath, folderDir, 'index.js');
};

const addGitIgnore = (folderDir, templatesDir) => {
  const basePath = path.join(templatesDir, '.gitignore');
  fs_helper.buildFilewithContents(basePath, folderDir, '.gitignore');
};

const addDockerSupport = (folderDir, templatesDir) => {
  const dockerfilePath = path.join(templatesDir, 'Dockerfile');
  fs_helper.buildFilewithContents(dockerfilePath, folderDir, 'Dockerfile');

  const dockerignorePath = path.join(templatesDir, '.dockerignore');
  fs_helper.buildFilewithContents(dockerignorePath, folderDir, '.dockerignore');
};

module.exports = {
  createExpressApp,
  createNodeApp,
  handleViews,
  handleConfig,
  addGitIgnore,
  addDockerSupport,
};
