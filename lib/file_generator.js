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
const generateMVC = (folderDir, templatesDir, options = {}) => {
  const extension = options.typescript ? 'ts' : 'js';
  const appRoot = options.typescript ? path.join(folderDir, 'src') : folderDir;
  const dirs = ['controllers', 'model', 'routes'];

  dirs.forEach((dir) => {
    const dirPath = path.join(appRoot, dir);
    fs.ensureDirSync(dirPath);
  });

  const routesPath = path.join(templatesDir, 'routes', `index.${extension}`);
  if (fs.existsSync(routesPath)) {
    fs_helper.buildFilewithContents(
      routesPath,
      path.join(appRoot, 'routes'),
      `index.${extension}`
    );
  }
};

/**
 * Returns generated-app paths that differ between JavaScript and TypeScript.
 * @param {string} folderDir - The application directory path.
 * @param {boolean} typescript - Whether TypeScript output is enabled.
 * @returns {Object} Generated app path metadata.
 */
const getGeneratedPaths = (folderDir, typescript = false) => {
  const sourceRoot = typescript ? path.join(folderDir, 'src') : folderDir;
  const extension = typescript ? 'ts' : 'js';
  return {
    sourceRoot,
    extension,
    entryFile: path.join(sourceRoot, `index.${extension}`),
    routesFile: path.join(sourceRoot, 'routes', `index.${extension}`),
  };
};

/**
 * Generates package.json with appropriate dependencies.
 * @param {string} folderDir - The application directory path.
 * @param {string} appName - The application name.
 * @param {string|null} view - The view engine name (ejs, pug, hbs).
 * @param {boolean} config - Whether to include mongoose configuration.
 * @param {string} framework - The framework type ('node', 'express', or 'hono').
 */
