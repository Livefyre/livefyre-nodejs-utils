var Network = require('./core/network')


var livefyre = function livefyre() {}


livefyre.getNetwork = function getNetwork(networkName, networkKey) {
	return Network.init(networkName, networkKey);
};
module.exports = livefyre;