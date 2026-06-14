/**
 * Express application entry point.
 * @description Main server configuration with CORS and routing setup.
 */

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

// Views

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes'));

// Listening on Port
app.listen(port, function (err) {
  if (err) {
    console.log('Error in running Express Server ');
    return;
  }
  console.log('Express Server started on port ', port);
});
