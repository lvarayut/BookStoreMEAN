'use strict';

var UserController = require('../controllers/user');
var passport = require('passport');
var mongoose = require('mongoose');


module.exports = function(app) {
	app.get('/api/loadAccounts', function(req, res){
		UserController.findAccounts(req, res);
	});

	app.post('/api/addAccount', function(req, res){
		UserController.addAccount(req, res);
	});

	app.post('/api/editAccount',function(req, res){
		UserController.editAccount(req, res);
	});

	app.post('/api/removeAccount', function(req, res){
		UserController.removeAccount(req, res);
	});


};



