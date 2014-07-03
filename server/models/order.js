'use strict';

/**
 * Include module dependencies
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Order Schema
 */

var OrderSchema = new Schema({
	productIds: {
		type: Array,
		required: true
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

module.exports = mongoose.model('Order', OrderSchema);
