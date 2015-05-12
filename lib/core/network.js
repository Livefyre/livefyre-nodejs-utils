var jwt = require('jsonwebtoken');
var rest = require('restler');
var util = require('util');

var Domain = require('../api/domain');
var NetworkData = require('../model/network_data');
var NetworkValidator = require('../validator/network_validator');
var Site = require('./site');


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
    if (urlTemplate.match('{id}') === null) {
        return callback(new Error('urlTemplate must contain {id}'));
    }

    var uri = Domain.quill(this);
    var data = {
        actor_token: this.buildLivefyreToken(),
        pull_profile_url: urlTemplate
    };

    rest.post(uri, { data: data }).on('complete', function(result, response) {
        if (response.statusCode != 204) {
            return callback(new Error('Livefyre error: Could not set sync url: ' + response.statusCode));
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
            return callback(new Error('Livefyre error: Could not sync user: ' + response.statusCode));
        }

        callback();
    });
};


Network.prototype.buildLivefyreToken = function buildLfToken() {
    return this.buildUserAuthToken(DEFAULT_USER, DEFAULT_USER, DEFAULT_EXPIRES);
};


Network.prototype.buildUserAuthToken = function buildUAT(userId, displayName, expires) {
    var ALPHA_DASH_UNDER_DOT_REGEX = '^[a-zZA-Z0-9_\\.-]+$';
    if (userId.match(ALPHA_DASH_UNDER_DOT_REGEX) === null) {
        throw new Error(util.format('userId is not alphanumeric. Ensure the following regex pattern is respected %s', ALPHA_DASH_UNDER_DOT_REGEX));
    }
    if (typeof expires != 'number') {
        throw new Error('expires must be a number');
    }

    var payload = {
        domain: this.data.name,
        user_id: userId,
        display_name: displayName,
        expires: (new Date).getTime()/1000 +parseInt(expires)
    };

    return jwt.sign(payload, this.data.key);
};


Network.prototype.validateLivefyreToken = function validateLivefyreToken(lfToken) {
    var attr = jwt.verify(lfToken, this.data.key);

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