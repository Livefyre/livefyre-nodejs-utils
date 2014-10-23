function CursorData(resource, limit, startTime) {
    this.resource = resource;
    this.limit = limit;
    this.cursorTime = startTime.toISOString();
    this.next = false;
    this.previous = false;
}
module.exports = CursorData;


CursorData.prototype.setCursorTime = function setCursorTime(date) {
    this.cursorTime = date.toISOString();
};