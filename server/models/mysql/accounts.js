'use strict';

module.exports = function(sequelize, DataTypes) {
	var Account = sequelize.define('Account', {
		accountId: DataTypes.STRING,
		type: DataTypes.STRING,
		balance: DataTypes.DECIMAL,
		userId: DataTypes.STRING
	});

	return Account;
};
