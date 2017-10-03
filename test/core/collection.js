var c = require('./../constants');
var jwt = require('jsonwebtoken');

var livefyre = require(c.PATH+'livefyre');
var Collection = require(c.PATH+'core/collection');
var CollectionType = require(c.PATH+'type/collection_type');
var Topic = require(c.PATH+'dto/topic');

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
        try {
            Collection.init(site, 'bad type', c.TITLE, c.ARTICLE_ID, c.URL);
        } catch (err) { }
        test.done();
    },

    'should return correct collection meta tokens': function(test) {
        var collection = site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, c.URL);
        test.ok(collection.buildCollectionMetaToken());

        var topics  = [ Topic.create(network, 'ID', 'LABEL') ];
        collection.data.topics = topics;

        var token = collection.buildCollectionMetaToken();
        test.ok(jwt.verify(token, network.data.key));
        test.done();
    },

    'should return same collection meta token for same collection': function(test) {
        var collection = site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, c.URL);
        test.ok(collection.buildCollectionMetaToken());

        var topics  = [ Topic.create(network, 'ID', 'LABEL') ];
        collection.data.topics = topics;

        var token = collection.buildCollectionMetaToken();
        test.ok(jwt.verify(token, network.data.key));

        var otherToken = collection.buildCollectionMetaToken();
        test.ok(token === otherToken);
        test.done();
    },

    'should return a valid checksum': function(test) {
        var collection = site.buildCommentsCollection('title', 'articleId', 'https://www.livefyre.com');
        collection.data.tags = 'tags';
        test.equals('8bcfca7fb2187b1dcb627506deceee32', collection.buildChecksum());
        collection.data.extensions = '{"blah":"cool"}';
        test.ok(collection.buildChecksum());
        test.done();
    },

    'should check different variations of valid and invalid urls': function(test) {
        try {
            site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, 'test.com');
            test.fail();
        } catch (err) { }
        test.ok(site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, 'http://test.com:8000'));
        test.ok(site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, 'https://test.com'));
        test.ok(site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, 'ftp://test.com/'));
        test.ok(site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, "https://test.com/path/test.-_~!$&'()*+,=:@/dash"));
        test.ok(site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, 'http://清华大学.cn'));
        test.ok(site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, 'http://www.mysite.com/myresumé.html'));

        test.done();
    },

    'should test that network issued is providing the proper urn': function(test) {
        var collection = site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, c.URL);
        test.ok(!collection.isNetworkIssued());

        var topics  = [ Topic.create(site, 'ID', 'LABEL') ];
        collection.data.topics = topics;
        test.ok(!collection.isNetworkIssued());

        topics.push(Topic.create(network, 'ID', 'LABEL'));
        test.ok(collection.isNetworkIssued());
        test.done()
    },

    'should test that collection is created and updated and an id is set': function(test) {
        test.expect(3);

        var name = 'NodeCreateCollection ' + new Date();
        var collection = site.buildCommentsCollection(name, name, c.URL);

        var update = function(err, collection) {
            test.ok(collection.data.id);
            collection.data.title = 'NodeUpdateCollection' + new Date();
            collection.createOrUpdate(getContent);
        };
        var getContent = function(err, collection) {
            test.ok(collection);
            collection.getCollectionContent(finish);
        };
        var finish = function(err, content) {
            test.ok(content);
            test.done();
        };

        collection.createOrUpdate(update);
    }
};