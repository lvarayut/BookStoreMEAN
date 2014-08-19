'user strict';

var PaymentController = require('../controllers/payment');
var utils = require('./utils');

module.exports = function(app) {
    app.get('/paypal-checkout', utils.isLoggedIn, function(req, res) {
        PaymentController.createPaypal(req, res);
    });

    app.get('/paypal-execute', utils.isLoggedIn, function(req, res){
        PaymentController.executePaypal(req, res);
    });

    app.get('paypal-cancel', utils.isLoggedIn, function(req, res){
        PaymentController.cancelPaypal(req,res);
    });

	app.post('/api/handlePayment', function(req, res) {
		PaymentController.handlePayment(req, res);
	});
};
