var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();

// Define route files
require('./server/routes/bsmean')(app);
require('./public/routes/bsmean')(app);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/bsmean');

app.use(express.static(__dirname, 'public/assets'));

// Config body parser for JSON and form
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));  

// Catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// Error handlers

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

