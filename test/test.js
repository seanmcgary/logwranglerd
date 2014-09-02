var interfaces = require('../lib/interfaces');

var wsServer = require('../lib/websocketClientServer');
console.log(wsServer);

var ws = new wsServer();

var instances = interfaces.init({
	elasticsearch: {
		host: 'elasticsearch.local',
		port: 9200
	},
	interfaces: {
		http: {
			port: 8000,
			auth: function(payload, cb){
				//console.log("AUTH");
				//console.log(payload.get());
				//console.log(payload.constructor);

				cb();
			}
		}
	}
}, ws);

instances.startAll();



var logwrangler = require('logwrangler');
var logwranglerHttp = require('logwrangler-http');

var logger = logwrangler.create({}, true);

logger.use(new logwranglerHttp({
	host: 'localhost',
	port: 8000
}));

setInterval(function(){
	logger.log({
		message: 'test message',
		token: 'testtoken',
		data: {
			date: new Date().toISOString()
		}
	});	
}, 5000);
