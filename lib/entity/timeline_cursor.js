var psClient = require('../api/personalized_streams.js')

function TimelineCursor(core, resource, limit, startTime, callback) {
	this.core = core;
	this.resource = resource;
	this.limit = limit;
	this.cursorTime = startTime.toISOString();
	this.callback = callback;
	this.hasNext = false;
	this.hasPrevious = false;
}

TimelineCursor.prototype = {
	next: function(limit) {
		var cursor = this;
		limit = limit || this.limit;

		psClient.getTimelineStream(this.core, this.resource, limit, null, this.cursorTime, function(result) {
			c = result.meta.cursor;

			cursor.hasNext = c.hasNext;
			cursor.hasPrevious = c.next != null;
			cursor.cursorTime = c.next;

			cursor.callback(result);
		});
	},

	previous: function(limit) {
		var cursor = this;
		limit = limit || this.limit;

		psClient.getTimelineStream(this.core, this.resource, limit, this.cursorTime, null, function(result) {
			c = result.meta.cursor;

			cursor.hasPrevious = c.hasPrev;
			cursor.hasNext = c.prev != null;
			cursor.cursorTime = c.prev;

			cursor.callback(result);
		});
	},

	setCursorTime: function(newTime) {
		this.cursorTime = newTime.toISOString();
	}
}

module.exports = TimelineCursor;