const net = require('net');
const client = new net.Socket();
const port = 7070;
const host = 'tcp-service';

client.connect(port, host, function() {
  console.log('Connected');
  client.write('Hello, server! Love, Client.');
});

client.on('data', function(data) {
  console.log('Received: ' + data);
  console.log(data.length)
});

client.on('close', function() {
  console.log('Connection closed');
});

// waitPort({
//   host: 'tcp-service',
//   port: 7070,
//   timeout: 10000,
//   waitForDns: true,
// }).then(() => {
//   console.log('tcp-service is up');
// }
// ).catch((err) => {
//   console.log(err);
// });
