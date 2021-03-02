const mongoose = require("mongoose"); // Required Library

mongoose.connect("mongodb://localhost/demo_db"); //Connect to DB

// Acquire the connection - To access DB
const db = mongoose.connection;

// To have a check on Error
db.on("error", console.error.bind(console, "connection error:"));

// Once Connection is Open
db.once("open", function () {
  // we're connected!
  console.log("Connected to DB");
});
