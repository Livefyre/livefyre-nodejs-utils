var validator = require('validator'),
	jwt = require('jwt-simple'),
	rest = require('restler'),
	util = require('util');

var Site = require('./site.js'),
	Topic = require('../entity/topic.js'),
	PSClient = require('../api/personalized_streams.js'),
	CursorFactory = require('../factory/cursor_factory.js');

function Network(name, key) {
	this.name = name,
	this.key = key,
	this.networkName = name.split('.')[0];
	this.DEFAULT_USER = 'system',
	this.DEFAULT_EXPIRES = 86400;
}

Network.prototype = {
	setUserSyncUrl: function(callback, urlTemplate) {
		if (!validator.contains(urlTemplate, '{id}')) {
			return null;
		}

		var uri = util.format('http://%s', this.name);
		var data = { actor_token: this.buildLivefyreToken(), pull_profile_url: urlTemplate };

		rest.post(uri, { data: data }).on('complete', function(result, response) {
			callback(response.statusCode == 204);
		});
	},
	
	syncUser: function(callback, userId) {
		var uri = util.format('http://%s/api/v3_0/user/%s/refresh', this.name, userId);
		var data = { lftoken: this.buildLivefyreToken() };

		rest.post(uri, { data: data }).on('complete', function(result, response) {
			callback(response.statusCode == 200);
		});
	},

	buildLivefyreToken: function() {
		return this.buildUserAuthToken(this.DEFAULT_USER, this.DEFAULT_USER, this.DEFAULT_EXPIRES);
	},

	buildUserAuthToken: function(userId, displayName, expires) {
		if (!validator.isAlphanumeric(userId)) {
			return null;
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
			network = this;

		Object.keys(topicMap).forEach(function(key) {
			topics.push(Topic.create(network, key, topicMap[key]));
		});

		PSClient.postTopics(this, topics, callback);
		return topics;
	},

	deleteTopics: function(callback, topics) {
		PSClient.patchTopics(this, topics, callback);
	},

	getSubscriptions: function(callback, userId) {
		PSClient.getSubscriptions(this, userId, callback);
	},

	addSubscriptions: function(callback, userId, topics) {
		PSClient.postSubscriptions(this, userId, topics, callback);
	},

	updateSubscriptions: function(callback, userId, topics) {
		PSClient.putSubscriptions(this, userId, topics, callback);
	},

	removeSubscriptions: function(callback, userId, topics) {
		PSClient.patchSubscriptions(this, userId, topics, callback);
	},

	getSubscribers: function(callback, topic, limit, offset) {
		limit = limit || 100;
		offset = offset || 0;

		PSClient.getSubscribers(this, topic, limit, offset, callback);
	},

	getTopicStreamCursor: function(callback, topic, limit, date) {
		limit = limit || 50;
		date = date || new Date();

		return CursorFactory.getTopicStreamCursor(this, topic, limit, date, callback);
	},

	getPersonalStreamCursor: function(callback, user, limit, date) {
		limit = limit || 50;
		date = date || new Date();

		return CursorFactory.getPersonalStreamCursor(this, user, limit, date, callback);
	},

	getUrn: function() {
		return 'urn:livefyre:' + this.name;
	},

	getUserUrn: function(user) {
		return this.getUrn() + ':user=' + user;
	}
}

module.exports = Network;