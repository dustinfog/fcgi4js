var FCGIHeaderType = require('../constant/FCGIHeaderType'),
    FCGIRole = require('../constant/FCGIRole'),
    FCGIHeader = require('./FCGIHeader');
/**
 *
 * @param {FCGIRole} role
 * @param {int} keepAlive
 * @constructor
 */
var FCGIBeginRequest = function(role, keepAlive) {
    this.header = new FCGIHeader(FCGIHeaderType.FCGI_BEGIN_REQUEST, FCGIBeginRequest.FCGI_BEGIN_REQUEST_LEN);
    this.role = role;
    if(keepAlive != undefined) {
        this.keepAlive = keepAlive;
    } else {
        this.keepAlive = false;
    }
};

FCGIBeginRequest.FCGI_BEGIN_REQUEST_LEN = 8;
FCGIBeginRequest.FCGI_KEEP_CONN = 1;
FCGIBeginRequest.LENGTH = FCGIHeader.FCGI_HEADER_LEN + FCGIBeginRequest.FCGI_BEGIN_REQUEST_LEN;

/**
 *
 * @returns {Buffer}
 */
FCGIBeginRequest.prototype.writeToBuffer = function(buffer, offset)
{
    if(offset == undefined) {
        offset = 0;
    }
    this.header.writeToBuffer(buffer, offset);
    var newOffset = buffer.writeUInt16BE(this.role, FCGIHeader.FCGI_HEADER_LEN + offset);
    buffer.writeUInt8(this.keepAlive ? 1 : 0, newOffset);
    return offset + FCGIBeginRequest.LENGTH;
};

module.exports = FCGIBeginRequest;
