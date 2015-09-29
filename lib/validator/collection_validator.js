var validator = require('validator');

var CollectionType = require('../type/collection_type');


function CollectionValidator() {}
module.exports = CollectionValidator;


CollectionValidator.validate = function validate(data) {
    var reason = '';

    if (typeof data.articleId == 'undefined' || !data.articleId || data.articleId.length === 0) {
        reason += '\n Article ID is null or blank.';
    }

    if (typeof data.title == 'undefined' || !data.title || data.title.length === 0) {
        reason += '\n Title is null or blank.';
    } else if(data.title.length > 255) {
        reason += '\n Title is longer than 255 characters.';
    }

    if (typeof data.url == 'undefined' || !data.url || data.url.length === 0) {
        reason += '\n URL is null or blank.';
    } else if (!validator.isURL(data.url, { require_protocol: true })) {
        reason += '\n URL is not a valid url. see http://www.ietf.org/rfc/rfc2396.txt';
    }

    if (typeof data.type == 'undefined' || !data.type || data.type.length === 0) {
        data.append('\n Type is null or blank.');
    } else if (!(data.type.toUpperCase() in CollectionType)) {
        data.append('\n Type is not a valid type.');
    }

    if (reason.length > 0) {
        throw new Error('Problems with your collection input:' +reason);
    }

    return data;
};