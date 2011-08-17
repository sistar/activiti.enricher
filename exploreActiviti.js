var APIeasy = require('api-easy');
var assert = require('assert');
var userId = 'mam';
var userPw = 'mam';
var suite = init_suite("explore Activiti", userId, userPw);

suite
    .discuss('When logging in as known user ' +userId +' using correct credentials')
    .post('/login', {"userId": userId,"password": userPw})
    .expect(200, {"success": true})

    .discuss('When querying the user '+userId)
    .get('/user/'+userId)
    .expect(200, {"id":userId,"firstName":"Maja","lastName":"Mueller","email":"mas@opitz-consulting.com"})

    .discuss('When querying for process definitions')
    .get('/process-definitions')
    .expect('rylc present',
    function(err, res, body) {

        suite.rylc_id = JSON.parse(body)["data"].filter(function(me) {
            return (me.key == 'RYLC');
        })[0].id;

        assert.isNotNull(suite.rylc_id);
        suite.before('rylc_process_id', function(outgoing) {
            outgoing.uri = outgoing.uri.replace("${suite.rylc.id}", suite.rylc_id);


            if (outgoing.body != null) {
                bo = JSON.parse(outgoing.body);
                var name;
                for (name in bo) {
                    if (typeof bo[name] == 'string') {
                        bo[name] = bo[name].replace("${suite.rylc.id}", suite.rylc_id);
                    }
                }

                outgoing.body = JSON.stringify(bo);

            }

            console.log(outgoing);
            return outgoing;
        });

    }).next()
    .get('/process-definition/${suite.rylc.id}')
    .expect(200)
    .discuss('when starting the rylc process')
    .post('/process-instance', {
        "processDefinitionId":"${suite.rylc.id}",
        "startDate":"2011-05-22",
        "endDate":"2011-05-23",
        "location":"HAMBURG",
        "selectedType":"OBERKLASSE"
    }).expect(200)
    .expect('pi received',
    function(err, res, body) {
        console.log(body);
        suite.processInstanceId = JSON.parse(body).id;

    }).next()
    .discuss('my rylc process instance should be found by candidate-group')
    .get('/tasks?candidate-group=bearbeiter&size=1000')
    .expect('pi in task list',
    function(err, res, body) {
        console.log('PIID:' + suite.processInstanceId + ' BODY: ' + body);
        var foundTask = JSON.parse(body)["data"].filter(function(me) {
            return (me.processInstanceId == suite.processInstanceId);
        });

        assert.isNotZero(foundTask.length);
        suite.before('set task_id', function(outgoing) {
            suite.task_id = foundTask[0].id;
            outgoing.uri = outgoing.uri.replace("${suite.task_id}", suite.task_id || '<<TASK_ID_MISSING>>');
            console.log(suite.task_id);
            console.log(outgoing);
            return outgoing;
        })


    }).next().
    discuss('claiming the task is possible').
    put('/task/${suite.task_id}/claim').expect('task is claimed',
    function(err, res, body) {
        console.log(body);

    }).
    discuss('completing the task is possible').
    put('/task/${suite.task_id}/complete', {"selectedCar":"OBERKLASSE","confirm":true}).expect('task is claimed',
    function(err, res, body) {
        console.log(body);

    }).discuss('process should be in modified state').
    get('/process-instances?size=1000').expect('process progressed', function(err, res, body) {
        var foundProcessInstance = JSON.parse(body)["data"].filter(function(me) {
            return (me.id == suite.processInstanceId);
        });
        console.log(foundProcessInstance);
    }).export(module);


    /*
     .discuss('When querying kermits groups')
     .get('/user/kermit/groups')
     .expect(200, {"data":[
     {"id":"accountancy","name":"Accountancy","type":"assignment"},
     {"id":"admin","name":"System administrator","type":"security-role"},
     {"id":"bearbeiter","name":"bearbeiter","type":"Assignment"},
     {"id":"engineering","name":"Engineering","type":"assignment"},
     {"id":"management","name":"Management","type":"assignment"},
     {"id":"manager","name":"Manager","type":"security-role"},
     {"id":"sales","name":"Sales","type":"assignment"}
     ],
     "total":7,"start":0,"sort":"id","order":"asc","size":7})

     .discuss('When querying the users for group bearbeiter')
     .get('/group/bearbeiter/users')
     .expect(200, { "data": [
     {"id": "kermit","firstName": "Kermit","lastName": "the Frog","email": "kermit@localhost"},
     {"id": "sachbearbeiter","firstName": "","lastName": "","email": ""}
     ],
     "total": 2,
     "start": 0,
     "sort": "id",
     "order": "asc",
     "size": 2
     })
     .discuss('When getting the list of all process-definitions')
     .get('/process-definitions?start=0&size=10&sort=id&order=asc').expect(200)
     .get('/process-definition/RYLC:1:116')
     .expect(200, {"id":"RYLC:1:116","key":"RYLC","name":"Neues Fahrzeug reservieren",
     "version":1,"deploymentId":"110",
     "resourceName":"RYLC.bpmn20.xml",
     "diagramResourceName":"RYLC.png",
     "startFormResourceKey":"orderInputForm.form","graphicNotationDefined":"true"})
     .get('/process-definition/RYLC:1:116/form').expect(200)
     .post('/process-instance')
     .get('/process-instances').expect(200, {"data":[
     {"id":"117","processDefinitionId":"RYLC:1:116","businessKey":null,"startTime":"2011-06-15T21:00:05.744+02:00","startUserId":"kermit"}
     ],"total":1,"start":0,"sort":"id","order":"asc","size":1})
     */

function init_suite(suite_name, user, pw) {
    var activiti_host = 'localhost';
    var activiti_port = '8080';
    var activiti_url_path = '/activiti-rest/service';

    if (process.argv[2] != null) {
        var  activiti_url = process.argv[2].split('//').pop();
        activiti_host = activiti_url.split(':')[0];
        activiti_port = activiti_url.split(':')[1];

        if(activiti_port.indexOf('/') > 0){

            activiti_url_path = activiti_port.substring(activiti_port.indexOf('/'));
            if(activiti_url_path == '/'){
                activiti_url_path = ''
            }
            activiti_port = activiti_port.substring(0,activiti_port.indexOf('/'));
        }

        console.log('activiti host: %s port: %s url-path: %s', activiti_host, activiti_port,activiti_url_path);
    } else {
        console.log('no activiti url supplied.. using default host: %s port: %s url-path: %s',
            activiti_host, activiti_port, activiti_url_path);
    }
//
// Create a APIeasy test suite for our API
//
    var suite = APIeasy.describe(suite_name);
    suite.use(activiti_host, activiti_port).setHeader('Content-Type', 'application/json');
    if(activiti_url_path!= null && activiti_url_path.length > 0){
        suite.path(activiti_url_path);
    }

        suite.before('authorize', function(outgoing) {
            outgoing.headers['Authorization'] = 'Basic ' + new Buffer(user + ':' + pw).toString('base64');
            return outgoing;
        });
    return suite;
}
