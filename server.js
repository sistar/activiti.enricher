var http = require("http");
var url = require("url");
function start(route,handle) {
    function onRequest (request,response){
        var postData = "";
        var parsedUrl = url.parse(request.url,true);
        console.log("Request for " + parsedUrl.href + " received.");

        request.setEncoding("utf8");

        request.addListener("data", function(postDataChunk) {
          postData += postDataChunk;
          console.log("Received POST data chunk '" + postDataChunk + "'.");
        });

        request.addListener("end", function() {
          route(handle, parsedUrl, response, postData, request);
        });     
    };
    
    http.createServer(onRequest).listen(8109,"192.168.30.104");
    console.log("server listening at http://localhost:8109");
}

exports.start = start;
