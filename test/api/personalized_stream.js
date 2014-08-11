var livefyre = require('../../lib/livefyre.js'),
	jwt = require('jwt-simple');

var PersonalizedStream = require('../../lib/api/personalized_stream.js'),
	CursorFactory = require('../../lib/factory/cursor_factory.js'),
	Topic = require('../../lib/entity/topic.js'),
	Constants = require('../constants.js');

exports.unit = {
	setUp: function (callback) {
		constants = new Constants();
		constants.setPropValues(Constants.Environments.prod);
        network = livefyre.getNetwork(constants.NETWORK_NAME, constants.NETWORK_KEY);
        // network.ssl = false;
        site = network.getSite(constants.SITE_ID, constants.SITE_KEY);
        callback();
    },

	'should test network topic api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.length, 1);
			PersonalizedStream.getTopic(network, '1', two); 
		};
		var two = function(result) {
			test.equal(result.label, 'ONE');
			PersonalizedStream.deleteTopic(network, result, three); 
		};
		var three = function(result) {
			test.equal(result, 1);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopic(network, '1', 'ONE', one);
	},

	'should test network topics api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.getTopics(network, two);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.deleteTopics(network, result, three);
		};
		var three = function(result) {
			test.equal(result, 2);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopics(network, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }], one);
	},

	'should test network subscription api calls': function(test) {
		test.expect(5);
		var userToken = network.buildUserAuthToken(constants.USER_ID, constants.USER_ID + '@' + constants.NETWORK_NAME, network.DEFAULT_EXPIRES);

		var topics = PersonalizedStream.createOrUpdateTopics(network, [{ key: 2, value: 'TWO'}, { key: 3, value: 'THREE' }], function(result) {});
		var one = function(result) {
			test.equal(result, 2);
			PersonalizedStream.getSubscriptions(network, constants.USER_ID, two);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.replaceSubscriptions(network, userToken, [topics[0]], three);
		};
		var three = function(result) {
			test.equal(result.removed, 1);
			PersonalizedStream.getSubscribers(network, topics[0], four);
		};
		var four = function(result) {
			test.equal(result.length, 1);
			PersonalizedStream.removeSubscriptions(network, userToken, [topics[0]], five);
		};
		var five = function(result) {
			test.equal(result, 1);
			PersonalizedStream.deleteTopics(network, topics, six);
		};
		var six = function(result) {
			test.done();
		};

		PersonalizedStream.addSubscriptions(network, userToken, topics, one);
	},

	'tests cursors': function(test) {
		test.expect(1);

		var one = function(result) {
			test.equals(result.code, 200);
			test.done();
		};

		var cursor = CursorFactory.getPersonalStreamCursor(network, constants.USER_ID, one);

		cursor.next();
		// cursor.previous();
	},

	'should test site topic api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.length, 1);
			PersonalizedStream.getTopic(site, '1', two);
		};
		var two = function(result) {
			test.equal(result.label, 'ONE');
			PersonalizedStream.deleteTopic(site, result, three);
		};
		var three = function(result) {
			test.equal(result, 1);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopic(site, '1', 'ONE', one);
	},

	'should test site topics api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.getTopics(site, two);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.deleteTopics(site, result, three);
		};
		var three = function(result) {
			test.equal(result, 2);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopics(site, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }], one);
	},

	'should test site collection topic api calls': function(test) {
		test.expect(4);

		var topics = PersonalizedStream.createOrUpdateTopics(site, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }], function(result) {});
		var one = function(result) {
			test.equal(result, 2);
			PersonalizedStream.getCollectionTopics(site, constants.COLLECTION_ID, two);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PersonalizedStream.replaceCollectionTopics(site, constants.COLLECTION_ID, [topics[0]], three);
		};
		var three = function(result) {
			test.equal(result.removed, 1);
			PersonalizedStream.removeCollectionTopics(site, constants.COLLECTION_ID, [topics[0]], four);
		};
		var four = function(result) {
			test.equal(result, 1);
			PersonalizedStream.deleteTopics(site, topics, five);
		};
		var five = function(result) {
			test.done();
		};

		PersonalizedStream.addCollectionTopics(site, constants.COLLECTION_ID, topics, one);
	}
}