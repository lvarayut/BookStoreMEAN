'use strict';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var swig = require('swig');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var async = require('async');
var colors = require('colors');
var app = express();

app.use(express.static(__dirname + '/public'));

/// Connect to MongoDB
mongoose.connect('mongodb://localhost/bsmean', {
    server: {
        poolSize: 1
    }
});

// Logger

//app.use(morgan());

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

// Models (order is matter, subdocuments should come before parents)
require(__dirname + '/server/models/account')(mongoose);
require(__dirname + '/server/models/address')(mongoose);
require(__dirname + '/server/models/comment')(mongoose);
require(__dirname + '/server/models/user')(mongoose);
require(__dirname + '/server/models/product')(mongoose);
require(__dirname + '/server/models/order')(mongoose);
require(__dirname + '/server/models/xhistory')(mongoose);

// Passport
app.use(cookieParser());
app.use(session({
    secret: 'bsmean'
}));
app.use(passport.initialize());
app.use(passport.session());
var User = mongoose.model('User');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());


/// Define route files
require(__dirname + '/server/routes/user')(app);
require(__dirname + '/server/routes/bsmean')(app);

//require(__dirname + '/public/routes/bsmean')(app);

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
    // res.render('error', {
    //     message: err.message,
    //     error: {}
    // });
});

app.listen(3000, function() {
    var UserController = require(__dirname + '/server/controllers/user');
    var ProductController = require(__dirname + '/server/controllers/product');
    var User = mongoose.model('User');
    var Product = mongoose.model('Product');

    // Add a default data if there is no user
    User.find(function(err, users) {
        Product.find(function(err, products) {
            if (!err && users.length === 0 && products.length !== 0) {
                async.series([

                    function(callback) {
                        UserController.init(callback)
                    },
                    function(callback) {
                        ProductController.init(callback);
                    }
                ]);
            }
        });
    });

    console.log("BSMEAN: listening on port 3000".underline.green);
});
