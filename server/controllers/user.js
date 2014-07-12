'use strict';

var async = require('async');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Account = mongoose.model('Account');
var Address = mongoose.model('Address');
var Order = mongoose.model('Order');
var History = mongoose.model('Address');
var Product = mongoose.model('Product');

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
	var history = new History();
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
			async.each(products, function(product, callback) {
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
					sellers.push(sellers);
					// Delete the product from the order
					for(var i = 0; i<order.productIds.length;i++){
						if(order.productIds[i] === product._id){
							order.productIds.splice(i,1);
						}
					}
				});
				callback(null, order, products, );
			}, function(err, order, products) {
				if (err) {
					console.error(err);
				}
				else{

				}
			});
		}

	]);
					// Delete the product
	// Begin a transaction
	User.db.db.command({
		beginTransaction: 1
	}, function(err, result) {
		if (err) {
			console.error(err);
		}
		console.log(result);
	});

	// If error occurred, rollback is triggered. 

	User.db.db.command({
		rollbackTransaction: 1
	}, function(err, result) {
		if (err) {
			console.error(err);
		}
		console.log(result);
	});
	console.error(err);

	// Add a transaction history
	var history = new History({
		buyerId: buyer._id,
		quantity: order.quantity,
		total: order.total,
		paymentMethod: 'Credit card'
	});
	history.save(function(err) {
		console.error(err);
	});

};

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
