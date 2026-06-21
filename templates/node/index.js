/**
 * Node.js HTTP server entry point.
 * @description Basic JSON HTTP server with simple routing.
 */

const http = require('http');

const hostname = process.env.HOST || '0.0.0.0';
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

  const requestPath = (req.url || '/').split('?')[0];
  if (requestPath === '/') {
    sendJson(200, { message: 'Welcome to ServerGen!' });
  } else if (requestPath === '/about') {
    sendJson(200, { message: 'About this ServerGen app' });
  } else if (requestPath === '/contact') {
    sendJson(200, { message: 'Contact this ServerGen app' });
  } else if (requestPath === '/health') {
    sendJson(200, { status: 'ok' });
  } else {
    sendJson(404, { error: 'Not Found' });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
