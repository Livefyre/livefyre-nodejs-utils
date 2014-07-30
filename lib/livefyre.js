var Network = require('./core/network.js')

var livefyre = module.exports;

livefyre.getNetwork = function getNetwork(networkName, networkKey) {
	return new Network(networkName, networkKey);
}