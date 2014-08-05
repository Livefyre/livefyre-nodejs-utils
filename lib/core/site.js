var validator = require('validator'),
	jwt = require('jwt-simple'),
	rest = require('restler'),
	util = require('util'),
	crypto = require('crypto');

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
		if (!validator.isURL(url, { require_protocol: true }) || title.length > 255) {
			return null;
		}

		options['url'] = url;
		options['title'] = title;
		options['articleId'] = articleId;

		if ('type' in options && this.TYPE.indexOf(options['type']) == -1) {
			return null;
		}

		return jwt.encode(options, this.key);
	},

	buildChecksum: function(title, url, tags) {
		tags = tags || '';
		if (!validator.isURL(url, { require_protocol: true }) || title.length > 255) {
			return null;
		}

		var payload = { tags: tags, title: title, url: url };
		return crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');
	},

	createCollection: function(callback, title, articleId, url, options) {
		options = options || {};
		var uri = util.format("https://%s.quill.fyre.co/api/v3.0/site/%s/collection/create/?sync=1", this.networkName, this.id),
			data = {
				articleId: articleId,
				collectionMeta: this.buildCollectionMetaToken(title, articleId, url, options),
				checksum: this.buildChecksum(title, url, 'tags' in options ? options['tags'] : '')
			};

		rest.postJson(uri, data).on('complete', function(result, response) {
			if (response.statusCode != 200) {
				return callback(null);
			}

			callback(result.data.collectionId);
		});
	},

	getCollectionContent: function(callback, articleId) {
		var uri = util.format('https://bootstrap.livefyre.com/bs3/%s/%s/%s/init',
			this.network.name, this.id, new Buffer(articleId.toString()).toString('base64'));
		
		rest.get(uri).on('complete', function(result, response) {
			callback(result);
		});
	},

	getCollectionId: function(callback, articleId) {
		var handler = function(result, response) {
			if (util.isError(result)) {
				return callback(result);
			}
			
			callback(result.collectionSettings.collectionId);
		};

		this.getCollectionContent(handler, articleId);
	},

	getUrn: function() {
		return this.network.getUrn() + ':site=' + this.id;
	},

	buildLivefyreToken: function() {
		return this.network.buildLivefyreToken();
	}
}

module.exports = Site;