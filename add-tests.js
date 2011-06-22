var APIeasy = require('api-easy');

//
// Create a APIeasy test suite for our API
//
var suite = APIeasy.describe('api');

//
// Add some discussion around the vowsjs tests.
// Not familiar with vows? Checkout:
// http://vowsjs.org 
//
suite.discuss('When using the API')
     .discuss('the Ping resource');

//
// Here we will configure our tests to use 
// http://localhost:8109 as the remote address
// and to always send 'Content-Type': 'application/json'
//

suite.use('localhost', 80).setHeader('Content-Type', 'application/json')
  .discuss('When using the activiti rest api login POST')
  .post('/enricher/login', {"userId": "kermit","password": "kermit"})
  .expect(200, {"success": true})
  
  .discuss('When querying the user kermit')
  .get('/enricher/user/kermit').expect(200,{"id":"kermit","firstName":"Kermit","lastName":"the Frog","email":"kermit@localhost"})
  .discuss('When querying kermits groups')
  .get('/enricher/user/kermit/groups')
  .expect(200,{"data":[ {"id":"accountancy","name":"Accountancy","type":"assignment"},
                        {"id":"admin","name":"System administrator","type":"security-role"},
                        {"id":"bearbeiter","name":"bearbeiter","type":"Assignment"},
                        {"id":"engineering","name":"Engineering","type":"assignment"},
                        {"id":"management","name":"Management","type":"assignment"},
                        {"id":"manager","name":"Manager","type":"security-role"},
                        {"id":"sales","name":"Sales","type":"assignment"}],
                        "total":7,"start":0,"sort":"id","order":"asc","size":7})
  .discuss('When querying the users for group bearbeiter')
  .get('/enricher/group/bearbeiter/users')
  .expect(200,{ "data": [{"id": "kermit","firstName": "Kermit","lastName": "the Frog","email": "kermit@localhost"},
  {"id": "sachbearbeiter","firstName": "","lastName": "","email": ""}],
  "total": 2,
  "start": 0,
  "sort": "id",
  "order": "asc",
  "size": 2
}

)
  .get('/enricher/process-definitions?start=0&size=10&sort=id&order=asc').expect(200)
  .get('/enricher/process-definition/RYLC:1:116')
  .expect(200, {"id":"RYLC:1:116","key":"RYLC","name":"Neues Fahrzeug reservieren",
    "version":1,"deploymentId":"110",
    "resourceName":"RYLC.bpmn20.xml",
    "diagramResourceName":"RYLC.png",
    "startFormResourceKey":"orderInputForm.form","graphicNotationDefined":"true"})
     .get('/enricher/process-definition/RYLC:1:116/form').expect(200)
     .get('/enricher/process-definition/RYLC:1:116/form').expect(200)
     .get('/process-instances').expect(200,{"data":[{"id":"117","processDefinitionId":"RYLC:1:116","businessKey":null,"startTime":"2011-06-15T21:00:05.744+02:00","startUserId":"kermit"}],"total":1,"start":0,"sort":"id","order":"asc","size":1})  
     .export(module);
