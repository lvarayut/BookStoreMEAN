'use strict';

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
		type: int,
		required: true
	},
	total: {
		type: float,
		required: true
	},
	userId: {
		type: String,
		required: true
	}
});
