'use strict';

module.exports = function(sequelize, DataTypes) {
	var History = sequelize.define('History', {
		quantity: DataTypes.INTEGER,
		total: DataTypes.DECIMAL,
		paymentMethod: DataTypes.STRING,
		buyerId: DataTypes.STRING,
		productId: DataTypes.STRING
	});

	return History;
};
