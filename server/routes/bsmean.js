'use strict';

var ProductController = require('../controllers/product');
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');


module.exports = function(app) {

	// Verify whether user already logged in or not
	var isLoggedIn = function (req, res, next) {
		if (req.user) {
			next();
		} else {
			req.flash('error', 'Please sign in');
			res.redirect('/introduction');
		}
	};

	app.get('/', isLoggedIn, function(req, res) {
		res.render('index', {
			user: req.user
		});
	});

	app.get('/introduction', function(req, res) {
		res.render('introduction', {
			message: req.flash('error')
		});
	});

	app.post('/signup', function(req, res) {
		User.register(new User({
			email: req.body.email,
			username: req.body.username
		}), req.body.password, function(err, user) {
			if (err) {
				console.error(err);
				return res.render('introduction', {
					user: user
				});
			}
			passport.authenticate('local')(req, res, function() {
				res.redirect('/');
			});
		});
	});

	app.post('/login', passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/introduction',
		failureFlash: 'Invalid Username and/or Password'
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/introduction');
	});

	app.get('/api/loadCarts', function(req, res) {
		//ProductController.create(req, res);
		res.send("I'm here");
	});

	app.get('/api/loadBooks/:count', function(req, res) {
		ProductController.findAllBooks(req, res);
	});

	app.get('/api/getImage/:productId', function(req, res) {
		ProductController.getImage(req, res, req.param('productId'));
	});

	app.get('/api/searchProducts', function(req, res) {
		ProductController.findByName(req, res, req.query.name);
	});

	app.get('/api/description/:productId', function(req, res) {
		ProductController.description(req, res, req.param('productId'));
	});

	// Other resquest sent to Angular routes
	app.get('*', function(req, res) {
		res.render('index', {});
	});



};
