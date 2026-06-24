import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import {
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
} from '../../lib/file_generator.js';
import { VIEW_ENGINES, DEPENDENCY_VERSIONS } from '../../lib/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '..', '..', 'templates', 'express');
const honoTemplatesDir = path.join(__dirname, '..', '..', 'templates', 'hono');
const nodeTemplatesDir = path.join(__dirname, '..', '..', 'templates', 'node');
const viewsDir = path.join(templatesDir, 'views');
let testDir;

const readPkg = (folderDir) =>
  JSON.parse(fs.readFileSync(path.join(folderDir, 'package.json'), 'utf-8'));

const readIndex = (folderDir) =>
  fs.readFileSync(path.join(folderDir, 'index.js'), 'utf-8');

const readTypeScriptIndex = (folderDir) =>
  fs.readFileSync(path.join(folderDir, 'src', 'index.ts'), 'utf-8');

describe('file_generator', () => {
  let logSpy;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'servergen-file-generator-'));
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.removeSync(testDir);
    vi.restoreAllMocks();
  });

  describe('createExpressApp', () => {
    it('writes package.json with express dependency', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.express).toBe(DEPENDENCY_VERSIONS.express);
    });

    it('sets package name from appName', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.name).toBe('my-app');
    });

    it('places nodemon under devDependencies, not dependencies', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.devDependencies.nodemon).toBe(DEPENDENCY_VERSIONS.nodemon);
      expect(pkg.dependencies.nodemon).toBeUndefined();
    });

    it('sets scripts.start to "node index.js" and scripts.dev to "nodemon index.js"', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.scripts.start).toBe('node index.js');
      expect(pkg.scripts.dev).toBe('nodemon index.js');
    });

    it('sets the supported Node.js engine floor', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.engines.node).toBe('>=20');
    });

    it('includes cors dependency', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.cors).toBe(DEPENDENCY_VERSIONS.cors);
    });

    it('adds the requested view dependency', () => {
      createExpressApp(templatesDir, testDir, 'my-app', 'ejs', false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.ejs).toBe(VIEW_ENGINES.ejs);
    });

    it('does not add a view dependency when view is null', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.ejs).toBeUndefined();
      expect(pkg.dependencies.pug).toBeUndefined();
      expect(pkg.dependencies.hbs).toBeUndefined();
    });

    it('does not add a view dependency for an unknown view engine', () => {
      createExpressApp(templatesDir, testDir, 'my-app', 'bogus', false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.bogus).toBeUndefined();
    });

    it('adds mongoose dependency when config is true', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, true);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.mongoose).toBe(DEPENDENCY_VERSIONS.mongoose);
    });

    it('does not add mongoose dependency when config is false', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.mongoose).toBeUndefined();
    });

    it('uses the config-variant index template (mongoose require) when config is true', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, true);
      expect(readIndex(testDir)).toContain("require('./config/mongoose')");
    });

    it('uses the plain index template (no mongoose require) when config is false', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      expect(readIndex(testDir)).not.toContain("require('./config/mongoose')");
    });

    it('uses quiet dotenv configuration in the generated index.js', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      expect(readIndex(testDir)).toContain(
        "require('dotenv').config({ quiet: true })"
      );
    });

    it('uses quiet dotenv configuration in the generated config index.js', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, true);
      expect(readIndex(testDir)).toContain(
        "require('dotenv').config({ quiet: true })"
      );
    });

    it('generates the MVC folder structure', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      expect(fs.existsSync(path.join(testDir, 'controllers'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'model'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'routes'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'routes', 'index.js'))).toBe(true);
    });

    it('writes JSON routes with status before body serialization', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      const routes = fs.readFileSync(
        path.join(testDir, 'routes', 'index.js'),
        'utf-8'
      );

      expect(routes).toMatch(
        /router\.get\('\/', function \(req, res\) \{\n  res\n    \.status\(200\)\n    \.json\({/
      );
      expect(routes).toMatch(
        /router\.post\('\/', function \(req, res\) \{\n  res\n    \.status\(200\)\n    \.json\({/
      );
    });

    it('logs the express generation message', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      expect(logSpy).toHaveBeenCalledWith('Generating Express application..');
    });

    it('generates TypeScript Express source, config, test and tsconfig files', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false, {
        typescript: true,
      });

      expect(fs.existsSync(path.join(testDir, 'src', 'index.ts'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'src', 'routes', 'index.ts'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'test', 'app.test.ts'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'tsconfig.json'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'index.js'))).toBe(false);
      expect(fs.existsSync(path.join(testDir, 'routes', 'index.js'))).toBe(false);
    });

    it('writes TypeScript Express package scripts and dev dependencies', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false, {
        typescript: true,
      });
      const pkg = readPkg(testDir);

      expect(pkg.main).toBe('dist/index.js');
      expect(pkg.scripts.dev).toBe('tsx watch src/index.ts');
      expect(pkg.scripts.build).toBe('tsc');
      expect(pkg.scripts.start).toBe('node dist/index.js');
      expect(pkg.scripts.test).toBe('node --import tsx --test test/**/*.test.ts');
      expect(pkg.devDependencies.typescript).toBe(DEPENDENCY_VERSIONS.typescript);
      expect(pkg.devDependencies.tsx).toBe(DEPENDENCY_VERSIONS.tsx);
      expect(pkg.devDependencies['@types/express']).toBe(
        DEPENDENCY_VERSIONS['@types/express']
      );
      expect(pkg.devDependencies.nodemon).toBeUndefined();
    });

    it('uses the TypeScript config-variant index template when config is true', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, true, {
        typescript: true,
      });

      expect(readTypeScriptIndex(testDir)).toContain(
        "import { connectDatabase, mongoose } from './config/mongoose'"
      );
    });

    it('logs the TypeScript express generation message', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false, {
        typescript: true,
      });
      expect(logSpy).toHaveBeenCalledWith(
        'Generating TypeScript Express application..'
      );
    });
  });

  describe('createNodeApp', () => {
    it('writes package.json WITHOUT express dependency', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.express).toBeUndefined();
    });

    it('does not include unused cors dependency', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.cors).toBeUndefined();
    });

    it('places nodemon under devDependencies', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.devDependencies.nodemon).toBe(DEPENDENCY_VERSIONS.nodemon);
      expect(pkg.dependencies.nodemon).toBeUndefined();
    });

    it('sets start and dev scripts', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.scripts.start).toBe('node index.js');
      expect(pkg.scripts.dev).toBe('nodemon index.js');
    });

    it('sets the supported Node.js engine floor', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.engines.node).toBe('>=20');
    });

    it('adds the requested view dependency', () => {
      createNodeApp(templatesDir, testDir, 'node-app', 'pug', false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.pug).toBe(VIEW_ENGINES.pug);
    });

    it('adds mongoose dependency when config is true', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, true);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.mongoose).toBe(DEPENDENCY_VERSIONS.mongoose);
    });

    it('writes the plain index.js from the given templates dir (never the config variant)', () => {
      // createNodeApp always copies <templatesDir>/index.js regardless of config.
      createNodeApp(templatesDir, testDir, 'node-app', null, true);
      const index = readIndex(testDir);
      const expected = fs.readFileSync(
        path.join(templatesDir, 'index.js'),
        'utf-8'
      );
      expect(index).toBe(expected);
      expect(index).not.toContain("require('./config/mongoose')");
    });

    it('generates the MVC folder structure', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, false);
      expect(fs.existsSync(path.join(testDir, 'controllers'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'model'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'routes'))).toBe(true);
    });

    it('logs the node generation message', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, false);
      expect(logSpy).toHaveBeenCalledWith('Generating NodeJS application..');
    });
  });

  describe('createHonoApp', () => {
    it('generates TypeScript Hono source, test and tsconfig files', () => {
      createHonoApp(honoTemplatesDir, testDir, 'hono-app');

      expect(fs.existsSync(path.join(testDir, 'src', 'index.ts'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'test', 'app.test.ts'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'tsconfig.json'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'index.js'))).toBe(false);
    });

    it('writes Hono package scripts and dependencies', () => {
      createHonoApp(honoTemplatesDir, testDir, 'hono-app');
      const pkg = readPkg(testDir);

      expect(pkg.name).toBe('hono-app');
      expect(pkg.type).toBe('module');
      expect(pkg.main).toBe('dist/index.js');
      expect(pkg.scripts.dev).toBe('tsx watch src/index.ts');
      expect(pkg.scripts.build).toBe('tsc');
      expect(pkg.scripts.start).toBe('node dist/index.js');
      expect(pkg.scripts.test).toBe('node --import tsx --test test/**/*.test.ts');
      expect(pkg.dependencies.hono).toBe(DEPENDENCY_VERSIONS.hono);
      expect(pkg.dependencies['@hono/node-server']).toBe(
        DEPENDENCY_VERSIONS['@hono/node-server']
      );
      expect(pkg.dependencies.dotenv).toBe(DEPENDENCY_VERSIONS.dotenv);
      expect(pkg.devDependencies.typescript).toBe(DEPENDENCY_VERSIONS.typescript);
      expect(pkg.devDependencies.tsx).toBe(DEPENDENCY_VERSIONS.tsx);
      expect(pkg.devDependencies['@types/node']).toBe(
        DEPENDENCY_VERSIONS['@types/node']
      );
      expect(pkg.devDependencies.nodemon).toBeUndefined();
    });

    it('uses an import-safe server entry point with JSON routes', () => {
      createHonoApp(honoTemplatesDir, testDir, 'hono-app');
      const index = fs.readFileSync(
        path.join(testDir, 'src', 'index.ts'),
        'utf-8'
      );

      expect(index).toContain('new Hono()');
      expect(index).toContain("app.get('/about'");
      expect(index).toContain("app.get('/contact'");
      expect(index).toContain("app.get('/health'");
      expect(index).toContain('app.notFound');
      expect(index).toContain('export const startServer');
      expect(index).toContain('pathToFileURL(process.argv[1])');
    });

    it('logs the Hono generation message', () => {
      createHonoApp(honoTemplatesDir, testDir, 'hono-app');
      expect(logSpy).toHaveBeenCalledWith('Generating TypeScript Hono application..');
    });
  });

  describe('handleViews', () => {
    it('logs "No Views Selected" and creates a views/ dir when no view is provided', () => {
      // manageViews(false) reads index.js, so provide one with the marker.
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      handleViews(testDir, viewsDir, null);
      expect(logSpy).toHaveBeenCalledWith('No Views Selected');
      expect(fs.existsSync(path.join(testDir, 'views'))).toBe(true);
    });

    it('removes the "// Views" marker when no view is selected', () => {
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      handleViews(testDir, viewsDir, null);
      const index = readIndex(testDir);
      expect(index).not.toContain('// Views');
    });

    it('copies the ve_<view>.<view> file for a valid view', () => {
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      handleViews(testDir, viewsDir, 'ejs');
      expect(fs.existsSync(path.join(testDir, 'views', 've_ejs.ejs'))).toBe(true);
    });

    it('updates GET / to render the selected view when routes exist', () => {
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      fs.ensureDirSync(path.join(testDir, 'routes'));
      fs.copyFileSync(
        path.join(templatesDir, 'routes', 'index.js'),
        path.join(testDir, 'routes', 'index.js')
      );

      handleViews(testDir, viewsDir, 'ejs');

      const routes = fs.readFileSync(
        path.join(testDir, 'routes', 'index.js'),
        'utf-8'
      );
      expect(routes).toContain("res.status(200).render('ve_ejs'");
      expect(routes).toContain("message: 'Welcome to ServerGen!'");
      expect(routes).not.toContain('GET / - Returns welcome message');
    });

    it('injects the view-engine line into index.js for a valid view', () => {
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      handleViews(testDir, viewsDir, 'pug');
      const index = readIndex(testDir);
      expect(index).toContain("app.set('view engine','pug')");
      expect(index).toContain("app.set('views', path.join(__dirname, 'views'));");
      expect(index).not.toContain('// Views');
    });

    it('injects the view-engine line into src/index.ts for TypeScript apps', () => {
      fs.ensureDirSync(path.join(testDir, 'src'));
      fs.writeFileSync(path.join(testDir, 'src', 'index.ts'), '// Views\nconst x = 1;');
      fs.ensureDirSync(path.join(testDir, 'src', 'routes'));
      fs.copyFileSync(
        path.join(templatesDir, 'typescript', 'src', 'routes', 'index.ts'),
        path.join(testDir, 'src', 'routes', 'index.ts')
      );

      handleViews(testDir, viewsDir, 'ejs', { typescript: true });

      const index = readTypeScriptIndex(testDir);
      const routes = fs.readFileSync(
        path.join(testDir, 'src', 'routes', 'index.ts'),
        'utf-8'
      );

      expect(index).toContain("app.set('view engine','ejs')");
      expect(index).toContain("app.set('views', path.join(process.cwd(), 'views'));");
      expect(routes).toContain("res.status(200).render('ve_ejs'");
      expect(fs.existsSync(path.join(testDir, 'views', 've_ejs.ejs'))).toBe(true);
    });

    it('handles hbs as a valid view', () => {
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      handleViews(testDir, viewsDir, 'hbs');
      expect(fs.existsSync(path.join(testDir, 'views', 've_hbs.hbs'))).toBe(true);
      expect(readIndex(testDir)).toContain("app.set('view engine','hbs')");
    });

    it('logs an "Invalid view engine" message for an unsupported view', () => {
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      handleViews(testDir, viewsDir, 'jade');
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid view engine: jade')
      );
    });

    it('does not modify index.js or copy a view file for an invalid view', () => {
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      handleViews(testDir, viewsDir, 'jade');
      // index.js untouched (marker still present, no injection)
      expect(readIndex(testDir)).toContain('// Views');
      expect(fs.existsSync(path.join(testDir, 'views', 've_jade.jade'))).toBe(false);
    });

    it('still creates the views/ dir even for an invalid view', () => {
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      handleViews(testDir, viewsDir, 'jade');
      expect(fs.existsSync(path.join(testDir, 'views'))).toBe(true);
    });
  });

  describe('handleConfig', () => {
    it('creates config/mongoose.js', () => {
      handleConfig(testDir, templatesDir);
      const configFile = path.join(testDir, 'config', 'mongoose.js');
      expect(fs.existsSync(configFile)).toBe(true);
      expect(fs.readFileSync(configFile, 'utf-8')).toContain(
        "require('mongoose')"
      );
    });

    it('uses quiet dotenv configuration in config/mongoose.js', () => {
      handleConfig(testDir, templatesDir);
      const configFile = path.join(testDir, 'config', 'mongoose.js');
      expect(fs.readFileSync(configFile, 'utf-8')).toContain(
        "require('dotenv').config({ quiet: true })"
      );
    });

    it('logs the configuring message', () => {
      handleConfig(testDir, templatesDir);
      expect(logSpy).toHaveBeenCalledWith('Configuring Mongoose..');
    });

    it('does NOT overwrite an existing index.js', () => {
      const sentinel = '// SENTINEL index.js content';
      fs.writeFileSync(path.join(testDir, 'index.js'), sentinel);
      handleConfig(testDir, templatesDir);
      expect(readIndex(testDir)).toBe(sentinel);
    });

    it('creates src/config/mongoose.ts for TypeScript apps', () => {
      handleConfig(testDir, templatesDir, { typescript: true });
      const configFile = path.join(testDir, 'src', 'config', 'mongoose.ts');
      expect(fs.existsSync(configFile)).toBe(true);
      expect(fs.readFileSync(configFile, 'utf-8')).toContain(
        "import mongoose from 'mongoose'"
      );
    });
  });

  describe('addGitIgnore', () => {
    it('copies the .gitignore file', () => {
      addGitIgnore(testDir, templatesDir);
      const dest = path.join(testDir, '.gitignore');
      expect(fs.existsSync(dest)).toBe(true);
      // Source template is stored as 'gitignore' (no dot) so npm does not strip
      // it from published tarballs; it is written out as '.gitignore'.
      expect(fs.readFileSync(dest, 'utf-8')).toBe(
        fs.readFileSync(path.join(templatesDir, 'gitignore'), 'utf-8')
      );
    });
  });

  describe('addDockerSupport', () => {
    it('copies the Dockerfile and .dockerignore', () => {
      addDockerSupport(testDir, templatesDir);
      expect(fs.existsSync(path.join(testDir, 'Dockerfile'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.dockerignore'))).toBe(true);
    });

    it('copies the exact Dockerfile contents', () => {
      addDockerSupport(testDir, templatesDir);
      expect(fs.readFileSync(path.join(testDir, 'Dockerfile'), 'utf-8')).toBe(
        fs.readFileSync(path.join(templatesDir, 'Dockerfile'), 'utf-8')
      );
    });

    it('updates the Dockerfile exposed port when configured', () => {
      addDockerSupport(testDir, templatesDir, { port: 8080 });
      const dockerfile = fs.readFileSync(
        path.join(testDir, 'Dockerfile'),
        'utf-8'
      );

      expect(dockerfile).toContain('EXPOSE 8080');
      expect(dockerfile).not.toContain('EXPOSE 3000');
    });

    it('uses the TypeScript Dockerfile when configured', () => {
      addDockerSupport(testDir, templatesDir, { typescript: true });
      const dockerfile = fs.readFileSync(
        path.join(testDir, 'Dockerfile'),
        'utf-8'
      );

      expect(dockerfile).toContain('npm run build');
      expect(dockerfile).toContain('dist/index.js');
    });
  });

  describe('addReadme', () => {
    it('copies the README.md when present', () => {
      addReadme(testDir, templatesDir);
      const dest = path.join(testDir, 'README.md');
      expect(fs.existsSync(dest)).toBe(true);
      expect(fs.readFileSync(dest, 'utf-8')).toBe(
        fs.readFileSync(path.join(templatesDir, 'README.md'), 'utf-8')
      );
    });

    it('updates the generated README port when configured', () => {
      addReadme(testDir, templatesDir, { port: 8080 });
      const readme = fs.readFileSync(path.join(testDir, 'README.md'), 'utf-8');
      expect(readme).toContain('http://localhost:8080');
      expect(readme).not.toContain('http://localhost:3000');
    });

    it('updates the generated Express README title when appName is configured', () => {
      addReadme(testDir, templatesDir, { appName: 'my-api' });
      const readme = fs.readFileSync(path.join(testDir, 'README.md'), 'utf-8');

      expect(readme).toContain('# my-api');
      expect(readme).not.toContain('# Project Name');
    });

    it('documents the OpenAPI spec when requested', () => {
      addReadme(testDir, templatesDir, { openapi: true });
      const readme = fs.readFileSync(path.join(testDir, 'README.md'), 'utf-8');

      expect(readme).toContain('## OpenAPI Specification');
      expect(readme).toContain('docs/openapi.yaml');
    });

    it('uses the TypeScript README when configured', () => {
      addReadme(testDir, templatesDir, { appName: 'ts-api', typescript: true });
      const readme = fs.readFileSync(path.join(testDir, 'README.md'), 'utf-8');

      expect(readme).toContain('# ts-api');
      expect(readme).toContain('src/index.ts');
      expect(readme).toContain('npm run build');
    });

    it('updates Node README localhost URLs when configured', () => {
      addReadme(testDir, nodeTemplatesDir, { port: 8081 });
      const readme = fs.readFileSync(path.join(testDir, 'README.md'), 'utf-8');

      expect(readme).toContain('http://127.0.0.1:8081');
      expect(readme).not.toContain('http://127.0.0.1:3000');
    });

    it('updates the generated Node README title when appName is configured', () => {
      addReadme(testDir, nodeTemplatesDir, { appName: 'node-api' });
      const readme = fs.readFileSync(path.join(testDir, 'README.md'), 'utf-8');

      expect(readme).toContain('# node-api');
      expect(readme).not.toContain('# Project Name');
    });

    it('does nothing when the template README.md is absent', () => {
      // node templates dir has a README, so point at an empty temp templates dir
      const emptyTemplates = path.join(testDir, 'empty-templates');
      fs.ensureDirSync(emptyTemplates);
      expect(() => addReadme(testDir, emptyTemplates)).not.toThrow();
      expect(fs.existsSync(path.join(testDir, 'README.md'))).toBe(false);
    });
  });

  describe('addOpenApiSpec', () => {
    it('writes docs/openapi.yaml with app name, port, and route docs', () => {
      addOpenApiSpec(testDir, { appName: 'my-api', port: 8080 });
      const specPath = path.join(testDir, 'docs', 'openapi.yaml');
      const spec = fs.readFileSync(specPath, 'utf-8');

      expect(fs.existsSync(specPath)).toBe(true);
      expect(spec).toContain('openapi: 3.0.3');
      expect(spec).toContain("title: 'my-api API'");
      expect(spec).toContain('url: http://localhost:8080');
      expect(spec).toContain('operationId: getRoot');
      expect(spec).toContain('operationId: postRoot');
      expect(spec).toContain('operationId: getHealth');
      expect(spec).toContain("NotFound:");
      expect(spec).toContain("InternalServerError:");
    });

    it('writes Hono OpenAPI docs with Hono routes and JSON 404s', () => {
      addOpenApiSpec(testDir, {
        appName: 'hono-api',
        framework: 'hono',
        port: 8787,
      });
      const spec = fs.readFileSync(
        path.join(testDir, 'docs', 'openapi.yaml'),
        'utf-8'
      );

      expect(spec).toContain('Hono app generated by ServerGen');
      expect(spec).toContain('url: http://localhost:8787');
      expect(spec).toContain('operationId: getAbout');
      expect(spec).toContain('operationId: getContact');
      expect(spec).toContain('application/json:');
      expect(spec).not.toContain('operationId: postRoot');
      expect(spec).not.toContain('text/html:');
    });

    it('documents rendered HTML for root GET when a view is selected', () => {
      addOpenApiSpec(testDir, { appName: 'view-api', port: 3000, view: 'pug' });
      const spec = fs.readFileSync(
        path.join(testDir, 'docs', 'openapi.yaml'),
        'utf-8'
      );

      expect(spec).toContain('text/html:');
      expect(spec).toContain('Rendered welcome page');
      expect(spec).not.toContain('$ref: \'#/components/schemas/WelcomeResponse\'');
    });
  });

  describe('addEnvExample', () => {
    it('copies the .env.example when present', () => {
      addEnvExample(testDir, templatesDir);
      const dest = path.join(testDir, '.env.example');
      expect(fs.existsSync(dest)).toBe(true);
      expect(fs.readFileSync(dest, 'utf-8')).toBe(
        fs.readFileSync(path.join(templatesDir, '.env.example'), 'utf-8')
      );
    });

    it('writes only server env values when MongoDB is not enabled', () => {
      addEnvExample(testDir, templatesDir, { db: false, port: 8080 });
      const env = fs.readFileSync(path.join(testDir, '.env.example'), 'utf-8');
      expect(env).toContain('PORT=8080');
      expect(env).toContain('NODE_ENV=development');
      expect(env).not.toContain('MONGODB_URI');
    });

    it('keeps MongoDB env values when MongoDB is enabled', () => {
      addEnvExample(testDir, templatesDir, { db: true, port: 8080 });
      const env = fs.readFileSync(path.join(testDir, '.env.example'), 'utf-8');
      expect(env).toContain('MONGODB_URI=mongodb://localhost/your_database_name');
      expect(env).toContain('PORT=8080');
    });

    it('does nothing when the template .env.example is absent', () => {
      const emptyTemplates = path.join(testDir, 'empty-templates');
      fs.ensureDirSync(emptyTemplates);
      expect(() => addEnvExample(testDir, emptyTemplates)).not.toThrow();
      expect(fs.existsSync(path.join(testDir, '.env.example'))).toBe(false);
    });
  });
});
