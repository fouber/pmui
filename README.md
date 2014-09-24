## Page Monitor UI

An UI wrapper of [page-monitor](https://github.com/fouber/page-monitor), to show webpage history captures and diff them.

![screenshot](./assets/screenshot.png)

## Usage

### Step 0. install ``phantomjs``

see http://phantomjs.org/download.html

### Step 1. create a directory on your machine

```bash
mkdir page-monitor
cd page-monitor
```

### Step 2. generate ``package.json``

```bash
vim package.json
```

content of package.json:

```json
{
  "name": "my-monitor",
  "description": "monitor www.google.com",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "pmui": "*",
    "page-monitor": "*"
  }
}
```

### Step 3. install packages

```bash
npm install
```

### Step 4. create ``app.js``

```bash
vim app.js
```

content of app.js:

```javascript
var app = require('../pmui');

app.set('port', process.env.PORT || 8894);

// app.set('page monitor root', process.cwd());   // path to save captures
// app.set('page monitor ext', 'jpg');            // screenshot format
// app.set('page monitor title', 'Page Monitor'); // page title

var cluster = require('cluster'),
    os = require('os'),
    cpuCount = os.cpus().length,
    logger = app.get('logger') || console;

if (cluster.isMaster) {
    for (var i = 0; i < cpuCount; i++) cluster.fork();
    cluster.on('exit', function (worker) {
        logger.error('Worker ' + worker.id + 'died :(');
        cluster.fork();
    });
} else {
    app.listen(app.get('port'), function () {
        logger.log('[%s] Express server listening on port %d',
            app.get('env').toUpperCase(), app.get('port'));
    });
}
```

### Step 5. launch ui server

```bash
node app.js
```

> It is recommended to use [forever](https://github.com/nodejitsu/forever) to run server as a daemon in the background.


### Step 6. generate monitor script

```bash
vim www.google.com.js
```

content of www.google.com.js:

```javascript
var Monitor = require('page-monitor');
var url = 'http://www.google.com/';
var opt = { /* see https://github.com/fouber/page-monitor#monitor */ };
var monitor = new Monitor(url, opt);
monitor.on('debug', function (data) {
    console.log('[DEBUG] ' + data);
});
monitor.on('error', function (data) {
    console.error('[ERROR] ' + data);
});

monitor.capture(function (code) {
    console.log('[DONE ] ' + (new Date));
});
```

### Step 7. run monitor script

```bash
node www.google.com
```

I highly recommend to use [forever](https://github.com/nodejitsu/forever) to run monitor script as a daemon in the background.

```bash
forever start --spinSleepTime 60000 www.google.com.js
```

### Upgrade

```bash
npm update
```