/**
 * Express application entry point.
 * @description Production-ready server with a health check, centralized error
 * handling, Prisma-ready routes, and graceful shutdown.
 */

import cors from 'cors';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import router from './routes/index.js';

dotenv.config({ quiet: true });

const app = express();
const port = Number(process.env.PORT || 3000);

// Views

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint.
app.get('/health', function (req: Request, res: Response) {
  res.status(200).json({ status: 'ok' });
});

app.use('/', router);

// Centralized error-handling middleware (must be registered last).
app.use(function (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

export const startServer = function () {
  // Bind to 0.0.0.0 so the server is reachable from outside a container.
  const server = app.listen(port, '0.0.0.0', function () {
    console.log('Express server started on port ' + port);
  });

  const shutdown = function (signal: string) {
    console.log(signal + ' received, shutting down gracefully');
    server.close(function () {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', function () {
    shutdown('SIGINT');
  });
  process.on('SIGTERM', function () {
    shutdown('SIGTERM');
  });

  return server;
};

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  startServer();
}

export default app;
