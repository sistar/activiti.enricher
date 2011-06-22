var cloudservers = require('cloudservers'),
    sys = require('sys'),util = require('util'), fs = require('fs');

function queryInfo(client){
 var example={};
 client.getFlavors(function (err, flavors) {
    // Dump the flavors we have just received
    util.inspect(flavors);
    example.flavors = flavors;
  });

  client.getImages(function (err, images) {
    // Dump the flavors we have just received
    util.inspect(images);
    example.images = images;
  });
}

function createServer(serverName, client) {
  var options = {
    name: serverName,
    image: 49, // Ubuntu 10.04 (Lucid Lynx)
    flavor: 1, // 256 server
  };  
  console.log("server create options"+ util.inspect(options));
  
  client.createServer(options, function (err, server) {
    server.setWait({ status: 'ACTIVE' }, 5000, function () {
      // Our server is now built and active, so we can install node.js on it
      fs.writeFile(process.env.HOME+'/'+serverName+'_rackspace.json', JSON.stringify(server), function (err) {
        if (err) throw err;
        console.log('Your server ' + serverName + ' is now ready.');
        console.log('IP Address: ' + server.addresses.public);
       });       
    });
  });
};

var args = process.argv.slice(2);
var serverName = args[0] || 'activiti.enricher'
var config = {
    auth : {
      username: args[1] || process.env.RACKSPACE_USER,
      apiKey: args[2] || process.env.RACKSPACE_API_KEY
    }
};
var client = cloudservers.createClient(config);
createServer(serverName, client);
