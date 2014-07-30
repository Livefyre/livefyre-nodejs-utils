var livefyre = require('../../lib/livefyre.js'),
	jwt = require('jwt-simple');

var Topic = require('../../lib/entity/topic.js');

var Constants = require('../constants.js');

exports.unit = {
	setUp: function (callback) {
        network = livefyre.getNetwork(Constants.NETWORK_NAME, Constants.NETWORK_KEY);
        site = network.getSite(Constants.SITE_ID, Constants.SITE_KEY);
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

	'should return a collection meta token': function(test) {
		test.ok(site.buildCollectionMetaToken('title', 'articleId', 'http://livefyre.com', { tags: 'tags' }));
		test.done();
	},

	'should check if buildCollectionMetaToken has a valid url and title is less than 256 char': function(test) {
		test.equals(site.buildCollectionMetaToken('title', 'articleId', 'test.com'), null);
		test.equals(site.buildCollectionMetaToken('1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456', 'articleId', 'http://test.com'), null);
		test.done();
	},

	'should check various strings for type and ensure that they are set in the correct field': function(test) {
		var token = site.buildCollectionMetaToken('title', 'articleId', 'http://livefyre.com', { tags: 'tag', type: 'reviews' });
		var decoded = jwt.decode(token, Constants.SITE_KEY);
		test.equals(jwt.decode(token, Constants.SITE_KEY)['type'], 'reviews');

		token = site.buildCollectionMetaToken('title', 'articleId', 'http://livefyre.com', { tags: 'tag', type: 'liveblog' });
		decoded = jwt.decode(token, Constants.SITE_KEY);

		test.equals(jwt.decode(token, Constants.SITE_KEY)['type'], 'liveblog');

		test.done();
	},

	'should return a valid checksum': function(test) {
		test.equals(site.buildChecksum('title', 'https://www.url.com', 'tags'), '4464458a10c305693b5bf4d43a384be7');
		test.done();
	},

	'should check if buildChecksum has a valid url and title is less than 256 char': function(test) {
		test.equals(site.buildChecksum('title', 'test.com', 'tag'), null);
		test.equals(site.buildChecksum('1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456', 'http://test.com', 'tag'), null);
		test.done();
	},

	'should check different variations of valid and invalid urls': function(test) {
		test.equals(site.buildChecksum('', 'test.com', ''), null);
		test.ok(site.buildChecksum('', 'http://test.com:8000', ''), null);
		test.ok(site.buildChecksum('', 'https://test.com/', ''), null);
		test.ok(site.buildChecksum('', 'ftp://test.com/', ''), null);
		test.ok(site.buildChecksum('', "https://test.com/path/test.-_~!$&'()*+,=:@/dash", ''), null);
		test.ok(site.buildChecksum('', 'http://清华大学.cn', ''));
        test.ok(site.buildChecksum('', 'http://www.mysite.com/myresumé.html', ''));

		test.done();
	}/*,

	'should test basic site api calls': function(test) {
		test.expect(1);

		var one = function(collectionId) {
			test.equal(collectionId, Constants.COLLECTION_ID);
			test.done();
		};

		site.getCollectionId(one, Constants.ARTICLE_ID);
	},

	'should test site topic api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.created, 1);
			site.getTopic(two, '1');
		};
		var two = function(result) {
			test.equal(result.label, 'ONE');
			site.deleteTopic(three, result);
		};
		var three = function(result) {
			test.equal(result, 1);
			test.done();
		};

		site.createOrUpdateTopic(one, '1', 'ONE');
	},

	'should test site topics api calls': function(test) {
		test.expect(3);

		var one = function(result) {
			test.equal(result.created, 2);
			site.getTopics(two);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			site.deleteTopics(three, result);
		};
		var three = function(result) {
			test.equal(result, 2);
			test.done();
		};

		site.createOrUpdateTopics(one, { 2: 'TWO', 3: 'THREE' });
	},

	'should test site collection topic api calls': function(test) {
		test.expect(4);

		var topics = site.createOrUpdateTopics(function(result) {}, { 2: 'TWO', 3: 'THREE' });
		var one = function(result) {
			test.equal(result, 2);
			site.getCollectionTopics(two, Constants.COLLECTION_ID);
		};
		var two = function(result) {
			test.equal(result.length, 2);
			site.updateCollectionTopics(three, Constants.COLLECTION_ID, [topics[0]]);
		};
		var three = function(result) {
			test.equal(result.removed, 1);
			site.removeCollectionTopics(four, Constants.COLLECTION_ID, [topics[0]]);
		};
		var four = function(result) {
			test.equal(result, 1);
			site.deleteTopics(five, topics);
		};
		var five = function(result) {
			test.done();
		};

		site.addCollectionTopics(one, Constants.COLLECTION_ID, topics);
	}*/
}