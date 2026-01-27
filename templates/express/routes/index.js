/**
 * Express router configuration.
 * @description Defines API routes for the application.
 */

const express = require('express');

const router = express.Router();

/**
 * GET / - Returns welcome message.
 */
router.get('/', function (req, res) {
  res
    .json({
      message: 'Welcome to ServerGen!',
    })
    .status(200);
});

/**
 * POST / - Returns welcome message with request body.
 */
router.post('/', function (req, res) {
  res
    .json({
      message: 'Welcome to ServerGen!',
      data: req.body,
    })
    .status(200);
});

module.exports = router;
