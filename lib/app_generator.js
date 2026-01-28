/**
 * Application generator that orchestrates the app creation process.
 * @module lib/app_generator
 */

const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const chalk = require('chalk');

const execPromise = util.promisify(exec);

/**
 * AppGenerator class that handles the complete app generation workflow.
 */
class AppGenerator {
  /**
   * Creates an AppGenerator instance.
   * @param {Object} options - Generation options.
   * @param {string} options.appName - The application name.
   * @param {string} options.framework - The framework type ('node' or 'express').
   * @param {string|null} options.view - The view engine name.
   * @param {boolean} options.db - Whether to include database configuration.
   * @param {Object} options.config - Configuration object from lib/config.
   * @param {Object} dependencies - Injected dependencies.
   * @param {Object} dependencies.fsHelper - File system helper module.
   * @param {Object} dependencies.fileCreator - File generator module.
   * @param {Object} dependencies.displayer - Log display module.
   */
  constructor(options, dependencies) {
    this.appName = options.appName;
    this.framework = options.framework || 'express';
    this.view = options.view;
    this.db = options.db;
    this.config = options.config;

    this.fsHelper = dependencies.fsHelper;
    this.fileCreator = dependencies.fileCreator;
    this.displayer = dependencies.displayer;

    this.folderDir = path.join(this.config.paths.cwd, this.appName);
    this.templatesDir = this.framework === 'node'
      ? this.config.paths.templates.node
      : this.config.paths.templates.express;
  }

  /**
   * Generates the complete application.
   * @returns {Promise<void>}
   */
  async generate() {
    this.createAppFolder();
    this.createAppStructure();
    this.setupViews();
    this.setupDatabase();
    this.addSupportFiles();
    await this.installDependencies();
  }

  /**
   * Creates the main application folder.
   */
  createAppFolder() {
    this.fsHelper.buildFolderforApp(this.folderDir);
  }

  /**
   * Creates the application structure based on framework.
   */
  createAppStructure() {
    if (this.framework === 'node') {
      this.fileCreator.createNodeApp(
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
        this.config.paths.templates.express
      );
    }
  }

  /**
   * Adds gitignore and Docker support files.
   */
  addSupportFiles() {
    this.fileCreator.addGitIgnore(this.folderDir, this.templatesDir);
    this.fileCreator.addDockerSupport(this.folderDir, this.templatesDir);
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
      console.log(chalk.red('\nError: ' + err));
      throw err;
    }
  }
}

module.exports = AppGenerator;
