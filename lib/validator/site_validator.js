var validator = require('validator');


function SiteValidator() {}
module.exports = SiteValidator;


SiteValidator.validate = function validate(data) {
    var reason = '';

    if (typeof data.id == 'undefined' || data.id.length === 0) {
        reason += '\n ID is null or blank.';
    }

    if (typeof data.key == 'undefined' || data.key.length === 0) {
        reason += '\n Key is null or blank.';
    }

    if (reason.length > 0) {
        throw new Error('Problems with your site input:' +reason);
    }

    return data;
};