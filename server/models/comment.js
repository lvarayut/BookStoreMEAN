'use strict';

/**
 * Comment Schema
 */

module.exports = function(mongoose, conn) {
	var CommentSchema = mongoose.Schema({
		user: {
			type: String
		},
		publicationDate: {
			type: Date
		},
		description: {
			type: String
		},
		rating: {
			type: Number
		}
	});

	mongoose.model('Comment', CommentSchema);

	return {
		name: 'Comment',
		schema: CommentSchema
	};

};