const generatePackage = (folderDir, appName, view, config, framework, options = {}) => {
  const typescript = Boolean(options.typescript);
  const pkg = {
    name: appName,
    version: '1.0.0',
    description: '',
    main: typescript ? 'dist/index.js' : 'index.js',
    engines: {
      node: '>=20',
    },
    scripts: {
      start: typescript ? 'node dist/index.js' : 'node index.js',
      dev: typescript ? 'tsx watch src/index.ts' : 'nodemon index.js',
    },
    dependencies: {},
    devDependencies: {},
  };

  if (typescript) {
    pkg.scripts.build = 'tsc';
    pkg.devDependencies.typescript = DEPENDENCY_VERSIONS.typescript;
    pkg.devDependencies.tsx = DEPENDENCY_VERSIONS.tsx;
    pkg.devDependencies['@types/node'] = DEPENDENCY_VERSIONS['@types/node'];
  } else {
    pkg.devDependencies.nodemon = DEPENDENCY_VERSIONS.nodemon;
  }

  if (framework === 'express') {
    pkg.dependencies.cors = DEPENDENCY_VERSIONS.cors;
    pkg.dependencies.express = DEPENDENCY_VERSIONS.express;
    pkg.dependencies.dotenv = DEPENDENCY_VERSIONS.dotenv;
    pkg.scripts.test = typescript
      ? 'node --import tsx --test test/**/*.test.ts'
      : 'node --test';
    pkg.devDependencies.supertest = DEPENDENCY_VERSIONS.supertest;
    if (typescript) {
      pkg.devDependencies['@types/express'] = DEPENDENCY_VERSIONS['@types/express'];
      pkg.devDependencies['@types/cors'] = DEPENDENCY_VERSIONS['@types/cors'];
      pkg.devDependencies['@types/supertest'] = DEPENDENCY_VERSIONS['@types/supertest'];
    }
  } else if (framework === 'hono') {
    pkg.type = 'module';
    pkg.dependencies['@hono/node-server'] = DEPENDENCY_VERSIONS['@hono/node-server'];
    pkg.dependencies.dotenv = DEPENDENCY_VERSIONS.dotenv;
    pkg.dependencies.hono = DEPENDENCY_VERSIONS.hono;
    pkg.scripts.test = 'node --import tsx --test test/**/*.test.ts';
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
const createExpressApp = (templatesDir, folderDir, appName, view, config, options = {}) => {
  const typescript = Boolean(options.typescript);
  const appTemplatesDir = typescript
    ? path.join(templatesDir, 'typescript')
    : templatesDir;
  const sourceTemplatesDir = typescript
    ? path.join(appTemplatesDir, 'src')
    : appTemplatesDir;
  const generatedPaths = getGeneratedPaths(folderDir, typescript);

  // Select the correct base index.js up front (config variant vs plain) so that
  // later port and view edits operate on the final file and are not overwritten.
  const indexTemplate = config ? `index(config).${generatedPaths.extension}` : `index.${generatedPaths.extension}`;
  const basePath = path.join(appTemplatesDir, indexTemplate);
  fs.ensureDirSync(generatedPaths.sourceRoot);
  fs_helper.buildFilewithContents(
    basePath,
    generatedPaths.sourceRoot,
    `index.${generatedPaths.extension}`
  );
  generateMVC(folderDir, sourceTemplatesDir, { typescript });
  generatePackage(folderDir, appName, view, config, 'express', { typescript });
  generateTypeScriptConfig(folderDir, appTemplatesDir, { typescript });
  generateAppTest(folderDir, appTemplatesDir, { typescript });
  console.log(typescript ? 'Generating TypeScript Express application..' : 'Generating Express application..');
};

/**
 * Creates a TypeScript Hono API application.
 * @param {string} templatesDir - Path to Hono templates.
 * @param {string} folderDir - The application directory path.
 * @param {string} appName - The application name.
 */
const createHonoApp = (templatesDir, folderDir, appName) => {
  const appTemplatesDir = path.join(templatesDir, 'typescript');
  const generatedPaths = getGeneratedPaths(folderDir, true);

  fs.ensureDirSync(generatedPaths.sourceRoot);
  fs_helper.buildFilewithContents(
    path.join(appTemplatesDir, 'src', 'index.ts'),
    generatedPaths.sourceRoot,
    'index.ts'
  );
  generatePackage(folderDir, appName, null, false, 'hono', { typescript: true });
  generateTypeScriptConfig(folderDir, appTemplatesDir, { typescript: true });
  generateAppTest(folderDir, appTemplatesDir, { typescript: true });
  console.log('Generating TypeScript Hono application..');
};

/**
 * Copies the generated app's integration test into a test/ directory.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to Express templates.
 */
const generateAppTest = (folderDir, templatesDir, options = {}) => {
  const extension = options.typescript ? 'ts' : 'js';
  const testTemplate = path.join(templatesDir, 'test', `app.test.${extension}`);
  if (fs.existsSync(testTemplate)) {
    fs_helper.createDir(folderDir, 'test');
    fs_helper.buildFilewithContents(
      testTemplate,
      path.join(folderDir, 'test'),
      `app.test.${extension}`
    );
  }
};

/**
 * Copies TypeScript compiler configuration when TypeScript output is enabled.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to Express TypeScript templates.
 * @param {Object} options - Generation options.
 * @param {boolean} options.typescript - Whether TypeScript output is enabled.
 */
const generateTypeScriptConfig = (folderDir, templatesDir, options = {}) => {
  if (!options.typescript) {
    return;
  }

  const tsconfigPath = path.join(templatesDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    fs_helper.buildFilewithContents(tsconfigPath, folderDir, 'tsconfig.json');
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
const handleViews = (folderDir, viewsDir, view, options = {}) => {
  const typescript = Boolean(options.typescript);
  fs_helper.createDir(folderDir, 'views');

  if (!view) {
    console.log('No Views Selected');
    manageViews(folderDir, view, false, { typescript });
    return;
  }

  if (!VALID_VIEWS.includes(view)) {
    console.log(`Invalid view engine: ${view}. Valid options: ${VALID_VIEWS.join(', ')}`);
    return;
  }

  manageViews(folderDir, view, true, { typescript });
  manageViewRoute(folderDir, view, { typescript });
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
const manageViews = (folderPath, viewName, addView, options = {}) => {
  const typescript = Boolean(options.typescript);
  const viewString = typescript
    ? `app.set('view engine','${viewName}') \n app.set('views', path.join(process.cwd(), 'views'));`
    : `app.set('view engine','${viewName}') \n app.set('views', path.join(__dirname, 'views'));`;
  const jsFile = getGeneratedPaths(folderPath, typescript).entryFile;

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
const manageViewRoute = (folderPath, viewName, options = {}) => {
  const typescript = Boolean(options.typescript);
  const routesFile = getGeneratedPaths(folderPath, typescript).routesFile;
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
const handleConfig = (folderDir, templatesDir, options = {}) => {
  const typescript = Boolean(options.typescript);
  const sourceTemplatesDir = typescript
    ? path.join(templatesDir, 'typescript')
    : templatesDir;
  const configDir = typescript
    ? path.join(folderDir, 'src', 'config')
    : path.join(folderDir, 'config');
  const extension = typescript ? 'ts' : 'js';

  console.log('Configuring Mongoose..');
  fs.ensureDirSync(configDir);
  const basePath = typescript
    ? path.join(sourceTemplatesDir, 'src', 'config', `mongoose.${extension}`)
    : path.join(sourceTemplatesDir, 'config', `mongoose.${extension}`);
  fs_helper.buildFilewithContents(
    basePath,
    configDir,
    `mongoose.${extension}`
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
 * @param {Object} options - Docker file generation options.
 * @param {number} options.port - Port configured for the generated app.
 */
const addDockerSupport = (folderDir, templatesDir, options = {}) => {
  const dockerfilePath = options.typescript
    ? path.join(templatesDir, 'typescript', 'Dockerfile')
    : path.join(templatesDir, 'Dockerfile');
  fs_helper.buildFilewithContents(dockerfilePath, folderDir, 'Dockerfile');

  if (options.port) {
    const generatedDockerfilePath = path.join(folderDir, 'Dockerfile');
    const dockerfile = fs
      .readFileSync(generatedDockerfilePath, 'utf-8')
      .replace(/EXPOSE 3000/g, `EXPOSE ${options.port}`);
    fs.writeFileSync(generatedDockerfilePath, dockerfile, 'utf-8');
  }

  const dockerignorePath = path.join(templatesDir, '.dockerignore');
  fs_helper.buildFilewithContents(dockerignorePath, folderDir, '.dockerignore');
};

/**
 * Adds README.md file to the application.
 * @param {string} folderDir - The application directory path.
 * @param {string} templatesDir - Path to templates directory.
 * @param {Object} options - README generation options.
 * @param {string} options.appName - Name of the generated app.
 * @param {number} options.port - Port configured for the generated app.
 */
const addReadme = (folderDir, templatesDir, options = {}) => {
  const readmePath = options.typescript
    ? path.join(templatesDir, 'typescript', 'README.md')
    : path.join(templatesDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    fs_helper.buildFilewithContents(readmePath, folderDir, 'README.md');

    const generatedReadmePath = path.join(folderDir, 'README.md');
    let readme = fs.readFileSync(generatedReadmePath, 'utf-8');
    if (options.appName) {
      readme = readme.replace(/^# Project Name$/m, `# ${options.appName}`);
    }
    if (options.port) {
      readme = readme
        .replace(/http:\/\/localhost:3000/g, `http://localhost:${options.port}`)
        .replace(/http:\/\/127\.0\.0\.1:3000/g, `http://127.0.0.1:${options.port}`);
    }
    if (options.openapi) {
      readme += `
## OpenAPI Specification

This app includes a static OpenAPI 3.0 spec at \`docs/openapi.yaml\`.

Inspect it with an OpenAPI viewer, import it into API tooling, or serve it with
your preferred static file middleware if you want browser-accessible docs.
`;
    }
    fs.writeFileSync(generatedReadmePath, readme, 'utf-8');
  }
};

const yamlSingleQuoted = (value) => `'${String(value).replace(/'/g, "''")}'`;

/**
 * Adds an OpenAPI specification for generated Express apps.
 * @param {string} folderDir - The application directory path.
 * @param {Object} options - OpenAPI generation options.
 * @param {string} options.appName - Name of the generated app.
 * @param {number} options.port - Port configured for the generated app.
 * @param {string|null} options.view - The selected Express view engine.
 */
const addOpenApiSpec = (folderDir, options = {}) => {
  const appName = options.appName || 'servergen-app';
  const port = options.port || 3000;
  const framework = options.framework || 'express';
  const frameworkName = framework === 'hono' ? 'Hono' : 'Express';
  const hasView = Boolean(options.view);
  const rootGetResponse = hasView
    ? `          description: Rendered welcome page
          content:
            text/html:
              schema:
                type: string
              example: '<!doctype html><html><body>Welcome to ServerGen!</body></html>'`
    : `          description: Welcome response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WelcomeResponse'
              examples:
                welcome:
                  value:
                    message: Welcome to ServerGen!`;
  const postRootPath = framework === 'hono'
    ? ''
    : `    post:
      summary: Echo a JSON payload with the welcome response
      operationId: postRoot
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              additionalProperties: true
            example:
              name: ServerGen
      responses:
        '200':
          description: Welcome response with the submitted request body
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PostRootResponse'
              examples:
                echoedPayload:
                  value:
                    message: Welcome to ServerGen!
                    data:
                      name: ServerGen
        '400':
          description: Invalid JSON request body
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'
`;
  const honoInfoPaths = framework === 'hono'
    ? `  /about:
    get:
      summary: About endpoint
      operationId: getAbout
      responses:
        '200':
          description: About response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
              examples:
                about:
                  value:
                    message: About this ServerGen app
  /contact:
    get:
      summary: Contact endpoint
      operationId: getContact
      responses:
        '200':
          description: Contact response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'
              examples:
                contact:
                  value:
                    message: Contact this ServerGen app
`
    : '';
  const notFoundContent = framework === 'hono'
    ? `      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            notFound:
              value:
                error: Not Found`
    : `      content:
        text/html:
          schema:
            type: string
          examples:
            notFound:
              value: Cannot GET /missing`;

  const spec = `openapi: 3.0.3
info:
  title: ${yamlSingleQuoted(`${appName} API`)}
  version: 1.0.0
  description: ${yamlSingleQuoted(`API specification for the ${appName} ${frameworkName} app generated by ServerGen.`)}
servers:
  - url: http://localhost:${port}
    description: Local development server
paths:
  /:
    get:
      summary: Root endpoint
      operationId: getRoot
      responses:
        '200':
${rootGetResponse}
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'
${postRootPath}${honoInfoPaths}  /health:
    get:
      summary: Health check
      operationId: getHealth
      responses:
        '200':
          description: Service health status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'
              examples:
                ok:
                  value:
                    status: ok
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'
components:
  responses:
    NotFound:
      description: Route not found
${notFoundContent}
    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            internalServerError:
              value:
                error: Internal Server Error
  schemas:
    WelcomeResponse:
      type: object
      required:
        - message
      properties:
        message:
          type: string
          example: Welcome to ServerGen!
    MessageResponse:
      type: object
      required:
        - message
      properties:
        message:
          type: string
          example: About this ServerGen app
    PostRootResponse:
      type: object
      required:
        - message
      properties:
        message:
          type: string
          example: Welcome to ServerGen!
        data:
          type: object
          additionalProperties: true
    HealthResponse:
      type: object
      required:
        - status
      properties:
        status:
          type: string
          example: ok
    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: string
`;

  const docsDir = path.join(folderDir, 'docs');
  fs.ensureDirSync(docsDir);
  fs.writeFileSync(path.join(docsDir, 'openapi.yaml'), spec, 'utf-8');
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
  createHonoApp,
  createNodeApp,
  handleViews,
  handleConfig,
  addGitIgnore,
  addDockerSupport,
  addReadme,
  addOpenApiSpec,
  addEnvExample,
};
