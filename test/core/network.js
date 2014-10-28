var c = require('./../constants');
var	jwt = require('jwt-simple');
var	util = require('util');

var livefyre = require(c.PATH+'livefyre');
var Network = require(c.PATH+'core/network');


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

    'should return a network urn and urn for user': function(test) {
        test.equals('urn:livefyre:'+ c.NETWORK_NAME, network.getUrn());
        test.equals(network.getUrn()+':user='+ c.USER_ID, network.getUrnForUser(c.USER_ID));
        test.done();
    },

    'should get the proper network name': function(test) {
        test.equals(c.NETWORK_NAME.split('.')[0], network.getNetworkName());
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
        test.ok(!network.validateLivefyreToken(network.buildUserAuthToken('not', 'system', 10)));
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
        test.expect(2);

		var one = function(err) {
            test.ok(typeof err == 'undefined');
            network.syncUser('user', finish);
        };
        var finish = function (err) {
            test.ok(typeof err == 'undefined');
            test.done();
        };

		network.setUserSyncUrl('url/{id}', one);
    }
};