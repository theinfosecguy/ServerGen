/**
 * MongoDB connection configuration using Mongoose.
 * @description Exports a lazy MongoDB connector using the MONGODB_URI
 * environment variable, falling back to a local database.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ quiet: true });

const uri = process.env.MONGODB_URI || 'mongodb://localhost/demo_db';
let connectionPromise: Promise<typeof mongoose | null> | undefined;

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
      .catch(function (err: Error) {
        connectionPromise = undefined;
        console.error('MongoDB connection error:', err.message);
        return null;
      });
  }

  return connectionPromise;
};

export { mongoose, connectDatabase };
