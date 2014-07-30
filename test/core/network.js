var livefyre = require('../../lib/livefyre.js'),
	jwt = require('jwt-simple');

var Topic = require('../../lib/entity/topic.js');

var Constants = require('../constants.js');

exports.unit = {
	setUp: function (callback) {
        network = livefyre.getNetwork(Constants.NETWORK_NAME, Constants.NETWORK_KEY);
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
	},
	

	'should test network topic api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.created, 1);
			network.getTopic(two, '1'); 
		};
		var two = function(result) {
			test.equal(result.label, 'ONE');
			network.deleteTopic(three, result); 
		};
		var three = function(result) {
			test.equal(result, 1);
			test.done();
		};

		network.createOrUpdateTopic(one, '1', 'ONE');
	},

	'should test network topics api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.created, 2);
			network.getTopics(two);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			network.deleteTopics(three, result);
		};
		var three = function(result) {
			test.equal(result, 2);
			test.done();
		};

		network.createOrUpdateTopics(one, { 2: 'TWO', 3: 'THREE' });
	},

	'should test network subscription api calls': function(test) {
		test.expect(5);

		var topics = network.createOrUpdateTopics(function(result) {}, { 2: 'TWO', 3: 'THREE' });
		var one = function(result) {
			test.equal(result, 2);
			network.getSubscriptions(two, Constants.USER_ID);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			network.updateSubscriptions(three, Constants.USER_ID, [topics[0]]);
		};
		var three = function(result) {
			test.equal(result.removed, 1);
			network.getSubscribers(four, topics[0]);
		};
		var four = function(result) {
			test.equal(result.length, 1);
			network.removeSubscriptions(five, Constants.USER_ID, [topics[0]]);
		};
		var five = function(result) {
			test.equal(result, 1);
			network.deleteTopics(six, topics);
		};
		var six = function(result) {
			test.done();
		};

		network.addSubscriptions(one, Constants.USER_ID, topics);
	},

	'tests cursors': function(test) {
		test.expect(1);

		var one = function(result) {
			test.equals(result.code, 200);
			test.done();
		};

		var cursor = network.getPersonalStreamCursor(one, Constants.USER_ID);

		cursor.next();
		// cursor.previous();
	}*/
}