var APIeasy = require('api-easy');


suite = init_suite("enricher rest api");
ep = '/enricher';

suite.discuss('When logging in as known user kermit using correct credentials')
    .post(ep+'/login', {"userId": "kermit","password": "kermit"})
    .expect(200, {"success": true})

    .discuss('When querying the user kermit')
    .get(ep+'/user/kermit')
    .expect(200, {"id":"kermit","firstName":"Kermit","lastName":"the Frog","email":"kermit@localhost"})

    .discuss('When querying kermits groups')
    .get(ep+'/user/kermit/groups')
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
    .get(ep+'/group/bearbeiter/users')
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
    .get(ep+'/process-definitions?start=0&size=10&sort=id&order=asc').expect(200)
    .get(ep+'/process-definition/RYLC:1:116')
    .expect(200, {"id":"RYLC:1:116","key":"RYLC","name":"Neues Fahrzeug reservieren",
        "version":1,"deploymentId":"110",
        "resourceName":"RYLC.bpmn20.xml",
        "diagramResourceName":"RYLC.png",
        "startFormResourceKey":"orderInputForm.form","graphicNotationDefined":"true"})
    .get(ep+'/process-definition/RYLC:1:116/form').expect(200)
    .post(ep+'/process-instance')
    .get(ep+'/process-instances').expect(200, {"data":[
        {"id":"117","processDefinitionId":"RYLC:1:116","businessKey":null,"startTime":"2011-06-15T21:00:05.744+02:00","startUserId":"kermit"}
    ],"total":1,"start":0,"sort":"id","order":"asc","size":1})
    .export(module);

function init_suite(suite_name){
    enricher_host = 'localhost';
    enricher_port = '80';
    if (process.argv[2] != null) {
        enricher_url = process.argv[2].split('//').pop();
        enricher_host = enricher_url.split(':')[0];
        enricher_port = enricher_url.split(':')[1];
        console.log('enricher host: %s port: %s', enricher_host, enricher_port);
    } else {
        console.log('no enricher url supplied.. using default host: %s port: %s', enricher_host, enricher_port);
    }
//
// Create a APIeasy test suite for our API
//
    var suite = APIeasy.describe(suite_name);
    suite.use(enricher_host, enricher_port).setHeader('Content-Type', 'application/json');
    return suite;

};
