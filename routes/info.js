var express = require('express');
var _ = require('./util.js');
var fs = require('fs');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res) {
    var root = req.app.get('page monitor root');
    var ext = req.app.get('page monitor ext');
    var path = String(req.query.path).replace(/(^|\/)\.\.(?=\/|$)/g, '');
    var full = root + '/' + path;
    var info = {
        status: 0
    };
    if(_.isDir(full)){
        if(_.isFile(full + '/latest.log')){
            var object = info.object = {};
            object.latest = String(fs.readFileSync(full + '/latest.log')).trim();
            object.ext = ext;
            object.list = [];
            _.find(full, function(dir){
                if(/^\d+$/.test(dir)){
                    object.list.push({
                        time: dir,
                        root: path,
                        path: path + '/' + dir,
                        screenshot: path + '/' + dir + '/screenshot.' + ext
                    });
                }
            });
            object.list.sort(function(a, b){
                return a.time - b.time;
            });
        }
    } else {
        info.status = 1;
        info.message = 'invalid path [' + path + ']';
    }
    res.json(info);
});

module.exports = router;