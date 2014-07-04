var _ = require('lodash');


var interfaces = {
	http: require('./http')
};

_.each(interfaces, function(iface, name){
	exports[name] = iface;
});

exports.init = function(config){
	if(!config.interfaces){
		throw new Error('no interfaces provided');
	}

	var instances = {};
	_.each(config.interfaces, function(iface, name){
		if(name in interfaces){
			instances[name] = new interfaces[name](iface);
		}
	});

	return {
		instances: instances,
		startAll: function(){
			_.each(instances, function(inst){
				inst.start();
			});
		}
	};
};