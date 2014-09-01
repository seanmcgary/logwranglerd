var _ = require('lodash');
var http = require('./http');
var Elasticsearch = require('../elasticsearch');

var HTTPServer = exports.HTTPServer = function(options, elasticsearch, eventBroker){
	return new http(options, elasticsearch, eventBroker);
};

var interfaces = {
	http: HTTPServer
};

function SwitchBoard(){};
SwitchBoard.prototype = Object.create(require('events').EventEmitter.prototype);

exports.init = function(config, eventBroker){
	if(!config.interfaces){
		throw new Error('no interfaces provided');
	}

	var esConn = Elasticsearch.connection(config.elasticsearch);

	var instances = {};
	_.each(config.interfaces, function(iface, name){
		if(name in interfaces){
			instances[name] = interfaces[name](iface, esConn, eventBroker);
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