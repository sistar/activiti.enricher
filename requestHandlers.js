var sys = require('sys'),
    rest = require('restler'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    events = require('events'),
    async = require('async'),
    processInstances = require('./processInstances');

var credentials = {
    "userId": "",
    "password": ""
};

function start(response, postData, parsedUrl) {
    console.log("Request handler 'start' was called.");
    var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        '<form action="/tasks?assignee=kermit" method="post">' +
        '<textarea name="text" rows="20" cols="60"></textarea>' +
        '<input type="submit" value="Submit text" />' +
        '</form>' +
        '</body>' +
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();

}
var u = 'http://localhost:8080/activiti-rest/service';
var http_methods = {'GET': rest.get, 'PUT': rest.put, 'POST': rest.post };

function proxy(response, postData, parsedUrl, request, modifierFunction) {


    var targetPath = parsedUrl.pathname.replace(/\/enricher/, "").replace(/\/activiti-rest\/service\//, "/");
    console.log("Request handler '" + targetPath + "' was called. with query '" + parsedUrl.search + "' and data '" + postData + "' for method :" + request.method);

    if (request.headers['authorization'] != null) {
        var header = request.headers['authorization'] || '',        // get the header
            token = header.split(/\s+/).pop() || '',            // and the encoded auth token
            auth = new Buffer(token, 'base64').toString(),    // convert from base64
            parts = auth.split(/:/),                          // split on colon
            username64 = parts[0],
            password64 = parts[1];
        credentials.userId = username64;
        credentials.password = password64;


    }

    if (credentials.userId == null || credentials.userId.length == 0) {
        console.log("No credentials from /login found" + util.inspect(credentials['userId']));

        /**
         * HTTP/1.1 401 Unauthorized
         < Server: Apache-Coyote/1.1
         < WWW-Authenticate: Basic realm="Activiti"
         < Content-Type: text/html;charset=utf-8
         < Content-Length: 954
         < Date: Tue, 16 Aug 2011 17:05:14 GMT

         */

        response.writeHead(401, {"Content-Type": "text/html",
            "WWW-Authenticate": 'Basic realm="Activiti"'});
        response.write("");
        response.end();
    } else {

        var myOpts = {  username: credentials['userId'],
            password: credentials['password'],
            headers: { 'Content-Type': 'application/json' }
        };
        if (request.method === 'POST' || request.method === 'PUT') {
            myOpts['data'] = postData;
        }
        console.log('writing data to response:' + util.inspect(myOpts));
        try {
            http_methods[request.method](u + targetPath + parsedUrl.search, myOpts
            )
                .on('complete', function(clientResponseData, clientResponse){
                    modifierFunction(response, clientResponse,clientResponseData);
                })
                .on('error',
                function(data) {
                    console.log("error with data: " + util.inspect(data));
                });
        } catch (error) {
            console.log(error);
        }
    }

}

function doLogin() {
    try {
        rest.post(u + '/login', {'data' : JSON.stringify(credentials)})
            .on('complete', function() {
                console.log("logged in as: " + util.inspect(credentials));
            })
            .on('error',
            function(data) {
                console.log("doLogin error with data: " + util.inspect(data));
            });
    } catch (error) {
        console.log(error);
    }
}
var noOpmodifierFunction = function(clientResponseData,requestCloser){
    var modifiedData = clientResponseData;
    requestCloser(modifiedData);
}

function proxy_target_call(response, postData, parsedUrl, request, resultModifier) {

    try {
        proxy(response, postData, parsedUrl, request, function(response, clientResponse, clientResponseData) {

            response.writeHead(clientResponse.statusCode, clientResponse.headers);


            resultModifier(clientResponseData, function(modifiedData) {
                if (clientResponse.headers['content-type'].indexOf('/json') >= 0) {
                    try {
                        var responseString = JSON.stringify(modifiedData);
                        response.write(responseString);
                    } catch (error){
                        console.log("no JSON"+util.inspect(modifiedData));
                        throw(error);
                    }

                } else {
                    response.write(modifiedData);
                }
                response.end();
            });



        });

    } catch (error) {
        console.log(error);
        response.writeHead(500, {"Content-Type": "text/json"});
        response.write('ERROR' + error);
        response.end();
    }

}

function login(response, postData, parsedUrl, request) {
    try {
        credentials = JSON.parse(postData);
    } catch (error) {
        response.writeHead(400, {"Content-Type": "text/json"});
        response.write('INVALID JSON:');
        response.write(postData);
        response.end();
    }
    proxy_target_call(response, postData, parsedUrl, request,noOpmodifierFunction);
}


function upload(response, postData, parsedUrl, request) {

    proxy_target_call(response, postData, parsedUrl, request,noOpmodifierFunction);
}

var Counter = require('./counter');
var counter = new Counter();


function processInstance(response, postData, parsedUrl, request) {
    var self = this;
    self.response = response;
    self.postData = postData;
    self.parsedUrl = parsedUrl;
    self.request = request;

    var nextStep = function(){
        proxy_target_call(self.response, self.postData, self.parsedUrl, self.request, noOpmodifierFunction);
    }

    function isStartProcessInstanceCall(request) {
        return request.method === 'POST';
    }

    var proceedFunction = function(actData){
        var postDataObject = JSON.parse(self.postData);
        postDataObject.businessKey = "ID_" + actData.maxKey;
        self.postData = JSON.stringify(postDataObject);
        nextStep();
    }


    if (isStartProcessInstanceCall(request)) {
        counter.createUniqueBusinessKey(createDelegate(this, proceedFunction));
    } else {
        nextStep();

    }

    function createDelegate(object, method) {
        return function() {
            method.apply(object, arguments)
        };
    }
}



function tasks(response, postData, parsedUrl, request) {

    var taskEnricherModifierFunction = function(clientResponseData, requestCloser) {

            var processInstanceIds = []
            for (var i in  clientResponseData.data) {
                var task = clientResponseData.data[i];
                processInstanceIds.push(task.processInstanceId);

                if (task.name.indexOf("ABC AG") >= 0) {
                    task['kundenname'] = 'ABC AG';
                } else {
                    task['kundenname'] = 'DEF GmbH';
                }
            }

            clientResponseData['metadata'] = [
                {'field-id': 'id', 'display-when': []},
                {'field-id': 'name', 'display-format':'upper-light', 'column-title':'Kunden Name','display-when': ['landscape']},
                {'field-id': 'kundenname', 'display-format':'middle-strong', 'column-title':'Kunden Name','display-when': ['landscape']},
                {'field-id': 'due-date', 'display-format':'lower-light', 'column-title':'Kunden Name','display-when': ['landscape','portrait']}
            ];
            processInstances.dueDates(20,processInstanceIds, clientResponseData ,requestCloser ) ;
        };

    proxy_target_call(response, postData, parsedUrl, request, taskEnricherModifierFunction);
}


exports.user = upload;
exports.processDefinitions = upload;
exports.processDefinition = upload;
exports.processInstance = processInstance;
exports.processInstances = upload;
exports.tasksSummary = upload;
exports.group = upload;
exports.tasks = tasks;
exports.task = upload;
exports.login = login;
exports.start = start;
exports.upload = upload;
exports.management = upload;
