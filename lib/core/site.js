var validator = require('validator'),
	jwt = require('jwt-simple'),
	rest = require('restler'),
	util = require('util'),
	crypto = require('crypto');

function Site(network, siteId, siteKey) {
	this.network = network;
	this.networkName = network.networkName;
	this.siteId = siteId;
	this.siteKey = siteKey;
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

		return jwt.encode(options, this.siteKey);
	},

	buildChecksum: function(title, url, tags) {
		tags = tags || '';
		if (!validator.isURL(url, { require_protocol: true }) || title.length > 255) {
			return null;
		}

		var payload = { tags: tags, title: title, url: url };
		return crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');
	},

	getCollectionContent: function(callback, articleId) {
		var uri = util.format('https://bootstrap.livefyre.com/bs3/%s/%s/%s/init',
			this.network.name, this.siteId, new Buffer(articleId.toString()).toString('base64'));
		
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
		return this.network.getUrn() + ':site=' + this.siteId;
	},

	buildLivefyreToken: function() {
		return this.network.buildLivefyreToken();
	}
}

module.exports = Site;