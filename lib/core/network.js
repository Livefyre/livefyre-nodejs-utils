var validator = require('validator'),
	jwt = require('jwt-simple'),
	rest = require('restler'),
	util = require('util');

var Site = require('./site.js'),
	Domain = require('../api/domain.js');

function Network(name, key) {
	this.name = name,
	this.key = key,
	this.networkName = name.split('.')[0];
	this.ssl = true;
	this.DEFAULT_USER = 'system',
	this.DEFAULT_EXPIRES = 86400;
}

Network.prototype = {
	setUserSyncUrl: function(urlTemplate, callback) {
		if (!validator.contains(urlTemplate, '{id}')) {
			return callback(new Error('urlTemplate must contain {id}'));
		}

		var uri = util.format('%s', Domain.quill(this));
		var data = { actor_token: this.buildLivefyreToken(), pull_profile_url: urlTemplate };

		rest.post(uri, { data: data }).on('complete', function(result, response) {
			if (response.statusCode != 204) {
		        callback(new Error('Could not set sync url: ' + response.statusCode));
		    }

			callback();
		});
	},
	
	syncUser: function(userId, callback) {
		var uri = util.format('%s/api/v3_0/user/%s/refresh', Domain.quill(this), userId);
		var data = { lftoken: this.buildLivefyreToken() };

		rest.post(uri, { data: data }).on('complete', function(result, response) {
			if (response.statusCode != 200) {
		        callback(new Error('Could not sync user: ' + response.statusCode));
		    }

			callback();
		});
	},

	buildLivefyreToken: function() {
		return this.buildUserAuthToken(this.DEFAULT_USER, this.DEFAULT_USER, this.DEFAULT_EXPIRES);
	},

	buildUserAuthToken: function(userId, displayName, expires) {
		if (!validator.isAlphanumeric(userId)) {
			return new Error('userId must be alphanumeric');
		}

		var payload = {
			domain: this.name,
			user_id: userId,
			display_name: displayName,
			expires: (new Date).getTime()/1000 +expires
		};
		return jwt.encode(payload, this.key);
	},

	validateLivefyreToken: function(lfToken) {
		var attr = jwt.decode(lfToken, this.key);

		return attr['domain'] == this.name
			&& attr['user_id'] == this.DEFAULT_USER
			&& attr['expires'] >= (new Date).getTime()/1000;
	},

	getSite: function(siteId, siteKey) {
		return new Site(this, siteId, siteKey);
	},

	getUrn: function() {
		return 'urn:livefyre:' + this.name;
	},

	getUserUrn: function(user) {
		return this.getUrn() + ':user=' + user;
	},

	setSsl: function(ssl) {
		this.ssl = ssl;
	}
}

module.exports = Network;