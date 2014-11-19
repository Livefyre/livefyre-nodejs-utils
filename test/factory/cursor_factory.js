var c = require('./../constants');

var livefyre = require(c.PATH + 'livefyre');
var CursorFactory = require(c.PATH + 'factory/cursor_factory');
var Topic = require(c.PATH + 'dto/topic');

exports.unit = {
    setUp: function (callback) {
        network = livefyre.getNetwork(c.NETWORK_NAME, c.NETWORK_KEY);
        site = network.getSite(c.SITE_ID, c.SITE_KEY);
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

    'should test that personal stream cursors are properly created': function(test) {
        try {
            CursorFactory.getPersonalStreamCursor(null, null, null);
            test.fail();
        } catch (err) { }

        var callback = function callback(err, result) {
            test.ok(result);
        };

        var cursor = CursorFactory.getPersonalStreamCursor(network, c.USER_ID, callback);
        test.equals(callback, cursor.callback);
        test.equals(50, cursor.data.limit);
        var cursor = CursorFactory.getPersonalStreamCursor(network, c.USER_ID, 100, callback);
        test.equals(callback, cursor.callback);
        test.equals(100, cursor.data.limit);
        var cursor = CursorFactory.getPersonalStreamCursor(network, c.USER_ID, 150, new Date(), callback);
        test.equals(callback, cursor.callback);
        test.equals(150, cursor.data.limit);
        test.equals('urn:livefyre:' + network.getNetworkName() + '.fyre.co:user=' + c.USER_ID + ':personalStream', cursor.data.resource);

        test.done();
    },

    'should test that topic stream cursors are properly created': function(test) {
        try {
            CursorFactory.getTopicStreamCursor(null, null, null);
            test.fail();
        } catch (err) { }

        var callback = function callback(err, result) {
            test.ok(result);
        };

        var topic = Topic.create(network, 'ID', 'LABEL');

        var cursor = CursorFactory.getTopicStreamCursor(network, topic, callback);
        test.equals(callback, cursor.callback);
        test.equals(50, cursor.data.limit);
        var cursor = CursorFactory.getTopicStreamCursor(network, topic, 100, callback);
        test.equals(callback, cursor.callback);
        test.equals(100, cursor.data.limit);
        var cursor = CursorFactory.getTopicStreamCursor(network, topic, 150, new Date(), callback);
        test.equals(callback, cursor.callback);
        test.equals(150, cursor.data.limit);
        test.equals(topic.id + ':topicStream', cursor.data.resource);

        test.done();
    }
};