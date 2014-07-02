'use strict'

module.exports = function(app) {

	app.get('/api/loadCart', function(req, res) {
		console.log("Im here");
		res.send("I'm here");
	});

	// Other resquest sent to Angular routes
	app.get('*', function(req, res) {
		res.render('index', {});
	});


};
