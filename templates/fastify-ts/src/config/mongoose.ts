/**
 * MongoDB connection plugin for Fastify.
 * @description Connects to MongoDB using Mongoose and decorates the Fastify instance.
 */

import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    mongoose: typeof mongoose;
  }
}

/**
 * Mongoose connection plugin.
 */
const mongooseConnector: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
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
};

export default fp(mongooseConnector);
