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

LivefyreUtil.endsWith = function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};