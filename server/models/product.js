'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Order Schema
 */

var ProductSchema = new Schema({
	name: {
		type: String
	},
	type: {
		type: String
	},
	description: {
		type: String
	},
	company: {
		type: String
	},
	price: {
		type: Number
	},
	imagePath: {
		type: String
	},
	imageName: {
		type: String
	},
	rating: {
		type: Number
	},
	comments: {
		type: Array
	},
	userId: {
		type: String
	},
	category: {
		type: String
	},
	author: {
		type: String
	},
	publicationDate: {
		type: Date
	},
	numPage:{
		type: Number
	}	
});

module.exports = mongoose.model('Product', ProductSchema);
