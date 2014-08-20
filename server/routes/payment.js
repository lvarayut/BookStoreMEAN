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

	app.post('/api/credit-create', function(req, res) {
		PaymentController.createCreditCard(req, res);
	});
};
