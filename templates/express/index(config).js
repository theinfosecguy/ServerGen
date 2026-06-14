/**
 * Express application entry point with MongoDB configuration.
 * @description Production-ready server with MongoDB, a health check, centralized
 * error handling, and graceful shutdown. The app is exported so it can be
 * imported by tests; it only starts listening when run directly.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('./config/mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Views

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint.
app.get('/health', function (req, res) {
  res.status(200).json({ status: 'ok' });
});

app.use('/', require('./routes'));

// Centralized error-handling middleware (must be registered last).
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

if (require.main === module) {
  // Bind to 0.0.0.0 so the server is reachable from outside a container.
  const server = app.listen(port, '0.0.0.0', function () {
    console.log('Express server started on port ' + port);
  });

  const shutdown = function (signal) {
    console.log(signal + ' received, shutting down gracefully');
    server.close(async function () {
      try {
        await mongoose.connection.close();
      } catch (err) {
        // ignore close errors during shutdown
      }
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
}

module.exports = app;
