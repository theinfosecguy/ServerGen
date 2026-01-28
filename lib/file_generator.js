/**
 * File generator utilities for creating app structure and configuration.
 * @module lib/file_generator
 */

import path from 'path';
import fs from 'fs-extra';
import * as fs_helper from './build_helper.js';
import { VIEW_ENGINES, VALID_VIEWS, DEPENDENCY_VERSIONS, TS_DEPENDENCY_VERSIONS } from './constants.js';

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

/**
 * Generates MVC folder structure for TypeScript apps.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - The templates directory path.
 */
const generateMVCTypeScript = (folderDir, templatesDir) => {
  const dirs = ['controllers', 'model', 'routes'];

  dirs.forEach((dir) => {
    const dirPath = path.join(folderDir, dir);
    fs.ensureDirSync(dirPath);
  });

  const routesPath = path.join(templatesDir, 'routes', 'index.ts');
  if (fs.existsSync(routesPath)) {
    fs_helper.buildFilewithContents(
      routesPath,
      path.join(folderDir, 'routes'),
      'index.ts'
    );
  }
};

/**
 * Generates package.json for TypeScript apps with appropriate dependencies.
 * @param {string} folderDir - The application directory path.
 * @param {string} appName - The application name.
 * @param {string|null} view - The view engine name (ejs, pug, jade, hbs).
 * @param {boolean} config - Whether to include mongoose configuration.
 * @param {string} framework - The framework type ('node' or 'express').
 */
const generatePackageTypeScript = (folderDir, appName, view, config, framework) => {
  const pkg = {
    name: appName,
    version: '1.0.0',
    description: '',
    main: 'dist/index.js',
    scripts: {
      start: 'node dist/index.js',
      dev: 'ts-node-dev --respawn index.ts',
      build: 'tsc',
    },
    dependencies: {
      cors: DEPENDENCY_VERSIONS.cors,
    },
    devDependencies: {
      typescript: TS_DEPENDENCY_VERSIONS.typescript,
      'ts-node': TS_DEPENDENCY_VERSIONS['ts-node'],
      'ts-node-dev': TS_DEPENDENCY_VERSIONS['ts-node-dev'],
      '@types/node': TS_DEPENDENCY_VERSIONS['@types/node'],
    },
  };

  if (framework === 'express') {
    pkg.dependencies.express = DEPENDENCY_VERSIONS.express;
    pkg.devDependencies['@types/express'] = TS_DEPENDENCY_VERSIONS['@types/express'];
    pkg.devDependencies['@types/cors'] = TS_DEPENDENCY_VERSIONS['@types/cors'];
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
 * Copies tsconfig.json to the application directory.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 */
const addTsConfig = (folderDir, templatesDir) => {
  const tsconfigPath = path.join(templatesDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    fs_helper.buildFilewithContents(tsconfigPath, folderDir, 'tsconfig.json');
  }
};

/**
 * Creates a TypeScript Express application with MVC structure.
 * @param {string} templatesDir - Path to Express-TS templates.
 * @param {string} folderDir - The application directory path.
 * @param {string} appName - The application name.
 * @param {string|null} view - The view engine name.
 * @param {boolean} config - Whether to include mongoose configuration.
 */
const createExpressAppTypeScript = (templatesDir, folderDir, appName, view, config) => {
  const basePath = path.join(templatesDir, 'index.ts');
  fs_helper.buildFilewithContents(basePath, folderDir, 'index.ts');
  generateMVCTypeScript(folderDir, templatesDir);
  generatePackageTypeScript(folderDir, appName, view, config, 'express');
  addTsConfig(folderDir, templatesDir);
  console.log('Generating TypeScript Express application..');
};

/**
 * Creates a TypeScript Node.js application with MVC structure.
 * @param {string} templatesDir - Path to Node-TS templates.
 * @param {string} folderDir - The application directory path.
 * @param {string} appName - The application name.
 * @param {string|null} view - The view engine name.
 * @param {boolean} config - Whether to include mongoose configuration.
 */
const createNodeAppTypeScript = (templatesDir, folderDir, appName, view, config) => {
  const basePath = path.join(templatesDir, 'index.ts');
  fs_helper.buildFilewithContents(basePath, folderDir, 'index.ts');
  generateMVCTypeScript(folderDir, templatesDir);
  generatePackageTypeScript(folderDir, appName, view, config, 'node');
  addTsConfig(folderDir, templatesDir);
  console.log('Generating TypeScript NodeJS application..');
};

/**
 * Handles database config for TypeScript apps.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 */
const handleConfigTypeScript = (folderDir, templatesDir) => {
  console.log('Configuring Mongoose..');
  fs_helper.createDir(folderDir, 'config');
  const basePath = path.join(templatesDir, 'config', 'mongoose.ts');
  if (fs.existsSync(basePath)) {
    fs_helper.buildFilewithContents(
      basePath,
      path.join(folderDir, 'config'),
      'mongoose.ts'
    );
  }
  const newIndexPath = path.join(templatesDir, 'index(config).ts');
  if (fs.existsSync(newIndexPath)) {
    fs_helper.buildFilewithContents(newIndexPath, folderDir, 'index.ts');
  }
};

export {
  createExpressApp,
  createNodeApp,
  createExpressAppTypeScript,
  createNodeAppTypeScript,
  handleViews,
  handleConfig,
  handleConfigTypeScript,
  addGitIgnore,
  addDockerSupport,
  addReadme,
  addEnvExample,
  addTsConfig,
};
