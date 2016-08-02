var FCGIHeader = require('./FCGIHeader'),
    FCGIHeaderType = require('../constant/FCGIHeaderType');
/**
 *
 * @param {String} key
 * @param {String} value
 * @constructor
 */
var FCGIParams = function(key, value) {
    if(key == undefined)
    {
        this.header = new FCGIHeader(FCGIHeaderType.FCGI_PARAMS, 0);
    } else {
        this.key = key;
        this.value = value;

        var length = countLength(key) + countLength(value);
        this.header = new FCGIHeader(FCGIHeaderType.FCGI_PARAMS, length);
    }
};

module.exports = FCGIParams;

FCGIParams.NULL = new FCGIParams();
/**
 *
 * @param {Buffer} buffer
 * @param {int} offset
 * @returns {int}
 */
FCGIParams.prototype.writeToBuffer = function(buffer, offset)
{
    if(offset == undefined) {
        offset = 0;
    }
    this.header.writeToBuffer(buffer, offset);

    if(this.key != undefined) {
        var newOffset = bufferLength(buffer, this.key, offset + FCGIHeader.FCGI_HEADER_LEN);
        newOffset = bufferLength(buffer, this.value, newOffset);
        newOffset += buffer.write(this.key, newOffset);
        buffer.write(this.value, newOffset);
    }

    return offset + this.length;
};

FCGIParams.prototype.__defineGetter__('length', function(){
    return FCGIHeader.FCGI_HEADER_LEN + this.header.length;
});

function countLength(str) {
    var length = utf8StringLength(str);
    if (length < 0x80) {
        length += 1;
    } else {
        length += 4;
    }

    return length;
}

/**
 *
 * @param {String} str
 * @returns int
 */
function utf8StringLength(str) {
    return new Buffer(str, "UTF-8").length;
}

/**
 *
 * @param {Buffer} buffer
 * @param {String} str
 * @param {int} offset
 */
function bufferLength(buffer, str, offset)
{
    var length = utf8StringLength(str);
    if(length < 0x80) {
        return buffer.writeUInt8(length, offset)
    } else {
        offset = buffer.writeUInt8((length >>> 24) | 0x80, offset);
        offset = buffer.writeUInt8(length >>> 16, offset);
        offset = buffer.writeUInt8(length >>> 8, offset);
        return buffer.writeUInt8(length, offset);
    }
}

