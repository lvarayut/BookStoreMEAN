'use strict';


/**
 * History Schema
 */

module.exports = function(mongoose, conn) {
	var ProductSchema = mongoose.model('Product');
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
		name: 'Order',
		schema: HistorySchema
	};
};
