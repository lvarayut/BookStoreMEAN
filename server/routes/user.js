'use strict';

var UserController = require('../controllers/user');
var passport = require('passport');
var mongoose = require('mongoose');


module.exports = function(app) {
	app.get('/api/loadAccounts', function(req, res) {
		UserController.findAccounts(req, res);
	});

	app.post('/api/addAccount', function(req, res) {
		UserController.addAccount(req, res);
	});

	app.post('/api/editAccount', function(req, res) {
		UserController.editAccount(req, res);
	});

	app.post('/api/removeAccount', function(req, res) {
		UserController.removeAccount(req, res);
	});

	app.get('/api/loadAddresses', function(req, res) {
		UserController.findAddresses(req, res);
	});

	app.post('/api/addAddress', function(req, res) {
		UserController.addAddress(req, res);
	});

	app.post('/api/editAddress', function(req, res) {
		UserController.editAddress(req, res);
	});

	app.post('/api/removeAddress', function(req, res) {
		UserController.removeAddress(req, res);
	});

	app.get('/api/loadPersonalInfo', function(req, res){
		UserController.loadPersonalInfo(req, res);
	});

	app.post('/api/changePersonalInfo', function(req, res) {
		UserController.handleChangePersonalInfo(req, res);
	});

	app.get('/api/loadHistory', function(req, res){
		UserController.findHistories(req, res);
	});
};
