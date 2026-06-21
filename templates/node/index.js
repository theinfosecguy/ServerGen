/**
 * Node.js HTTP server entry point.
 * @description Basic JSON HTTP server with simple routing.
 */

const http = require('http');

const hostname = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

/**
 * Creates HTTP server with basic routing.
 */
const server = http.createServer((req, res) => {
  const sendJson = function (statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
  };

  const url = req.url;
  if (url === '/about') {
    sendJson(200, { message: 'About this ServerGen app' });
  } else if (url === '/contact') {
    sendJson(200, { message: 'Contact this ServerGen app' });
  } else if (url === '/health') {
    sendJson(200, { status: 'ok' });
  } else {
    sendJson(200, { message: 'Welcome to ServerGen!' });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
