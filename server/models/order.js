'use strict';

/**
 * Order Schema
 */

module.exports = function(mongoose, conn) {
	var OrderSchema = mongoose.Schema({


		productIds: {
			type: Array
		},
		quantity: {
			type: Number,
			required: true
		},
		total: {
			type: Number,
			required: true
		},
		userId: {
			type: String,
			required: true
		}
	});

	mongoose.model('Order', OrderSchema);

	return {
		name: 'Order',
		schema: OrderSchema
	};

};
