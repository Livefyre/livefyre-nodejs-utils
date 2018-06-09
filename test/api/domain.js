var	c = require('../constants');

var livefyre = require(c.PATH + 'livefyre');
var Domain = require(c.PATH + 'api/domain');

exports.unit = {
    setUp: function (callback) {
        network = livefyre.getNetwork(c.NETWORK_NAME, c.NETWORK_KEY);
        site = network.getSite(c.SITE_ID, c.SITE_KEY);
        collection = site.buildCommentsCollection(c.TITLE, c.ARTICLE_ID, c.URL);
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

    'should make sure that quill urls are properly returned when a core object is passed in': function(test) {
        var quillSsl = 'https://' + network.getNetworkName() + '.quill.fyre.co';
        test.equals(quillSsl, Domain.quill(network));
        test.equals(quillSsl, Domain.quill(site));
        test.equals(quillSsl, Domain.quill(collection));

        var quill = 'https://quill.' + network.getNetworkName() + '.fyre.co';
        network.ssl = false;
        test.equals(quill, Domain.quill(network));
        test.equals(quill, Domain.quill(site));
        test.equals(quill, Domain.quill(collection));
        test.done();
    },

    'should make sure that bootstrap urls are properly returned when a core object is passed in': function(test) {
        var bootstrapSsl = 'https://' + network.getNetworkName() + '.bootstrap.fyre.co';
        test.equals(bootstrapSsl, Domain.bootstrap(network));
        test.equals(bootstrapSsl, Domain.bootstrap(site));
        test.equals(bootstrapSsl, Domain.bootstrap(collection));

        var bootstrap = 'https://bootstrap.' + network.getNetworkName() + '.fyre.co';
        network.ssl = false;
        test.equals(bootstrap, Domain.bootstrap(network));
        test.equals(bootstrap, Domain.bootstrap(site));
        test.equals(bootstrap, Domain.bootstrap(collection));
        test.done();
    }
};