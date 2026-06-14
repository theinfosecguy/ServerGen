/**
 * MongoDB connection configuration using Mongoose.
 * @description Connects to MongoDB using the MONGODB_URI environment variable
 * (falling back to a local database), and exports the mongoose instance.
 */

require('dotenv').config();

const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost/demo_db';

mongoose
  .connect(uri)
  .then(function () {
    console.log('Connected to MongoDB');
  })
  .catch(function (err) {
    console.error('MongoDB connection error:', err.message);
  });

module.exports = mongoose;
