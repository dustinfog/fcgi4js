/**
 * Created by panzd on 15/10/23.
 */

var   FCGIRequest = require('./FCGIRequest');

var request = new FCGIRequest('127.0.0.1', 9000, "/Users/panzd/test1.php");
request.send(function(response) {
    console.log(JSON.stringify(response.headers));
    console.log(response.data[0].toString());
});