var fs = require('fs');
var path = require('path');
var _exists = fs.existsSync || path.existsSync;
var _ = module.exports = {};

_.isFile = function(path){
    return _exists(path) && fs.statSync(path).isFile();
};

_.isDir = function(path){
    return _exists(path) && fs.statSync(path).isDirectory();
};

_.find = function(path, callback){
    if(_.isDir(path)){
        fs.readdirSync(path).forEach(function(p){
            if(p[0] !== '.' && _.isDir(path + '/' + p)){
                callback(p, path + '/' + p);
            }
        });
    }
};