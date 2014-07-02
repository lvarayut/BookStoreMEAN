'use strict'

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var swig = require('swig');

var app = express();

app.use(express.static(__dirname + '/public'));

/// Connect to MongoDB
mongoose.connect('mongodb://localhost/bsmean');

/// Config body parser for JSON and form
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/// Set template engine
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/public/views');

// Cache templates only in producttion
if (app.get('env') === 'development') {
    app.set('view cache', false);
    swig.setDefaults({
        cache: false
    });
} else if (app.get('env') === 'production') {
    app.set('view cache', true);
    swig.setDefaults({
        cache: true
    });
}

/// Define route files
require(__dirname + '/server/routes/bsmean')(app);
require(__dirname + '/public/routes/bsmean')(app);

/// Error handlers

// Catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(3000);
console.log("BSMEAN: listening on port 3000");
