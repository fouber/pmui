var fs = require('fs');
var express = require('express');
var router = express.Router();


function find(path, callback){
    if(fs.statSync(path).isDirectory()){
        fs.readdirSync(path).forEach(function(p){
            if(p[0] !== '.' && fs.statSync(path + '/' + p).isDirectory()){
                callback(p, path + '/' + p);
            }
        });
    }
}

function list(root){
    var urls = [];
    find(root, function(path, full){
        var host = 'http://' + path.replace(/-/g, ':');
        find(full, function(path){
            var pathname = new Buffer(path, 'base64');
            var url = host + pathname.toString();
            urls.push(url);
        });
    });
    return urls;
}

/* GET home page. */
router.get('/', function (req, res) {
    var root = req.app.get('page monitor root');
    res.render('index', { title: 'Express', list: list(root) });
});

module.exports = router;
