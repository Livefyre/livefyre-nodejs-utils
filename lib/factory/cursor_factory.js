var TimelineCursor = require('../entity/timeline_cursor.js');

function CursorFactory() {}

CursorFactory.getTopicStreamCursor = function(core, topic, limit, date, callback) {
	var resource = topic.id + ':topicStream';
	return new TimelineCursor(core, resource, limit, date, callback);
}

CursorFactory.getPersonalStreamCursor = function(network, user, limit, date, callback) {
	var resource = network.getUserUrn(user) + ':personalStream';
	return new TimelineCursor(network, resource, limit, date, callback);
}

module.exports = CursorFactory;