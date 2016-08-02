var FCGIRole = require('./constant/FCGIRole'),
    FCGIBeginRequest = require('./message/FCGIBeginRequest'),
    FCGIParams = require('./message/FCGIParams'),
    net = require("net"),
    FCGIStdin = require('./message/FCGIStdin'),
    FCGIResponse = require('./FCGIResponse');

/**
 * @param {String} host
 * @param {int} port
 * @param {String} scriptFilename
 * @constructor
 */
var FCGIRequest = function(host, port, scriptFilename) {
    this._paramsMap = {};
    this.host = host;
    this.port = port;
    this.scriptFilename = scriptFilename;
    this.requestMethod = "GET";
    this.keepAlive = false;
};

FCGIRequest.KEY_SCRIPT_FILENAME = "SCRIPT_FILENAME";
FCGIRequest.KEY_REQUEST_METHOD = "REQUEST_METHOD";
FCGIRequest.KEY_QUERY_STRING = "QUERY_STRING";
FCGIRequest.KEY_CONTENT_TYPE = "CONTENT_TYPE";
FCGIRequest.KEY_CONTENT_LENGTH = "CONTENT_LENGTH";

FCGIRequest.prototype.__defineSetter__('scriptFilename', function(scriptFilename)
{
    this.addParams(FCGIRequest.KEY_SCRIPT_FILENAME, scriptFilename);
});

FCGIRequest.prototype.__defineGetter__('scriptFilename', function()
{
    return this.getParams(FCGIRequest.KEY_SCRIPT_FILENAME);
});

FCGIRequest.prototype.__defineSetter__('requestMethod', function(method)
{
    this.addParams(FCGIRequest.KEY_REQUEST_METHOD, method);

    if(method.toLowerCase() == "post") {
        this.contentType = "application/x-www-form-urlencoded";
    }
});

FCGIRequest.prototype.__defineGetter__('requestMethod', function(){
    return this.getParams(FCGIRequest.KEY_REQUEST_METHOD);
});

FCGIRequest.prototype.__defineSetter__('queryString', function(queryString) {
    this.addParams(FCGIRequest.KEY_QUERY_STRING, queryString);
});

FCGIRequest.prototype.__defineGetter__('queryString', function()
{
    return this.getParams(FCGIRequest.KEY_QUERY_STRING);
});

FCGIRequest.prototype.__defineSetter__('contentType', function(contentType) {
    this.addParams(FCGIRequest.KEY_CONTENT_TYPE, contentType);
});

FCGIRequest.prototype.__defineGetter__('contentType', function () {
    return this.getParams(FCGIRequest.KEY_CONTENT_TYPE);
});

FCGIRequest.prototype.__defineSetter__('contentLength', function(contentLength) {
    this.addParams(FCGIRequest.KEY_CONTENT_LENGTH, contentLength.toString());
});

FCGIRequest.prototype.__defineGetter__('contentLength', function () {
    return parseInt(this.getParams(FCGIRequest.KEY_CONTENT_LENGTH));
});

FCGIRequest.prototype.__defineSetter__('data', function(data) {
    this._data = data;
    this.contentLength = data.length;
});

FCGIRequest.prototype.__defineGetter__('data', function(){
    return this._data;
});

FCGIRequest.prototype.addParams = function(key, value)
{
    this._paramsMap[key] = value;
};

FCGIRequest.prototype.getParams = function (key)
{
    return this._paramsMap[key];
};

FCGIRequest.prototype.send = function (callback) {
    var request = this;
    var conn = net.connect({
            host: this.host,
            port: this.port
        },
        function() {
            conn.write(getBufferFromRequest(request));
        }
    );
    conn.on('data', function(data){
        var response = new FCGIResponse();
        if(response.parse(data)){
            callback(response);
            conn.destroy();
        }
    });
    conn.on('error', function(e) {
        console.log(e);
    });
};

FCGIRequest.prototype.getBuffer = getBufferFromRequest.bind(null, FCGIRequest.prototype);

/**
 * @param {FCGIRequest} request
 */
function getBufferFromRequest(request)
{
    var paramses = [];
    var stdIn = null;
    var params;

    // 计算长度
    var length = FCGIBeginRequest.LENGTH;
    for(var key in request._paramsMap)
    {
        if(!request._paramsMap.hasOwnProperty(key)) {
            continue;
        }

        params = new FCGIParams(key, request._paramsMap[key]);
        paramses.push(params);
        length += params.length;
    }

    length += FCGIParams.NULL.length;

    if(request.data != undefined || request.data != undefined) {
        stdIn = new FCGIStdin(request.data);
        length += stdIn.length;
    }

    length += FCGIStdin.NULL.length;

    // 构造buffer
    var buffer = new Buffer(length);
    buffer.fill(0, 0);

    var beginRequest = new FCGIBeginRequest(FCGIRole.RESPONDER, request.keepAlive);
    var offset = beginRequest.writeToBuffer(buffer, 0);

    for(var i = 0; i < paramses.length; i ++)
    {
        params = paramses[i];
        offset = params.writeToBuffer(buffer, offset);
    }

    offset = FCGIParams.NULL.writeToBuffer(buffer, offset);

    if(stdIn != null) {
        offset = stdIn.writeToBuffer(buffer, offset);
    }

    FCGIStdin.NULL.writeToBuffer(buffer, offset);
    return buffer;
}

module.exports = FCGIRequest;
