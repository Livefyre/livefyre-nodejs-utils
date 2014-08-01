var TimelineCursor = require('../entity/timeline_cursor.js');

function CursorFactory() {}

CursorFactory.getTopicStreamCursor = function(callback, core, topic, limit, date) {
	limit = limit || 50;
	date = date || new Date();
	
	var resource = topic.id + ':topicStream';
	return new TimelineCursor(core, resource, limit, date, callback);
}

CursorFactory.getPersonalStreamCursor = function(callback, network, user, limit, date) {
	limit = limit || 50;
	date = date || new Date();

	var resource = network.getUserUrn(user) + ':personalStream';
	return new TimelineCursor(network, resource, limit, date, callback);
}

module.exports = CursorFactory;