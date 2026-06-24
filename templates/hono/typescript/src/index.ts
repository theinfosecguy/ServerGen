/**
 * Hono API entry point.
 * @description TypeScript API server with JSON routes and a health check.
 */

import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { pathToFileURL } from 'node:url';

dotenv.config({ quiet: true });

const app = new Hono();
const port = Number(process.env.PORT || 3000);

app.use('*', logger());

app.get('/', (c) => {
  return c.json({ message: 'Welcome to ServerGen!' });
});

app.get('/about', (c) => {
  return c.json({ message: 'About this ServerGen app' });
});

app.get('/contact', (c) => {
  return c.json({ message: 'Contact this ServerGen app' });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export const startServer = () => {
  const server = serve(
    {
      fetch: app.fetch,
      hostname: '0.0.0.0',
      port,
    },
    (info) => {
      console.log(`Hono server running at http://0.0.0.0:${info.port}/`);
    }
  );

  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });

  return server;
};

const isMain = Boolean(
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
);

if (isMain) {
  startServer();
}

export default app;
