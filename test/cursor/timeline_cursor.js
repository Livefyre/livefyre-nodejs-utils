var c = require('./../constants');

var livefyre = require(c.PATH + 'livefyre');
var TimelineCursor = require(c.PATH + 'cursor/timeline_cursor');

exports.unit = {
    setUp: function (callback) {
        network = livefyre.getNetwork(c.NETWORK_NAME, c.NETWORK_KEY);
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

    'should test initialization': function(test) {
        try {
            TimelineCursor.init();
            test.fail();
        } catch (err) { }

        try {
            TimelineCursor.init(network);
            test.fail();
        } catch (err) { }

        try {
            TimelineCursor.init(network, 'resource');
            test.fail();
        } catch (err) { }

        try {
            TimelineCursor.init(network, 'resource', 50);
            test.fail();
        } catch (err) { }

        test.done();
    }
};