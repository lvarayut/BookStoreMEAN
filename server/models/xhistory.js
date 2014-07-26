'use strict';


/**
 * History Schema
 */

module.exports = function(mongoose, conn) {
	var ProductSchema = mongoose.model('Product').schema;
	var HistorySchema = new mongoose.Schema({
		buyerId: {
			type: String
		},
		quantity: {
			type: Number
		},
		total: {
			type: Number
		},
		paymentMethod: {
			type: String
		},
		products: {
			type: [ProductSchema]
		}
	});

	mongoose.model('History', HistorySchema);
	return {
		name: 'History',
		schema: HistorySchema
	};
};
