var TimelineCursor = require('../entity/timeline_cursor.js');

function CursorFactory() {}

CursorFactory.getTopicStreamCursor = function(core, topic, limit, date, callback) {
    var args = [];
	Array.prototype.push.apply(args, arguments);
 
    core = args.shift();
    topic = args.shift();
    callback = args.pop();
 
    if (args.length > 0) limit = args.shift(); else limit = 50;
    if (args.length > 0) date = args.shift(); else date = new Date();
	
	var resource = topic.id + ':topicStream';
	return new TimelineCursor(core, resource, limit, date, callback);
}

CursorFactory.getPersonalStreamCursor = function(network, user, limit, date, callback) {
    var args = [];
	Array.prototype.push.apply(args, arguments);
 
    network = args.shift();
    user = args.shift();
    callback = args.pop();
 
    if (args.length > 0) limit = args.shift(); else limit = 50;
    if (args.length > 0) date = args.shift(); else date = new Date();

	var resource = network.getUserUrn(user) + ':personalStream';
	return new TimelineCursor(network, resource, limit, date, callback);
}

module.exports = CursorFactory;