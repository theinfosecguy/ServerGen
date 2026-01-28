/**
 * Fastify application entry point with MongoDB configuration.
 * @description High-performance server with logging, security headers, and database.
 */

'use strict';

const Fastify = require('fastify');

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
};

const environment = process.env.NODE_ENV || 'development';

const fastify = Fastify({
  logger: envToLogger[environment] ?? true,
});

// Register plugins
fastify.register(require('@fastify/cors'));
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/helmet'));

// Views

// Register database connector
fastify.register(require('./config/mongoose'));

// Register routes
fastify.register(require('./routes'));

/**
 * Health check endpoint for container orchestration.
 */
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

/**
 * Graceful shutdown handler.
 */
const closeGracefully = async (signal) => {
  fastify.log.info(`Received signal: ${signal}`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

/**
 * Start the server.
 */
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
