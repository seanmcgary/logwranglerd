var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var Payload = require('./payload');
var logwrangler = require('logwrangler');
var logger = logwrangler.create();

var HTTPPayload = function(){
	Payload.apply(this, arguments);

	this.type = 'http';
	return this;
};
HTTPPayload.prototype = Object.create(Payload.prototype);
HTTPPayload.prototype.type = 'http';


function HTTPServer(options, elasticsearch, eventBroker){
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

		if(payload && payload.logs && _.isArray(payload.logs)){
			_.each(payload.logs, function(log){

				var errors = false;
				var errorData = {};
				if(!log.level || !log.level.length){
					errors = true;
					errorData.level = 'Log level is required';
				}

				if(!log.message || !log.message.length){
					errors = true;
					errorData.level = 'Log message is required';
				}

				if(errors){

					logger.warn({
						message: 'invalid payload',
						data: {
							error: 'invalid_payload',
							payload: errorData
						}
					});
				}
				var formattedPayload = {};
				var validKeys = ['level', 'ns', 'ident', 'message', 'data', 'token'];

				_.each(validKeys, function(key){
					if(key in log){
						formattedPayload[key] = log[key];
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
					logger.info({
						message: 'log inserted'
					});
					eventBroker.emit('log', 'http', formattedPayload);
				})
				.then(undefined, function(err){
					logger.error({
						data: {
							error: 'failed_to_insert',
							log: err
						}
					}); 
				});
			});
			res.json(200);
		} else {
			res.json(400, {
				error: 'logs needs to be an array of logs'
			});
		}
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
			logger.log({
				level: logger.levels.INFO,
				ns: 'http server',
				message: 'server started',
				data: options
			});
		});
	};

	if(options.auth && typeof options.auth === 'function'){
		authFunction = options.auth;
	}
};



module.exports = HTTPServer;	