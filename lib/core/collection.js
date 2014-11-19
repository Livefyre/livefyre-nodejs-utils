var jwt = require('jwt-simple');
var rest = require('restler');
var util = require('util');
var crypto = require('crypto');

var Domain = require('../api/domain');
var CollectionData = require('../model/collection_data');
var CollectionValidator = require('../validator/collection_validator');


function Collection(site, data) {
    this.site = site;
    this.data = data;
}
module.exports = Collection;


Collection.init = function init(site, type, title, articleId, url) {
    var data = new CollectionData(type, title, articleId, url);
    return new Collection(site, CollectionValidator.validate(data));
};


Collection.prototype.createOrUpdate = function createOrUpdate(callback) {
    invokeCollectionApi(this, 'create', callback);
};


Collection.prototype.buildCollectionMetaToken = function buildCMT() {
    var key;

    if (this.isNetworkIssued()) {
        this.data['iss'] = this.site.network.getUrn();
        key = this.site.network.data.key;
    } else {
        this.data['iss'] = this.site.getUrn();
        key = this.site.data.key;
    }
    var token = jwt.encode(this.data, key);
    delete this.data['iss'];

    return token;
};


Collection.prototype.buildChecksum = function buildChecksum() {
    var json = this.data.toJsonString();
    return crypto.createHash('md5').update(json).digest('hex');
};


Collection.prototype.getCollectionContent = function getContent(callback) {
    var uri = util.format(
        '%s/bs3/%s/%s/%s/init',
        Domain.bootstrap(this),
        this.site.network.data.name,
        this.site.data.id,
        new Buffer(this.data.articleId.toString()).toString('base64'));

    rest.get(uri).on('complete', function(result, response) {
        if (response.statusCode >= 400) {
            return callback(new Error('Livefyre error: problem retrieving collection content: ' +response.statusCode));
        }

        callback(null, result);
    });
};


Collection.prototype.isNetworkIssued = function isNetworkIssued() {
    var topics = this.data.topics;

    if (typeof(topics) === 'undefined' || topics.length == 0) {
        return false;
    }

    var urn = this.site.network.getUrn();
    var result = false;
    topics.forEach(function(topic) {
        var id = topic.id;
        if (id.indexOf(urn) == 0 && !(id.replace(urn, '').indexOf(':site=') === 0)) {
            result = true;
        }
    });

    return result;
};


Collection.prototype.getUrn = function getUrn() {
    return this.site.getUrn() + ':collection=' + this.data.id;
};


function invokeCollectionApi(coll, method, callback) {
    var uri = util.format('%s/api/v3.0/site/%s/collection/%s/?sync=1', Domain.quill(coll), coll.site.data.id, method);
    var data = {
        articleId: coll.data.articleId,
        collectionMeta: coll.buildCollectionMetaToken(),
        checksum: coll.buildChecksum()
    };

    rest.postJson(uri, data).on('complete', function(result, response) {
        if (response.statusCode == 200) {
            coll.data.id = result.data.collectionId;
            return callback(null, coll);
        }
        if (response.statusCode == 409 && method == 'create') {
            return invokeCollectionApi(coll, 'update', callback);
        }

        callback(new Error('Livefyre error: problem creating/updating collection: ' + response.statusCode));
    });
}