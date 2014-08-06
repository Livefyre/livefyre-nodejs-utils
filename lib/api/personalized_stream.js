var	jwt = require('jwt-simple'),
	rest = require('restler'),
	util = require('util');

var Topic = require('../entity/topic.js'),
	Subscription = require('../entity/subscription.js');

var BASE_URL = 'https://%s.quill.fyre.co/api/v4/';
var STREAM_URL = 'https://bootstrap.livefyre.com/api/v4/';

var NETWORK_TOPICS_URL_PATH = ':topics/';
var COLLECTION_TOPICS_URL_PATH = ':collection=%s:topics/';
var SUBSCRIPTION_URL_PATH = ':subscriptions/';
var SUBSCRIBER_URL_PATH = ':subscribers/';
var TIMELINE_PATH = 'timeline/';

function PersonalizedStream() {}

function getHeader(core, userToken) {
	var token = (typeof userToken !== 'undefined' && userToken) ? userToken : core.buildLivefyreToken();

	return { 'Authorization': 'lftoken '+ token };
}

function getTopicIds(topics) {
	var topicIds = [];

	for (var i in topics) {
		topicIds.push(topics[i].id);
	}

	return topicIds;
}

function buildSubscriptions(topics, userUrn) {
	var subscriptions = [];

	for (var i in topics) {
		subscriptions.push(new Subscription(topics[i].id, userUrn, Subscription.Types['personalStream']));
	}

	return subscriptions;
}

PersonalizedStream.getTopic = function(callback, core, id) {
	var uri = util.format(BASE_URL, core.networkName) + Topic.generateUrn(core, id) + '/';
	
	rest.get(uri, { headers: getHeader(core) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(Topic.serializeFromJson(result.data.topic));
	});
}

PersonalizedStream.createOrUpdateTopic = function(callback, core, id, label) {
	var dict = [];
	dict.push({ key: id, value: label });
	return PersonalizedStream.createOrUpdateTopics(callback, core, dict)[0];
}

PersonalizedStream.deleteTopic = function(callback, core, topic) {
	PersonalizedStream.deleteTopics(callback, core, [topic]);
}

PersonalizedStream.getTopics = function(callback, core, limit, offset) {
	limit = limit || 100;
	offset = offset || 0;

	var uri = util.format(BASE_URL, core.networkName) + core.getUrn() + NETWORK_TOPICS_URL_PATH,
		query = { limit: limit, offset: offset };
	
	rest.get(uri, { query: query, headers: getHeader(core) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		var topics = [],
			topicData = result.data.topics;
		for (var i in topicData) {
			topics.push(Topic.serializeFromJson(topicData[i]));
		}

		callback(topics);
	});
}

PersonalizedStream.createOrUpdateTopics = function(callback, core, topicMap) {
	var topics = [];

	for(var obj in topicMap) {
		if (!topicMap.hasOwnProperty(obj)) continue;

        var label = topicMap[obj].value;
		if (typeof label == 'undefined' || !label || label.length > 128) {
			return null;
		}
		topics.push(Topic.create(core, topicMap[obj].key, label));
	}

	var uri = util.format(BASE_URL, core.networkName) + core.getUrn() + NETWORK_TOPICS_URL_PATH;
	
	rest.postJson(uri, { topics: topics }, { headers: getHeader(core) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(topics);
	});
	return topics;
}

PersonalizedStream.deleteTopics = function(callback, core, topics) {
	var uri = util.format(BASE_URL, core.networkName) + core.getUrn() + NETWORK_TOPICS_URL_PATH;
		options = { data: JSON.stringify({ delete: getTopicIds(topics) }), headers: getHeader(core) };
	
	rest.patch(uri, options).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(result.data.deleted);
	});
}

PersonalizedStream.getCollectionTopics = function(callback, site, collectionId) {
	var uri = util.format(BASE_URL, site.networkName) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.get(uri, { headers: getHeader(site) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(result.data.topicIds);
	});
}

PersonalizedStream.addCollectionTopics = function(callback, site, collectionId, topics) {
	var uri = util.format(BASE_URL, site.networkName) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.postJson(uri, { topicIds: getTopicIds(topics) }, { headers: getHeader(site) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(result.data.added);
	});
}

PersonalizedStream.replaceCollectionTopics = function(callback, site, collectionId, topics) {
	var uri = util.format(BASE_URL, site.networkName) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.putJson(uri, { topicIds: getTopicIds(topics) }, { headers: getHeader(site) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(result.data);
	});
}

PersonalizedStream.removeCollectionTopics = function(callback, site, collectionId, topics) {
	var uri = util.format(BASE_URL, site.networkName) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.patch(uri, { data: JSON.stringify({ delete: getTopicIds(topics) }), headers: getHeader(site) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(result.data.removed);
	});
}

PersonalizedStream.getSubscriptions = function(callback, network, userId) {
	var uri = util.format(BASE_URL, network.networkName) + network.getUserUrn(userId) + SUBSCRIPTION_URL_PATH;
	
	rest.get(uri, { headers: getHeader(network) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		var subscriptions = [],
			subData = result.data.subscriptions;
		for (var i in subData) {
			subscriptions.push(Subscription.serializeFromJson(subData[i]));
		}

		callback(subscriptions);
	});
}

PersonalizedStream.addSubscriptions = function(callback, network, userToken, topics) {
	var userId = jwt.decode(userToken, network.key)['user_id'],
		userUrn = network.getUserUrn(userId),
		uri = util.format(BASE_URL, network.networkName) + userUrn + SUBSCRIPTION_URL_PATH;
	
	rest.postJson(uri, { subscriptions: buildSubscriptions(topics, userUrn) }, { headers: getHeader(network, userToken) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(result.data.added);
	});
}

PersonalizedStream.replaceSubscriptions = function(callback, network, userToken, topics) {
	var userId = jwt.decode(userToken, network.key)['user_id'],
		userUrn = network.getUserUrn(userId),
		uri = util.format(BASE_URL, network.networkName) + userUrn + SUBSCRIPTION_URL_PATH;
	
	rest.putJson(uri, { subscriptions: buildSubscriptions(topics, userUrn) }, { headers: getHeader(network, userToken) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(result.data);
	});
}

PersonalizedStream.removeSubscriptions = function(callback, network, userToken, topics) {
	var userId = jwt.decode(userToken, network.key)['user_id'],
		userUrn = network.getUserUrn(userId),
		uri = util.format(BASE_URL, network.networkName) + userUrn + SUBSCRIPTION_URL_PATH;
	
	rest.patch(uri, { data: JSON.stringify({ delete: buildSubscriptions(topics, userUrn) }), headers: getHeader(network, userToken) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		callback(result.data.removed);
	});
}

PersonalizedStream.getSubscribers = function(callback, network, topic, limit, offset) {
	limit = limit || 100;
	offset = offset || 0;

	var uri = util.format(BASE_URL, network.networkName) + topic.id + SUBSCRIBER_URL_PATH,
		query = { limit: limit, offset: offset };
	
	rest.get(uri, { query: query, headers: getHeader(network) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(result);
		}

		var subscriptions = [],
			subData = result.data.subscriptions;
		for (var i in subData) {
			subscriptions.push(Subscription.serializeFromJson(subData[i]));
		}

		callback(subscriptions);
	});
}

PersonalizedStream.getTimelineStream = function(callback, core, resource, limit, until, since) {
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
}

module.exports = PersonalizedStream;