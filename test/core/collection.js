var c = require('../constants');
var livefyre = require('../../lib/livefyre');
var	jwt = require('jwt-simple');
var	util = require('util');

var Collection = require('../../lib/core/collection');
var CollectionType = require('../../lib/type/collection_type');
var Topic = require('../../lib/dto/topic');

exports.unit = {
    setUp: function (callback) {
        network = livefyre.getNetwork(c.NETWORK_NAME, c.NETWORK_KEY);
        site = network.getSite(c.SITE_ID, c.SITE_KEY);
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

    'should throw an error if any field is null or undefined in initialization': function(test) {
        try {
            Collection.init(site, null, null, null, null);
            test.fail();
        } catch (err) { }
        try {
            Collection.init(site, undefined, undefined, undefined, undefined);
            test.fail();
        } catch (err) { }
        try {
            Collection.init(site, '', '', '', '');
            test.fail();
        } catch (err) { }
        try {
            Collection.init(site, CollectionType.LIVECOMMENTS, '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456', c.ARTICLE_ID, c.URL);
            test.fail();
        } catch (err) { }
        try {
            Collection.init(site, CollectionType.RATINGS, 'title', 'articleId', 'test.com');
        } catch (err) { }
        test.done();
    },

    'should return a collection meta token': function(test) {
        var collection = site.buildLiveCommentsCollection(c.TITLE, c.ARTICLE_ID, c.URL);
        test.ok(collection.buildCollectionMetaToken());
        test.done();
    },

//    'should check various strings for type and ensure that they are set in the correct field': function(test) {
//        var token = site.buildCollectionMetaToken('title', 'articleId', 'http://livefyre.com', { tags: 'tag', type: 'reviews' });
//        var decoded = jwt.decode(token, c.SITE_KEY);
//        test.equals(jwt.decode(token, c.SITE_KEY)['type'], 'reviews');
//
//        token = site.buildCollectionMetaToken('title', 'articleId', 'http://livefyre.com', { tags: 'tag', type: 'liveblog' });
//        decoded = jwt.decode(token, c.SITE_KEY);
//
//        test.equals(jwt.decode(token, c.SITE_KEY)['type'], 'liveblog');
//
//        test.done();
//    },
//
    'should return a valid checksum': function(test) {
        var collection = site.buildLiveCommentsCollection('title', 'articleId', 'http://livefyre.com');
        collection.data.tags = 'tags';
        test.equals('8bcfca7fb2187b1dcb627506deceee32', collection.buildChecksum());
        test.done();
    }
//
//    'should check if buildChecksum has a valid url and title is less than 256 char': function(test) {
//        test.ok(util.isError(site.buildChecksum('title', 'test.com', 'tag')));
//        test.ok(util.isError(site.buildChecksum('1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456', 'http://test.com', 'tag')));
//        test.done();
//    },
//
//    'should check different variations of valid and invalid urls': function(test) {
//        test.ok(util.isError(site.buildChecksum('', 'test.com', '')));
//        test.ok(site.buildChecksum('', 'http://test.com:8000', ''));
//        test.ok(site.buildChecksum('', 'https://test.com/', ''));
//        test.ok(site.buildChecksum('', 'ftp://test.com/', ''));
//        test.ok(site.buildChecksum('', "https://test.com/path/test.-_~!$&'()*+,=:@/dash", ''));
//        test.ok(site.buildChecksum('', 'http://清华大学.cn', ''));
//        test.ok(site.buildChecksum('', 'http://www.mysite.com/myresumé.html', ''));
//
//        test.done();
//    },
//
//    'should test basic site api calls': function(test) {
//        test.expect(1);
//
//        var name = 'NodeJSCreateCollection'+new Date();
//
//        var one = function(collectionId) {
//            var two = function(otherId) {
//                test.equal(collectionId, otherId);
//                test.done();
//            };
//
//            site.getCollectionId(name, two);
//        };
//
//        site.buildCollection(name, name, 'http://answers.livefyre.com/NODEJS', one);
//    }
};