const net = require('node:net');
const client = new net.Socket();
const port = 7070;
const host = 'tcp-service';

client.connect(port, host, function() {
  console.log('Connected');
  client.write('Hello, server! Love, Client.');
});

client.on('data', function(data) {
  console.log('Received: ' + data.toJSON().data);
});

client.on('close', function() {
  console.log('Connection closed');
});
