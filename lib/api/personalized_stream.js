var jwt = require('jwt-simple');
var client = require('restler');
var util = require('util');

var Domain = require('../api/domain');
var Topic = require('../dto/topic');
var Subscription = require('../dto/subscription');
var SubscriptionType = require('../type/subscription_type');


var BASE_URL = '%s/api/v4/';
var NETWORK_TOPICS_URL_PATH = ':topics/';
var SUBSCRIPTION_URL_PATH = ':subscriptions/';
var SUBSCRIBER_URL_PATH = ':subscribers/';
var TIMELINE_PATH = 'timeline/';


var ps = function PersonalizedStream() {};
module.exports = ps;


ps.getTopic = function getTopic(core, id, callback) {
    var uri = getBaseQuillUrl(core) + Topic.generateUrn(core, id) + '/';
    var opts = { headers: getHeader(core) };
	
	client.get(uri, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(new Error('error getting topic: '+response.statusCode));
		}

		callback(null, Topic.serializeFromJson(result.data.topic));
	});
};


ps.createOrUpdateTopic = function createOrUpdateTopic(core, id, label, callback) {
	var dict = [{ key: id, value: label }];

	ps.createOrUpdateTopics(core, dict, callback);
};


ps.deleteTopic = function deleteTopic(core, topic, callback) {
    ps.deleteTopics(core, [topic], callback);
};


ps.getTopics = function getTopics(core, limit, offset, callback) {
    var args = [];
	Array.prototype.push.apply(args, arguments);
 
    core = args.shift();
    callback = args.pop();
 
    if (args.length > 0) limit = args.shift(); else limit = 100;
    if (args.length > 0) offset = args.shift(); else offset = 0;
 
	var uri = getBaseQuillUrl(core) + core.getUrn() + NETWORK_TOPICS_URL_PATH;
    var opts = {
        query: { limit: limit, offset: offset },
        headers: getHeader(core)
    };

    client.get(uri, opts).on('complete', function(result, response) {
        if (response.statusCode != 200) {
            return callback(new Error('error getting topics: '+response.statusCode));
        }

        var topics = [],
            topicData = result.data.topics;
        for (var i in topicData) {
            topics.push(Topic.serializeFromJson(topicData[i]));
        }

        callback(null, topics);
    });
};


ps.createOrUpdateTopics = function createOrUpdateTopics(core, topicMap, callback) {
    var topics = [];

    for(var obj in topicMap) {
        if (!topicMap.hasOwnProperty(obj)) continue;

        var label = topicMap[obj].value;
		if (typeof label == 'undefined' || !label || label.length > 128) {
			return callback(new Error('labels are required and cannot be longer than 128 characters'));
		}
		topics.push(Topic.create(core, topicMap[obj].key, label));
	}

	var uri = getBaseQuillUrl(core) + core.getUrn() + NETWORK_TOPICS_URL_PATH;
    var data = { topics: topics };
    var opts = { headers: getHeader(core) };

    client.postJson(uri, data, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
			return callback(new Error('error creating/updating topics: '+response.statusCode));
		}

		callback(null, topics);
	});
};


ps.deleteTopics = function deleteTopics(core, topics, callback) {
	var uri = getBaseQuillUrl(core) + core.getUrn() + NETWORK_TOPICS_URL_PATH;
	var	opts = {
        data: JSON.stringify({ delete: getTopicIds(topics) }),
        headers: getHeader(core)
    };

	client.patch(uri, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error deleting topics: '+response.statusCode));
		}

		callback(null, result.data.deleted);
	});
};


ps.getCollectionTopics = function getCollectionTopics(collection, callback) {
	var uri = getBaseQuillUrl(collection) + collection.getUrn();
    var opts = { headers: getHeader(collection) };

    client.get(uri, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error getting collection topics: '+response.statusCode));
		}

		callback(null, result.data.topicIds);
	});
};


ps.addCollectionTopics = function addCollectionTopics(collection, topics, callback) {
	var uri = getBaseQuillUrl(collection) + collection.getUrn();
    var data = { topicIds: getTopicIds(topics) };
    var opts = { headers: getHeader(collection) };

    client.postJson(uri, data, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error adding collection topics: '+response.statusCode));
		}

		callback(null, result.data.added);
	});
};


ps.replaceCollectionTopics = function replaceCollectionTopics(collection, topics, callback) {
	var uri = getBaseQuillUrl(collection) + collection.getUrn();
    var data = { topicIds: getTopicIds(topics) };
    var opts = { headers: getHeader(collection) };

    client.putJson(uri, data, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error replacing collection topics: '+response.statusCode));
		}

		callback(null, result.data);
	});
};


ps.removeCollectionTopics = function removeCollectionTopics(collection, topics, callback) {
	var uri = getBaseQuillUrl(collection) + collection.getUrn();
    var opts = {
        data: JSON.stringify({ delete: getTopicIds(topics) }),
        headers: getHeader(collection)
    };

    client.patch(uri, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error removing collection topics: '+response.statusCode));
		}

		callback(null, result.data.removed);
	});
};


