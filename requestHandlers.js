var sys = require('sys'),
    rest = require('restler')
    ;

var realm = {
  "userId": "kermit",
  "password": "kermit"
};

function start(response,postData,parsedUrl) {
  console.log("Request handler 'start' was called.");
  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/tasks?assignee=kermit" method="post">'+
    '<textarea name="text" rows="20" cols="60"></textarea>'+
    '<input type="submit" value="Submit text" />'+
    '</form>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();

}
var u = 'http://localhost:8080/activiti-rest/service';
var http_methods = {'GET': rest.get, 'PUT': rest.put, 'POST': rest.post }

function proxy(response, postData, parsedUrl, request, modifierFunction){
    var response = response;
    console.log("Request handler '"+parsedUrl.pathname+"' was called. with query '"+ parsedUrl.search +"' for method :"+request.method );
    response.writeHead(200, {"Content-Type": "text/json"});
    var myOpts = {  username: realm['userId'],
                    password: realm['password']
                 };
    if (request.method === 'POST'){
        myOpts['data'] = postData;
    } 
    
    
    
    try { 
        http_methods[request.method](u+parsedUrl.pathname+parsedUrl.search,myOpts 
        ).on('complete', modifierFunction).on('error',function(data){console.log(data);});
    } catch (error) {
        console.log(error);
    }
}

function login(response,postData,parsedUrl,request){
    console.log('>>REALM' + postData);
    try {
    realm = JSON.parse(postData);
    
    console.log('>>REALM USERID' + realm["userId"]);
    proxy(response,postData, parsedUrl, request, function(data) { 
    if(data['status'] !== undefined){
     response.writeHead(data['status']['code'], {"Content-Type": "text/json"});   
    }
    
           
            response.write(JSON.stringify(data));
            response.end();
        });
    } catch (error){
        response.writeHead(400, {"Content-Type": "text/json"});  
        response.write('INVALID JSON:')
        response.write(postData);
        response.end();
    }
}


function upload(response,postData,parsedUrl,request) {

    proxy(response,postData, parsedUrl,request, function(data) {    
            response.write(JSON.stringify(data));
            response.end();
        });        
}
function user(response,postData,parsedUrl,request) {
    console.log('>>USER' + parsedUrl.pathname);
    proxy(response,postData, parsedUrl,request, function(data) {    
                response.write(JSON.stringify(data));
                response.end();
            }); 
}

function tasks(response,postData,parsedUrl,request) {

    proxy(response,postData, parsedUrl,request, function(d) {    
    d['kundenname'] = 'DEF GmbH statisch';
    d['due-date'] = '2011-06-21';
    d['metadata'] = [
   {'field-id': 'id', 'display-when': []},
   {'field-id': 'name', 'display-format':'upper-light', 'column-title':'Kunden Name','display-when': ['landscape']},
   {'field-id': 'kundenname', 'display-format':'middle-strong', 'column-title':'Kunden Name','display-when': ['landscape']},
   {'field-id': 'due-date', 'display-format':'lower-light', 'column-title':'Kunden Name','display-when': ['landscape','portrait']}
 	];
 	console.log(d['data']);
            
 	console.log(JSON.stringify(d));
            response.write(JSON.stringify(d));
            response.end();
        });         
}


exports.user = upload; 
exports.processDefinitions = upload;
exports.processDefinition = upload;
exports.processInstance = upload;
exports.processInstances = upload;
exports.tasksSummary = upload;
exports.groups = upload;
exports.tasks = tasks;
exports.task = upload;
exports.login = login;
exports.start = start;
exports.upload = upload;
