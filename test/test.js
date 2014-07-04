var interfaces = require('../lib/interfaces');

var instances = interfaces.init({
	interfaces: {
		http: {
			port: 9999,
			auth: function(payload, cb){
				console.log("AUTH");
				console.log(payload.get());
				console.log(payload.constructor);
			}
		}
	}
});

instances.startAll();