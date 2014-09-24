var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var debug = require('debug')('page-monitor');
var routes = require('./routes/index');
var info = require('./routes/info');

var app = express();
var root = process.cwd();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('page monitor root', root);
app.set('page monitor ext', 'jpg');
app.set('page monitor title', 'Page Monitor');

app.use(favicon());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(root));
app.use('/', routes);
app.use('/info', info);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;