var PersonalizedStream = require('../api/personalized_stream');
var CursorData = require('../model/cursor_data');


function TimelineCursor(core, data, callback) {
	this.core = core;
    this.data = data;
	this.callback = callback;
}
module.exports = TimelineCursor;


TimelineCursor.init = function init(core, resource, limit, startTime, callback) {
    var data = new CursorData(resource, limit, startTime);
    return new TimelineCursor(core, CursorValidator.validate(data), callback);
};


TimelineCursor.prototype.next = function next() {
    var handler = function(err, cursor, result) {
        if (err) {
            return cursor.callback(err);
        }

        var c = result.meta.cursor;

        cursor.data.next = c.hasNext;
        cursor.data.previous = c.next != null;
        if (cursor.data.previous) {
            cursor.data.cursorTime = c.next;
        }

        cursor.callback(result);
    };

    PersonalizedStream.getTimelineStream(this, true, handler);
};

TimelineCursor.prototype.previous = function previous() {
    var handler = function(err, cursor, result) {
        if (err) {
            return cursor.callback(err);
        }

        var c = result.meta.cursor;s.

        cursor.data.previous = c.hasPrev;
        cursor.data.next = c.prev != null;
        if (cursor.data.next) {
            cursor.data.cursorTime = c.prev;
        }

        cursor.callback(result);
    };

    PersonalizedStream.getTimelineStream(this, false, handler);
};