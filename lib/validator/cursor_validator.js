var validator = require('validator');


function CursorValidator() {}
module.exports = CursorValidator;


CursorValidator.validate = function validate(data) {
    var reason = '';

    if (typeof data.resource == 'undefined' || !data.resource || data.resource.length === 0) {
        reason += '\n Resource is null or blank.';
    }

    if (typeof data.limit == 'undefined' || !data.limit || data.limit.length === 0) {
        reason += '\n Limit is null or blank.';
    }

    if (typeof data.cursorTime == 'undefined' || !data.cursorTime || data.cursorTime.length === 0) {
        reason += '\n Cursor time is null or blank.';
    }

    if (reason.length > 0) {
        throw new Error('Problems with your network input:' +reason);
    }

    return data;
};