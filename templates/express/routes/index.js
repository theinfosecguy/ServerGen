const express = require('express');

const router = express.Router();

router.get('/', function (req, res) {
  res
    .json({
      message: 'Welcome to ServerGen!',
    })
    .status(200);
});

router.post('/', function (req, res) {
  res
    .json({
      message: 'Welcome to ServerGen!',
      data: req.body,
    })
    .status(200);
});

module.exports = router;
