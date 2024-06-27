const net = require('node:net');
const port = 7070;
const host = 'tcp-service';

const server = net.createServer();

server.listen(port, host, () => {
  console.log('TCP Server is running on port ' + port + '.');
});

const sockets = [];

server.on('connection', function(sock) {
  console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
  sockets.push(sock);

  sock.on('data', function(data) {
    console.log('DATA ' + sock.remoteAddress + ': ' + data);
    sockets.forEach(function(sock, index, array) {
      sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n');
      sock.write(Buffer.from([100,2,3,4,5,6,7,8,9,10,11]));
    });
  });

  sock.on('close', function(data) {
    let index = sockets.findIndex(function(o) {
      return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
    })
    if (index !== -1) sockets.splice(index, 1);
    console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
  });
});

server.on('error', function(err) {
  console.log(err);
});

require('./client');