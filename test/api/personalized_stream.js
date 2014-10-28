var	c = require('../constants');
var jwt = require('jwt-simple');

var livefyre = require(c.PATH+'livefyre');
var PersonalizedStream = require(c.PATH+'api/personalized_stream');
var	CursorFactory = require(c.PATH+'factory/cursor_factory');
var	Topic = require(c.PATH+'dto/topic');


exports.unit = {
	setUp: function (callback) {
        network = livefyre.getNetwork(c.NETWORK_NAME, c.NETWORK_KEY);
        site = network.getSite(c.SITE_ID, c.SITE_KEY);
        callback();
    },

	'should test network topic api calls': function(test) {
		test.expect(3);

		var one = function(err, result) {
			test.equal(result.length, 1);
			PersonalizedStream.getTopic(network, '1', two);
		};
		var two = function(err, result) {
			test.equal(result.label, 'ONE');
			PersonalizedStream.deleteTopic(network, result, three);
		};
		var three = function(err, result) {
			test.equal(result, 1);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopic(network, '1', 'ONE', one);
	},

	'should test network topics api calls': function(test) {
		test.expect(3);

		var one = function(err, result) {
			test.equal(result.length, 2);
			PersonalizedStream.getTopics(network, two);
		};
		var two = function(err, result) {
			test.equal(result.length, 2);
			PersonalizedStream.deleteTopics(network, result, three);
		};
		var three = function(err, result) {
			test.equal(result, 2);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopics(network, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }], one);
	},

	'should test network subscription api calls': function(test) {
		test.expect(5);
        var topics;
		var userToken = network.buildUserAuthToken(c.USER_ID, c.USER_ID + '@' + c.NETWORK_NAME, 86400);
        var topicMap = [
            { key: 2, value: 'TWO'},
            { key: 3, value: 'THREE' }
        ];

        var zero = function (err, result) {
            topics = result;
            PersonalizedStream.addSubscriptions(network, userToken, topics, one);
        };
		var one = function(err, result) {
			test.equal(result, 2);
			PersonalizedStream.getSubscriptions(network, c.USER_ID, two);
		};
		var two = function(err, result) {
			test.equal(result.length, 2);
			PersonalizedStream.replaceSubscriptions(network, userToken, [topics[0]], three);
		};
		var three = function(err, result) {
			test.equal(result.removed, 1);
			PersonalizedStream.getSubscribers(network, topics[0], four);
		};
		var four = function(err, result) {
			test.equal(result.length, 1);
			PersonalizedStream.removeSubscriptions(network, userToken, [topics[0]], five);
		};
		var five = function(err, result) {
			test.equal(result, 1);
			PersonalizedStream.deleteTopics(network, topics, six);
		};
		var six = function(err, result) {
			test.done();
		};

        PersonalizedStream.createOrUpdateTopics(network, topicMap, zero);
	},

	'tests cursors': function(test) {
		test.expect(2);

		var one = function(err, result) {
			test.equals(result.code, 200);
            cursor.callback = two;
            cursor.previous();
		};
        var two = function(err, result) {
            test.equals(result.code, 200);
            test.done();
        };

		var cursor = CursorFactory.getPersonalStreamCursor(network, c.USER_ID, one);

		cursor.next();
	},

	'should test site topic api calls': function(test) {
		test.expect(3);

		var one = function(err, result) {
			test.equal(result.length, 1);
			PersonalizedStream.getTopic(site, '1', two);
		};
		var two = function(err, result) {
			test.equal(result.label, 'ONE');
			PersonalizedStream.deleteTopic(site, result, three);
		};
		var three = function(err, result) {
			test.equal(result, 1);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopic(site, '1', 'ONE', one);
	},

	'should test site topics api calls': function(test) {
		test.expect(3);

		var one = function(err, result) {
			test.equal(result.length, 2);
			PersonalizedStream.getTopics(site, two);
		};
		var two = function(err, result) {
			test.equal(result.length, 2);
			PersonalizedStream.deleteTopics(site, result, three);
		};
		var three = function(err, result) {
			test.equal(result, 2);
			test.done();
		};

		PersonalizedStream.createOrUpdateTopics(site, [{ key: 2, value: 'TWO' }, { key: 3, value: 'THREE' }], one);
	},

	'should test site collection topic api calls': function(test) {
		test.expect(4);
        var name = 'NODE PSSTREAM TEST ' + new Date();
        var collection;
        var topics;

        var createCollection = function (err, coll) {
            collection = coll;
            PersonalizedStream.createOrUpdateTopics(site, topicMap, zero);
        };
        var zero = function (err, result) {
            topics = result;
            PersonalizedStream.addCollectionTopics(collection, result, one);
        };
        var one = function(err, result) {
            test.equal(result, 2);
            PersonalizedStream.getCollectionTopics(collection, two);
        };
        var two = function(err, result) {
            test.equal(result.length, 2);
            PersonalizedStream.replaceCollectionTopics(collection, [topics[0]], three);
        };
        var three = function(err, result) {
            test.equal(result.removed, 1);
            PersonalizedStream.removeCollectionTopics(collection, [topics[0]], four);
        };
        var four = function(err, result) {
            test.equal(result, 1);
            PersonalizedStream.deleteTopics(site, topics, five);
        };
        var five = function(err, result) {
            test.done();
        };
        var topicMap = [
            { key: 2, value: 'TWO' },
            { key: 3, value: 'THREE' }
        ];

        site.buildLiveCommentsCollection(name, name, c.URL).createOrUpdate(createCollection);
	}

    //TODO: create/update collection with topics
};