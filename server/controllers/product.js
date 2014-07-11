'use strict';

var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');
var Grid = require('gridfs-stream');
var gfs = Grid(mongoose.connection.db, mongoose.mongo);
var Product = mongoose.model('Product');
var Order = mongoose.model('Order');


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
			console.log(err);
		}
	});
};

exports.update = function(product) {
	product.update({
		id: product['_id']
	}, function(err, result) {
		if (err) {
			console.log('Error: cannot update product');
		}
	});
};

exports.findAllBooks = function(req, res) {
	Product.find(function(err, result) {
		if (err) {
			return console.error(err);
		}
		return res.json(result);
	});
};

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

exports.description = function(req, res, productId) {
	Product.findOne({
		_id: productId
	}, function(err, result) {
		if (err) {
			return console.error(err);
		}
		return res.render('description', {
			product: result
		});
	});
};

exports.getImage = function(req, res, productId) {
	var readStream = gfs.createReadStream({
		filename: productId
	});
	readStream.pipe(res);
};

exports.addToCart = function(req, res) {
	var user = req.user;
	var productId = req.body.id;
	var product, order;
	async.series([

		function(callback) {
			Product.findOne({
				_id: productId
			}, function(err, result) {
				product = result;
				callback();
			});
		},
		function(callback) {
			Order.findOne({
				userId: user._id
			}, function(err, result) {
				// If user has never ordered
				if (!result) {
					order = new Order({
						productIds: productId,
						quantity: 1,
						total: product.price,
						userId: user._id
					});
				} else {
					result.productIds.push(productId);
					result.quantity += 1;
					result.total += product.price
					order = result;
				}
				order.save(function(err) {
					if (err) {
						console.error(err);
					}
					callback();
				});
			})
		}
	]);

};

exports.findAllOrderItems = function(req, res) {
	Order.findOne(function(err, order) {
		if (err) {
			return console.error(err);
		}
		Product.find({
			_id: {
				$in: order.productIds
			}
		}, function(err, result) {
			return res.json(result);

		});


	});
};

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
