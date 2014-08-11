var	jwt = require('jwt-simple'),
	rest = require('restler'),
	util = require('util');

var Topic = require('../entity/topic.js'),
	Subscription = require('../entity/subscription.js'),
	Domain = require('../api/domain.js');

var BASE_URL = '%s/api/v4/';
var STREAM_URL = '%s/api/v4/';

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

PersonalizedStream.getTopic = function(core, id, callback) {
	var uri = util.format(BASE_URL, Domain.quill(core)) + Topic.generateUrn(core, id) + '/';
	
	rest.get(uri, { headers: getHeader(core) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error getting topic: '+response.statusCode));
		}

		callback(Topic.serializeFromJson(result.data.topic));
	});
}

PersonalizedStream.createOrUpdateTopic = function(core, id, label, callback) {
	var dict = [];
	dict.push({ key: id, value: label });
	return PersonalizedStream.createOrUpdateTopics(core, dict, callback)[0];
}

PersonalizedStream.deleteTopic = function(core, topic, callback) {
	PersonalizedStream.deleteTopics(core, [topic], callback);
}

PersonalizedStream.getTopics = function(core, limit, offset, callback) {
    var args = [];
	Array.prototype.push.apply(args, arguments);
 
    core = args.shift();
    callback = args.pop();
 
    if (args.length > 0) limit = args.shift(); else limit = 100;
    if (args.length > 0) offset = args.shift(); else offset = 0;
 
	var uri = util.format(BASE_URL, Domain.quill(core)) + core.getUrn() + NETWORK_TOPICS_URL_PATH,
		query = { limit: limit, offset: offset };
	
	rest.get(uri, { query: query, headers: getHeader(core) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error getting topics: '+response.statusCode));
		}

		var topics = [],
			topicData = result.data.topics;
		for (var i in topicData) {
			topics.push(Topic.serializeFromJson(topicData[i]));
		}

		callback(topics);
	});
}

PersonalizedStream.createOrUpdateTopics = function(core, topicMap, callback) {
	var topics = [];

	for(var obj in topicMap) {
		if (!topicMap.hasOwnProperty(obj)) continue;

        var label = topicMap[obj].value;
		if (typeof label == 'undefined' || !label || label.length > 128) {
			return callback(new Error('labels are required and cannot be longer than 128 characters'));
		}
		topics.push(Topic.create(core, topicMap[obj].key, label));
	}

	var uri = util.format(BASE_URL, Domain.quill(core)) + core.getUrn() + NETWORK_TOPICS_URL_PATH;
	
	rest.postJson(uri, { topics: topics }, { headers: getHeader(core) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error creating/updating topics: '+response.statusCode));
		}

		callback(topics);
	});
	return topics;
}

PersonalizedStream.deleteTopics = function(core, topics, callback) {
	var uri = util.format(BASE_URL, Domain.quill(core)) + core.getUrn() + NETWORK_TOPICS_URL_PATH;
		options = { data: JSON.stringify({ delete: getTopicIds(topics) }), headers: getHeader(core) };
	
	rest.patch(uri, options).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error deleting topics: '+response.statusCode));
		}

		callback(result.data.deleted);
	});
}

PersonalizedStream.getCollectionTopics = function(site, collectionId, callback) {
	var uri = util.format(BASE_URL, Domain.quill(site)) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.get(uri, { headers: getHeader(site) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error getting collection topics: '+response.statusCode));
		}

		callback(result.data.topicIds);
	});
}

PersonalizedStream.addCollectionTopics = function(site, collectionId, topics, callback) {
	var uri = util.format(BASE_URL, Domain.quill(site)) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.postJson(uri, { topicIds: getTopicIds(topics) }, { headers: getHeader(site) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error adding collection topics: '+response.statusCode));
		}

		callback(result.data.added);
	});
}

PersonalizedStream.replaceCollectionTopics = function(site, collectionId, topics, callback) {
	var uri = util.format(BASE_URL, Domain.quill(site)) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.putJson(uri, { topicIds: getTopicIds(topics) }, { headers: getHeader(site) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error replacing collection topics: '+response.statusCode));
		}

		callback(result.data);
	});
}

