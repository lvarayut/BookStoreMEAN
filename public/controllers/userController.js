'use strict';

// Get the module
var app = angular.module('BSMEAN');

app.controller('UserController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
    $scope.savedMessage = false;
	// Load address of a current user
    $scope.loadAddresses = function() {
        var responsePromise = $http.get("/api/loadAddresses");
        responsePromise.success(function(data, status, header, config) {
            $scope.addresses = data || [];
        });
        responsePromise.error(function(data, status, header, config) {
            $scope.addresses = [];
            console.log("Error: No address found");
        });
    };

    // Add a new address
    $scope.upsertAddress = function() {
        // All the field are required
        if ($scope.editAddress["street"] == null ||
            $scope.editAddress["city"] == null ||
            $scope.editAddress["country"] == null ||
            $scope.editAddress["zipcode"] == null) {
            return;
        }
        // Add
        if ($scope.addressIndex == null) {
            $scope.addresses.push($scope.editAddress);
            // Add to MongoDB
            var responsePromise = $http.post("/api/addAddress", angular.toJson($scope.editAddress));
        }
        // Edit
        else {
            var address = angular.copy($scope.addresses[$scope.addressIndex]);
            var responsePromise = $http.post("/api/editAddress", $scope.editAddress);
            $scope.addresses[$scope.addressIndex] = $scope.editAddress;
            $scope.addressIndex = null;
        }
        // Clear the address field
        $scope.editAddress = null;
    };

    // Fill the form when click on the edit button
    $scope.editAddressForm = function(index) {
        $scope.editAddress = angular.copy($scope.addresses[index]);
        $scope.addressIndex = index;
    };

    // Remove an address
    $scope.removeAddress = function(index) {
        // Remove in MongoDB
        var responsePromise = $http.post("/api/removeAddress", angular.toJson($scope.addresses[index]));
        $scope.addresses.splice(index, 1);
    };

    // Load account of a current user
    $scope.loadAccounts = function() {
        var responsePromise = $http.get("/api/loadAccounts");
        responsePromise.success(function(data, status, header, config) {
            $scope.accounts = data || [];
            $('#loadingModal').modal('hide');
        });
        responsePromise.error(function(data, status, header, config) {
            $('#loadingModal').modal('show');
            $timeout(function() {
                $scope.loadAccounts();
            }, 3000);
            console.log("Error: No address found");
        });
    };

    // Add a new account
    $scope.upsertAccount = function() {
        // All the field are required
        if ($scope.editAccount["accountId"] == null ||
            $scope.editAccount["type"] == null ||
            $scope.editAccount["balance"] == null) {
            return;
        }
        // Add
        if ($scope.accountIndex == null) {
            $scope.accounts.push($scope.editAccount);
            // Add to MongoDB
            var responsePromise = $http.post("/api/addAccount", angular.toJson($scope.editAccount));
        }
        // Edit
        else {
            var account = angular.copy($scope.accounts[$scope.accountIndex]);
            var responsePromise = $http.post("/api/editAccount", $scope.editAccount);
            $scope.accounts[$scope.accountIndex] = $scope.editAccount;
            $scope.accountIndex = null;
        }
        // Clear the address field
        $scope.editAccount = null;
    };

    // Fill the form when click on the edit button
    $scope.editAccountForm = function(index) {
        $scope.editAccount = angular.copy($scope.accounts[index]);
        $scope.accountIndex = index;
    };

    // Remove an account
    $scope.removeAccount = function(index) {
        // Remove in MongoDB
        var responsePromise = $http.post("/api/removeAccount", angular.toJson($scope.accounts[index]))
        $scope.accounts.splice(index, 1);
    };

    $scope.loadPersonalInfo = function() {
        var responsePromise = $http.get("/api/loadPersonalInfo");
        responsePromise.success(function(data, status, header, config) {
            $scope.personalInfo = data;
        });
        responsePromise.error(function(data, status, header, config) {
            console.log("Error: no user found");
        });
    };

    $scope.changePersonalInfo = function() {
        $scope.savedMessage = true;
        var responsePromise = $http.post("/api/changePersonalInfo", $scope.personalInfo);
        responsePromise.success(function(data, status, header, config) {
            // Delay 3 seconds before redirect
            $timeout(function() {
                $scope.savedMessage = false;
            }, 3000);
        });
        responsePromise.error(function(data, status, header, config) {
            console.log("Error: please try again");
        });
    };
}]);
