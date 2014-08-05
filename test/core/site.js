var livefyre = require('../../lib/livefyre.js'),
	jwt = require('jwt-simple');

var Topic = require('../../lib/entity/topic.js'),
	Constants = require('../constants.js');

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

		var name = 'NodeJSCreateCollection'+new Date();

		var one = function(collectionId) {
			var two = function(otherId) {
				test.equal(collectionId, otherId);
				test.done();
			}

			site.getCollectionId(two, name);
		};

		site.createCollection(one, name, name, 'http://answers.livefyre.com/NODEJS');
	}*/
}