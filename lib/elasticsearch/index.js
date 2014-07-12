var _ = require('lodash');
var elasticsearch = require('elasticsearch');

var client;
var createConnection = function(config, newInstance){
	var config = config || {};

	var port = config.port || 9200;
	var host = config.host || 'localhost';
	var apiVersion = config.apiVersion || '1.2';

	if(!client || newInstance){
		var localClient = new elasticsearch.Client({
			host: [host, port].join(':'),
			apiVersion: apiVersion
		});

		if(newInstance){
			return localClient;
		}
		client = localClient;
	}
	return client;
};

exports.connection = createConnection;