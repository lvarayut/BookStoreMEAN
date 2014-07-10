'use strict';

/**
 * User Schema
 */

var passportLocalMongoose = require('passport-local-mongoose');
var AccountSchema = require('./account').schema;
module.exports = function(mongoose, conn) {
	var UserSchema = mongoose.Schema({
		firstname: {
			type: String
		},
		lastname: {
			type: String
		},
		email: {
			type: String
		},
		username: {
			type: String
		},
		phoneno: {
			type: String
		},
		accounts: {
			type: [AccountSchema]
		},
		addresses: {
			type: Array
		},
		roles: {
			type: Array
		}
	});

	UserSchema.plugin(passportLocalMongoose, {
		usernameField: 'email'
	});
 	mongoose.model('User', UserSchema)
	return {
		name: 'User',
		schema: UserSchema,
	};


};
