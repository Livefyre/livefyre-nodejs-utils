var LivefyreException = require('./livefyre_exception');


function ApiException() {
    var tmp = Error.apply(this, arguments);
    tmp.name = this.name = 'ApiException';

    this.message = tmp.message;
    Object.defineProperty(this, 'stack', {
        get: function() {
            return tmp.stack
        }
    });

    return this;
}
module.exports = ApiException;
var IntermediateInheritor = function() {};
IntermediateInheritor.prototype = LivefyreException.prototype;
ApiException.prototype = new IntermediateInheritor();