## Page Monitor UI

An UI wrapper of [page-monitor](https://github.com/fouber/page-monitor), to show webpage history captures and diff them.

![screenshot](./assets/screenshot.png)

## Usage

### Setp 1. install

```bash
npm install -g pmui
```

> NOTICE: use ``-g`` option to install as global cli tool.

### Step 2. start ui server

```bash
mkdir page-monitor
cd page-monitor
pmui server start
```

### Step 4. install page-monitor

```bash
npm install page-monitor
```

> NOTICE: install into current work dir, DO NOT use ``-g`` option.


### Step 5. generate monitor script

```bash
vim www.google.com.js
```

www.google.com.js:

```javascript
var Monitor = require('page-monitor');
var url = 'http://www.google.com/';
var opt = { /* see https://github.com/fouber/page-monitor#monitor */ };
var monitor = new Monitor(url, opt);
var timeout = 60 * 1000; // 1 minute a capture
(function(){
    var callee = arguments.callee;
    monitor.capture(function (code) {
        // do something...
        console.log(monitor.log);      // useful information from phantomjs
        setTimeout(callee, timeout);   // interval
    });
})();
```

### Step 6. run monitor script

```bash
pmui run www.google.com
```


## Learn More

### pmui

```bash
> pmui -h

  Usage: pmui <cmd>

  Commands:

    server <cmd>      start/stop ui server
    run <file>        run monitor script
    stop <file>       stop monitor script

  Options:

    -h, --help        output usage information
    -v, --version     output the version number

```

### pmui server

```bash
> pmui server -h

  Usage: server <command> [options]

  Commands:

    start            start ui server
    stop             shutdown server

  Options:

    -p, --port <int>      server listen port
    -r, --root <path>     monitor history root
    -h, --help            output usage information

```

### pmui run

```bash
> pmui run -h

  Usage: run <file>

  Options:

    -o, --out <file>      log output file
    -h, --help            output usage information

```

## pmui stop


```bash
> pmui stop -h

  Usage: stop <file>

  Options:

    -h, --help            output usage information

```