var TimelineCursor = require('../cursor/timeline_cursor');


function CursorFactory() {}
module.exports = CursorFactory;


CursorFactory.getTopicStreamCursor = function(core, topic, limit, date, callback) {
    var args = [];
	Array.prototype.push.apply(args, arguments);
 
    core = args.shift();
    topic = args.shift();
    callback = args.pop();
 
    if (args.length > 0) limit = args.shift(); else limit = 50;
    if (args.length > 0) date = args.shift(); else date = new Date();
	
	var resource = topic.id + ':topicStream';
	return TimelineCursor.init(core, resource, limit, date, callback);
};


CursorFactory.getPersonalStreamCursor = function(network, user, limit, date, callback) {
    var args = [];
	Array.prototype.push.apply(args, arguments);
 
    network = args.shift();
    user = args.shift();
    callback = args.pop();
 
    if (args.length > 0) limit = args.shift(); else limit = 50;
    if (args.length > 0) date = args.shift(); else date = new Date();

	var resource = network.getUrnForUser(user) + ':personalStream';
	return TimelineCursor.init(network, resource, limit, date, callback);
};