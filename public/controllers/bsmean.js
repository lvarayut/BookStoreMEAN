'use strict';

// Ellipsis function
var ellipsis = function(max, currentText) {
    var currentTextArr = currentText.split(' ');
    var numWords = currentTextArr.length;
    var result = "";
    for (var i = 0; i < numWords; i++) {
        // Word length + space should less than 65 characters
        if (result.length + i < max) {
            result += currentTextArr[i] + " ";
        }
    }
    return result.trim() + "...";
};

// Ellipsis in words
$(".bs-navbar-wishlist-body a span").html(function(index, currentText) {
    return ellipsis(75, currentText);
});

// initialize the bootstrap star rating
$("#reviewStar").rating();

// AngularJS
var app = angular.module("BSMEAN", ["infinite-scroll", "ngSanitize", "ngAnimate"]);

// Change angularJs syntax
app.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[').endSymbol(']}');
}]);

app.filter("ellipsis", function() {
    return function(currentText) {
        return ellipsis(35, currentText);
    };
});

app.service('cartService', function() {
        this.cart = [];
});
