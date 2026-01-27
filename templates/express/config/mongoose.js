/**
 * MongoDB connection configuration using Mongoose.
 * @description Establishes connection to MongoDB database.
 */

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/demo_db');

// Acquire the connection - To access DB
const db = mongoose.connection;

// To have a check on Error
db.on('error', console.error.bind(console, 'connection error:'));

// Once Connection is Open
db.once('open', function () {
  // we're connected!
  console.log('Connected to DB');
});
