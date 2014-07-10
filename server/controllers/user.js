'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.create = function(req, res) {
	var user = new User();
	user.save(function(err) {
		if (!err) {} else {
			console.log(err);
		}
	});
};

exports.findOneByUserName = function(name) {
	User.findOne({
		username: name
	}, function(err, result) {
		if (err) {
			console.log('Error: cannot find a user');
		} else {
			return result;
		}
	});
}

exports.findAll = function() {
	User.find(function(err, result) {
		if (err) {
			return console.error(err);
		}
		return res.json(result);
	});
};


exports.init = function(callback) {
	var password = '123456789';
	User.register(new User({
		firstname: "sellerFN",
		lastname: "sllerLN",
		email: "seller@example.com",
		username: "seller",
		phoneno: "0645789631"
	}), password, function(err, user) {
		if (err) {
			console.error(err);
		}
		callback();
	});
};
