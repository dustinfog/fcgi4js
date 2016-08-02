var FCGIHeader = require('./FCGIHeader'),
    FCGIHeaderType = require('../constant/FCGIHeaderType');

/**
 *
 * @param {String|Buffer} data
 * @constructor
 */
var FCGIStdin = function(data) {
    if(typeof data == "string" || data instanceof String) {
        this.data = new Buffer(data);
    } else if(data instanceof Buffer) {
        this.data = data;
    }

    if(this.data != undefined) {
        this.header = new FCGIHeader(FCGIHeaderType.FCGI_STDIN, this.data.length);
    } else {
        this.header = new FCGIHeader(FCGIHeaderType.FCGI_STDIN, 0);
    }
};

FCGIStdin.NULL = new FCGIStdin();

FCGIStdin.prototype.__defineGetter__("length", function(){
    return FCGIHeader.FCGI_HEADER_LEN + (this.data == null ? 0 : this.data.length);
});

/**
 *
 * @param {Buffer} buffer
 * @param {int} offset
 * @returns {int}
 */
FCGIStdin.prototype.writeToBuffer = function (buffer, offset) {
    if(offset == undefined) {
        offset = 0;
    }
    this.header.writeToBuffer(buffer, offset);
    if(this.data) {
        this.data.copy(buffer, FCGIHeader.FCGI_HEADER_LEN + offset);
    }
    return offset + this.length;
};

module.exports = FCGIStdin;
