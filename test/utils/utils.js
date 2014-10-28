var c = require('./../constants');

var livefyre = require(c.PATH + 'livefyre');
var LivefyreUtil = require(c.PATH + 'utils/livefyre_util');

exports.unit = {
    setUp: function (callback) {
        network = livefyre.getNetwork(c.NETWORK_NAME, c.NETWORK_KEY);
        site = network.getSite(c.SITE_ID, c.SITE_KEY);
        collection = site.buildLiveCommentsCollection(c.TITLE, c.ARTICLE_ID, c.URL);
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

    'should test network is returned every time': function(test) {
        test.equals(network, LivefyreUtil.getNetworkFromCore(network));
        test.equals(network, LivefyreUtil.getNetworkFromCore(site));
        test.equals(network, LivefyreUtil.getNetworkFromCore(collection));
        test.done();
    }
};