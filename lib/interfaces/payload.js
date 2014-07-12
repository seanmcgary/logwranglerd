var _ = require('lodash');

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

module.exports = Payload;