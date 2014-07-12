'use strict';

/**
 * Address Schema
 */

module.exports = function(mongoose, conn) {
	var AddressSchema = mongoose.Schema({
		street: {
			type: String
		},
		city: {
			type: String
		},
		country: {
			type: String
		},
		zipcode: {
			type: String
		}
	});

	mongoose.model('Address', AddressSchema);

	return {
		name: 'Address',
		schema: AddressSchema
	};

};
