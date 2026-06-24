import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import AppGenerator from '../../lib/app_generator.js';

let testDir;

/**
 * Build a fresh set of mocked dependencies for each test.
 */
function makeDeps() {
  return {
    fsHelper: { buildFolderforApp: vi.fn() },
    fileCreator: {
      createNodeApp: vi.fn(),
      createExpressApp: vi.fn(),
      handleViews: vi.fn(),
      handleConfig: vi.fn(),
      addGitIgnore: vi.fn(),
      addDockerSupport: vi.fn(),
      addReadme: vi.fn(),
      addOpenApiSpec: vi.fn(),
      addEnvExample: vi.fn(),
    },
    displayer: { beginMessage: vi.fn(), endMessage: vi.fn() },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      step: vi.fn(),
    },
  };
}

/**
 * Build a config object rooted at the temp test dir.
 */
function makeConfig() {
  return {
    paths: {
      cwd: testDir,
      templates: {
        express: path.join(testDir, 'templates', 'express'),
        hono: path.join(testDir, 'templates', 'hono'),
        node: path.join(testDir, 'templates', 'node'),
        views: path.join(testDir, 'templates', 'views'),
      },
    },
  };
}

describe('AppGenerator', () => {
  let deps;
  let config;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'servergen-app-generator-'));
    deps = makeDeps();
    config = makeConfig();
  });

  afterEach(() => {
    fs.removeSync(testDir);
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('defaults framework to express when not provided', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      expect(gen.framework).toBe('express');
    });

    it('uses the provided framework when given', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'node', config },
        deps
      );
      expect(gen.framework).toBe('node');
    });

    it('defaults port to 3000 when not provided', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      expect(gen.port).toBe(3000);
    });

    it('defaults skipInstall to false when not provided', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      expect(gen.skipInstall).toBe(false);
    });

    it('defaults openapi to false when not provided', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      expect(gen.openapi).toBe(false);
    });

    it('defaults typescript to false when not provided', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      expect(gen.typescript).toBe(false);
    });

    it('computes folderDir as cwd/appName', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      expect(gen.folderDir).toBe(path.join(testDir, 'myapp'));
    });

    it('selects the express templates dir for express framework', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'express', config },
        deps
      );
      expect(gen.templatesDir).toBe(config.paths.templates.express);
    });

    it('selects the node templates dir for node framework', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'node', config },
        deps
      );
      expect(gen.templatesDir).toBe(config.paths.templates.node);
    });

    it('selects the hono templates dir for hono framework', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'hono', config },
        deps
      );
      expect(gen.templatesDir).toBe(config.paths.templates.hono);
    });

    it('wires the injected dependencies onto the instance', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      expect(gen.fsHelper).toBe(deps.fsHelper);
      expect(gen.fileCreator).toBe(deps.fileCreator);
      expect(gen.displayer).toBe(deps.displayer);
      expect(gen.logger).toBe(deps.logger);
    });
  });

  describe('generate', () => {
    it('runs all steps and creates an express app by default', async () => {
      const gen = new AppGenerator(
        { appName: 'myapp', skipInstall: true, config },
        deps
      );

      await gen.generate();

      expect(deps.fsHelper.buildFolderforApp).toHaveBeenCalledWith(
        path.join(testDir, 'myapp')
      );
      expect(deps.fileCreator.createExpressApp).toHaveBeenCalledTimes(1);
      expect(deps.fileCreator.createNodeApp).not.toHaveBeenCalled();
      // support files always added
      expect(deps.fileCreator.addGitIgnore).toHaveBeenCalledTimes(1);
      expect(deps.fileCreator.addDockerSupport).toHaveBeenCalledTimes(1);
      expect(deps.fileCreator.addReadme).toHaveBeenCalledTimes(1);
      expect(deps.fileCreator.addOpenApiSpec).not.toHaveBeenCalled();
      expect(deps.fileCreator.addEnvExample).toHaveBeenCalledTimes(1);
      expect(deps.logger.success).toHaveBeenCalledWith(
        'Application myapp created successfully'
      );
    });

    it('creates a node app when framework is node', async () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'node', skipInstall: true, config },
        deps
      );

      await gen.generate();

      expect(deps.fileCreator.createNodeApp).toHaveBeenCalledTimes(1);
      expect(deps.fileCreator.createExpressApp).not.toHaveBeenCalled();
    });

    it('passes the expected args to createExpressApp', async () => {
      const gen = new AppGenerator(
        {
          appName: 'myapp',
          framework: 'express',
          view: 'ejs',
          db: true,
          skipInstall: true,
          config,
        },
        deps
      );

      await gen.generate();

      expect(deps.fileCreator.createExpressApp).toHaveBeenCalledWith(
        config.paths.templates.express,
        path.join(testDir, 'myapp'),
        'myapp',
        'ejs',
        true,
        { typescript: false }
      );
    });

    it('passes the TypeScript option to createExpressApp', async () => {
      const gen = new AppGenerator(
        {
          appName: 'myapp',
          framework: 'express',
          typescript: true,
          skipInstall: true,
          config,
        },
        deps
      );

      await gen.generate();

      expect(deps.fileCreator.createExpressApp).toHaveBeenCalledWith(
        config.paths.templates.express,
        path.join(testDir, 'myapp'),
        'myapp',
        undefined,
        undefined,
        { typescript: true }
      );
    });

    it('passes the expected args to createNodeApp', async () => {
      const gen = new AppGenerator(
        {
          appName: 'myapp',
          framework: 'node',
          view: null,
          db: false,
          skipInstall: true,
          config,
        },
        deps
      );

      await gen.generate();

      expect(deps.fileCreator.createNodeApp).toHaveBeenCalledWith(
        config.paths.templates.node,
        path.join(testDir, 'myapp'),
        'myapp',
        null,
        false
      );
    });

    it('skips installDependencies when skipInstall is true', async () => {
      const gen = new AppGenerator(
        { appName: 'myapp', skipInstall: true, config },
        deps
      );
      const installSpy = vi.spyOn(gen, 'installDependencies');

      await gen.generate();

      expect(installSpy).not.toHaveBeenCalled();
      expect(deps.displayer.beginMessage).not.toHaveBeenCalled();
    });

    it('calls installDependencies when skipInstall is false', async () => {
      const gen = new AppGenerator(
        { appName: 'myapp', skipInstall: false, config },
        deps
      );
      vi.spyOn(gen, 'runNpmInstall').mockResolvedValue();
      const installSpy = vi.spyOn(gen, 'installDependencies');

      await gen.generate();

      expect(installSpy).toHaveBeenCalledTimes(1);
    });

    it('rejects when installDependencies fails', async () => {
      const gen = new AppGenerator(
        { appName: 'myapp', skipInstall: false, config },
        deps
      );
      const boom = new Error('npm failed');
      vi.spyOn(gen, 'runNpmInstall').mockRejectedValue(boom);

      await expect(gen.generate()).rejects.toThrow('npm failed');
      // success message should not be logged on failure
      expect(deps.logger.success).not.toHaveBeenCalledWith(
        'Application myapp created successfully'
      );
    });
  });

  describe('createAppFolder', () => {
    it('delegates to fsHelper.buildFolderforApp with the folder dir', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      gen.createAppFolder();
      expect(deps.fsHelper.buildFolderforApp).toHaveBeenCalledWith(
        path.join(testDir, 'myapp')
      );
    });
  });

  describe('createAppStructure', () => {
    it('calls createExpressApp for express framework', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'express', config },
        deps
      );
      gen.createAppStructure();
      expect(deps.fileCreator.createExpressApp).toHaveBeenCalledTimes(1);
      expect(deps.fileCreator.createNodeApp).not.toHaveBeenCalled();
    });

    it('calls createNodeApp for node framework', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'node', config },
        deps
      );
      gen.createAppStructure();
      expect(deps.fileCreator.createNodeApp).toHaveBeenCalledTimes(1);
      expect(deps.fileCreator.createExpressApp).not.toHaveBeenCalled();
    });

    it('calls createHonoApp for hono framework when available', () => {
      deps.fileCreator.createHonoApp = vi.fn();
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'hono', typescript: true, config },
        deps
      );
      gen.createAppStructure();
      expect(deps.fileCreator.createHonoApp).toHaveBeenCalledWith(
        config.paths.templates.hono,
        path.join(testDir, 'myapp'),
        'myapp',
        { typescript: true }
      );
      expect(deps.fileCreator.createExpressApp).not.toHaveBeenCalled();
      expect(deps.fileCreator.createNodeApp).not.toHaveBeenCalled();
    });

    it('fails clearly when hono generation is not available', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'hono', config },
        deps
      );
      expect(() => gen.createAppStructure()).toThrow('Hono generation is not available');
      expect(deps.fileCreator.createExpressApp).not.toHaveBeenCalled();
      expect(deps.fileCreator.createNodeApp).not.toHaveBeenCalled();
    });
  });

  describe('setupViews', () => {
    it('is a no-op for the node framework', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'node', view: 'ejs', config },
        deps
      );
      gen.setupViews();
      expect(deps.fileCreator.handleViews).not.toHaveBeenCalled();
    });

    it('is a no-op for the hono framework', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'hono', view: 'ejs', config },
        deps
      );
      gen.setupViews();
      expect(deps.fileCreator.handleViews).not.toHaveBeenCalled();
    });

    it('calls handleViews for the express framework', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'express', view: 'ejs', config },
        deps
      );
      gen.setupViews();
      expect(deps.fileCreator.handleViews).toHaveBeenCalledWith(
        path.join(testDir, 'myapp'),
        config.paths.templates.views,
        'ejs',
        { typescript: false }
      );
    });

    it('passes the TypeScript option to handleViews', () => {
      const gen = new AppGenerator(
        {
          appName: 'myapp',
          framework: 'express',
          view: 'ejs',
          typescript: true,
          config,
        },
        deps
      );
      gen.setupViews();
      expect(deps.fileCreator.handleViews).toHaveBeenCalledWith(
        path.join(testDir, 'myapp'),
        config.paths.templates.views,
        'ejs',
        { typescript: true }
      );
    });
  });

  describe('setupDatabase', () => {
    it('calls handleConfig when db is true', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', db: true, config },
        deps
      );
      gen.setupDatabase();
      expect(deps.fileCreator.handleConfig).toHaveBeenCalledWith(
        path.join(testDir, 'myapp'),
        config.paths.templates.express,
        { typescript: false }
      );
    });

    it('passes the TypeScript option to handleConfig', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', db: true, typescript: true, config },
        deps
      );
      gen.setupDatabase();
      expect(deps.fileCreator.handleConfig).toHaveBeenCalledWith(
        path.join(testDir, 'myapp'),
        config.paths.templates.express,
        { typescript: true }
      );
    });

    it('does not call handleConfig when db is false', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', db: false, config },
        deps
      );
      gen.setupDatabase();
      expect(deps.fileCreator.handleConfig).not.toHaveBeenCalled();
    });

    it('does not call handleConfig when db is undefined', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      gen.setupDatabase();
      expect(deps.fileCreator.handleConfig).not.toHaveBeenCalled();
    });

    it('does not call handleConfig for the hono framework', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'hono', db: true, config },
        deps
      );
      gen.setupDatabase();
      expect(deps.fileCreator.handleConfig).not.toHaveBeenCalled();
    });
  });

  describe('addSupportFiles', () => {
    it('adds gitignore, docker, readme and env example', () => {
      const gen = new AppGenerator({ appName: 'myapp', config }, deps);
      gen.addSupportFiles();
      const folderDir = path.join(testDir, 'myapp');
      const templatesDir = config.paths.templates.express;
      expect(deps.fileCreator.addGitIgnore).toHaveBeenCalledWith(
        folderDir,
        templatesDir
      );
      expect(deps.fileCreator.addDockerSupport).toHaveBeenCalledWith(
        folderDir,
        templatesDir,
        { db: false, openapi: false, port: 3000, typescript: false }
      );
      expect(deps.fileCreator.addReadme).toHaveBeenCalledWith(
        folderDir,
        templatesDir,
        { appName: 'myapp', db: false, openapi: false, port: 3000, typescript: false }
      );
      expect(deps.fileCreator.addEnvExample).toHaveBeenCalledWith(
        folderDir,
        templatesDir,
        { db: false, openapi: false, port: 3000, typescript: false }
      );
    });

    it('adds an OpenAPI spec for express apps when requested', () => {
      const gen = new AppGenerator(
        {
          appName: 'myapp',
          framework: 'express',
          openapi: true,
          port: 8080,
          view: 'ejs',
          config,
        },
        deps
      );

      gen.addSupportFiles();

      expect(deps.fileCreator.addOpenApiSpec).toHaveBeenCalledWith(
        path.join(testDir, 'myapp'),
        { appName: 'myapp', framework: 'express', port: 8080, view: 'ejs' }
      );
      expect(deps.fileCreator.addReadme).toHaveBeenCalledWith(
        path.join(testDir, 'myapp'),
        config.paths.templates.express,
        { appName: 'myapp', db: false, openapi: true, port: 8080, typescript: false }
      );
    });

    it('adds an OpenAPI spec for hono apps when requested', () => {
      const gen = new AppGenerator(
        {
          appName: 'myapp',
          framework: 'hono',
          openapi: true,
          port: 8081,
          config,
        },
        deps
      );

      gen.addSupportFiles();

      expect(deps.fileCreator.addOpenApiSpec).toHaveBeenCalledWith(
        path.join(testDir, 'myapp'),
        { appName: 'myapp', framework: 'hono', port: 8081, view: undefined }
      );
      expect(deps.fileCreator.addReadme).toHaveBeenCalledWith(
        path.join(testDir, 'myapp'),
        config.paths.templates.hono,
        { appName: 'myapp', db: false, openapi: true, port: 8081, typescript: true }
      );
    });

    it('does not add an OpenAPI spec for node apps', () => {
      const gen = new AppGenerator(
        {
          appName: 'nodeapp',
          framework: 'node',
          openapi: true,
          config,
        },
        deps
      );

      gen.addSupportFiles();

      expect(deps.fileCreator.addOpenApiSpec).not.toHaveBeenCalled();
    });
  });

  describe('configurePort', () => {
    it('does nothing when port is the default 3000', () => {
      const gen = new AppGenerator(
        { appName: 'myapp', port: 3000, config },
        deps
      );
      // No index.js exists; if it tried to read it would warn. Assert no warn.
      gen.configurePort();
      expect(deps.logger.step).not.toHaveBeenCalled();
      expect(deps.logger.warn).not.toHaveBeenCalled();
    });

    it('rewrites the port in index.js when port differs from 3000', () => {
      const folderDir = path.join(testDir, 'myapp');
      fs.ensureDirSync(folderDir);
      const indexPath = path.join(folderDir, 'index.js');
      fs.writeFileSync(
        indexPath,
        'const port = process.env.PORT || 3000;\napp.listen(port);\n',
        'utf8'
      );

      const gen = new AppGenerator(
        { appName: 'myapp', port: 8080, config },
        deps
      );
      gen.configurePort();

      const updated = fs.readFileSync(indexPath, 'utf8');
      expect(updated).toContain('process.env.PORT || 8080');
      expect(updated).not.toContain('process.env.PORT || 3000');
      expect(deps.logger.step).toHaveBeenCalledWith('Port configured to 8080');
    });

    it('rewrites the port in src/index.ts for TypeScript apps', () => {
      const folderDir = path.join(testDir, 'myapp');
      fs.ensureDirSync(path.join(folderDir, 'src'));
      const indexPath = path.join(folderDir, 'src', 'index.ts');
      fs.writeFileSync(
        indexPath,
        'const port = process.env.PORT || 3000;\napp.listen(port);\n',
        'utf8'
      );

      const gen = new AppGenerator(
        { appName: 'myapp', port: 8080, typescript: true, config },
        deps
      );
      gen.configurePort();

      const updated = fs.readFileSync(indexPath, 'utf8');
      expect(updated).toContain('process.env.PORT || 8080');
      expect(updated).not.toContain('process.env.PORT || 3000');
    });

    it('rewrites the port in src/index.ts for Hono apps', () => {
      const folderDir = path.join(testDir, 'myapp');
      fs.ensureDirSync(path.join(folderDir, 'src'));
      const indexPath = path.join(folderDir, 'src', 'index.ts');
      fs.writeFileSync(
        indexPath,
        'const port = Number(process.env.PORT || 3000);\n',
        'utf8'
      );

      const gen = new AppGenerator(
        { appName: 'myapp', framework: 'hono', port: 8787, config },
        deps
      );
      gen.configurePort();

      const updated = fs.readFileSync(indexPath, 'utf8');
      expect(updated).toContain('process.env.PORT || 8787');
      expect(updated).not.toContain('process.env.PORT || 3000');
    });

    it('replaces every occurrence of the default port token', () => {
      const folderDir = path.join(testDir, 'myapp');
      fs.ensureDirSync(folderDir);
      const indexPath = path.join(folderDir, 'index.js');
      fs.writeFileSync(
        indexPath,
        'const a = process.env.PORT || 3000;\nconst b = process.env.PORT || 3000;\n',
        'utf8'
      );

      const gen = new AppGenerator(
        { appName: 'myapp', port: 5000, config },
        deps
      );
      gen.configurePort();

      const updated = fs.readFileSync(indexPath, 'utf8');
      const matches = updated.match(/process\.env\.PORT \|\| 5000/g) || [];
      expect(matches).toHaveLength(2);
    });

    it('warns and does not throw when index.js is missing', () => {
      const gen = new AppGenerator(
        { appName: 'no-index-app', port: 4000, config },
        deps
      );

      expect(() => gen.configurePort()).not.toThrow();
      expect(deps.logger.warn).toHaveBeenCalledTimes(1);
      expect(deps.logger.warn.mock.calls[0][0]).toContain(
        'Could not configure port'
      );
      expect(deps.logger.step).not.toHaveBeenCalled();
    });
  });

  describe('installDependencies', () => {
    it('runs the install happy path and emits begin/end messages', async () => {
      const gen = new AppGenerator(
        { appName: 'myapp', config },
        deps
      );
      vi.spyOn(gen, 'runNpmInstall').mockResolvedValue();

      await gen.installDependencies();

      expect(deps.displayer.beginMessage).toHaveBeenCalledWith('myapp');
      expect(deps.displayer.endMessage).toHaveBeenCalledWith('myapp');
      expect(deps.logger.success).toHaveBeenCalledWith(
        'NPM Packages installed successfully'
      );
    });

    it('rethrows and logs an error when runNpmInstall rejects', async () => {
      const gen = new AppGenerator(
        { appName: 'myapp', config },
        deps
      );
      const boom = new Error('install boom');
      vi.spyOn(gen, 'runNpmInstall').mockRejectedValue(boom);

      await expect(gen.installDependencies()).rejects.toThrow('install boom');
      expect(deps.logger.error).toHaveBeenCalledWith(
        'Failed to install dependencies',
        boom
      );
      expect(deps.displayer.endMessage).not.toHaveBeenCalled();
    });
  });

  describe('runNpmInstall', () => {
    it('rejects when the spawned process emits an error', async () => {
      // Point folderDir at a non-existent directory so spawn cannot start.
      const gen = new AppGenerator(
        { appName: 'definitely-missing-dir-xyz', config },
        deps
      );
      gen.folderDir = path.join(testDir, 'definitely-missing-dir-xyz');

      await expect(gen.runNpmInstall()).rejects.toBeInstanceOf(Error);
    });
  });
});