PersonalizedStream.removeCollectionTopics = function(site, collectionId, topics, callback) {
	var uri = util.format(BASE_URL, Domain.quill(site)) + site.getUrn() + util.format(COLLECTION_TOPICS_URL_PATH, collectionId);
	
	rest.patch(uri, { data: JSON.stringify({ delete: getTopicIds(topics) }), headers: getHeader(site) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error removing collection topics: '+response.statusCode));
		}

		callback(result.data.removed);
	});
}

PersonalizedStream.getSubscriptions = function(network, userId, callback) {
	var uri = util.format(BASE_URL, Domain.quill(network)) + network.getUserUrn(userId) + SUBSCRIPTION_URL_PATH;
	
	rest.get(uri, { headers: getHeader(network) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error getting subscriptions: '+response.statusCode));
		}

		var subscriptions = [],
			subData = result.data.subscriptions;
		for (var i in subData) {
			subscriptions.push(Subscription.serializeFromJson(subData[i]));
		}

		callback(subscriptions);
	});
}

PersonalizedStream.addSubscriptions = function(network, userToken, topics, callback) {
	var userId = jwt.decode(userToken, network.key)['user_id'],
		userUrn = network.getUserUrn(userId),
		uri = util.format(BASE_URL, Domain.quill(network)) + userUrn + SUBSCRIPTION_URL_PATH;
	
	rest.postJson(uri, { subscriptions: buildSubscriptions(topics, userUrn) }, { headers: getHeader(network, userToken) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error adding subscriptions: '+response.statusCode));
		}

		callback(result.data.added);
	});
}

PersonalizedStream.replaceSubscriptions = function(network, userToken, topics, callback) {
	var userId = jwt.decode(userToken, network.key)['user_id'],
		userUrn = network.getUserUrn(userId),
		uri = util.format(BASE_URL, Domain.quill(network)) + userUrn + SUBSCRIPTION_URL_PATH;
	
	rest.putJson(uri, { subscriptions: buildSubscriptions(topics, userUrn) }, { headers: getHeader(network, userToken) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error replacing subscriptions: '+response.statusCode));
		}

		callback(result.data);
	});
}

PersonalizedStream.removeSubscriptions = function(network, userToken, topics, callback) {
	var userId = jwt.decode(userToken, network.key)['user_id'],
		userUrn = network.getUserUrn(userId),
		uri = util.format(BASE_URL, Domain.quill(network)) + userUrn + SUBSCRIPTION_URL_PATH;
	
	rest.patch(uri, { data: JSON.stringify({ delete: buildSubscriptions(topics, userUrn) }), headers: getHeader(network, userToken) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error removing subscriptions: '+response.statusCode));
		}

		callback(result.data.removed);
	});
}

PersonalizedStream.getSubscribers = function(network, topic, limit, offset, callback) {
    var args = [];
	Array.prototype.push.apply(args, arguments);
 
    network = args.shift();
    topic = args.shift();
    callback = args.pop();
 
    if (args.length > 0) limit = args.shift(); else limit = 100;
    if (args.length > 0) offset = args.shift(); else offset = 0;

	var uri = util.format(BASE_URL, Domain.quill(network)) + topic.id + SUBSCRIBER_URL_PATH,
		query = { limit: limit, offset: offset };
	
	rest.get(uri, { query: query, headers: getHeader(network) }).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			callback(new Error('error getting subscribers: '+response.statusCode));
		}

		var subscriptions = [],
			subData = result.data.subscriptions;
		for (var i in subData) {
			subscriptions.push(Subscription.serializeFromJson(subData[i]));
		}

		callback(subscriptions);
	});
}

PersonalizedStream.getTimelineStream = function(core, resource, limit, until, since, callback) {
    var args = [];
	Array.prototype.push.apply(args, arguments);
 
    core = args.shift();
    resource = args.shift();
    callback = args.pop();
 
    if (args.length > 0) limit = args.shift(); else limit = 100;
    if (args.length > 0) until = args.shift(); else until = null;
    if (args.length > 0) since = args.shift(); else since = null;

	var uri = util.format(STREAM_URL, Domain.bootstrap(core)) + TIMELINE_PATH;
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