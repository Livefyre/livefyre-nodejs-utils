var validator = require('validator'),
	jwt = require('jwt-simple'),
	rest = require('restler'),
	util = require('util'),
	crypto = require('crypto');

var Domain = require('../api/domain.js');

function Site(network, id, key) {
	this.network = network;
	this.networkName = network.networkName;
	this.id = id;
	this.key = key;
	this.TYPE = ['reviews', 'sidenotes', 'ratings', 'counting', 'liveblog', 'livechat', 'livecomments', ''];
}

Site.prototype = {
	buildCollectionMetaToken: function(title, articleId, url, options) {
		options = options || {};
		if (!validator.isURL(url, { require_protocol: true })) {
			return new Error('must be a valid URL');
		} else if (title.length > 255) {
			return new Error('title must be less than 255 characters');
		}

		options['url'] = url;
		options['title'] = title;
		options['articleId'] = articleId;

		if ('type' in options && this.TYPE.indexOf(options['type']) == -1) {
			return new Error('type is not of a valid type: '+this.TYPE);
		}

		return jwt.encode(options, this.key);
	},

	buildChecksum: function(title, url, tags) {
		tags = tags || '';
		if (!validator.isURL(url, { require_protocol: true })) {
			return new Error('must be a valid URL');
		} else if (title.length > 255) {
			return new Error('title must be less than 255 characters');
		}

		var payload = { tags: tags, title: title, url: url };
		return crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');
	},

	createCollection: function(title, articleId, url, options, callback) {
	    if (!callback || typeof callback != "function") {
	        callback = options;
	        options = undefined;
	    }

		options = options || {};

		var token = this.buildCollectionMetaToken(title, articleId, url, options),
			checksum = this.buildChecksum(title, url, 'tags' in options ? options['tags'] : '');

		if (util.isError(token)) {
			return callback(token);
		}

		var uri = util.format('%s/api/v3.0/site/%s/collection/create/?sync=1', Domain.quill(this), this.id),
			data = {
				articleId: articleId,
				collectionMeta: token,
				checksum: checksum
			};

		rest.postJson(uri, data).on('complete', function(result, response) {
			if (response.statusCode != 200) {
				callback(new Error('error creating a collection: ' +response.statusCode));
			}

			callback(result.data.collectionId);
		});
	},

	getCollectionContent: function(articleId, callback) {
		var uri = util.format('%s/bs3/%s/%s/%s/init',
			Domain.bootstrap(this), this.network.name, this.id, new Buffer(articleId.toString()).toString('base64'));
		
		rest.get(uri).on('complete', function(result, response) {
			if (response.statusCode != 200) {
				callback(new Error('error retrieving collection info: ' +response.statusCode));
			}

			callback(result);
		});
	},

	getCollectionId: function(articleId, callback) {
		var handler = function(result, response) {
			if (util.isError(result)) {
				callback(result);
			}
			callback(result.collectionSettings.collectionId);
		};

		this.getCollectionContent(articleId, handler);
	},

	getUrn: function() {
		return this.network.getUrn() + ':site=' + this.id;
	},

	buildLivefyreToken: function() {
		return this.network.buildLivefyreToken();
	}
}

module.exports = Site;