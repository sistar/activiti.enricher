var spawn = require('child_process').spawn,
     fs = require('fs'),
     sys = require('sys'),
     util = require('util');

function withCredentials(credentialFile,shellScript){
   fs.readFile(credentialFile , function (err, data) {
        if (err) throw err;
        dObject = JSON.parse(data);
        ssh('root', dObject.addresses.public[0], shellScript , dObject.adminPass)
        console.log(dObject.adminPass);
       });       
}

function ssh(username, host, shellScript, password) {
  
  fs.readFile(shellScript, function (err, data) {
     if (err) throw err;

     var hasPassword = false;
     
     var commands = data.toString().split('\n');
     commands.pop();
     commands = commands.join(' && ');
    
     var ssh = spawn('ssh', ['-ql' + username, host, commands]);

     ssh.on('exit', function (code, signal) {
       process.exit();
     });

     ssh.stdout.on('data', function (out) {
       process.stdout.write(out);
       if (!hasPassword) {
         var stdin = process.openStdin();
         stdin.on('data', function (chunk) {
           ssh.stdin.write(chunk);
         });
         //sh.stdin.write(password+'\n');
         //process.stdout.write('wrote password.')
       }

       hasPassword = true;
     });

     ssh.stderr.on('data', function (err) {
       process.stdout.write(err);
     });  
   });
 };

var args = process.argv.slice(1);
var serverName = args[1] || 'activiti.enricher';
var shellScript = args[2] || 'commands.sh'
var credentialFile = process.env.HOME+'/'+serverName+'_rackspace.json';
withCredentials(credentialFile,shellScript);
