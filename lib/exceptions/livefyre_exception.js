function LivefyreException() {
    var tmp = Error.apply(this, arguments);
    tmp.name = this.name = 'LivefyreException';

    this.message = tmp.message;
    Object.defineProperty(this, 'stack', {
        get: function() {
            return tmp.stack
        }
    });

    return this;
}
module.exports = LivefyreException;
var IntermediateInheritor = function() {};
IntermediateInheritor.prototype = Error.prototype;
LivefyreException.prototype = new IntermediateInheritor();