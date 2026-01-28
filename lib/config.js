/**
 * Configuration settings for ServerGen.
 * @module lib/config
 */

const path = require('path');

/**
 * Returns configuration object with all paths and settings.
 * @param {string} baseDir - The base directory (usually __dirname of caller).
 * @param {string} cwd - Current working directory.
 * @returns {Object} Configuration object.
 */
const getConfig = (baseDir, cwd) => {
  return {
    paths: {
      templates: {
        express: path.join(baseDir, '..', 'templates', 'express'),
        node: path.join(baseDir, '..', 'templates', 'node'),
        views: path.join(baseDir, '..', 'templates', 'express', 'views'),
      },
      cwd,
    },
    validation: {
      frameworks: ['node', 'express'],
      views: ['ejs', 'jade', 'pug', 'hbs'],
    },
    defaults: {
      framework: 'express',
      port: 3000,
    },
  };
};

module.exports = {
  getConfig,
};
