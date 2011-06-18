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

suite.use('localhost', 8109)
     .setHeader('Content-Type', 'application/json')
     //
     // A GET Request to /ping
     //   should respond with 200
     //   should respond with { pong: true }
     //
     //.get('/')
       //.expect(200, { pong: true })
      //
      // A POST Request to /ping
      //   should respond with 200
      //   should respond with { dynamic_data: true }
      //
     .post('/login', {"userId": "kermit","password": "kermit"})
       .expect(200, {"success": true}).export(module);
