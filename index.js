var meta = require('./package.json');
var path = require('path');
var argv = process.argv;
var cliName = path.basename(argv[1], '.js');
var opt = require('minimist')(argv.slice(2), {
    string: ['root', 'port', 'out', 'r', 'p', 'o'],
    boolean: ['b'],
    alias: {
        root: 'r',
        port: 'p',
        out: 'o'
    }
});
var chalk = require('chalk');
var child_process = require('child_process');
var spawn = child_process.spawn;
var DEFAULT_SERVER_PORT = 8994;
var IS_WIN = process.platform.indexOf('win') === 0;
var fs = require('fs');
var express = require('express');
var exists = fs.existsSync || path.existsSync;
var crypto = require('crypto');

var TEMP_DIR;
function getTempDir(){
    if(!TEMP_DIR){
        var list = ['FIS_TEMP_DIR', 'LOCALAPPDATA', 'APPDATA', 'HOME'];
        var tmp;
        for(var i = 0, len = list.length; i < len; i++){
            if(tmp = process.env[list[i]]){
                break;
            }
        }
        tmp = (tmp || process.cwd()) + '/.page-monitor';
        if(!exists(tmp)){
            fs.mkdirSync(tmp);
        } else if(!fs.statSync(tmp).isDirectory()) {
            error('invalid temp path [' + tmp + ']');
        }
        TEMP_DIR = tmp;
    }
    return TEMP_DIR;
}
var SERVER_SCRIPT = __dirname + '/app.js';
var MONITOR_SCRIPT = __dirname + '/monitor.js';

function help(){
    var msg = [
        '  ',
        '  Usage: ' + cliName + ' <cmd>',
        '  ',
        '  Commands:',
        '  ',
        '    server <cmd>      start/stop ui server',
        '    run <file>        run monitor script',
        '    stop <file>       stop monitor script',
        '  ',
        '  Options:',
        '  ',
        '    -h, --help        output usage information',
        '    -v, --version     output the version number',
        '  '
    ];
    console.log(msg.join('\n'));
}

function serverHelp(){
    var msg = [
        '  ',
        '  Usage: server <command> [options]',
        '  ',
        '  Commands:',
        '  ',
        '    start            start ui server',
        '    stop             shutdown server',
        '  ',
        '  Options:',
        '  ',
        '    -p, --port <int>      server listen port',
        '    -r, --root <path>     monitor history root',
        '    -h, --help            output usage information',
        ''
    ];
    console.log(msg.join('\n'));
}

function runHelp(){
    var msg = [
        '  ',
        '  Usage: run <file>',
        '  ',
        '  Options:',
        '  ',
        '    -o, --out <file>      log output file',
        '    -h, --help            output usage information',
        '  '
    ];
    console.log(msg.join('\n'));
}

function stopHelp(){
    var msg = [
        '  ',
        '  Usage: stop <file>',
        '  ',
        '  Options:',
        '  ',
        '    -h, --help            output usage information',
        '  '
    ];
    console.log(msg.join('\n'));
}

function version(){
    console.log(meta.version);
}

function error(msg){
    console.log(chalk.red(msg + '\u0007'));
    process.exit(1);
}

function notice(msg){
    console.log(chalk.gray(msg));
}

function open(path, callback) {
    var cmd = '"' + path + '"';
    if(IS_WIN){
        cmd = 'start "" ' + cmd;
    } else {
        if(process.env['XDG_SESSION_COOKIE']){
            cmd = 'xdg-open ' + cmd;
        } else if(process.env['GNOME_DESKTOP_SESSION_ID']){
            cmd = 'gnome-open ' + cmd;
        } else {
            cmd = 'open ' + cmd;
        }
    }
    child_process.exec(cmd, callback);
}

function start(port, root){
    root = root || process.cwd();
    port = port || DEFAULT_SERVER_PORT;
    var stat = fs.statSync(root);
    if(stat.isDirectory()){
        root = fs.realpathSync(root);
        stop('server', function(pidfile){
            var args = [
                SERVER_SCRIPT,
                port, root,
                pidfile
            ];
            var server = spawn(
                process.execPath, args,
                { detached: true, stdio: [ 'ignore', 'ignore', 'ignore' ] }
            );
            server.unref();
            console.log('start server at port [' + chalk.yellow(port) + ']');
            check(pidfile, function(err){
                if(err){
                    error('unable to launch ui server at port [' + port + ']');
                } else {
                    var url = 'http://127.0.0.1' + (port == 80 ? '/' : ':' + port + '/');
                    console.log('open ' + chalk.yellow(url));
                    open(url);
                }
            });
        });
    } else {
        error('invalid monitor root path [' + root + ']');
    }
}

