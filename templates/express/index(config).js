const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
require('./config/mongoose');

// If views flag is true, View Engine will be set here.
null;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

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
