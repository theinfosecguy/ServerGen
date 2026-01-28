/**
 * MongoDB connection plugin for Fastify.
 * @description Connects to MongoDB using Mongoose and decorates the Fastify instance.
 */

'use strict';

const fp = require('fastify-plugin');
const mongoose = require('mongoose');

/**
 * Mongoose connection plugin.
 * @param {FastifyInstance} fastify - Encapsulated Fastify instance.
 * @param {Object} options - Plugin options.
 */
async function mongooseConnector(fastify, options) {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/servergen';

  try {
    await mongoose.connect(uri);
    fastify.log.info('Connected to MongoDB');

    // Decorate fastify with mongoose instance
    fastify.decorate('mongoose', mongoose);

    // Close connection on fastify close
    fastify.addHook('onClose', async (instance) => {
      await mongoose.connection.close();
      instance.log.info('MongoDB connection closed');
    });
  } catch (err) {
    fastify.log.error('MongoDB connection error:', err);
    throw err;
  }
}

module.exports = fp(mongooseConnector);
