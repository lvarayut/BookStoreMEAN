'use strict';

// Get the module
var app = angular.module('BSMEAN');

app.controller('OrderController', ['$scope', '$http', '$timeout', 'cartService',
	function($scope, $http, $timeout, cartService) {
		// Payment by credit card
		$scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		$scope.years = [];
		$scope.payment = {};
		$scope.cart = cartService.cart;
		$scope.history = [];
		for (var i = new Date().getFullYear(); i < new Date().getFullYear() + 8; i++) {
			$scope.years.push(i);
		}

		// Handle payment
		$scope.handlePayment = function() {
			if ($scope.payment.method === 'paypal') {
				window.location.href = '/api/paypal-create';
			} else if ($scope.payment.method === 'credit-card') {
				// Validate fields
				if (typeof $scope.payment.firstName == 'undefined' ||
					typeof $scope.payment.lastName == 'undefined' ||
					typeof $scope.payment.cardType == 'undefined' ||
					typeof $scope.payment.expireMonth == 'undefined' ||
					typeof $scope.payment.expireYear == 'undefined' ||
					typeof $scope.payment.cardNumber == 'undefined' ||
					typeof $scope.payment.cvv == 'undefined') {
					$scope.modalBody = '<div class="alert alert-danger"><strong>Error!</strong> please correct the red fields</div>';
					$timeout(function() {
						$scope.modalBody = '';
					}, 2000);

				} else {
					var responsePromise = $http.post('/api/credit-create', angular.toJson($scope.payment));
					responsePromise.success(function(data, status, header, config) {
						$scope.modalBody = '<div class="alert alert-success"><strong>Done!</strong>Thank you for trusting us</div><p>Redirecting... <i class="fa fa-spinner fa-spin"></i><p>';
						// Delay 2 seconds before redirect
						$timeout(function() {
							window.location.href = "/";
						}, 2000);
					});
					responsePromise.error(function(data, status, header, config) {
						$scope.modalBody = '<div class="alert alert-danger"><strong>Error!</strong> please make sure that you have correctly entered the information.</div>';
						$timeout(function() {
							$scope.modalBody = '';
						}, 2000);
					});
				}
			} else if ($scope.payment.method === 'bs-system') {
				// If the form are not filled
				if (typeof $scope.payment == 'undefined' ||
					typeof $scope.payment.account == 'undefined' ||
					typeof $scope.payment.address == 'undefined') {
					$scope.modalBody = '<div class="alert alert-danger"><strong>Error!</strong> please select both address and account.</div>';
					$timeout(function() {
						$scope.modalBody = '';
					}, 3000);
				} else {
					// BookStore system
					var responsePromise = $http.post('/api/bs-system', angular.toJson($scope.payment));
					responsePromise.success(function(data, status, header, config) {
						$scope.modalBody = '<div class="alert alert-success"><strong>Done!</strong>Thank you for trusting us</div><p>Redirecting... <i class="fa fa-spinner fa-spin"></i><p>';
						// Delay 2 seconds before redirect
						$timeout(function() {
							window.location.href = "/";
						}, 3000);

					});
					responsePromise.error(function(data, status, header, config) {
						$scope.modalBody = '<div class="alert alert-danger"><strong>Error!</strong> please check your <a href="/setting" class="alert-link">bank account</a> and try again.</div>';
						$timeout(function() {
							$scope.modalBody = '';
						}, 3000);
					});
				}

			}
		};

		// Load history
		$scope.loadHistory = function() {
			var responsePromise = $http.get("/api/loadHistory");
			responsePromise.success(function(data, status, header, config) {
				$scope.history = data;
			});
			responsePromise.error(function(data, status, header, config) {
				console.log("Error: no history found");
			});
		};

		// Load items in cart
		$scope.loadCarts = function() {
			var responsePromise = $http.get("/api/loadCarts");
			responsePromise.success(function(data, status, header, config) {
				// Verify if the page is not redirected
				if (typeof data[0] != "undefined" && typeof data[0]._id != "undefined") {
					cartService.cart.length = 0; // Empty the current cart
					cartService.cart.push.apply(cartService.cart, data); // push the new items
					$('#loadingModal').modal('hide');
				} else { // In case of no data
					cartService.cart.length = 0;
				}
			});
			responsePromise.error(function(data, status, header, config) {
				$('#loadingModal').modal('show');
				$timeout(function() {
					$scope.loadCarts();
				}, 3000);
				console.log("Error: no item found in the cart")
			});
		};

		// Add an item into cart
		$scope.addToCart = function() {
			$scope.isItemAdded = true;
			var product = {};
			product.id = document.getElementById("productId").getAttribute("data-productId");
			var responsePromise = $http.post("/api/addToCart", angular.toJson(product));
			responsePromise.success(function(data, status, header, config) {
				// Add the product into cart
				$scope.cart.push(data);
				$('#loadingModal').modal('hide');
			});
			responsePromise.error(function(data, status, header, config) {
				$('#loadingModal').modal('show');
				$timeout(function() {
					$scope.addToCart();
				}, 3000);
				console.error("Error: No product found");
			});
		};

		// Remove an item from cart
		$scope.removeFromCart = function() {
			$scope.isItemAdded = false;
			var product = {};
			product.id = document.getElementById("productId").getAttribute("data-productId");
			var responsePromise = $http.post("/api/removeFromCart", angular.toJson(product));
			responsePromise.success(function(data, status, header, config) {
				$scope.loadCarts();
				$('#loadingModal').modal('hide');
			});
			responsePromise.error(function(data, status, header, config) {
				$('#loadingModal').modal('show');
				$timeout(function() {
					$scope.removeFromCart();
				}, 3000);
				console.error("Error: No product found");
			});
		};

		// Verify whether the product is in cart of not
		$scope.isItemInCart = function() {
			var product = {};
			product.id = document.getElementById("productId").getAttribute("data-productId");
			var responsePromise = $http.post("/api/isItemInCart", angular.toJson(product));
			responsePromise.success(function(data, status, header, config) {
				if (data.result) $scope.isItemAdded = true;
				else $scope.isItemAdded = false;
				$('#loadingModal').modal('hide');
			});
			responsePromise.error(function(data, status, header, config) {
				$('#loadingModal').modal('show');
				$timeout(function() {
					$scope.isItemInCart();
				}, 3000);
				console.error("Cannot verify the item");
			});
		};

		// Calculate the total price in cart
		$scope.getTotalPriceInCart = function() {
			var totalPrice = 0;
			for (var i = 0; i < $scope.cart.length; i++) {
				totalPrice += $scope.cart[i].price;
			}
			return totalPrice;
		};

	}
]);
