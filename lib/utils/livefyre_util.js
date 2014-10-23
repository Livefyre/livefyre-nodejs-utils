var util = require('util');


function LivefyreUtil() {}
module.exports = LivefyreUtil;


LivefyreUtil.getNetworkFromCore = function getNetworkFromCore(core) {
    var name = core.constructor.name;
    if (name == 'Collection') {
        return core.site.network;
    }
    if (name == 'Site') {
        return core.network;
    }
    return core;
};