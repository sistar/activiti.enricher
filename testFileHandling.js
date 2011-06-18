var spawn = require('child_process').spawn,
     fs = require('fs'),
     sys = require('sys');

 function ssh(username, host, file) {
   fs.readFile(file, function (err, data) {
     if (err) throw err;

     var hasPassword = false;
     var commands = data.toString().split('\n');
     commands.pop();
     commands = commands.join(' && ');
     sys.puts(commands);
     //process.stdout.write(commands);
     
   });
 };

 var args = process.argv.slice(2);
 sys.puts('Running commands from ' + args[1] + ' as root@' + args[0]);
 ssh('root', args[0], args[1]);
