'user strict';
var mysql = require('../models/mysql');

exports.removeAll = function(buyer, callback) {
	mysql.Order.destroy({
		buyerId: buyer._id.toString()
	}).success(function() {
		console.log('BSMEAN: The payment has been done successfully'.green);
		callback(null);
	}).error(function(err) {
		callback(err);
	});
};
