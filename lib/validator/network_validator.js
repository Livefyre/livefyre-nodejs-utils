var validator = require('validator');


function NetworkValidator() {}
module.exports = NetworkValidator;


NetworkValidator.validate = function validate(data) {
    var reason = '';

    if (typeof data.name == 'undefined' || data.name.length === 0) {
        reason += '\n Name is null or blank.';
    }

    if (typeof data.key == 'undefined' || data.key.length === 0) {
        reason += '\n Key is null or blank.';
    }

    if (reason.length > 0) {
        throw new Error('Problems with your network input:' +reason);
    }

    return data;
};