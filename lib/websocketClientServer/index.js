var _ = require('lodash');
var q = require('q');
var express = require('express');
var io = require('socket.io');

function WebsocketClientServer(server){
	var self = this;
	if(!server){
		server = express();
	}
	var socketServer = new io(require('http').Server(server), {
		serveClient: true
	});

	socketServer.listen(9000);

	self.on('log', function(interfaceName, payload){
		socketServer.to(payload.token).emit('log', payload);
	});

	socketServer.on('connection', function(socket){
		console.log('connection created');
		var authToken;

		socket.on('disconnect', function(){
			console.log('disconnected');
		});

		socket.on('auth', function(token){
			authToken = token;
			socket.join(token);
		});
	});
};
WebsocketClientServer.prototype = Object.create(require('events').EventEmitter.prototype);


module.exports = WebsocketClientServer;