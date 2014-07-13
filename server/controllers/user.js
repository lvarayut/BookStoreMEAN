'use strict';

var async = require('async');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Account = mongoose.model('Account');
var Address = mongoose.model('Address');
var Order = mongoose.model('Order');
var History = mongoose.model('History');
var Product = mongoose.model('Product');
var colors = require('colors');

/**
 * Create a new user
 * @param  Request req
 * @param  Response res
 */
exports.create = function(req, res) {
	var user = new User();
	user.save(function(err) {
		if (!err) {} else {
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
			return console.error(err);
		}
		return res.json(result);
	});
};

/**
 * Find all accounts
 * @param  Request req
 * @param  Response res
 * @return Account json
 */
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

/**
 * Add a new account
 * @param  Request req
 * @param  Response res
 */
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

/**
 * Edit an account
 * @param  Request req
 * @param  Response res
 */
exports.editAccount = function(req, res) {
	var user = req.user;
	var newAccount = req.body;
	var account = user.accounts.id(newAccount._id);
	account.accountId = newAccount.accountId;
	account.type = newAccount.type;
	account.balance = newAccount.balance;

	user.save(function(err) {
		if (err) {
			console.error(err);
		}
	});
};

/**
 * Remove an account
 * @param  Request req
 * @param  Response res
 */
exports.removeAccount = function(req, res) {
	var user = req.user;
	var newAccount = req.body;
	var account = user.accounts.id(newAccount._id).remove();
	user.save(function(err) {
		if (err) {
			console.error(err);
		}
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
			return console.error(err);
		}
		return res.json(user.addresses);
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
	console.log('Adding');
	user.addresses.push(address);
	user.save(function(err) {
		if (err) {
			console.error(err);
		}
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
		}
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
		}
	});
};

exports.handlePayment = function(req, res) {
	var buyer = req.user;
	var addressIndex = req.body.address;
	var accountIndex = req.body.account;
	var sellers = [];
	var history = {};
	history.products = [];
	async.waterfall([
		// Find an order of a current user
		function(callback) {
			Order.findOne({
				userId: buyer._id
			}, function(err, order) {
				if (err) {
					console.error(err);
				}
				callback(null, order);
			});
		},
		// Find products
		function(order, callback) {
			Product.find({
				_id: {
					$in: order.productIds
				}
			}, function(err, products) {
				if (err) {
					console.error(err);
				}
				callback(null, order, products);
			});
		},
		// Do transactions
		function(order, products, callback) {
			// Each product
			async.each(products, function(product, eachCallback) {
				// Find seller
				User.findOne({
					_id: product.userId
				}, function(err, seller) {
					// Transfer money
					buyer.accounts[accountIndex].balance -= product.price;
					seller.accounts[0].balance += product.price;
					// Add history
					history.products.push(product);
					// Keep all sellers
					sellers.push(seller);
					eachCallback();
				});
			}, function(err) { // async.each callback
				if (err) {
					console.error(err);
				}
				callback(null, order, products);
			});
		}

	], function(err, order, products) { // async.waterfall callback
		// Begin a transaction
		User.db.db.command({
			beginTransaction: 1
		}, function(err, result) {
			if (err) {
				console.error(err);
			} else {
				console.log(result);
				async.parallel([
					// Update buyer
					function(callback) {
						buyer.save(function(err) {
							if (err) {
								console.error(err);
							}
							callback();
						});
					},
					// Delete order order
					function(callback) {
						Order.remove({
							_id: order._id
						}, function(err) {
							if (err) {
								console.error(err);
							}
							callback();
						});
					},

					// Add a transaction history
					function(callback) {
						history.buyerId = buyer._id;
						history.quantity = order.quantity;
						history.total = order.total;
						history.paymentMethod = 'Credit card';
						var historyModel = new History(history);
						historyModel.save(function(err) {
							if (err) {
								console.error(err);
							}
							callback();
						});
					},

					function(callback) {
						async.each(sellers, function(seller, eachCallback) {
							seller.save(function(err) {
								if (err) {
									console.error(err);
								}
								eachCallback();
							});
						}, function(err) {
							if (err) {
								console.error(err);
							}
							callback();

						});
					}
					// Delete the product
					function(callback) {
						async.each(products, function(product, callback) {
							Product.remove({
								_id: product._id
							}, function(err) {
								if (err) {
									console.error(err);
								}
							});
						}, function(err) {
							if (err) {
								console.error(err);
							}
							callback();
						});
					}
				], function(err, result) { // callback async.parallel
					// If error occurred, rollback is triggered. 
					if (err) {
						User.db.db.command({
							rollbackTransaction: 1
						}, function(err, result) {
							if (err) {
								console.error(err);
							}
							console.log(result);
						});
					} 
					// else {
					// 	User.db.db.command({
					// 		commitTransaction: 1
					// 	}, function(err, result) {
					// 		if (err) {
					// 			console.error(err);
					// 		}
					// 		console.log(result);
					// 	});
					// }
				}); // close async.parallel
			} // close else
		}); // close begin transaction
	}); // close async.waterfall
	res.send(200);
}
/**
 * Initialize user data
 * @param  Function callback to async
 */
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
