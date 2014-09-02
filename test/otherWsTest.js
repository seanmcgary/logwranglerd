var ioClient = require('socket.io-client');
var d = ioClient('http://localhost:9000');
d.on('connect', function(){
	console.log('connected');
});

d.on('log', function(){
	console.log('d', arguments);
});