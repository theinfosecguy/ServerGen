import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createExpressApp,
  createNodeApp,
  handleViews,
  handleConfig,
  addGitIgnore,
  addDockerSupport,
  addReadme,
  addEnvExample,
} from '../../lib/file_generator.js';
import { VIEW_ENGINES, DEPENDENCY_VERSIONS } from '../../lib/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '..', '..', 'templates', 'express');
const viewsDir = path.join(templatesDir, 'views');
let testDir;

const readPkg = (folderDir) =>
  JSON.parse(fs.readFileSync(path.join(folderDir, 'package.json'), 'utf-8'));

const readIndex = (folderDir) =>
  fs.readFileSync(path.join(folderDir, 'index.js'), 'utf-8');

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

    it('always includes cors dependency', () => {
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

    it('generates the MVC folder structure', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      expect(fs.existsSync(path.join(testDir, 'controllers'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'model'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'routes'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'routes', 'index.js'))).toBe(true);
    });

    it('logs the express generation message', () => {
      createExpressApp(templatesDir, testDir, 'my-app', null, false);
      expect(logSpy).toHaveBeenCalledWith('Generating Express application..');
    });
  });

  describe('createNodeApp', () => {
    it('writes package.json WITHOUT express dependency', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.express).toBeUndefined();
    });

    it('still includes cors dependency', () => {
      createNodeApp(templatesDir, testDir, 'node-app', null, false);
      const pkg = readPkg(testDir);
      expect(pkg.dependencies.cors).toBe(DEPENDENCY_VERSIONS.cors);
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

    it('injects the view-engine line into index.js for a valid view', () => {
      fs.writeFileSync(path.join(testDir, 'index.js'), '// Views\nconst x = 1;');
      handleViews(testDir, viewsDir, 'pug');
      const index = readIndex(testDir);
      expect(index).toContain("app.set('view engine','pug')");
      expect(index).toContain("app.set('views', path.join(__dirname, 'views'));");
      expect(index).not.toContain('// Views');
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

    it('does nothing when the template README.md is absent', () => {
      // node templates dir has a README, so point at an empty temp templates dir
      const emptyTemplates = path.join(testDir, 'empty-templates');
      fs.ensureDirSync(emptyTemplates);
      expect(() => addReadme(testDir, emptyTemplates)).not.toThrow();
      expect(fs.existsSync(path.join(testDir, 'README.md'))).toBe(false);
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

    it('does nothing when the template .env.example is absent', () => {
      const emptyTemplates = path.join(testDir, 'empty-templates');
      fs.ensureDirSync(emptyTemplates);
      expect(() => addEnvExample(testDir, emptyTemplates)).not.toThrow();
      expect(fs.existsSync(path.join(testDir, '.env.example'))).toBe(false);
    });
  });
});
