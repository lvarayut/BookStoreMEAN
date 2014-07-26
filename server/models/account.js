'use strict';

/**
 * Account Schema
 */

module.exports = function(mongoose, conn) {
	var AccountSchema = mongoose.Schema({
		accountId: {
			type: String
		},
		type: {
			type: String
		},
		balance: {
			type: Number,
			required: true
		}
	});

	mongoose.model('Account', AccountSchema);

	return {
		name: 'Account',
		schema: AccountSchema
	};

};
