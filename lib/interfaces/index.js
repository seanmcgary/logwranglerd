var _ = require('lodash');
var http = require('./http');
var Elasticsearch = require('../elasticsearch');

var HTTPServer = exports.HTTPServer = function(options, elasticsearch){
	return new http(options, elasticsearch);
};

var interfaces = {
	http: HTTPServer
};

exports.init = function(config){
	if(!config.interfaces){
		throw new Error('no interfaces provided');
	}

	var esConn = Elasticsearch.connection(config.elasticsearch);

	var instances = {};
	_.each(config.interfaces, function(iface, name){
		if(name in interfaces){
			instances[name] = interfaces[name](iface, esConn);
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