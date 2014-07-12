var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var Payload = require('./payload');

var HTTPPayload = function(){
	Payload.apply(this, arguments);

	this.type = 'http';
	return this;
};
HTTPPayload.prototype = Object.create(Payload.prototype);
HTTPPayload.prototype.type = 'http';


function HTTPServer(options, elasticsearch){
	var self = this;
	options = _.extend({
		port: 8000,
		hostname: 'localhost'
	}, options);
	

	// basically a noop
	var authFunction = function(body, cb){
		cb(null);
	};

	var server = express();
	server.use(bodyParser.json());

	// ignore the stupid favicon
	server.use(function(req, res, next){
		if(req.path == '/favicon.ico'){
			return res.send(200);
		}
		next();
	});

	server.use(function(req, res, next){
		var payload = new HTTPPayload(req.body, {
			headers: req.headers
		});

		authFunction(payload, function(err){
			if(err){
				return res.json(500);
			}
			next();
		});
	});

	var handleLog = function(req, res, next){
		var payload = req.body;
		if(!_.isObject(payload) || !_.keys(payload).length){
			return res.json(200);
		}

		var errors = false;
		var errorData = {};
		if(!payload.level || !payload.level.length){
			errors = true;
			errorData.level = 'Log level is required';
		}

		if(!payload.message || !payload.message.length){
			errors = true;
			errorData.level = 'Log message is required';
		}

		if(errors){
			return res.json(400, {
				error: 'invalid_payload',
				payload: errorData
			});
		}

		var formattedPayload = {};
		var validKeys = ['level', 'ns', 'ident', 'message', 'data', 'token'];

		_.each(validKeys, function(key){
			if(key in payload){
				formattedPayload[key] = payload[key];
			} else {
				if(key == 'data'){
					formattedPayload[key] = {};
				} else {
					formattedPayload[key] = '';
				}
			}
		});

		elasticsearch.insert(formattedPayload)
		.then(function(){
			res.json(200);
		})
		.then(undefined, function(err){
			res.json(500, {
				error: 'failed_to_insert',
				payload: err
			}); 
		});
	};

	server.get('*', handleLog);
	server.post('*', handleLog);

	self.auth = function(fn){
		if(typeof fn === 'function'){
			authFunction = fn;
		}
	};

	self.start = function(){
		var self = this;
		server.listen(options.port, options.hostname, function(){
			console.log('started', options);
		});
	};

	if(options.auth && typeof options.auth === 'function'){
		authFunction = options.auth;
	}
};



module.exports = HTTPServer;	