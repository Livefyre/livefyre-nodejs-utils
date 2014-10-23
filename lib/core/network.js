var validator = require('validator');
var jwt = require('jwt-simple');
var rest = require('restler');
var util = require('util');

var Site = require('./site');
var Domain = require('../api/domain');
var NetworkData = require('../model/network_data');
var NetworkValidator = require('../validator/network_validator');


var DEFAULT_USER = 'system';
var DEFAULT_EXPIRES = 86400;


function Network(data) {
    this.data = data;
    this.ssl = true;
}
module.exports = Network;


Network.init = function init(name, key) {
    var data = new NetworkData(name, key);
    return new Network(NetworkValidator.validate(data));
};


Network.prototype.setUserSyncUrl = function setUserSyncUrl(urlTemplate, callback) {
    if (!validator.contains(urlTemplate, '{id}')) {
        return callback(new Error('urlTemplate must contain {id}'));
    }

    var uri = Domain.quill(this);
    var data = {
        actor_token: this.buildLivefyreToken(),
        pull_profile_url: urlTemplate
    };

    rest.post(uri, { data: data }).on('complete', function(result, response) {
        if (response.statusCode != 204) {
            return callback(new Error('Could not set sync url: ' + response.statusCode));
        }

        callback();
    });
};


Network.prototype.syncUser = function syncUser(userId, callback) {
    var uri = util.format('%s/api/v3_0/user/%s/refresh', Domain.quill(this), userId);
    var opts = {
        data: { lftoken: this.buildLivefyreToken() }
    };

    rest.post(uri, opts).on('complete', function(result, response) {
        if (response.statusCode != 200) {
            return callback(new Error('Could not sync user: ' + response.statusCode));
        }

        callback();
    });
};


Network.prototype.buildLivefyreToken = function buildLfToken() {
    return this.buildUserAuthToken(DEFAULT_USER, DEFAULT_USER, DEFAULT_EXPIRES);
};


Network.prototype.buildUserAuthToken = function buildUAT(userId, displayName, expires) {
    if (!validator.isAlphanumeric(userId)) {
        return new Error('userId must be alphanumeric');
    }

    var payload = {
        domain: this.data.name,
        user_id: userId,
        display_name: displayName,
        expires: (new Date).getTime()/1000 +expires
    };

    return jwt.encode(payload, this.data.key);
};


Network.prototype.validateLivefyreToken = function validateLivefyreToken(lfToken) {
    var attr = jwt.decode(lfToken, this.data.key);

    var isValid = attr['domain'] == this.data.name
        && attr['user_id'] == DEFAULT_USER
        && attr['expires'] >= (new Date).getTime() / 1000;
    return isValid;
};


Network.prototype.getSite = function getSite(siteId, siteKey) {
    return Site.init(this, siteId, siteKey);
};


Network.prototype.getUrn = function getUrn() {
    return 'urn:livefyre:' + this.data.name;
};


Network.prototype.getUrnForUser = function getUrnForUser(user) {
    return this.getUrn() + ':user=' + user;
};


Network.prototype.getNetworkName = function getNetworkName() {
    return this.data.name.split('.')[0];
};