'user strict';

var PaymentController = require('../controllers/payment');
var utils = require('./utils');

module.exports = function(app) {
    app.get('/api/paypal-create', utils.isLoggedIn, function(req, res) {
        PaymentController.createPaypal(req, res);
    });

    app.get('/api/paypal-execute', utils.isLoggedIn, function(req, res){
        PaymentController.executePaypal(req, res);
    });

    app.get('/api/paypal-cancel', utils.isLoggedIn, function(req, res){
        PaymentController.cancelPaypal(req,res);
    });

	app.get('/api/credit-create', utils.isLoggedIn, function(req, res) {
		PaymentController.createExecuteCreditCard(req, res);
	});

    app.post('/api/bs-system', utils.isLoggedIn, function(req, res) {
        PaymentController.createExecuteBSSystem(req, res);
    });    
};
