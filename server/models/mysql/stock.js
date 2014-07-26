'use strict';

// Stock for each product
module.exports = function(sequelize, DataTypes) {
	var Stock = sequelize.define('Stock', {
		quantity: DataTypes.STRING,
		balance: DataTypes.DECIMAL,
		userId: DataTypes.STRING,
		productId: DataTypes.STRING
	});

	return Stock;
};
