'use strict';

var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');
var mysql = require('../models/mysql');
var Grid = require('gridfs-stream');
var gfs = Grid(mongoose.connection.db, mongoose.mongo);
var Product = mongoose.model('Product');
var Order = mongoose.model('Order');
var Comment = mongoose.model('Comment');

/**
 * Create a new product
 * @param  Request req
 * @param  Response res
 */
exports.create = function(req, res) {
	var product = new Product({
		name: "Product2",
		imageName: "ProductImage",
		imagePath: "/home/varayut/Documents/Internship/Projects/NodeJs/BookStoreMEAN/public/assets/images/eat-that-frog.png"
	});
	product.save(function(err) {
		if (!err) {
			var writeStream = gfs.createWriteStream({
				filename: product.imageName
			});
			fs.createReadStream(product.imagePath).pipe(writeStream);
		} else {
			console.error(err);
		}
	});
};

/**
 * Update a given product
 * @param  {Product} product
 */
exports.update = function(product) {
	product.update({
		id: product['_id']
	}, function(err, result) {
		if (err) {
			console.error('Error: cannot update product');
		}
	});
};

/**
 * Find all books
 * @param  Request req
 * @param  Response res
 * @return Book json
 */
exports.findAllBooks = function(req, res) {
	Product.find(function(err, result) {
		if (err) {
			return console.error(err);
		}
		return res.json(result);
	});
};

/**
 * Find a book from a given name
 * @param  Request req
 * @param  Response res
 * @param  String name
 * @return Product json
 */
exports.findByName = function(req, res, name) {
	Product.find({
		name: new RegExp(name, 'i')
	}, function(err, result) {

		if (err) {
			return console.error(err);
		}
		return res.json(result);
	});
}

/**
 * Description page
 * @param  {Request} req
 * @param  {Response} res
 * @param  {String} productId
 * @return {Response} Description page
 */
exports.description = function(req, res, productId) {
	Product.findOne({
		_id: productId
	}, function(err, result) {
		if (err) {
			return console.error(err);
		}
		return res.render('description', {
			product: result,
			user: req.user
		});
	});
};

/**
 * Get image stream
 * @param  {Request} req
 * @param  {Response} res
 * @param  {String} productId
 */
exports.getImage = function(req, res, productId) {
	var readStream = gfs.createReadStream({
		filename: productId
	});
	readStream.pipe(res);
};

/**
 * Add a product to the cart
 * @param  {Request} req
 * @param  {Response} res
 */
exports.addToCart = function(req, res) {
	var user = req.user;
	var productId = req.body.id;
	var product, order;

	mysql.Order.build({
		quantity: 1,
		buyerId: user._id.toString(),
		productId: productId
	}).save().error(function(err) {
		console.error(err.red);
	});

	Product.findOne({
		_id: productId
	}, function(err, result) {
		res.json(result);
	});


	// async.series([

	// 	function(callback) {
	// 		Product.findOne({
	// 			_id: productId
	// 		}, function(err, result) {
	// 			product = result;
	// 			callback();
	// 		});
	// 	},
	// 	function(callback) {
	// 		Order.findOne({
	// 			userId: user._id
	// 		}, function(err, result) {
	// 			// If user has never ordered
	// 			if (!result) {
	// 				order = new Order({
	// 					productIds: productId,
	// 					quantity: 1,
	// 					total: product.price,
	// 					userId: user._id
	// 				});
	// 			} else {
	// 				result.productIds.push(productId);
	// 				result.quantity += 1;
	// 				result.total += product.price
	// 				order = result;
	// 			}
	// 			order.save(function(err) {
	// 				if (err) {
	// 					console.error(err);
	// 				}
	// 				callback();
	// 			});
	// 		})
	// 	}
	// ], function(err) {
	// 	if (err) {
	// 		console.error(err);
	// 	}
	// 	return res.json(product);
	// });

};

/**
 * Remove the given product from cart
 * @param  {Request} req
 * @param  {Response} res
 */
exports.removeFromCart = function(req, res) {
	var user = req.user;
	var productId = req.body.id;

	mysql.Order.destroy({
		buyerId: user._id.toString(),
		productId: productId
	}).success(function() {
		res.send(200);
	}).error(function(err) {
		console.error(err);
		res.send(500);
	});
};

/**
 * Verify whether the product is in cart of not
 * @param  {Request} req
 * @param  {Response} res
 */
exports.isItemInCart = function(req, res) {
	var user = req.user;
	var productId = req.body.id;

	mysql.Order.find({
		where: {
			buyerId: user._id.toString(),
			productId: productId
		}
	}).success(function(order) {
		if (order) res.json({
			result: true
		});
		else res.json({
			result: false
		});
	}).error(function(err) {
		console.error(err);
		res.send(500);
	});
};

/**
 * Find products in cart
 * @param  {Request} req
 * @param  {Response} res
 * @return {Json} Product
 */
exports.findAllOrderItems = function(req, res) {
	var user = req.user;
	var productIds = [];
	mysql.Order.findAll({
		where: {
			buyerId: user._id.toString()
		}
	}).success(function(orders) {
		for (var i = 0; i < orders.length; i++) {
			productIds.push(orders[i].productId);
		}
		Product.find({
				_id: {
					$in: productIds
				}
			},
			function(err, products) {
				return res.json(products);
			});
	});
	// Order.findOne(function(err, order) {
	// 	if (err) {
	// 		return console.error(err);
	// 	} else if (order) {
	// 		Product.find({
	// 			_id: {
	// 				$in: order.productIds
	// 			}
	// 		}, function(err, result) {
	// 			return res.json(result);

	// 		});
	// 	}
	// });
};

exports.findAllComments = function(req, res) {
	var product = req.body;
	Product.findOne({
		_id: product.id
	}, function(err, product) {
		if (err) {
			console.error(err);
		} else {
			res.json(product.comments);
		}
	});
};

exports.addComment = function(req, res) {
	var user = req.user;
	var comment = req.body;
	comment.user = user.username || user.firstname || user.email;
	comment.publicationDate = new Date();
	Product.findOne({
		_id: comment.productId
	}, function(err, product) {
		if (err) {
			console.error(err);
		} else {
			product.comments.push(comment);
			product.save(function(saveErr) {
				if (saveErr) {
					console.error(err);
				} else {

					return res.json(comment);
				}

			});
		}
	});
};

/**
 * Initialize product data
 * @param  Function callback to async
 */
exports.init = function(callback) {
	var products = Product.find(function(err, result) {
		var User = mongoose.model('User');
		User.findOne({
			username: 'seller'
		}, function(err, user) {
			for (var i = 0; i < result.length; i++) {

				// Update userId of products
				result[i].update({
					userId: user['_id']
				}, function(err, updateResult) {
					if (err) {
						console.log(err);
					}
				});

				// Add GridFS for products' image
				var writeStream = gfs.createWriteStream({
					filename: result[i]['_id'].toString()
				});
				fs.createReadStream(__dirname + '/../..' + result[i]['imagePath']).pipe(writeStream);
			}
			callback();
		});
	});
};
