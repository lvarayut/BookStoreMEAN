'use strict';

// Get the module
var app = angular.module('BSMEAN');

app.controller('ProductController', ['$scope', '$http',
    function($scope, $http) {
        var busy = false;
        var count = 0;

        // Load more books from DB
        $scope.loadBooks = function() {
            if (busy) return;
            busy = true;
            $("#ajaxloader").show();
            var responsePromise = $http.get("/api/loadBooks/" + count);
            responsePromise.success(function(data, status, header, config) {
                if (typeof $scope.products == 'undefined') {
                    $scope.products = data;
                } else {
                    $scope.products = $scope.products.concat(data);
                }
                $("#ajaxloader").hide();
                console.log("Books are fetched out!");
                busy = false;
            });
            responsePromise.error(function(data, status, header, config) {
                console.log("Error: There are some errors occurred during the fetching products from the database");
            });
        };

        // Search
        $scope.searchProducts = function(name) {
            var responsePromise = $http.get("api/searchProducts?name=" + name);
            responsePromise.success(function(data, status, header, config) {
                $scope.products = data;
            });
            responsePromise.error(function(data, status, header, config) {
                $scope.products = [];
                console.log("Error: No data found");
            });
        };

        // Edit Book
        $scope.editBook = function(event) {
            var bookHref = event.currentTarget.attributes["data-redirect"].nodeValue;
            window.location.href = bookHref;
        };
        // Number of rating 
        $scope.getRating = function(rating) {
            if (typeof rating != 'undefined' && rating != 0)
                return new Array(parseInt(rating));
        };



        // Add review
        $scope.reviews = [];
        $scope.addComment = function() {
            // If user doesn't enter either the description field or all the input fields
            if (typeof $scope.reviewField != 'undefined' && typeof $scope.reviewField.description != 'undefined') {
                var productId = document.getElementById('productId').getAttribute('data-productId');
                $scope.reviewField.productId = productId;
                var responsePromise = $http.post("/api/addComment", angular.toJson($scope.reviewField));
                responsePromise.success(function(data, status, header, config) {
                    // In case that the user didn't login
                    if (typeof data.user == 'undefined') {
                        $scope.isLogin = false;
                    } else {
                        // Recalculate rating
                        var newData = [];
                        newData.push(data);
                        $scope.calculateRating(newData);
                        // Add the new data into array
                        $scope.review = data;
                        $scope.review.title = ellipsis(30, $scope.review.description);
                        $scope.reviews.push($scope.review);

                    }
                });
            }
        };

        // Load comments of the current book
        $scope.loadComments = function() {
            var product = {};
            product.id = document.getElementById('productId').getAttribute('data-productId');
            var responsePromise = $http.post("/api/loadComments", angular.toJson(product));
            responsePromise.success(function(data, status, header, config) {
                $scope.rating = {
                    one: 0,
                    two: 0,
                    three: 0,
                    four: 0,
                    five: 0,
                    all: 0
                };
                $scope.reviews = data;
                for (var i = 0; i < $scope.reviews.length; i++) {
                    $scope.reviews[i].title = ellipsis(30, $scope.reviews[i].description);
                }
                $scope.calculateRating($scope.reviews);
            });
            responsePromise.error(function() {
                console.log("Error: No comment found");
            });


        };

        $scope.calculateRating = function(updatedRating) {
            for (var i = 0; i < updatedRating.length; i++) {
                // Set up rating object
                switch (updatedRating[i].rating) {
                    case 1:
                        $scope.rating.one += 1;
                        break;
                    case 2:
                        $scope.rating.two += 1;
                        break;
                    case 3:
                        $scope.rating.three += 1;
                        break;
                    case 4:
                        $scope.rating.four += 1;
                        break;
                    case 5:
                        $scope.rating.five += 1;
                        break;
                }
                $scope.rating.all += 1;
            }
            // Calculate percentage for the rating bars
            $scope.rating.onePc = $scope.rating.one * 100 / $scope.rating.all;
            $scope.rating.twoPc = $scope.rating.two * 100 / $scope.rating.all;
            $scope.rating.threePc = $scope.rating.three * 100 / $scope.rating.all;
            $scope.rating.fourPc = $scope.rating.four * 100 / $scope.rating.all;
            $scope.rating.fivePc = $scope.rating.five * 100 / $scope.rating.all;

            if ($scope.rating.all == 0) {
                $scope.rating.average = 0;
            } else {
                // Calculate rating average
                $scope.rating.average = Math.round(
                    ($scope.rating.one +
                        $scope.rating.two * 2 +
                        $scope.rating.three * 3 +
                        $scope.rating.four * 4 +
                        $scope.rating.five * 5) / $scope.rating.all
                );
            }

        };

    }
]);
