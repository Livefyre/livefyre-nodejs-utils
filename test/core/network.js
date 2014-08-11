var livefyre = require('../../lib/livefyre.js'),
	jwt = require('jwt-simple'),
	util = require('util');

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
		network.setUserSyncUrl('url', function(result) {
			test.ok(util.isError(result));
			test.done();
		});
	},

	'should return a token and validate a lf token': function(test) {
		var token = network.buildLivefyreToken();
		test.ok(token);
		test.ok(network.validateLivefyreToken(token));
		test.done();
	},

	'should return null for non-alphanumeric user ids': function(test) {
		test.ok(util.isError(network.buildUserAuthToken('test.-f12', 'test', 100.0)));
		test.done();
	},

	'should test basic network api calls': function (test) {
		var one = function(result) { 
			network.syncUser('user', function(result) { test.done(); });
		};

		network.setUserSyncUrl('url/{id}', one);
	}
}