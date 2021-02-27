const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`App by Make-Server started and listening at port ${port}`)
})