var http = require("http");
var url = require("url");
var spawn = require('child_process').spawn;
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
   
    var child = spawn('/sbin/ifconfig', ["eth0"]); 
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
      if (/^execvp\(\)/.test(data)) {
        console.log('Failed to start child process.');
      }
    });
    child.on('exit', function (code) {
        if (code !== 0) {
            console.log('child process exited with code ' + code);
        }
    });
    child.stdout.on('data', function (out) {
        var ip= /inet addr:([\d.]+)/.exec(out)[1];
        http.createServer(onRequest).listen(8109);
        console.log("server listening at http://"+ip+":8109");
    });
    
    
}

exports.start = start;
