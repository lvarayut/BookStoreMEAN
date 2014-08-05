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
			return console.error(err);
		} else {
			return res.json(result);
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
		return res.json(result);
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
		console.error(err.red);
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

exports.handlePayment = function(req, res) {
	var buyer = req.user;
	var addressIndex = req.body.address;
	var accountId = req.body.account;
	var buyerAccount;
	var sellers = [];
	var histories = [];
	async.waterfall([
		// Find a buyer account
		function(callback) {
			mysql.Account.find({
				where: {
					id: accountId
				}
			}).success(function(account) {
				buyerAccount = account;
				callback(null);
			});
		},
		// Find an order of a current user
		function(callback) {
			mysql.Order.findAll({
				where: {
					buyerId: buyer._id.toString()
				}
			}).success(function(orderItems) {
				callback(null, orderItems);
			});
		},
		// Find products
		function(orderItems, callback) {
			var productIds = [];
			for (var i = 0; i < orderItems.length; i++) {
				productIds.push(orderItems[i].productId);
			}
			Product.find({
				_id: {
					$in: productIds
				}
			}, function(err, products) {
				callback(null, orderItems, products);
			});
		},

		// Edit accounts
		function(orderItems, products, callback) {
			// Each product
			async.each(products, function(product, eachCallback) {
				mysql.Account.find({
					where: {
						userId: product.userId
					}
				}).success(function(sellerAccount) {
					// Update buyer's account
					buyerAccount.balance -= product.price;

					var isAccountExist = false;
					for (var i = 0; i < sellers.length; i++) {
						// If the seller exist, update it
						if (sellers[i].id === sellerAccount.id) {
							sellers[i].balance += product.price;
							isAccountExist = true;
							break;
						}
					}
					// If the seller doesn't exist
					if (!isAccountExist) {
						sellerAccount.balance += product.price;
						// Keep a new seller
						sellers.push(sellerAccount);
					}
					// Add history
					var history = mysql.History.build({
						quantity: 1,
						total: product.price,
						paymentMethod: 'Credit card',
						buyerId: buyer._id.toString(),
						productId: product._id.toString(),
					});
					histories.push(history);
					eachCallback();
				});
			}, function(err) { // async.each callback
				if (err) {
					console.error(err);
				}
				callback(null, orderItems, products);
			});
		}


	], function(err, orderItems, products) { // async.waterfall callback
		// Begin a transaction
		mysql.sequelize.transaction(function(t) {
			console.log("BSMEAN: Transaction is started - ".green);
			async.parallel([
				// Update buyerAccount
				function(callback) {
					buyerAccount.save({
						transaction: t
					}).success(function() {
						callback();
					}).error(function(err) {
						callback(err);
					});
				},
				// Update seller
				function(callback) {
					async.each(sellers, function(seller, eachCallback) {
						seller.save({
							transaction: t
						}).success(function() {
							eachCallback();
						}).error(function(err) {
							eachCallback(err);
						});
					}, function(err) {
						callback(err);

					});
				},

				// Remove orderItems
				function(callback) {
					mysql.Order.destroy({
						buyerId: buyer._id.toString()
					}, {
						transaction: t
					}).success(function() {
						callback();
					}).error(function(err) {
						callback(err);
					});
				},

				// Add history
				function(callback) {
					async.each(histories, function(history, eachCallback) {
						history.save({
							transaction: t
						}).success(function() {
							eachCallback();
						}).error(function(err) {
							eachCallback(err);
						});
					}, function(err) {
						callback(err);
					});
				}
			], function(err) {
				//err = stress.test();
				if (err) {
					console.error(err);
					t.rollback().success(function() {
						console.log("BSMEAN: Transaction is rolled back - ".red);
						res.send(500);
					});
				} else {
					t.commit().success(function() {
						console.log("BSMEAN: Transaction is committed - ".green);
						res.send(200);
					})
				}
			});
			//});
		}); // end transaction
	});
	// async.waterfall([
	// 	// Find an order of a current user
	// 	function(callback) {
	// 		Order.findOne({
	// 			userId: buyer._id
	// 		}, function(err, order) {
	// 			if (err) {
	// 				console.error(err);
	// 			}
	// 			callback(null, order);
	// 		});
	// 	},

	// 	// Find a history of the user
	// 	function(order, callback) {
	// 		History.findOne({
	// 			buyerId: buyer._id
	// 		}, function(err, result) {
	// 			// If no history found
	// 			if (!result) {
	// 				history = new History({
	// 					buyerId: buyer._id,
	// 					quantity: order.quantity,
	// 					total: order.total,
	// 					paymentMethod: 'Credit card',
	// 					products: []
	// 				});
	// 			} else {
	// 				history = result;
	// 			}
	// 			callback(null, order);
	// 		});
	// 	},
	// 	// Find products
	// 	function(order, callback) {
	// 		Product.find({
	// 			_id: {
	// 				$in: order.productIds
	// 			}
	// 		}, function(err, products) {
	// 			if (err) {
	// 				console.error(err);
	// 			}
	// 			callback(null, order, products);
	// 		});
	// 	},
	// 	
	// 	function(order, products, callback) {
	// 		// Each product
	// 		async.each(products, function(product, eachCallback) {
	// 			// Find seller
	// 			User.findOne({
	// 				_id: product.userId
	// 			}, function(err, seller) {
	// 				// Transfer money
	// 				buyer.accounts[accountIndex].balance -= product.price;
	// 				var isExist = false;
	// 				for (var i = 0; i < sellers.length; i++) {
	// 					// If the seller exist, update it
	// 					if (sellers[i]._id.toString() === seller._id.toString()) {
	// 						sellers[i].accounts[0].balance += product.price;
	// 						isExist = true;
	// 						break;
	// 					}
	// 				}
	// 				// If the seller doesn't exist
	// 				if (!isExist) {
	// 					seller.accounts[0].balance += product.price;
	// 					// Keep a new seller
	// 					sellers.push(seller);
	// 				}
	// 				// Add history
	// 				history.products.push(product);
	// 				eachCallback();
	// 			});
	// 		}, function(err) { // async.each callback
	// 			if (err) {
	// 				console.error(err);
	// 			}
	// 			callback(null, order, products);
	// 		});
	// 	}

	// ], function(err, order, products) { // async.waterfall callback
	// 	// Begin a transaction
	// 	User.db.db.command({
	// 		beginTransaction: 1
	// 	}, function(err, result) {
	// 		if (err) {
	// 			console.error(err);
	// 		} else {
	// 			console.log("BSMEAN: Transaction is started - ".green + JSON.stringify(result).green);
	// 			async.parallel([
	// 				// Update buyer
	// 				function(callback) {
	// 					buyer.save(function(err) {
	// 						if (err) {
	// 							console.error(err);
	// 						}
	// 						callback();
	// 					});
	// 				},
	// 				// Delete order order
	// 				// function(callback) {
	// 				// 	Order.remove({
	// 				// 		_id: order._id
	// 				// 	}, function(err) {
	// 				// 		if (err) {
	// 				// 			console.error(err);
	// 				// 		}
	// 				// 		callback();
	// 				// 	});
	// 				// },

	// 				// Add a transaction history
	// 				function(callback) {
	// 					history.save(function(err) {
	// 						if (err) {
	// 							console.error(err);
	// 						}
	// 						callback();
	// 					});
	// 				},

	// 				function(callback) {
	// 					async.each(sellers, function(seller, eachCallback) {
	// 						seller.save(function(err) {
	// 							if (err) {
	// 								console.error(err);
	// 							}
	// 							eachCallback();
	// 						});
	// 					}, function(err) {
	// 						if (err) {
	// 							console.error(err);
	// 						}
	// 						callback();

	// 					});
	// 				}
	// 				//,
	// 				// Delete the product
	// 				// function(callback) {
	// 				// 	async.each(products, function(product, eachCallback) {
	// 				// 		Product.remove({
	// 				// 			_id: product._id
	// 				// 		}, function(err) {
	// 				// 			if (err) {
	// 				// 				console.error(err);
	// 				// 			}
	// 				// 			eachCallback();
	// 				// 		});
	// 				// 	}, function(err) {
	// 				// 		if (err) {
	// 				// 			console.error(err);
	// 				// 		}
	// 				// 		callback();
	// 				// 	});
	// 				// }
	// 			], function(err, result) { // callback async.parallel
	// 				// If error occurred, rollback is triggered. 
	// 				if (err) {
	// 					User.db.db.command({
	// 						rollbackTransaction: 1
	// 					}, function(err, result) {
	// 						if (err) {
	// 							console.error(err);
	// 						}
	// 						console.log("BSMEAN: Transaction is rolled back - ".red + JSON.stringify(result).red);
	// 						res.send(500);
	// 					});
	// 				} else {
	// 					User.db.db.command({
	// 						commitTransaction: 1
	// 					}, function(err, result) {
	// 						if (err) {
	// 							console.error(err);
	// 						} else {
	// 							console.log("BSMEAN: Transaction is committed - ".green + JSON.stringify(result).green);
	// 							res.send(200);
	// 						}
	// 					});
	// 				}
	// 			}); // close async.parallel
	// 		} // close else
	// 	}); // close begin transaction
	// }); // close async.waterfall
}

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
					// Add product as one value property of history
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
		console.error(err.red);
	});

};
