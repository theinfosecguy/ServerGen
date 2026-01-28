/**
 * Fastify routes plugin.
 * @description Defines API routes for the application.
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';

/**
 * Route plugin that registers all application routes.
 */
const routes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  /**
   * GET / - Returns welcome message.
   */
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async () => {
    return { message: 'Welcome to ServerGen!' };
  });

  /**
   * POST / - Returns welcome message with request body.
   */
  fastify.post<{ Body: { name?: string } }>('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request) => {
    return {
      message: 'Welcome to ServerGen!',
      data: request.body,
    };
  });
};

export default routes;
