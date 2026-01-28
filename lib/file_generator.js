/**
 * File generator utilities for creating app structure and configuration.
 * @module lib/file_generator
 */

import path from 'path';
import fs from 'fs-extra';
import * as fs_helper from './build_helper.js';
import { VIEW_ENGINES, VALID_VIEWS, DEPENDENCY_VERSIONS } from './constants.js';

/**
 * Generates MVC folder structure (controllers, model, routes).
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - The templates directory path.
 */
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

/**
 * Generates package.json with appropriate dependencies.
 * @param {string} folderDir - The application directory path.
 * @param {string} appName - The application name.
 * @param {string|null} view - The view engine name (ejs, pug, jade, hbs).
 * @param {boolean} config - Whether to include mongoose configuration.
 * @param {string} framework - The framework type ('node' or 'express').
 */
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
      nodemon: DEPENDENCY_VERSIONS.nodemon,
      cors: DEPENDENCY_VERSIONS.cors,
    },
  };

  if (framework === 'express') {
    pkg.dependencies.express = DEPENDENCY_VERSIONS.express;
  }

  if (view && VIEW_ENGINES[view]) {
    pkg.dependencies[view] = VIEW_ENGINES[view];
  }

  if (config) {
    pkg.dependencies.mongoose = DEPENDENCY_VERSIONS.mongoose;
  }

  fs.writeFileSync(
    path.join(folderDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n'
  );
};

/**
 * Creates an Express application with MVC structure.
 * @param {string} templatesDir - Path to Express templates.
 * @param {string} folderDir - The application directory path.
 * @param {string} appName - The application name.
 * @param {string|null} view - The view engine name.
 * @param {boolean} config - Whether to include mongoose configuration.
 */
const createExpressApp = (templatesDir, folderDir, appName, view, config) => {
  const basePath = path.join(templatesDir, 'index.js');
  fs_helper.buildFilewithContents(basePath, folderDir, 'index.js');
  generateMVC(folderDir, templatesDir);
  generatePackage(folderDir, appName, view, config, 'express');
  console.log('Generating Express application..');
};

/**
 * Creates a Node.js application with MVC structure.
 * @param {string} templatesDir - Path to Node templates.
 * @param {string} folderDir - The application directory path.
 * @param {string} appName - The application name.
 * @param {string|null} view - The view engine name.
 * @param {boolean} config - Whether to include mongoose configuration.
 */
const createNodeApp = (templatesDir, folderDir, appName, view, config) => {
  const basePath = path.join(templatesDir, 'index.js');
  fs_helper.buildFilewithContents(basePath, folderDir, 'index.js');
  generateMVC(folderDir, templatesDir);
  generatePackage(folderDir, appName, view, config, 'node');
  console.log('Generating NodeJS application..');
};

/**
 * Handles view engine setup for the application.
 * @param {string} folderDir - The application directory path.
 * @param {string} viewsDir - Path to view templates.
 * @param {string|null} view - The view engine name (ejs, pug, jade, hbs).
 */
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

/**
 * Updates index.js with view engine configuration.
 * @param {string} folderPath - The application directory path.
 * @param {string} viewName - The view engine name.
 * @param {boolean} addView - Whether to add or remove view configuration.
 */
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

/**
 * Sets up MongoDB/Mongoose configuration files.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 */
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

/**
 * Adds .gitignore file to the application.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 */
const addGitIgnore = (folderDir, templatesDir) => {
  const basePath = path.join(templatesDir, '.gitignore');
  fs_helper.buildFilewithContents(basePath, folderDir, '.gitignore');
};

/**
 * Adds Docker support files (Dockerfile and .dockerignore).
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 */
const addDockerSupport = (folderDir, templatesDir) => {
  const dockerfilePath = path.join(templatesDir, 'Dockerfile');
  fs_helper.buildFilewithContents(dockerfilePath, folderDir, 'Dockerfile');

  const dockerignorePath = path.join(templatesDir, '.dockerignore');
  fs_helper.buildFilewithContents(dockerignorePath, folderDir, '.dockerignore');
};

/**
 * Adds README.md file to the application.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 */
const addReadme = (folderDir, templatesDir) => {
  const readmePath = path.join(templatesDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    fs_helper.buildFilewithContents(readmePath, folderDir, 'README.md');
  }
};

/**
 * Adds .env.example file to the application.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 */
const addEnvExample = (folderDir, templatesDir) => {
  const envPath = path.join(templatesDir, '.env.example');
  if (fs.existsSync(envPath)) {
    fs_helper.buildFilewithContents(envPath, folderDir, '.env.example');
  }
};

export {
  createExpressApp,
  createNodeApp,
  handleViews,
  handleConfig,
  addGitIgnore,
  addDockerSupport,
  addReadme,
  addEnvExample,
};
