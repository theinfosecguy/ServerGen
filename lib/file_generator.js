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
 * @param {string|null} view - The view engine name (ejs, pug, hbs).
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
      start: 'node index.js',
      dev: 'nodemon index.js',
    },
    dependencies: {
      cors: DEPENDENCY_VERSIONS.cors,
    },
    devDependencies: {
      nodemon: DEPENDENCY_VERSIONS.nodemon,
    },
  };

  if (framework === 'express') {
    pkg.dependencies.express = DEPENDENCY_VERSIONS.express;
    pkg.dependencies.dotenv = DEPENDENCY_VERSIONS.dotenv;
    pkg.scripts.test = 'node --test';
    pkg.devDependencies.supertest = DEPENDENCY_VERSIONS.supertest;
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
  // Select the correct base index.js up front (config variant vs plain) so that
  // later port and view edits operate on the final file and are not overwritten.
  const indexTemplate = config ? 'index(config).js' : 'index.js';
  const basePath = path.join(templatesDir, indexTemplate);
  fs_helper.buildFilewithContents(basePath, folderDir, 'index.js');
  generateMVC(folderDir, templatesDir);
  generatePackage(folderDir, appName, view, config, 'express');
  generateAppTest(folderDir, templatesDir);
  console.log('Generating Express application..');
};

/**
 * Copies the generated app's integration test into a test/ directory.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to Express templates.
 */
const generateAppTest = (folderDir, templatesDir) => {
  const testTemplate = path.join(templatesDir, 'test', 'app.test.js');
  if (fs.existsSync(testTemplate)) {
    fs_helper.createDir(folderDir, 'test');
    fs_helper.buildFilewithContents(
      testTemplate,
      path.join(folderDir, 'test'),
      'app.test.js'
    );
  }
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
 * @param {string|null} view - The view engine name (ejs, pug, hbs).
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
  manageViewRoute(folderDir, view);
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

  // Let read/write failures propagate so a corrupt index.js is not reported
  // as a successful generation.
  let data = fs.readFileSync(jsFile, 'utf8');
  if (addView) {
    data = data.replace('// Views', viewString);
  } else {
    data = data.replace('// Views', '');
  }
  fs.writeFileSync(jsFile, data, 'utf8');
};

/**
 * Updates the generated root route to render the selected view template.
 * @param {string} folderPath - The application directory path.
 * @param {string} viewName - The view engine name.
 */
const manageViewRoute = (folderPath, viewName) => {
  const routesFile = path.join(folderPath, 'routes', 'index.js');
  if (!fs.existsSync(routesFile)) {
    return;
  }

  const templateName = `ve_${viewName}`;
  const routeString = `/**
 * GET / - Renders the selected view template.
 */
router.get('/', function (req, res) {
  res.status(200).render('${templateName}', {
    title: 'ServerGen',
    message: 'Welcome to ServerGen!',
  });
});
`;

  const routePattern = /\/\*\*\n \* GET \/ - Returns welcome message\.\n \*\/\nrouter\.get\('\/', function \(req, res\) \{\n[\s\S]*?\n\}\);\n/;
  const data = fs.readFileSync(routesFile, 'utf8');
  fs.writeFileSync(routesFile, data.replace(routePattern, routeString), 'utf8');
};

/**
 * Sets up MongoDB/Mongoose configuration files.
 * The config-aware index.js is chosen in createExpressApp, so this only writes
 * the mongoose config and must not overwrite index.js (which would discard any
 * port and view edits already applied).
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
};

/**
 * Adds .gitignore file to the application.
 * The template source is stored as 'gitignore' (no leading dot) because npm
 * strips files literally named '.gitignore' from published tarballs, which
 * would leave generated projects without a .gitignore. We read the dotless
 * 'gitignore' template and write it into the generated project as '.gitignore'.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 */
const addGitIgnore = (folderDir, templatesDir) => {
  const basePath = path.join(templatesDir, 'gitignore');
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
 * @param {Object} options - README generation options.
 * @param {number} options.port - Port configured for the generated app.
 */
const addReadme = (folderDir, templatesDir, options = {}) => {
  const readmePath = path.join(templatesDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    fs_helper.buildFilewithContents(readmePath, folderDir, 'README.md');

    if (options.port) {
      const generatedReadmePath = path.join(folderDir, 'README.md');
      const readme = fs
        .readFileSync(generatedReadmePath, 'utf-8')
        .replace(/http:\/\/localhost:3000/g, `http://localhost:${options.port}`);
      fs.writeFileSync(generatedReadmePath, readme, 'utf-8');
    }
  }
};

/**
 * Adds .env.example file to the application.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 * @param {Object} options - Environment file generation options.
 * @param {boolean} options.db - Whether MongoDB configuration is enabled.
 * @param {number} options.port - Port configured for the generated app.
 */
const addEnvExample = (folderDir, templatesDir, options = {}) => {
  const envPath = path.join(templatesDir, '.env.example');
  if (fs.existsSync(envPath)) {
    let env = fs.readFileSync(envPath, 'utf-8');
    if (options.db === false) {
      env = env.replace(
        /# Database Configuration\nMONGODB_URI=.*\n\n/,
        ''
      );
    }
    if (options.port) {
      env = env.replace(/PORT=3000/g, `PORT=${options.port}`);
    }
    fs.writeFileSync(path.join(folderDir, '.env.example'), env, 'utf-8');
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
