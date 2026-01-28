/**
 * Configuration settings for ServerGen.
 * @module lib/config
 */

import path from 'path';

/**
 * Returns configuration object with all paths and settings.
 * @param {string} baseDir - The base directory (usually __dirname of caller).
 * @param {string} cwd - Current working directory.
 * @returns {Object} Configuration object.
 */
export const getConfig = (baseDir, cwd) => {
  return {
    paths: {
      templates: {
        express: path.join(baseDir, '..', 'templates', 'express'),
        node: path.join(baseDir, '..', 'templates', 'node'),
        fastify: path.join(baseDir, '..', 'templates', 'fastify'),
        'fastify-ts': path.join(baseDir, '..', 'templates', 'fastify-ts'),
        views: path.join(baseDir, '..', 'templates', 'express', 'views'),
      },
      cwd,
    },
    validation: {
      frameworks: ['node', 'express', 'fastify'],
      views: ['ejs', 'jade', 'pug', 'hbs'],
    },
    defaults: {
      framework: 'express',
      port: 3000,
    },
  };
};
