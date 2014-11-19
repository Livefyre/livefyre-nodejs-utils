var util = require('util');

var LivefyreUtil = require('../utils/livefyre_util');


function Domain() {}
module.exports = Domain;


Domain.quill = function quill(core) {
    var network = LivefyreUtil.getNetworkFromCore(core);
	return network.ssl
        ? util.format('https://%s.quill.fyre.co', network.getNetworkName())
        : util.format('http://quill.%s.fyre.co', network.getNetworkName());
};


Domain.bootstrap = function bootstrap(core) {
    var network = LivefyreUtil.getNetworkFromCore(core);
	return network.ssl
        ? util.format('https://%s.bootstrap.fyre.co', network.getNetworkName())
        : util.format('http://bootstrap.%s.fyre.co', network.getNetworkName());
};