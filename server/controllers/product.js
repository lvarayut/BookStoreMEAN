'use strict';

var mongoose = require('mongoose');
var Product = require('../models/product');
var fs = require('fs');
var Grid = require('gridfs-stream');
var gfs = Grid(mongoose.connection.db, mongoose.mongo);

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
		} else{
			console.log(err);
		}
	});
};

exports.getImage = function(req, res, path){
	var readStream = gfs.createReadStream({
		filename: path
	});
}
