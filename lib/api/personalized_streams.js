var Topic = require('../entity/topic.js'),
	Subscription = require('../entity/subscription.js'),
	rest = require('restler'),
	util = require('util');

var BASE_URL = 'https://%s.quill.fyre.co/api/v4/';
var STREAM_URL = 'https://bootstrap.livefyre.com/api/v4/';

var NETWORK_TOPICS_URL_PATH = ':topics/';
var COLLECTION_TOPICS_URL_PATH = ':collection=%s:topics/';
var SUBSCRIPTION_URL_PATH = ':subscriptions/';
var SUBSCRIBER_URL_PATH = ':subscribers/';
var TIMELINE_PATH = 'timeline/';

function PersonalizedStreamsClient() {}

function getHeader(core, userId) {
	var token = (typeof userId !== 'undefined' && userId) ?
		core.buildUserAuthToken(userId, '', core.DEFAULT_EXPIRES) : core.buildLivefyreToken();

	return { 'Authorization': 'lftoken '+token };
}

function getTopicIds(topics) {
	var topicIds = [];

	for (var i in topics) {
		topicIds.push(topics[i].id);
	}

	return topicIds;
}

function buildSubscriptions(topics, user) {
	var subscriptions = [];

	for (var i in topics) {
		subscriptions.push(new Subscription(topics[i].id, user, Subscription.Types['personalStream']));
	}

	return subscriptions;
}

PersonalizedStreamsClient.getTopic = function(core, id, callback) {
	var uri = util.format(BASE_URL, core.networkName) + Topic.generateUrn(core, id) + '/';
	
	rest.get(uri, { headers: getHeader(core) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(Topic.serializeFromJson(result.data.topic));
	});
	return this;
}

PersonalizedStreamsClient.getTopics = function(core, limit, offset, callback) {
	var uri = util.format(BASE_URL, core.networkName) + core.getUrn() + NETWORK_TOPICS_URL_PATH,
		query = { limit: limit, offset: offset };
	
	rest.get(uri, { query: query, headers: getHeader(core) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		var topics = [],
			topicData = result.data.topics;
		for (var i in topicData) {
			topics.push(Topic.serializeFromJson(topicData[i]));
		}

		callback(topics);
	});
	return this;
}

PersonalizedStreamsClient.postTopics = function(core, topics, callback) {
	var uri = util.format(BASE_URL, core.networkName) + core.getUrn() + NETWORK_TOPICS_URL_PATH;
	
	rest.postJson(uri, { topics: topics }, { headers: getHeader(core) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(result.data);
	});
	return this;
}

PersonalizedStreamsClient.patchTopics = function(core, topics, callback) {
	var uri = util.format(BASE_URL, core.networkName) + core.getUrn() + NETWORK_TOPICS_URL_PATH;
		options = { data: JSON.stringify({ delete: getTopicIds(topics) }), headers: getHeader(core) };
	
	rest.patch(uri, options).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(result.data.deleted);
	});
	return this;
}

PersonalizedStreamsClient.getCollectionTopics = function(site, collectionId, callback) {
	var uri = util.format(BASE_URL, site.networkName) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.get(uri, { headers: getHeader(site) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(result.data.topicIds);
	});
	return this;
}

PersonalizedStreamsClient.postCollectionTopics = function(site, collectionId, topics, callback) {
	var uri = util.format(BASE_URL, site.networkName) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.postJson(uri, { topicIds: getTopicIds(topics) }, { headers: getHeader(site) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(result.data.added);
	});
	return this;
}

PersonalizedStreamsClient.putCollectionTopics = function(site, collectionId, topics, callback) {
	var uri = util.format(BASE_URL, site.networkName) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.putJson(uri, { topicIds: getTopicIds(topics) }, { headers: getHeader(site) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(result.data);
	});
	return this;
}

PersonalizedStreamsClient.patchCollectionTopics = function(site, collectionId, topics, callback) {
	var uri = util.format(BASE_URL, site.networkName) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.patch(uri, { data: JSON.stringify({ delete: getTopicIds(topics) }), headers: getHeader(site) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(result.data.removed);
	});
	return this;
}

PersonalizedStreamsClient.getSubscriptions = function(network, userId, callback) {
	var uri = util.format(BASE_URL, network.networkName) + network.getUserUrn(userId) + SUBSCRIPTION_URL_PATH;
	
	rest.get(uri, { headers: getHeader(network, userId) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		var subscriptions = [],
			subData = result.data.subscriptions;
		for (var i in subData) {
			subscriptions.push(Subscription.serializeFromJson(subData[i]));
		}

		callback(subscriptions);
	});
	return this;
}

PersonalizedStreamsClient.postSubscriptions = function(network, userId, topics, callback) {
	var userUrn = network.getUserUrn(userId),
		uri = util.format(BASE_URL, network.networkName) + userUrn + SUBSCRIPTION_URL_PATH;
	
	rest.postJson(uri, { subscriptions: buildSubscriptions(topics, userUrn) }, { headers: getHeader(network, userId) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(result.data.added);
	});
	return this;
}

PersonalizedStreamsClient.putSubscriptions = function(network, userId, topics, callback) {
	var userUrn = network.getUserUrn(userId),
		uri = util.format(BASE_URL, network.networkName) + userUrn + SUBSCRIPTION_URL_PATH;
	
	rest.putJson(uri, { subscriptions: buildSubscriptions(topics, userUrn) }, { headers: getHeader(network, userId) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(result.data);
	});
	return this;
}

PersonalizedStreamsClient.patchSubscriptions = function(network, userId, topics, callback) {
	var userUrn = network.getUserUrn(userId),
		uri = util.format(BASE_URL, network.networkName) + userUrn + SUBSCRIPTION_URL_PATH;
	
	rest.patch(uri, { data: JSON.stringify({ delete: buildSubscriptions(topics, userUrn) }), headers: getHeader(network, userId) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		callback(result.data.removed);
	});
	return this;
}

PersonalizedStreamsClient.getSubscribers = function(network, topic, limit, offset, callback) {
	var uri = util.format(BASE_URL, network.networkName) + topic.id + SUBSCRIBER_URL_PATH,
		query = { limit: limit, offset: offset };
	
	rest.get(uri, { query: query, headers: getHeader(network) }).on('complete', function(result, response) {
		if (result.code != 200) {
			return callback(result);
		}

		var subscriptions = [],
			subData = result.data.subscriptions;
		for (var i in subData) {
			subscriptions.push(Subscription.serializeFromJson(subData[i]));
		}

		callback(subscriptions);
	});
	return this;
}

PersonalizedStreamsClient.getTimelineStream = function(core, resource, limit, until, since, callback) {
	var uri = STREAM_URL + TIMELINE_PATH;
		query = { resource: resource, limit: limit };

	if (typeof until != 'undefined' && until) {
		query[until] = until;
	} else if (typeof since != 'undefined' && since) {
		query[since] = since;
	}
	
	rest.get(uri, { query: query, headers: getHeader(network) }).on('complete', function(result, response) {
		callback(result);
	});
	return this;
}

module.exports = PersonalizedStreamsClient;