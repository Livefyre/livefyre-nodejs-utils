var LivefyreUtil = require('../utils/livefyre_util');


function NetworkValidator() {}
module.exports = NetworkValidator;


NetworkValidator.validate = function validate(data) {
    var reason = '';

    if (typeof data.name == 'undefined' || !data.name || data.name.length === 0) {
        reason += '\n Name is null or blank.';
    } else if (!LivefyreUtil.endsWith(data.name, 'fyre.co')) {
        reason += '\n Name must end with \'fyre.co\'.';
    }

    if (typeof data.key == 'undefined' || !data.key || data.key.length === 0) {
        reason += '\n Key is null or blank.';
    }

    if (reason.length > 0) {
        throw new Error('Problems with your network input:' +reason);
    }

    return data;
};