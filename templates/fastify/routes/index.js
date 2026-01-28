/**
 * Fastify routes plugin.
 * @description Defines API routes for the application.
 */

'use strict';

/**
 * Route plugin that registers all application routes.
 * @param {FastifyInstance} fastify - Encapsulated Fastify instance.
 * @param {Object} options - Plugin options.
 */
async function routes(fastify, options) {
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
  }, async (request, reply) => {
    return { message: 'Welcome to ServerGen!' };
  });

  /**
   * POST / - Returns welcome message with request body.
   */
  fastify.post('/', {
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
  }, async (request, reply) => {
    return {
      message: 'Welcome to ServerGen!',
      data: request.body,
    };
  });
}

module.exports = routes;
