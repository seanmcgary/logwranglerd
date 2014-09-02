var ioClient = require('socket.io-client');

var c = ioClient('http://localhost:9000');
c.on('connect', function(){
	console.log('connected');

	c.emit('auth', 'testtoken');
});

c.on('log', function(){
	console.log('c', arguments);
});