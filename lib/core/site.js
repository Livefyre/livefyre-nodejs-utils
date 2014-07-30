var validator = require('validator'),
	jwt = require('jwt-simple'),
	rest = require('restler'),
	util = require('util'),
	crypto = require('crypto');

var Topic = require('../entity/topic.js'),
	PSClient = require('../api/personalized_streams.js'),
	CursorFactory = require('../factory/cursor_factory.js');

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

	getTopic: function(callback, id) {
		PSClient.getTopic(this, id, callback);
	},

	createOrUpdateTopic: function(callback, id, label) {
		var topic = Topic.create(this, id, label);
		PSClient.postTopics(this, [topic], callback);

		return topic;
	},

	deleteTopic: function(callback, topic) {
		PSClient.patchTopics(this, [topic], callback);
	},

	getTopics: function(callback, limit, offset) {
		limit = limit || 100;
		offset = offset || 0;

		PSClient.getTopics(this, limit, offset, callback);
	},

	createOrUpdateTopics: function(callback, topicMap) {
		var topics = [],
			site = this;

		Object.keys(topicMap).forEach(function(key) {
			topics.push(Topic.create(site, key, topicMap[key]));
		});

		PSClient.postTopics(this, topics, callback);
		return topics;
	},

	deleteTopics: function(callback, topics) {
		PSClient.patchTopics(this, topics, callback);
	},

	getCollectionTopics: function(callback, collectionId) {
		PSClient.getCollectionTopics(this, collectionId, callback);
	},

	addCollectionTopics: function(callback, collectionId, topics) {
		PSClient.postCollectionTopics(this, collectionId, topics, callback);
	},

	updateCollectionTopics: function(callback, collectionId, topics) {
		PSClient.putCollectionTopics(this, collectionId, topics, callback);
	},

	removeCollectionTopics: function(callback, collectionId, topics) {
		PSClient.patchCollectionTopics(this, collectionId, topics, callback);
	},

	getTopicStreamCursor: function(callback, topic, limit, date) {
		limit = limit || 50;
		date = date || new Date();

		return CursorFactory.getTopicStreamCursor(this, topic, limit, date, callback);
	},

	getUrn: function() {
		return this.network.getUrn() + ':site=' + this.siteId;
	},

	buildLivefyreToken: function() {
		return this.network.buildLivefyreToken();
	}
}

module.exports = Site;