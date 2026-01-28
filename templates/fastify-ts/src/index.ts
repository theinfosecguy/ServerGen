/**
 * Fastify application entry point.
 * @description High-performance TypeScript server with logging and security headers.
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import routes from './routes';

type Environment = 'development' | 'production' | 'test';

const envToLogger: Record<Environment, boolean | object> = {
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

const environment = (process.env.NODE_ENV || 'development') as Environment;

const fastify: FastifyInstance = Fastify({
  logger: envToLogger[environment] ?? true,
});

// Register plugins
fastify.register(cors);
fastify.register(formbody);
fastify.register(helmet);

// Views

// Register routes
fastify.register(routes);

/**
 * Health check endpoint for container orchestration.
 */
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

/**
 * Graceful shutdown handler.
 */
const closeGracefully = async (signal: string): Promise<void> => {
  fastify.log.info(`Received signal: ${signal}`);
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

/**
 * Start the server.
 */
const start = async (): Promise<void> => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
