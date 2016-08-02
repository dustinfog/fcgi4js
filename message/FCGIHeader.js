/**
 * @author panzd
 */
var FCGIHeader = function(type, length) {
    if(!(this instanceof FCGIHeader))
        return new FCGIHeader(type, length);
    this.version = FCGIHeader.FCGI_VERSION_1;
    this.type = type;
    this.id = FCGIHeader.ID;
    this.length = length;
};

FCGIHeader.FCGI_HEADER_LEN = 8;
FCGIHeader.FCGI_VERSION_1 = 1;
FCGIHeader.ID = 1;

/**
 *
 * @param {Buffer} buffer
 * @returns {FCGIHeader}
 */
FCGIHeader.parse = function(buffer, offset) {
    if(offset == undefined) {
        offset = 0;
    }
    var version = buffer.readUInt8(offset);
    var type = buffer.readUInt8(offset + 1);
    var id = buffer.readUInt16BE(offset + 2);
    var length = buffer.readUInt16BE(offset + 4);
    var padding = buffer.readUInt8(offset + 6);

    var header = new FCGIHeader(type, length);
    header.version = version;
    header.id = id;
    header.padding = padding;

    return header;
};

FCGIHeader.prototype.writeToBuffer = function(buffer, offset) {
    if(offset == undefined) {
        offset = 0;
    }

    offset = buffer.writeUInt8(this.version, offset);
    offset = buffer.writeUInt8(this.type, offset);
    offset = buffer.writeUInt16BE(this.id, offset);
    offset = buffer.writeUInt16BE(this.length, offset);
    buffer.writeUInt8(this.padding, offset);
};

module.exports = FCGIHeader;
