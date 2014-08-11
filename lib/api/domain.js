var util = require('util');

function Domain() {}

Domain.quill = function(core) {
	var ssl = true;
	try {
		ssl = core.ssl;
	}
	catch (err) {
		ssl = core.network.ssl;
	}
	return ssl ? util.format('https://%s.quill.fyre.co', core.networkName) : util.format('http://quill.%s.fyre.co', core.networkName);
}

Domain.bootstrap = function(core) {
	var ssl = true;
	try {
		ssl = core.ssl;
	}
	catch (err) {
		ssl = core.network.ssl;
	}
	return ssl ? 'https://bootstrap.livefyre.com' : util.format('http://bootstrap.%s.fyre.co', core.networkName);
}

module.exports = Domain;