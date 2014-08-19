'use strict';

var async = require('async');
var mongoose = require('mongoose');
var colors = require('colors');
var mysql = require('../models/mysql');
var stress = require('../../test/stress');
var User = mongoose.model('User');
var Account = mongoose.model('Account');
var Address = mongoose.model('Address');
var Order = mongoose.model('Order');
var History = mongoose.model('History');
var Product = mongoose.model('Product');

/**
 * Create a new user
 * @param  Request req
 * @param  Response res
 */
exports.create = function(req, res) {
	var user = new User();
	user.save(function(err) {
		if (!err) {
			console.log(err);
		}
	});
};

/**
 * Find a user from the given username
 * @param  String username
 * @return User
 */
exports.findOneByUserName = function(username) {
	User.findOne({
		username: username
	}, function(err, result) {
		if (err) {
			console.log('Error: cannot find a user');
		} else {
			return result;
		}
	});
}

/**
 * Find all users
 * @return User array
 */
exports.findAll = function() {
	User.find(function(err, result) {
		if (err) {
			console.error(err);
		} else {
			res.json(result);
		}
	});
};

/**
 * Find all accounts
 * @param  Request req
 * @param  Response res
 * @return Account json
 */
exports.findAccounts = function(req, res) {
	var user = req.user;
	// User.findOne({
	// 	_id: req.user._id
	// }, function(err, user) {
	// 	if (err) {
	// 		return console.error(err);
	// 	} else {
	// 		return res.json(user.accounts);
	// 	}
	// });
	mysql.Account.findAll({
		where: {
			userId: user._id.toString()
		}
	}).success(function(result) {
		res.json(result);
	}).error(function(err) {
		res.send(500);
		console.error(err);
	});
};

/**
 * Add a new account
 * @param  Request req
 * @param  Response res
 */
exports.addAccount = function(req, res) {
	var user = req.user;
	// var account = new Account(req.body);
	// user.accounts.push(account);
	// user.save(function(err) {
	// 	if (err) {
	// 		console.error(err);
	// 	}
	// });
	var sqlAccount = mysql.Account.build({
		accountId: req.body.accountId,
		type: req.body.type,
		balance: req.body.balance,
		userId: user._id.toString()
	});
	sqlAccount.save().success(function() {
		res.send(200);
	}).error(function(err) {
		res.send(500);
		console.error(err);
	});
};

/**
 * Edit an account
 * @param  Request req
 * @param  Response res
 */
exports.editAccount = function(req, res) {
	var user = req.user;
	var newAccount = req.body;
	// var account = user.accounts.id(newAccount._id);
	// account.accountId = newAccount.accountId;
	// account.type = newAccount.type;
	// account.balance = newAccount.balance;

	// user.save(function(err) {
	// 	if (err) {
	// 		console.error(err);
	// 	}
	// });
	// Find the the requested account.
	mysql.Account.find({
		where: {
			id: newAccount.id
		}
	}).success(function(result) {
		// Update the account
		result.updateAttributes({
			accountId: newAccount.accountId,
			type: newAccount.type,
			balance: newAccount.balance
		}).success(function() {
			res.send(200);
		}).error(function(err) {
			res.send(500);
			console.error(err);
		});
	});
};

/**
 * Remove an account
 * @param  Request req
 * @param  Response res
 */
exports.removeAccount = function(req, res) {
	var user = req.user;
	var account = req.body;
	// var account = user.accounts.id(newAccount._id).remove();
	// user.save(function(err) {
	// 	if (err) {
	// 		console.error(err);
	// 	}
	// });
	mysql.Account.find({
		where: {
			id: account.id
		}
	}).success(function(result) {
		// Update the account
		result.destroy().success(function() {
			res.send(200);
		});
	}).error(function(err) {
		res.send(500);
		console.error(err);
	});
};

/**
 * Find all addresses
 * @param  Request req
 * @param  Response res
 * @return Account json
 */
exports.findAddresses = function(req, res) {
	User.findOne({
		_id: req.user._id
	}, function(err, user) {
		if (err) {
			res.send(500);
			console.error(err);
		} else {
			res.json(user.addresses);
		}
	});
};

/**
 * Add a new address
 * @param  Request req
 * @param  Response res
 */
exports.addAddress = function(req, res) {
	var user = req.user;
	var address = new Address(req.body);
	user.addresses.push(address);
	user.save(function(err) {
		if (err) {
			console.error(err);
			res.send(500);
		}
		res.send(200);
	});
};

/**
 * Edit an address
 * @param  Request req
 * @param  Response res
 */
exports.editAddress = function(req, res) {
	var user = req.user;
	var newAddress = req.body;
	var address = user.addresses.id(newAddress._id);
	address.street = newAddress.street;
	address.city = newAddress.city;
	address.country = newAddress.country;
	address.zipcode = newAddress.zipcode;

	user.save(function(err) {
		if (err) {
			console.error(err);
			res.send(500);
		}
		res.send(200);
	});
};

/**
 * Remove an address
 * @param  Request req
 * @param  Response res
 */
exports.removeAddress = function(req, res) {
	var user = req.user;
	var newAddress = req.body;
	var address = user.addresses.id(newAddress._id).remove();
	user.save(function(err) {
		if (err) {
			console.error(err);
			res.send(500);
		}
		res.send(200);
	});
};

exports.loadPersonalInfo = function(req, res) {
	var user = req.user;
	res.json(user);
};

exports.handleChangePersonalInfo = function(req, res) {
	var user = req.user;
	var info = req.body;
	user.firstname = info.firstname;
	user.lastname = info.lastname;
	user.email = info.email;
	user.username = info.username;
	user.phoneno = info.phoneno;
	// if Password isn't null
	if (info.password) {
		user.setPassword(info.password, function(err, result) {
			user.save(function(err) {
				if (err) {
					console.error(err);
				}
				res.json(user);
			});
		});
	} else {
		user.save(function(err) {
			if (err) {
				console.error(err);
			}
			res.json(user);
		});
	}
};

exports.findHistories = function(req, res) {
	var user = req.user;
	mysql.History.findAll({
		where: {
			buyerId: user._id.toString()
		}
	}).success(function(histories) {
		async.each(histories, function(history, callback) {
			Product.findOne({
					_id: history.productId
				},
				function(err, product) {
					// Add product as one of history property
					history.values.product = product;
					if (err) {
						callback(err);
					}
					callback();
				});
		}, function(err) {
			if (err) {
				res.send(500);
			} else {
				res.json(histories);
			}
		});
	}).error(function(err) {
		res.send(500);
		console.error(err);
	});
};

/**
 * Initialize user data
 * @param  Function callback to async
 */
exports.init = function(callback) {
	var password = '123456789';
	var account = new Account({
		accountId: "FR 123 456 789",
		type: "Saving account",
		balance: 0
	});
	var user = new User({
		firstname: "sellerFN",
		lastname: "sllerLN",
		email: "seller@example.com",
		username: "seller",
		phoneno: "0645789631",
		accounts: account
	});
	User.register(user, password, function(err, user) {
		if (err) {
			console.error(err);
		}
		callback();
	});

	// Add seller account to mysql
	mysql.Account.build({
		accountId: "FR 123 456 789",
		type: "Saving account",
		balance: 0,
		userId: user._id.toString()
	}).save().error(function(err) {
		console.error(err);
	});

};
