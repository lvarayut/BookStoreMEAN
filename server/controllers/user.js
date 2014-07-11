'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Account = mongoose.model('Account');

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

exports.findAccounts = function(req, res) {
	User.findOne({
		_id: req.user._id
	}, function(err, user) {
		if (err) {
			return console.error(err);
		}
		return res.json(user.accounts);
	});
};

exports.addAccount = function(req, res) {
	var user = req.user;
	var account = new Account(req.body);
	user.accounts.push(account);
	user.save(function(err) {
		if (err) {
			console.error(err);
		}
	});
};

exports.editAccount = function(req, res) {
	var user = req.user;
	var newAccount = req.body;
	console.log(newAccount);
	var account = user.accounts.id(newAccount._id);
	account.accountId = newAccount.accountId;
	account.type = newAccount.type;
	account.balance = newAccount.balance;
	console.log(account);
		console.log(newAccount);

	user.save(function(err) {
		if (err) {
			console.error(err);
		}
	});
};

exports.removeAccount = function(req, res) {
	console.log('Start removing');
	var user = req.user;
	var newAccount = req.body;
	var account = user.accounts.id(newAccount._id).remove();
	console.log('After');
	user.save(function(err) {
		if (err) {
			console.error(err);
		}
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
