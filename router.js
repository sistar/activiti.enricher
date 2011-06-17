var requestHandlers = require("./requestHandlers")
function route(handle,parsedUrl, response, postData, request) {
   var p = parsedUrl.pathname.replace(/\/activiti-rest\/service\//,"/");

     p = '/'+p.split('/')[1];
    if (typeof handle[p] === 'function') {
        
        handle[p](response,postData,parsedUrl,request);
    } else {
        console.log("No request handler found for " + p);
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write("404 Not found");
        response.end();
  }
}
exports.route = route; 
