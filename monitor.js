var script = process.argv[2];
var pidfile = process.argv[3];
var fs = require('fs');
require(script);
fs.writeFileSync(pidfile, process.pid);