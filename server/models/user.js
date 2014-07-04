'use strict';

/**
 * Order Schema
 */

module.exports = function(mongoose, conn) {
	var UserSchema = mongoose.Schema({
		userId: {
			type: String,
			required: true
		},
		firstname: {
			type: String,
			required: true
		},
		lastname: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		username: {
			type: String,
			required: true
		},
		phoneno: {
			type: String,
			required: true
		},
		accounts: {
			type: Array
		},
		addresses: {
			type: Array
		},
		roles: {
			type: Array
		}
	});
	return {
		name: 'User',
		schema: UserSchema
	};


};
