var _ = require('lodash');

var express = require('express');
var bodyParser = require('body-parser');


function Payload(log, additionalData){
	payload = _.extend(additionalData, {
		log: log,
		type: this.type
	});

	this.get = function(){
		return payload;
	};

	return this;	
};

var HTTPPayload = function(){
	Payload.apply(this, arguments);

	this.type = 'http';
	return this;
};
HTTPPayload.prototype = Object.create(Payload.prototype);
HTTPPayload.prototype.type = 'http';

function HTTPServer(options){
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
		console.log('use');
		var payload = new HTTPPayload(req.body, {
			headers: req.headers
		});

		authFunction(payload, function(err){
			console.log('after auth');
			if(err){
				return res.json(500);
			}
			next();
		});
	});

	var handleLog = function(req, res, next){
		res.send(200);
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
		console.log(options);
		server.listen(options.port, options.hostname, function(){
			console.log('started', options);
		});
	};

	if(options.auth && typeof options.auth === 'function'){
		authFunction = options.auth;
	}
};



module.exports = HTTPServer;	