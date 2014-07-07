'use strict';

var ProductController = require('../controllers/product');

module.exports = function(app) {

	app.get('/api/loadCarts', function(req, res) {
		//ProductController.create(req, res);
		res.send("I'm here");
	});

	app.get('/api/loadBooks/:count', function(req, res) {
		ProductController.findAllBooks(req, res);
	});

	app.get('/api/getImage/:productId', function(req, res){
		ProductController.getImage(req, res, req.param('productId'))	;
	});

	app.get('/api/searchProducts', function(req, res){
		ProductController.findByName(req, res, req.query.name);
	});

	app.get('/api/description/:productId', function(req, res){
		ProductController.description(req, res, req.param('productId'));
	});

	// Other resquest sent to Angular routes
	app.get('*', function(req, res) {
		res.render('index', {});
	});
};
