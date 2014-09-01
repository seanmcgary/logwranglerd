var _ = require('lodash');
var q = require('q');

function WebsocketClientServer(){
	this.on('log', function(interfaceName, payload){
		console.log("GOT LOG");
		console.log(arguments);
	});
};
WebsocketClientServer.prototype = Object.create(require('events').EventEmitter.prototype);


module.exports = WebsocketClientServer;