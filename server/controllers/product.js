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

exports.findAllBooks = function(req, res) {
	Product.find(function(err, result) {
		if (err) {
			return console.error(err);
		}
		return res.json(result);
	});
}

exports.getImage = function(req, res, path) {
	var readStream = gfs.createReadStream({
		filename: path
	});
}
