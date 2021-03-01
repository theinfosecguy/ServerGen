const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  // Routing in NodeJS
  var url = req.url;
  if(url ==='/about'){
      res.write('<h1> About Us - Make-Server <h1>'); //write a response
      res.end(); //end the response
  }else if(url ==='/contact'){
      res.write('<h1> Contact us: Make-Server <h1>'); //write a response
      res.end(); //end the response
  }else{
      res.write('<h1>Hello World!<h1>'); //write a response
      res.end(); //end the response
  }

  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});