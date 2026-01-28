/**
 * Application generator that orchestrates the app creation process.
 * @module lib/app_generator
 */

import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs-extra';
import chalk from 'chalk';
import { handleError } from './error_handler.js';

const execPromise = util.promisify(exec);

/**
 * AppGenerator class that handles the complete app generation workflow.
 */
class AppGenerator {
  /**
   * Creates an AppGenerator instance.
   * @param {Object} options - Generation options.
   * @param {string} options.appName - The application name.
   * @param {string} options.framework - The framework type ('node', 'express', or 'fastify').
   * @param {string|null} options.view - The view engine name.
   * @param {boolean} options.db - Whether to include database configuration.
   * @param {number} options.port - The port number for the app.
   * @param {boolean} options.skipInstall - Whether to skip npm install.
   * @param {Object} options.config - Configuration object from lib/config.
   * @param {Object} dependencies - Injected dependencies.
   * @param {Object} dependencies.fsHelper - File system helper module.
   * @param {Object} dependencies.fileCreator - File generator module.
   * @param {Object} dependencies.displayer - Log display module.
   * @param {Object} dependencies.logger - Logger module.
   */
  constructor(options, dependencies) {
    this.appName = options.appName;
    this.framework = options.framework || 'express';
    this.view = options.view;
    this.db = options.db;
    this.port = options.port || 3000;
    this.skipInstall = options.skipInstall || false;
    this.config = options.config;

    this.fsHelper = dependencies.fsHelper;
    this.fileCreator = dependencies.fileCreator;
    this.displayer = dependencies.displayer;
    this.logger = dependencies.logger;

    this.folderDir = path.join(this.config.paths.cwd, this.appName);
    this.templatesDir = this._getTemplatesDir();
  }

  /**
   * Returns the appropriate templates directory based on framework.
   * @returns {string} Path to templates directory.
   * @private
   */
  _getTemplatesDir() {
    switch (this.framework) {
      case 'node':
        return this.config.paths.templates.node;
      case 'fastify':
        return this.config.paths.templates.fastify;
      default:
        return this.config.paths.templates.express;
    }
  }

  /**
   * Generates the complete application.
   * @returns {Promise<void>}
   */
  async generate() {
    this.logger?.debug('Starting app generation', {
      appName: this.appName,
      framework: this.framework,
      port: this.port,
      skipInstall: this.skipInstall,
    });

    this.createAppFolder();
    this.createAppStructure();
    this.configurePort();
    this.setupDatabase();
    this.setupViews();
    this.addSupportFiles();
    
    if (!this.skipInstall) {
      await this.installDependencies();
    }

    this.logger?.success(`Application ${this.appName} created successfully`);
  }

  /**
   * Creates the main application folder.
   */
  createAppFolder() {
    this.logger?.debug('Creating app folder', { path: this.folderDir });
    this.fsHelper.buildFolderforApp(this.folderDir);
  }

  /**
   * Creates the application structure based on framework.
   */
  createAppStructure() {
    this.logger?.debug('Creating app structure', { framework: this.framework });
    if (this.framework === 'node') {
      this.fileCreator.createNodeApp(
        this.templatesDir,
        this.folderDir,
        this.appName,
        this.view,
        this.db
      );
    } else if (this.framework === 'fastify') {
      this.fileCreator.createFastifyApp(
        this.templatesDir,
        this.folderDir,
        this.appName,
        this.view,
        this.db
      );
    } else {
      this.fileCreator.createExpressApp(
        this.templatesDir,
        this.folderDir,
        this.appName,
        this.view,
        this.db
      );
    }
  }

  /**
   * Configures custom port in the generated app.
   */
  configurePort() {
    if (this.port !== 3000) {
      this.logger?.debug('Configuring custom port', { port: this.port });
      const indexPath = path.join(this.folderDir, 'index.js');
      try {
        let content = fs.readFileSync(indexPath, 'utf8');
        content = content.replace(
          /process\.env\.PORT \|\| 3000/g,
          `process.env.PORT || ${this.port}`
        );
        fs.writeFileSync(indexPath, content, 'utf8');
        this.logger?.step(`Port configured to ${this.port}`);
      } catch (err) {
        this.logger?.warn(`Could not configure port: ${err.message}`);
      }
    }
  }

  /**
   * Sets up view engine if specified.
   */
  setupViews() {
    this.fileCreator.handleViews(
      this.folderDir,
      this.config.paths.templates.views,
      this.view
    );
  }

  /**
   * Sets up database configuration if enabled.
   */
  setupDatabase() {
    if (this.db) {
      this.fileCreator.handleConfig(
        this.folderDir,
        this.templatesDir,
        this.framework
      );
    }
  }

  /**
   * Adds gitignore and Docker support files.
   */
  addSupportFiles() {
    this.fileCreator.addGitIgnore(this.folderDir, this.templatesDir);
    this.fileCreator.addDockerSupport(this.folderDir, this.templatesDir);
    this.fileCreator.addReadme(this.folderDir, this.templatesDir);
    this.fileCreator.addEnvExample(this.folderDir, this.templatesDir);
  }

  /**
   * Installs npm dependencies.
   * @returns {Promise<void>}
   */
  async installDependencies() {
    this.displayer.beginMessage(this.appName);
    console.log('Installing required NPM Packages. This might take a while.');

    try {
      await execPromise(`cd ${this.folderDir} && npm install`);
      console.log(chalk.green('\nNPM Packages Installed Successfully'));
      this.displayer.endMessage(this.appName);
    } catch (err) {
      handleError(err, 'Failed to install dependencies');
      throw err;
    }
  }
}

export default AppGenerator;
