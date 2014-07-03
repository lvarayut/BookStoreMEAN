'use strict';

/**
 * Include module dependencies
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Order Schema
 */

var UserSchema = new Schema({
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

module.exports = mongoose.model('User', UserSchema);

