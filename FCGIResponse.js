var FCGIHeader = require('./message/FCGIHeader'),
    FCGIHeaderType = require('./constant/FCGIHeaderType');


var FCGIResponse = function()
{
    this.buffer = null;
    this.position = 0;
    this.currentHeader = null;
    this.skipping = 0;
    this.data = [];
    this.headers = {};
};

/**
 * @param {Buffer} data
 * @param {int} readPosition
 */
FCGIResponse.prototype.parse = function(data, readPosition)
{
    if(readPosition == undefined) {
        readPosition = 0;
    }

    if(this.skipping != 0) {
        var available = data.length - readPosition;

        if (available > this.skipping) {
            readPosition += this.skipping;
            this.skipping = 0;
        } else {
            this.skipping -= available;
            return false;
        }
    }

    var copied;
    if(this.currentHeader == null) {
        if(this.buffer == null) {
            this.buffer = new Buffer(FCGIHeader.FCGI_HEADER_LEN);
            this.buffer.fill(0);
            this.position = 0;
        }

        copied = data.copy(this.buffer, this.position, readPosition);

        readPosition += copied;
        this.position += copied;

        if(this.position == FCGIHeader.FCGI_HEADER_LEN) {
            this.currentHeader = FCGIHeader.parse(this.buffer);
            this.padding = this.currentHeader.padding;
            this.buffer = null;
        }
    }

    if(this.currentHeader != null) {
        if(this.currentHeader.type == FCGIHeaderType.FCGI_STDOUT) {
            if(this.buffer == null) {
                this.buffer = new Buffer(this.currentHeader.length);
                this.buffer.fill(0);
                this.position = 0;
            }

            copied = data.copy(this.buffer, this.position, readPosition);

            readPosition += copied;
            this.position += copied;

            if(this.position == this.currentHeader.length)
            {
                this.data.push(this.buffer);
                this.skipping = this.currentHeader.padding;

                this.buffer = null;
                this.currentHeader = null;

                return this.parse(data, readPosition);
            }
        } else if(this.currentHeader.type != FCGIHeaderType.FCGI_END_REQUEST) {
            this.skipping = this.currentHeader.length + this.currentHeader.padding;
            return this.parse(data, readPosition);
        } else {
            var headerLength = readHeaders(this.data[0], this.headers);
            this.data[0] = this.data[0].slice(headerLength);
            return true;
        }
    }

    return false;
};

/**
 *
 * @param {Buffer} dataBuffer
 * @param {Object} headers
 * @returns {number}
 */
function readHeaders(dataBuffer, headers) {
    var charSpace = 32;
    var charCR = 13;
    var charLF = 10;
    var charColon = 58;
    var i = 0, length = dataBuffer.length;
    for (; i < length;) {
        var ch = dataBuffer.readUInt8(i ++ );
        var key = "";
        var value = "";

        while (ch != charSpace && ch != charCR && ch != charLF && ch != charColon) {
            key += String.fromCharCode(ch);
            ch = dataBuffer.readUInt8(i ++ );
        }

        while (ch == charSpace || ch == charColon) {
            ch = dataBuffer.readUInt8(i ++ );
        }

        while (ch != charCR && ch != charLF) {
            value += String.fromCharCode(ch);
            ch = dataBuffer.readUInt8(i ++ );
        }

        headers[key] = value;

        var lnCount = 0;

        while ((ch == charCR || ch == charLF) && lnCount < 3) {
            ch = dataBuffer.readUInt8(i ++);
            lnCount++;
        }

        if (lnCount == 3) {
            return i;
        }
    }
}


module.exports = FCGIResponse;