'use strict';

var ProductController = require('../controllers/product');

module.exports = function(app) {

	app.get('/api/loadCarts', function(req, res) {
		//ProductController.create(req, res);
		res.send("I'm here");
	});

	app.get('/api/loadBooks', function(req, res){

	});

	// Other resquest sent to Angular routes
	app.get('*', function(req, res) {
		res.render('index', {});
	});


};
