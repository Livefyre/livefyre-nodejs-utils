var validator = require('validator'),
		jwt = require('jwt-simple'),
		rest = require('restler'),
		util = require('util'),
		crypto = require('crypto');

var livefyre = module.exports;

livefyre.getNetwork = function getNetwork(networkName, networkKey) {
	return new Network(networkName, networkKey);
}

function Network(networkName, networkKey) {
	this.networkName = networkName,
	this.networkKey = networkKey,
	this.DEFAULT_USER = 'system',
	this.DEFAULT_EXPIRES = 86400;
}

function Site(networkName, siteId, siteKey) {
	this.networkName = networkName;
	this.siteId = siteId;
	this.siteKey = siteKey;

	this.TYPE = ['reviews', 'sidenotes', ''];
	this.STREAM_TYPE = ['liveblog', 'livechat', 'livecomments'];
}

Network.prototype = {
	setUserSyncUrl: function(urlTemplate, callback) {
		if (!validator.contains(urlTemplate, '{id}')) {
			return null;
		}

		callback = callback || function(data, response) {
			if (response.statusCode == 204) {
				console.log('livefyre.network.setUserSyncUrl succeeded.');
			} else {
				console.log('livefyre.network.setUserSyncUrl failed.');
			}
		}

		rest.post(util.format('http://%s', this.networkName), {
			data: { actor_token: this.buildLivefyreToken(), pull_profile_url: urlTemplate },
		}).on('complete', callback);
		return this;
	},
	syncUser: function(userId, callback) {
		callback = callback || function(data, response) {
			if (response.statusCode == 200) {
				console.log('livefyre.network.syncUser succeeded.');
			} else {
				console.log('livefyre.network.syncUser failed.');
			}
		}

		rest.post(util.format('http://%s/api/v3_0/user/%s/refresh', this.networkName, userId), {
			data: { lftoken: this.buildLivefyreToken() },
		}).on('complete', callback);
		return this;
	},

	buildLivefyreToken: function() {
		return this.buildUserAuthToken(this.DEFAULT_USER, this.DEFAULT_USER, this.DEFAULT_EXPIRES);
	},

	buildUserAuthToken: function(userId, displayName, expires) {
		if (!validator.isAlphanumeric(userId)) {
			return null;
		}
		var payload = {
			domain: this.networkName,
			user_id: userId,
			display_name: displayName,
			expires: (new Date).getTime()/1000 +expires
		};
		return jwt.encode(payload, this.networkKey);
	},

	validateLivefyreToken: function(lfToken) {
		var attr = jwt.decode(lfToken, this.networkKey);

		return attr['domain'] == this.networkName
			&& attr['user_id'] == this.DEFAULT_USER
			&& attr['expires'] >= (new Date).getTime()/1000;
	},

	getSite: function(siteId, siteKey) {
		return new Site(this.networkName, siteId, siteKey);
	}
}

Site.prototype = {
	buildCollectionMetaToken: function(title, articleId, url, tags, type) {
		tags = tags || '';
		type = type || null;
		if (!validator.isURL(url, { require_protocol: true }) || title.length > 255) {
			return null;
		}

		var payload = {
			url: url,
			tags: tags,
			title: title,
			articleId: articleId
		};
		if (type) {
			if (this.TYPE.indexOf(type) > -1) {
				payload['type'] = type;
			} else if (this.STREAM_TYPE.indexOf(type) > -1) {
				payload['stream_type'] = type;
			} else {
				return null;
			}
		}

		return jwt.encode(payload, this.siteKey);
	},

	buildChecksum: function(title, url, tags) {
		tags = tags || '';
		if (!validator.isURL(url, { require_protocol: true }) || title.length > 255) {
			return null;
		}

		var payload = {
			url: url,
			tags: tags,
			title: title
		};
		return crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');;
	},

	getCollectionContent: function(articleId, callback) {
		var uri = util.format('http://bootstrap.%s/bs3/%s/%s/%s/init',
			this.networkName, this.networkName, this.siteId, new Buffer(articleId.toString()).toString('base64'));
		rest.get(uri).on('complete', callback);
		return this;
	},

	getCollectionId: function(articleId, callback) {
		var callback = callback || function(data, response) {
			if (response.statusCode == 200) {
				console.log(data['collectionSettings']['collectionId']);
			} else {
				console.log('site.getCollectionId call failed.');
			}
		}
		this.getCollectionContent(articleId, callback);
		return this;
	}
}