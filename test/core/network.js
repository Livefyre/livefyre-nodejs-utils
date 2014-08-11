var livefyre = require('../../lib/livefyre.js'),
	jwt = require('jwt-simple');

var Topic = require('../../lib/entity/topic.js');

var Constants = require('../constants.js');

exports.unit = {
	setUp: function (callback) {
		constants = new Constants();
		constants.setPropValues(Constants.Environments.prod);
        network = livefyre.getNetwork(constants.NETWORK_NAME, constants.NETWORK_KEY);
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

	'should not allow urls without {id} in setUserSyncUrl': function(test) {
		test.equal(network.setUserSyncUrl('url'), null);
		test.done();
	},

	'should return a token and validate a lf token': function(test) {
		var token = network.buildLivefyreToken();
		test.ok(token);
		test.ok(network.validateLivefyreToken(token));
		test.done();
	},

	'should return null for non-alphanumeric user ids': function(test) {
		test.equal(network.buildUserAuthToken('test.-f12', 'test', 100.0), null);
		test.done();
	}/*,

	'should test basic network api calls': function (test) {
		var one = function(result) { 
			network.syncUser(function(result) { test.done(); }, 'user');
		};

		network.setUserSyncUrl(one, 'url/{id}');
	}*/
}