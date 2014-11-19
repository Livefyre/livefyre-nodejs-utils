var Network = require('./core/network');


var livefyre = function livefyre() {};
module.exports = livefyre;


livefyre.getNetwork = function getNetwork(networkName, networkKey) {
	return Network.init(networkName, networkKey);
};