var sys = require('sys'),
    rest = require('restler'),
    util = require('util');

var credentials = {
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
    var targetPath = parsedUrl.pathname.replace(/\/enricher/,"").replace(/\/activiti-rest\/service\//,"/");
    console.log("Request handler '"+targetPath+"' was called. with query '"+ parsedUrl.search + "' and data '" + postData + "' for method :"+request.method );
  
    var myOpts = {  username: credentials['userId'],
                    password: credentials['password']
                    Content-Type: 'application/json'
                 };
    if (request.method === 'POST' || request.method === 'PUT'  ){
        myOpts['data'] = postData;
    } 
    console.log('writing data to response:' +util.inspect(myOpts));
    try { 
        http_methods[request.method](u+targetPath+parsedUrl.search,myOpts 
        )
        .on('complete', modifierFunction)
        .on('error',
            function(data){
             console.log("error with data: "+ util.inspect(data));
              });
    } catch (error) {
        console.log(error);
    }
}
function doLogin(){
  try { 
        
        rest.post(u+'/login',{'data' : JSON.stringify(credentials)})
        .on('complete', function(){
             console.log("logged in as: "+ util.inspect(credentials));
        })
        .on('error',
            function(data){
             console.log("doLogin error with data: "+ util.inspect(data));
              });
    } catch (error) {
        console.log(error);
    }
}

function handle_credentials (jsonString) {
  console.log('>>credentials string' + jsonString);
  credentials = JSON.parse(jsonString);
  console.log('>>login credentials USERID ' + credentials["userId"]);
  console.log('>>login credentials password ' + credentials["password"]);
}

function proxy_target_call (response, postData, parsedUrl, request, resultModifier) {
  
  try {   
    doLogin();
    proxy(response,postData, parsedUrl, request, function(data,clientResponse) {
      console.log('look for Content-Type:'+util.inspect(clientResponse));
      response.writeHead(clientResponse.statusCode, clientResponse.headers);
      if (resultModifier !== undefined){
        resultModifier(data);
      }
       
      if(clientResponse.headers['content-type'].indexOf('/json') >= 0){
        response.write(JSON.stringify(data));
      } else {
        response.write(data);
      }
      response.end();
    });
    
} catch (error){
    response.writeHead(500, {"Content-Type": "text/json"});  
    response.write('ERROR' + error);
    response.end();
  }

}

function login(response,postData,parsedUrl,request){
  try {  
    handle_credentials(postData);
  } catch (error){
    response.writeHead(400, {"Content-Type": "text/json"});  
    response.write('INVALID JSON:')
    response.write(postData);
    response.end();
  }
    proxy_target_call (response, postData, parsedUrl, request);
}


function upload(response,postData,parsedUrl,request) {

    proxy_target_call (response, postData, parsedUrl, request);
}

function tasks(response,postData,parsedUrl,request) {
    
    proxy_target_call(response,postData, parsedUrl,request, function(d) {    
    for(var i in  d.data)
    {
        d.data[i]['kundenname'] = 'DEF GmbH noch statisch';
        d.data[i]['due-date'] = '2011-06-21';
    }
   
   d['metadata'] = [
   {'field-id': 'id', 'display-when': []},
   {'field-id': 'name', 'display-format':'upper-light', 'column-title':'Kunden Name','display-when': ['landscape']},
   {'field-id': 'kundenname', 'display-format':'middle-strong', 'column-title':'Kunden Name','display-when': ['landscape']},
   {'field-id': 'due-date', 'display-format':'lower-light', 'column-title':'Kunden Name','display-when': ['landscape','portrait']}
 	];}
 	);         
}


exports.user = upload; 
exports.processDefinitions = upload;
exports.processDefinition = upload;
exports.processInstance = upload;
exports.processInstances = upload;
exports.tasksSummary = upload;
exports.group = upload;
exports.tasks = tasks;
exports.task = upload;
exports.login = login;
exports.start = start;
exports.upload = upload;
