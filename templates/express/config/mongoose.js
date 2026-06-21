/**
 * MongoDB connection configuration using Mongoose.
 * @description Exports a lazy MongoDB connector using the MONGODB_URI
 * environment variable, falling back to a local database.
 */

require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost/demo_db';
let connectionPromise;

const connectDatabase = function () {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri)
      .then(function () {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch(function (err) {
        connectionPromise = null;
        console.error('MongoDB connection error:', err.message);
        return null;
      });
  }

  return connectionPromise;
};

module.exports = { mongoose, connectDatabase };
