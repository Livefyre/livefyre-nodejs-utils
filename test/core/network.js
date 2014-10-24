var c = require('../constants');
var livefyre = require('../../lib/livefyre');
var	jwt = require('jwt-simple');
var	util = require('util');

var Network = require('../../lib/core/network');


exports.unit = {
	setUp: function (callback) {
        network = livefyre.getNetwork(c.NETWORK_NAME, c.NETWORK_KEY);
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

    'should throw an error if any field is null or undefined in initialization': function(test) {
        try {
            Network.init(null, null);
            test.fail();
        } catch (err) { }
        try {
            Network.init(undefined, undefined);
            test.fail();
        } catch (err) { }
        try {
            Network.init('', '');
            test.fail();
        } catch (err) { }
        try {
            Network.init(c.NETWORK_NAME, undefined);
            test.fail();
        } catch (err) { }
        try {
            Network.init(undefined, c.NETWORK_KEY);
            test.fail();
        } catch (err) { }
        test.done();
    },

    'should return a network urn': function(test) {
        test.equals('urn:livefyre:'+ c.NETWORK_NAME, network.getUrn());
        test.done();
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
        try {
            network.buildUserAuthToken('test.-f12', 'test', 100.0);
        } catch(err) {
            test.ok(util.isError(err));
        }
		test.done();
	},

	'should test basic network api calls': function (test) {
		var one = function() {
			network.syncUser('user', function() { test.done(); });
		};

		network.setUserSyncUrl('url/{id}', one);
	}
};