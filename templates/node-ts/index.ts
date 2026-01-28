/**
 * Node.js HTTP server entry point.
 * @description Basic HTTP server with simple routing.
 */

import http, { IncomingMessage, ServerResponse } from 'http';

const hostname: string = process.env.HOST || '127.0.0.1';
const port: number = parseInt(process.env.PORT || '3000', 10);

/**
 * Request handler with basic routing.
 */
const requestHandler = (req: IncomingMessage, res: ServerResponse): void => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  const url: string = req.url || '/';
  
  if (url === '/about') {
    res.write('<h1>About Us - ServerGen</h1>');
    res.end();
  } else if (url === '/contact') {
    res.write('<h1>Contact us: ServerGen</h1>');
    res.end();
  } else if (url === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    res.end();
  } else {
    res.write('<h1>Hello World!</h1>');
    res.end();
  }
};

const server = http.createServer(requestHandler);

server.listen(port, hostname, (): void => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

export default server;
