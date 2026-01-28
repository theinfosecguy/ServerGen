/**
 * Express application entry point with MongoDB configuration.
 * @description Main server configuration with CORS, routing, and database setup.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import './config/mongoose';

const app: Application = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Views

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Using express router
app.use('/', routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Listening on Port
app.listen(port, (): void => {
  console.log(`Express Server started on port ${port}`);
});

export default app;