function stop(pidfile, callback){
    var tmp = getTempDir();
    pidfile = tmp + '/' + pidfile + '.pid';
    if(exists(pidfile)){
        var pid = fs.readFileSync(pidfile, 'utf-8').trim();
        var msg = '', list;
        if (IS_WIN) {
            list = spawn('tasklist');
        } else {
            list = spawn('ps', ['-A']);
        }
        list.stdout.on('data', function (chunk) {
            msg += chunk.toString('utf-8').toLowerCase();
        });
        list.on('exit', function() {
            msg.split(/[\r\n]+/).forEach(function(item){
                var reg = new RegExp('\\bnode\\b', 'i');
                if (reg.test(item)) {
                    var iMatch = item.match(/\d+/);
                    if (iMatch && iMatch[0] == pid) {
                        try {
                            process.kill(pid, 'SIGINT');
                            process.kill(pid, 'SIGKILL');
                        } catch (e) {}
                        notice('shutdown process [' + iMatch[0] + ']');
                    }
                }
            });
            fs.unlinkSync(pidfile);
            if (callback) {
                callback(pidfile);
            }
        });
    } else if(callback){
        callback(pidfile);
    }
}

function isFile(path){
    return exists(path) && fs.statSync(path).isFile();
}

function md5(data){
    var md5sum = crypto.createHash('md5'),
        encoding = typeof data === 'string' ? 'utf8' : 'binary';
    md5sum.update(data, encoding);
    return md5sum.digest('hex');
}

var CHECK_DELAY = 10;

function check(pidfile, callback, timeout){
    timeout = timeout || 5000;
    var count = timeout / CHECK_DELAY;
    (function(){
        if(count--){
            if(exists(pidfile)){
                callback(null, fs.readFileSync(pidfile, 'utf-8').trim());
            } else {
                setTimeout(arguments.callee, CHECK_DELAY);
            }
        } else {
            callback(true);
        }
    })();
}

function getScriptPath(file){
    var path;
    if(isFile(file)){
        path = file;
    } else if(isFile(file + '.js')) {
        path = file + '.js';
    } else {
        error('invalid script file [' + file + ']');
    }
    return fs.realpathSync(path);
}

function run(file, out){
    var path = getScriptPath(file);
    stop(md5(path), function(pidfile){
        var log = out ? fs.openSync(out, 'a') : 'ignore';
        var args = [
            MONITOR_SCRIPT,
            path,
            pidfile
        ];
        var server = spawn(
            process.execPath, args,
            { detached: true, stdio: [ 'ignore', log, log ] }
        );
        server.unref();
        check(pidfile, function(err, pid){
            if(err){
                error('unable to run script [' + path + ']');
            } else {
                console.log('running process [' + chalk.yellow(pid) + ']');
            }
        });
    });
}

function stopScript(file){
    var path = getScriptPath(file);
    stop(md5(path));
}

if(opt._.length){
    var first = opt._.shift();
    switch (first){
        case 'server':
            var second = opt._.shift();
            if(opt.h || opt.help){
                serverHelp();
            } else {
                switch (second){
                    case 'start':
                        start(opt.port || opt.p, opt.root || opt.r);
                        break;
                    case 'stop':
                        stop('server');
                        break;
                    default :
                        if(second){
                            error('unknown command [' + first + ' ' + second + ']');
                        } else {
                            serverHelp();
                        }
                }
            }
            break;
        case 'run':
            if(opt.h || opt.help){
                runHelp();
            } else {
                var file = opt._.shift();
                if(file){
                    run(file, opt.out || opt.o);
                } else {
                    error('missing script path, using run <path>');
                }
            }
            break;
        case 'stop':
            if(opt.h || opt.help){
                stopHelp();
            } else {
                var script = opt._.shift();
                if(script){
                    stopScript(script);
                } else {
                    error('missing script path, using run <path>');
                }
            }
            break;
        default :
            error('unknown command [' + first + ']');
            break;
    }
} else {
    if(opt.h || opt.help){
        help();
    } else if(opt.v || opt.version){
        version();
    } else {
        help();
    }
}