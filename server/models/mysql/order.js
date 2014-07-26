'use strict';

module.exports = function(sequelize, DataTypes) {
	var Order = sequelize.define('Order', {
		quantity: DataTypes.INTEGER,
		buyerId: DataTypes.STRING,
		productId: DataTypes.STRING
	});

	return Order;
};
