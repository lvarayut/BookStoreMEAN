'use strict';

/**
 * Product Schema
 */

module.exports = function(mongoose, conn) {
	var CommentSchema = mongoose.model('Comment').schema;
	var ProductSchema = mongoose.Schema({
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
			type: [CommentSchema]
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
		numPage: {
			type: Number
		}
	});

	mongoose.model('Product', ProductSchema);

	return {
		name: 'Product',
		schema: ProductSchema
	};
};
