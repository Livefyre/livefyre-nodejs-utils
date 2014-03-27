var livefyre = require('../lib/livefyre.js');


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
		var token = network.buildLfToken();
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
		test.ok(site.getCollectionMetaToken('title', 'articleId', 'http://test.com', 'tag'));
		test.done();
	},

	'should check if getCollectionMetaToken has a valid url and title is less than 256 char': function(test) {
		var site = livefyre.getNetwork('networkName', 'networkKey').getSite('siteId', 'siteKey');
		test.equals(site.getCollectionMetaToken('title', 'articleId', 'test.com', 'tag'), null);
		test.equals(site.getCollectionMetaToken('1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456', 'articleId', 'http://test.com', 'tag'), null);
		test.done();
	}
}