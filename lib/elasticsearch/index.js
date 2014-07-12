var _ = require('lodash');
var elasticsearch = require('elasticsearch');

var ESConnection = function(config){
	var config = config || {};

	var port = config.port || 9200;
	var host = config.host || 'localhost';
	var apiVersion = config.apiVersion || '1.2';
	var index = config.index || 'logwrangler';
	var type = config.type || 'type';

	var connection = new elasticsearch.Client({
		host: [host, port].join(':'),
		apiVersion: apiVersion
	});

	return {
		raw: connection,
		insert: function(data){
			return connection.create({
				index: index,
				type: type,
				body: data
			});
		}
	};
};

var client;
var createConnection = function(config, newInstance){
	if(!client || newInstance){
		localClient = new ESConnection(config);

		if(newInstance){
			return localClient;
		}
		client = localClient;
	}
	return client;
};

exports.connection = createConnection;