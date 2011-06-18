var server = require("./server")
var router = require("./router")
var requestHandlers = require("./requestHandlers")
var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle['/process-definitions'] = requestHandlers.processDefinitions;
handle['/process-definition'] = requestHandlers.processDefinition;
handle['/process-instance'] = requestHandlers.processInstance;
handle['/process-instances'] = requestHandlers.processInstances;
handle['/tasks-summary'] = requestHandlers.tasksSummary;
handle['/tasks'] = requestHandlers.tasks;
handle['/task'] = requestHandlers.task;
handle['/login'] = requestHandlers.login;
handle['/groups'] = requestHandlers.groups;
handle['/user'] = requestHandlers.user;



server.start(router.route, handle);
    
