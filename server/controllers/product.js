'use strict';

var mongoose = require('mongoose');
var productSchema = require('../models/product')(mongoose);
var fs = require('fs');
var Grid = require('gridfs-stream');
var gfs = Grid(mongoose.connection.db, mongoose.mongo);
var Product = mongoose.model(productSchema.name, productSchema.schema);

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

exports.init = function() {
	var products = Product.find(function(err, result) {
		var userSchema = require('../models/user')(mongoose);
		var User = mongoose.model(userSchema.name);
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
		});
	});
};
