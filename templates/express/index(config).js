/**
 * Express application entry point with MongoDB configuration.
 * @description Main server configuration with CORS, routing, and database setup.
 */

const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
require('./config/mongoose');

// Views

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Using express router
app.use('/', require('./routes'));

// Listening on Port
app.listen(port, function (err) {
  if (err) {
    console.log('Error in running Express Server ');
    return;
  }
  console.log('Express Server started on port ', port);
});