ps.getSubscriptions = function getSubscriptions(network, userId, callback) {
	var uri = getBaseQuillUrl(network) + network.getUrnForUser(userId) + SUBSCRIPTION_URL_PATH;
    var opts = { headers: getHeader(network) };

    client.get(uri, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error getting subscriptions: '+response.statusCode));
		}

		var subscriptions = [];
		var subData = result.data.subscriptions;

        subData.forEach(function addSubscription(sub) {
            subscriptions.push(Subscription.serializeFromJson(sub));
        });

		callback(null, subscriptions);
	});
};


ps.addSubscriptions = function addSubscriptions(network, userToken, topics, callback) {
	var userId = jwt.decode(userToken, network.key)['user_id'];
    var	userUrn = network.getUrnForUser(userId);

    var	uri = getBaseQuillUrl(network) + userUrn + SUBSCRIPTION_URL_PATH;
    var data = { subscriptions: buildSubscriptions(topics, userUrn) };
    var opts = { headers: getHeader(network, userToken) };

    client.postJson(uri, data, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error adding subscriptions: '+response.statusCode));
		}

		callback(null, result.data.added);
	});
};


ps.replaceSubscriptions = function replaceSubscriptions(network, userToken, topics, callback) {
	var userId = jwt.decode(userToken, network.key)['user_id'];
	var	userUrn = network.getUrnForUser(userId);

	var	uri = getBaseQuillUrl(network) + userUrn + SUBSCRIPTION_URL_PATH;
    var data = { subscriptions: buildSubscriptions(topics, userUrn) };
    var opts = { headers: getHeader(network, userToken) };

    client.putJson(uri, data, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error replacing subscriptions: '+response.statusCode));
		}

		callback(null, result.data);
	});
};


ps.removeSubscriptions = function removeSubscriptions(network, userToken, topics, callback) {
	var userId = jwt.decode(userToken, network.key)['user_id'];
	var	userUrn = network.getUrnForUser(userId);

    var	uri = getBaseQuillUrl(network) + userUrn + SUBSCRIPTION_URL_PATH;
    var opts = {
        data: JSON.stringify({ delete: buildSubscriptions(topics, userUrn) }),
        headers: getHeader(network, userToken)
    };

    client.patch(uri, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error removing subscriptions: '+response.statusCode));
		}

		callback(null, result.data.removed);
	});
};


ps.getSubscribers = function getSubscribers(network, topic, limit, offset, callback) {
    var args = [];
	Array.prototype.push.apply(args, arguments);
 
    network = args.shift();
    topic = args.shift();
    callback = args.pop();
 
    if (args.length > 0) limit = args.shift(); else limit = 100;
    if (args.length > 0) offset = args.shift(); else offset = 0;

	var uri = getBaseQuillUrl(network) + topic.id + SUBSCRIBER_URL_PATH;
	var query = { limit: limit, offset: offset };
    var opts = { query: query, headers: getHeader(network) };

    client.get(uri, opts).on('complete', function(result, response) {
		if (response.statusCode != 200) {
            return callback(new Error('error getting subscribers: '+response.statusCode));
		}

		var subscriptions = [];
		var	subData = result.data.subscriptions;

        subData.forEach(function addSubscription(sub) {
            subscriptions.push(Subscription.serializeFromJson(sub));
        });

		callback(null, subscriptions);
	});
};


ps.getTimelineStream = function getTimelineStream(cursor, isNext, callback) {
	var uri = getBaseBootstrapUrl(cursor.core) + TIMELINE_PATH;
	var query = { resource: cursor.data.resource, limit: cursor.data.limit };

    if (isNext) {
        query['since'] = cursor.data.cursorTime;
    } else {
        query['until'] = cursor.data.cursorTime;
    }

    var opts = { query: query, headers: getHeader(cursor.core) };

    client.get(uri, opts).on('complete', function(result, response) {
        if (response.statusCode != 200) {
            return callback(new Error('error getting timeline update: '+response.statusCode));
        }

		callback(null, cursor, result);
	});
};


function getBaseQuillUrl(core) {
    return util.format(BASE_URL, Domain.quill(core));
}


function getBaseBootstrapUrl(core) {
    return util.format(BASE_URL, Domain.bootstrap(core));
}


function getHeader(core, userToken) {
    var network = LivefyreUtil.getNetworkFromCore(core);
    var token = (typeof userToken !== 'undefined' && userToken)
        ? userToken
        : network.buildLivefyreToken();

    return { 'Authorization': 'lftoken '+ token };
}


function getTopicIds(topics) {
    var topicIds = [];

    topics.forEach(function addTopicId(topic) {
        topicIds.push(topic.id);
    });

    return topicIds;
}


function buildSubscriptions(topics, userUrn) {
    var subscriptions = [];

    topics.forEach(function addSubscription(topic) {
        var s = new Subscription(topic.id, userUrn, SubscriptionType.PERSONAL_STREAM);
        subscriptions.push(s);
    });

    return subscriptions;
}