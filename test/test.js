var interfaces = require('../lib/interfaces');

var instances = interfaces.init({
	elasticsearch: {
		host: 'elasticsearch.local',
		port: 9200
	},
	interfaces: {
		http: {
			port: 9999,
			auth: function(payload, cb){
				//console.log("AUTH");
				//console.log(payload.get());
				//console.log(payload.constructor);

				cb();
			}
		}
	}
});

instances.startAll();