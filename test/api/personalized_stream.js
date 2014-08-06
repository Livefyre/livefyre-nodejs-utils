var livefyre = require('../../lib/livefyre.js'),
	jwt = require('jwt-simple');

var PersonalizedStream = require('../../lib/api/personalized_stream.js'),
	CursorFactory = require('../../lib/factory/cursor_factory.js'),
	Topic = require('../../lib/entity/topic.js'),
	Constants = require('../constants.js');

exports.unit = {
	setUp: function (callback) {
        network = livefyre.getNetwork(Constants.NETWORK_NAME, Constants.NETWORK_KEY);
        site = network.getSite(Constants.SITE_ID, Constants.SITE_KEY);
        callback();
    },

	'should test network topic api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.length, 1);
			PersonalizedStream.getTopic(two, network, '1'); 
		};
		var two = function(result) {
			test.equal(result.label, 'ONE');
			PersonalizedStream.deleteTopic(three, network, result); 
		};
		var three = function(result) {
			test.equal(result, 1);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopic(one, network, '1', 'ONE');
	},

	'should test network topics api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.getTopics(two, network);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.deleteTopics(three, network, result);
		};
		var three = function(result) {
			test.equal(result, 2);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopics(one, network, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }]);
	},

	'should test network subscription api calls': function(test) {
		test.expect(5);
		var userToken = network.buildUserAuthToken(Constants.USER_ID, Constants.USER_ID + '@' + Constants.NETWORK_NAME, network.DEFAULT_EXPIRES);

		var topics = PersonalizedStream.createOrUpdateTopics(function(result) {}, network, [{ key: 2, value: 'TWO'}, { key: 3, value: 'THREE' }]);
		var one = function(result) {
			test.equal(result, 2);
			PersonalizedStream.getSubscriptions(two, network, Constants.USER_ID);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.replaceSubscriptions(three, network, userToken, [topics[0]]);
		};
		var three = function(result) {
			test.equal(result.removed, 1);
			PersonalizedStream.getSubscribers(four, network, topics[0]);
		};
		var four = function(result) {
			test.equal(result.length, 1);
			PersonalizedStream.removeSubscriptions(five, network, userToken, [topics[0]]);
		};
		var five = function(result) {
			test.equal(result, 1);
			PersonalizedStream.deleteTopics(six, network, topics);
		};
		var six = function(result) {
			test.done();
		};

		PersonalizedStream.addSubscriptions(one, network, userToken, topics);
	},

	'tests cursors': function(test) {
		test.expect(1);

		var one = function(result) {
			test.equals(result.code, 200);
			test.done();
		};

		var cursor = CursorFactory.getPersonalStreamCursor(one, network, Constants.USER_ID);

		cursor.next();
		// cursor.previous();
	},

	'should test site topic api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.length, 1);
			PersonalizedStream.getTopic(two, site, '1');
		};
		var two = function(result) {
			test.equal(result.label, 'ONE');
			PersonalizedStream.deleteTopic(three, site, result);
		};
		var three = function(result) {
			test.equal(result, 1);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopic(one, site, '1', 'ONE');
	},

	'should test site topics api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.getTopics(two, site);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.deleteTopics(three, site, result);
		};
		var three = function(result) {
			test.equal(result, 2);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopics(one, site, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }]);
	},

	'should test site collection topic api calls': function(test) {
		test.expect(4);

		var topics = PersonalizedStream.createOrUpdateTopics(function(result) {}, site, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }]);
		var one = function(result) {
			test.equal(result, 2);
			PersonalizedStream.getCollectionTopics(two, site, Constants.COLLECTION_ID);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.replaceCollectionTopics(three, site, Constants.COLLECTION_ID, [topics[0]]);
		};
		var three = function(result) {
			test.equal(result.removed, 1);
			PersonalizedStream.removeCollectionTopics(four, site, Constants.COLLECTION_ID, [topics[0]]);
		};
		var four = function(result) {
			test.equal(result, 1);
			PersonalizedStream.deleteTopics(five, site, topics);
		};
		var five = function(result) {
			test.done();
		};

		PersonalizedStream.addCollectionTopics(one, site, Constants.COLLECTION_ID, topics);
	}
}