/**
 *
 * @param {FCGIHeader} header
 * @param {int} appStatus
 * @param {int} protocolStatus
 * @constructor
 */
var FCGIEndRequest = function(header, appStatus, protocolStatus) {
    this.header = header;
    this.appStatus = appStatus;
    this.protocolStatus = protocolStatus;
};

/**
 *
 * @param {FCGIHeader} header
 * @param {Buffer} buffer
 * @param {int} offset
 * @returns {FCGIEndRequest|*}
 */
FCGIEndRequest.parse = function(header, buffer, offset) {
   var appStatus = buffer.readUInt32BE(offset);
   var protocolStatus = buffer.readUInt8(offset + 4);
   return new FCGIEndRequest(header, appStatus, protocolStatus);
};

module.exports = FCGIEndRequest;
