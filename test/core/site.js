var c = require('../constants');
var livefyre = require('../../lib/livefyre');
var	jwt = require('jwt-simple');
var	util = require('util');

var CollectionType = require('../../lib/type/collection_type');
var Site = require('../../lib/core/site');


exports.unit = {
	setUp: function (callback) {
        site = livefyre.getNetwork(c.NETWORK_NAME, c.NETWORK_KEY).getSite(c.SITE_ID, c.SITE_KEY);
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

    'should throw an error if any field is null or undefined in initialization': function(test) {
        var network = livefyre.getNetwork(c.NETWORK_NAME, c.NETWORK_KEY);
        try {
            Site.init(network, null, null);
            test.fail();
        } catch (err) { }
        try {
            Network.init(network, undefined, undefined);
            test.fail();
        } catch (err) { }
        try {
            Network.init(network, '', '');
            test.fail();
        } catch (err) { }
        try {
            Network.init(network, c.NETWORK_NAME, undefined);
            test.fail();
        } catch (err) { }
        try {
            Network.init(network, undefined, c.NETWORK_KEY);
            test.fail();
        } catch (err) { }
        test.done();
    },

	'should return a site urn': function(test) {
        test.equals(site.network.getUrn()+':site='+site.data.id, site.getUrn());
		test.done();
	},

	'should create collections of all types and verify the types': function(test) {
        var coll = site.buildCollection(CollectionType.LIVECOMMENTS, c.TITLE, c.TITLE, c.URL);
        test.equal(coll.data.type, CollectionType.LIVECOMMENTS);

        coll = site.buildLiveBlogCollection(c.TITLE, c.TITLE, c.URL);
        test.equal(coll.data.type, CollectionType.LIVEBLOG);

        coll = site.buildLiveChatCollection(c.TITLE, c.TITLE, c.URL);
        test.equal(coll.data.type, CollectionType.LIVECHAT);

        coll = site.buildLiveCommentsCollection(c.TITLE, c.TITLE, c.URL);
        test.equal(coll.data.type, CollectionType.LIVECOMMENTS);

        coll = site.buildCountingCollection(c.TITLE, c.TITLE, c.URL);
        test.equal(coll.data.type, CollectionType.COUNTING);

        coll = site.buildRatingsCollection(c.TITLE, c.TITLE, c.URL);
        test.equal(coll.data.type, CollectionType.RATINGS);

        coll = site.buildReviewsCollection(c.TITLE, c.TITLE, c.URL);
        test.equal(coll.data.type, CollectionType.REVIEWS);

        coll = site.buildSidenotesCollection(c.TITLE, c.TITLE, c.URL);
        test.equal(coll.data.type, CollectionType.SIDENOTES);

		test.done();
	}
};