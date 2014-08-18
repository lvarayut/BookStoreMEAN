'use strict';

/**
 * User Schema
 */

var passportLocalMongoose = require('passport-local-mongoose');
module.exports = function(mongoose, conn) {
	var AccountSchema = mongoose.model('Account').schema;
	var AddressSchema = mongoose.model('Address').schema;
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
			type: [AddressSchema]
		},
		roles: {
			type: Array
		}
	});

	UserSchema.plugin(passportLocalMongoose, {
		usernameField: 'email',
		usernameLowerCase: 'ture', //
		keylen: 256, //Specifies the length in byte of the generated key.
		iterations: 5000 //specifies the number of iterations used in pbkdf2 hashing algorithm.
	});
 	mongoose.model('User', UserSchema)
	return {
		name: 'User',
		schema: UserSchema,
	};


};
