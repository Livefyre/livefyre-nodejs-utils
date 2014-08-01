var livefyre = require('../../lib/livefyre.js'),
	jwt = require('jwt-simple');

var PSClient = require('../../lib/api/personalized_streams.js'),
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
			test.equal(result.created, 1);
			PSClient.getTopic(two, network, '1'); 
		};
		var two = function(result) {
			test.equal(result.label, 'ONE');
			PSClient.deleteTopic(three, network, result); 
		};
		var three = function(result) {
			test.equal(result, 1);
			test.done();
		};

		PSClient.createOrUpdateTopic(one, network, '1', 'ONE');
	},

	'should test network topics api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.created, 2);
			PSClient.getTopics(two, network);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PSClient.deleteTopics(three, network, result);
		};
		var three = function(result) {
			test.equal(result, 2);
			test.done();
		};

		PSClient.createOrUpdateTopics(one, network, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }]);
	},

	'should test network subscription api calls': function(test) {
		test.expect(5);

		var topics = PSClient.createOrUpdateTopics(function(result) {}, network, [{ key: 2, value: 'TWO'}, { key: 3, value: 'THREE' }]);
		var one = function(result) {
			test.equal(result, 2);
			PSClient.getSubscriptions(two, network, Constants.USER_ID);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PSClient.replaceSubscriptions(three, network, Constants.USER_ID, [topics[0]]);
		};
		var three = function(result) {
			test.equal(result.removed, 1);
			PSClient.getSubscribers(four, network, topics[0]);
		};
		var four = function(result) {
			console.log(result);
			test.equal(result.length, 1);
			PSClient.removeSubscriptions(five, network, Constants.USER_ID, [topics[0]]);
		};
		var five = function(result) {
			test.equal(result, 1);
			PSClient.deleteTopics(six, network, topics);
		};
		var six = function(result) {
			test.done();
		};

		PSClient.addSubscriptions(one, network, Constants.USER_ID, topics);
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
			test.equal(result.created, 1);
			PSClient.getTopic(two, site, '1');
		};
		var two = function(result) {
			test.equal(result.label, 'ONE');
			PSClient.deleteTopic(three, site, result);
		};
		var three = function(result) {
			test.equal(result, 1);
			test.done();
		};

		PSClient.createOrUpdateTopic(one, site, '1', 'ONE');
	},

	'should test site topics api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.created, 2);
			PSClient.getTopics(two, site);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PSClient.deleteTopics(three, site, result);
		};
		var three = function(result) {
			test.equal(result, 2);
			test.done();
		};

		PSClient.createOrUpdateTopics(one, site, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }]);
	},

	'should test site collection topic api calls': function(test) {
		test.expect(4);

		var topics = PSClient.createOrUpdateTopics(function(result) {}, site, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }]);
		var one = function(result) {
			test.equal(result, 2);
			PSClient.getCollectionTopics(two, site, Constants.COLLECTION_ID);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			PSClient.replaceCollectionTopics(three, site, Constants.COLLECTION_ID, [topics[0]]);
		};
		var three = function(result) {
			test.equal(result.removed, 1);
			PSClient.removeCollectionTopics(four, site, Constants.COLLECTION_ID, [topics[0]]);
		};
		var four = function(result) {
			test.equal(result, 1);
			PSClient.deleteTopics(five, site, topics);
		};
		var five = function(result) {
			test.done();
		};

		PSClient.addCollectionTopics(one, site, Constants.COLLECTION_ID, topics);
	}
}