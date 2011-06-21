var requestHandlers = require("./requestHandlers"),util = require('util');
function route(handle,parsedUrl, response, postData, request) {
console.log(util.inspect(parsedUrl));
   var p = parsedUrl.pathname.replace(/\/activiti-rest\/service\//,"/");

     p = '/'+p.split('/')[1];
    if (typeof handle[p] === 'function') {
        console.log("handling " + p);
        handle[p](response,postData,parsedUrl,request);
    } else {
        console.log("No request handler found for " + p);
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write("404 Not found");
        response.end();
  }
}
exports.route = route; 
