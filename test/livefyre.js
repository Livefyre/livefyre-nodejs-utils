var livefyre = require('../lib/livefyre.js'),
	jwt = require('jwt-simple');


exports.unit = {
	// 'should test all API calls': function (test) {
	// 	var network = livefyre.getNetwork('networkName', 'networkKey');
	// 	network.setUserSyncUrl('url/{id}');
	// 	network.syncUser('user');

	// 	var site = livefyre.getNetwork('networkName', 'networkKey').getSite('siteId', 'siteKey');
	// 	var content = site.getCollectionContent('articleId');
	// 	test.done();
	// },

	'should not allow urls without {id} in setUserSyncUrl': function(test) {
		var network = livefyre.getNetwork('networkName', 'networkKey');
		test.equal(network.setUserSyncUrl('url'), null);
		test.done();
	},

	'should return a token and validate a lf token': function(test) {
		var network = livefyre.getNetwork('networkName', 'networkKey');
		var token = network.buildLivefyreToken();
		test.ok(token);
		test.ok(network.validateLivefyreToken(token));
		test.done();
	},

	'should return null for non-alphanumeric user ids': function(test) {
		var network = livefyre.getNetwork('networkName', 'networkKey');
		test.equal(network.buildUserAuthToken('test.-f12', 'test', 100.0), null);
		test.done();
	},

	'should return a collection meta token': function(test) {
		var site = livefyre.getNetwork('networkName', 'networkKey').getSite('siteId', 'siteKey');
		test.ok(site.buildCollectionMetaToken('title', 'articleId', 'http://livefyre.com', 'tags'));
		test.done();
	},

	'should check if buildCollectionMetaToken has a valid url and title is less than 256 char': function(test) {
		var site = livefyre.getNetwork('networkName', 'networkKey').getSite('siteId', 'siteKey');
		test.equals(site.buildCollectionMetaToken('title', 'articleId', 'test.com', 'tag'), null);
		test.equals(site.buildCollectionMetaToken('1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456', 'articleId', 'http://test.com', 'tag'), null);
		test.done();
	},

	'should check various strings for type and ensure that they are set in the correct field': function(test) {
		var site = livefyre.getNetwork('networkName', 'networkKey').getSite('siteId', 'siteKey');
		
		var token = site.buildCollectionMetaToken('title', 'articleId', 'http://livefyre.com', 'tag', 'reviews');
		var decoded = jwt.decode(token, 'siteKey');
		test.equals(jwt.decode(token, 'siteKey')['type'], 'reviews');

		token = site.buildCollectionMetaToken('title', 'articleId', 'http://livefyre.com', 'tag', 'liveblog');
		decoded = jwt.decode(token, 'siteKey');

		test.equals(jwt.decode(token, 'siteKey')['type'], 'liveblog');

		test.done();
	},

	'should return a valid checksum': function(test) {
		var site = livefyre.getNetwork('networkName', 'networkKey').getSite('siteId', 'siteKey');
		test.equals(site.buildChecksum('title', 'https://www.url.com', 'tags'), '6e2e4faf7b95f896260fe695eafb34ba');
		test.done();
	},

	'should check if buildChecksum has a valid url and title is less than 256 char': function(test) {
		var site = livefyre.getNetwork('networkName', 'networkKey').getSite('siteId', 'siteKey');
		test.equals(site.buildChecksum('title', 'test.com', 'tag'), null);
		test.equals(site.buildChecksum('1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456', 'http://test.com', 'tag'), null);
		test.done();
	},

	'should check different variations of valid and invalid urls': function(test) {
		var site = livefyre.getNetwork('networkName', 'networkKey').getSite('siteId', 'siteKey');

		test.equals(site.buildChecksum('', 'test.com', ''), null);
		test.ok(site.buildChecksum('', 'http://test.com:8000', ''), null);
		test.ok(site.buildChecksum('', 'https://test.com/', ''), null);
		test.ok(site.buildChecksum('', 'ftp://test.com/', ''), null);
		test.ok(site.buildChecksum('', "https://test.com/path/test.-_~!$&'()*+,=:@/dash", ''), null);
		test.ok(site.buildChecksum('', 'http://清华大学.cn', ''));
        test.ok(site.buildChecksum('', 'http://www.mysite.com/myresumé.html', ''));

		test.done();
	}
}