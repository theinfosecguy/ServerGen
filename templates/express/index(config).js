const express = require("express");
const app = express();
const port = 3000;

// If views flag is true, View Engine will be set here.
null;

const db = require("./config/mongoose");

// Express Middleware
app.use(express.urlencoded());

// Using express router
app.use("/", require("./routes"));

// Listen on Port
app.listen(port, function (err) {
  if (err) {
    console.log("Error in running Express Server ");
    return;
  }
  console.log("Express Server started on port ", port);
});