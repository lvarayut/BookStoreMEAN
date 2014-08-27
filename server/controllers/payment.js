'use strict';

var async = require('async');
var mongoose = require('mongoose');
var colors = require('colors');
var mysql = require('../models/mysql');
var stress = require('../../test/stress');
var paypal = require('paypal-rest-sdk');
var ProductController = require('./product');
var OrderController = require('./order');
var User = mongoose.model('User');
var Account = mongoose.model('Account');
var Address = mongoose.model('Address');
var Order = mongoose.model('Order');
var History = mongoose.model('History');
var Product = mongoose.model('Product');

/**
 * Calcuate a total price and generate a description
 * @param  {Request}   req
 * @param  {Response}   res
 * @param  {Function} callback from the generate json
 */
function sumarizeProduct(req, res, callback) {
    // Find products in cart
    ProductController.findAllOrderItems(req, res, function(req, res, products) {
        var payment;
        var description = "";
        var total = 0;
        for (var i = 0; i < products.length; i++) {
            description += products[i].name + ': ' + products[i].price;
            if (i !== products.length - 1) description += ', ';
            total += products[i].price;
        }
        description += ' | Total: ' + total + ' euros';
        if (callback) callback(req, res, description, total)
    });

}

/**
 * Generate a paypal object
 * @param  {Request}   req
 * @param  {Response}  res
 * @param  {Function} callback from the create function
 */
function generatePaypalJSON(req, res, callback) {
    sumarizeProduct(req, res, function(req, res, description, total) {
        // Generate a payment json
        var payment = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/api/paypal-execute",
                "cancel_url": "http://localhost:3000/payment"
            },
            "transactions": [{
                "amount": {
                    "total": parseFloat(total).toFixed(2),
                    "currency": "EUR"
                },
                "description": description
            }]
        };
        if (callback) callback(res, req, payment);
    });
}

/**
 * Generate a credit object
 * @param  {Request}   req
 * @param  {Response}  res
 * @param  {Function} callback from the create function
 */
function generateCreditJSON(req, res, callback) {

    sumarizeProduct(req, res, function(req, res, description, total) {
        var paymentDetail = req.body;
        var payment = {
            "intent": "sale",
            "payer": {
                "payment_method": "credit_card",
                "funding_instruments": [{
                    "credit_card": {
                        "number": paymentDetail.cardNumber.toString(),
                        "type": paymentDetail.cardType.toString(),
                        "expire_month": parseInt(paymentDetail.expireMonth) + 1,
                        "expire_year": paymentDetail.expireYear,
                        "cvv2": paymentDetail.cvv,
                        "first_name": paymentDetail.firstName.toString(),
                        "last_name": paymentDetail.lastName.toString()
                    }
                }]
            },
            "transactions": [{
                "amount": {
                    "total": parseFloat(total).toFixed(2),
                    "currency": "EUR"
                },
                "description": description
            }]
        };
        if (callback) callback(req, res, payment);
    });
}


/**
 * Create paypal for getting ready to be executed
 * @param  {Request}   req
 * @param  {Response}  res
 */
exports.createPaypal = function(req, res) {

    generatePaypalJSON(req, res, function(res, req, payment) {
        // Generate a payment
        paypal.payment.create(payment, function(err, payment) {
            if (err) {
                console.error(err);
            } else {
                // Only paypal method has a redirect link
                if (payment.payer.payment_method === 'paypal') {
                    // Keep the payment id in the session
                    req.session.paymentId = payment.id;
                    var redirectUrl;
                    for (var i = 0; i < payment.links.length; i++) {
                        var link = payment.links[i];
                        if (link.method === 'REDIRECT') {
                            redirectUrl = link.href;
                        }
                    }
                    res.redirect(redirectUrl);
                }
            }
        });
    });

}

/**
 * Execute paypal using the created object
 * @param  {Request}   req
 * @param  {Response}  res
 */
exports.executePaypal = function(req, res) {
    var buyer = req.user;
    var paymentId = req.session.paymentId;
    // The payer id was returned when the user approved the payment
    var payerId = req.param('PayerID');
    var details = {
        "payer_id": payerId
    };

    paypal.payment.execute(paymentId, details, function(err, payment) {
        if (err) {
            console.error(err);
        } else {
            OrderController.removeAll(buyer, function(err) {
                if (err) console.error(err);
                else res.redirect('/');
            });
        }
    });
}

/**
 * Cancel the payment
 * @param  {Request}   req
 * @param  {Response}  res
 */
exports.cancelPaypal = function(req, res) {
    res.send(500);
}

/**
 * Create and Execute the credit card
 * @param  {Request}   req
 * @param  {Response}  res
 */
exports.createExecuteCreditCard = function(req, res) {
    generateCreditJSON(req, res, function(req, res, payment) {
        var buyer = req.user;
        // Generate a payment
        paypal.payment.create(payment, function(err, payment) {
            if (err) {
                console.error(err);
                res.send(500);
            } else {
                OrderController.removeAll(buyer, function(err) {
                    if (err) res.send(500);
                    else res.send(200);
                });
            }
        });
    });
}

/**
 * Create and execute by using BookStore system
 * @param  {Request}   req
 * @param  {Response}  res
 */
exports.createExecuteBSSystem = function(req, res) {
    var buyer = req.user;
    var addressIndex = req.body.address;
    var accountId = req.body.account;
    var buyerAccount;
    var sellers = [];
    var histories = [];

    async.waterfall([
        // Find a buyer account
        function(callback) {
            mysql.Account.find({
                where: {
                    id: accountId
                }
            }).success(function(account) {
                buyerAccount = account;
                callback(null);
            });
        },
        // Find an order of a current user
        function(callback) {
            mysql.Order.findAll({
                where: {
                    buyerId: buyer._id.toString()
                }
            }).success(function(orderItems) {
                callback(null, orderItems);
            });
        },
        // Find products
        function(orderItems, callback) {
            var productIds = [];
            for (var i = 0; i < orderItems.length; i++) {
                productIds.push(orderItems[i].productId);
            }
            Product.find({
                _id: {
                    $in: productIds
                }
            }, function(err, products) {
                callback(null, orderItems, products);
            });
        },

        // Edit accounts
        function(orderItems, products, callback) {
            // Each product
            async.each(products, function(product, eachCallback) {
                mysql.Account.find({
                    where: {
                        userId: product.userId
                    }
                }).success(function(sellerAccount) {
                    // Update buyer's account
                    buyerAccount.balance -= product.price;

                    var isAccountExist = false;
                    for (var i = 0; i < sellers.length; i++) {
                        // If the seller exist, update it
                        if (sellers[i].id === sellerAccount.id) {
                            sellers[i].balance += product.price;
                            isAccountExist = true;
                            break;
                        }
                    }
                    // If the seller doesn't exist
                    if (!isAccountExist) {
                        sellerAccount.balance += product.price;
                        // Keep a new seller
                        sellers.push(sellerAccount);
                    }
                    // Add history
                    var history = mysql.History.build({
                        quantity: 1,
                        total: product.price,
                        paymentMethod: 'Credit card',
                        buyerId: buyer._id.toString(),
                        productId: product._id.toString(),
                    });
                    histories.push(history);
                    eachCallback();
                });
            }, function(err) { // async.each callback
                if (err) {
                    console.error(err);
                }
                callback(null, orderItems, products);
            });
        }


    ], function(err, orderItems, products) { // async.waterfall callback
        // Begin a transaction
        mysql.sequelize.transaction(function(t) {
            console.log("BSMEAN: Transaction is started - ".green);
            async.parallel([
                // Update buyerAccount
                function(callback) {
                    buyerAccount.save({
                        transaction: t
                    }).success(function() {
                        callback();
                    }).error(function(err) {
                        callback(err);
                    });
                },
                // Update seller
                function(callback) {
                    async.each(sellers, function(seller, eachCallback) {
                        seller.save({
                            transaction: t
                        }).success(function() {
                            eachCallback();
                        }).error(function(err) {
                            eachCallback(err);
                        });
                    }, function(err) {
                        callback(err);

                    });
                },

                // Remove orderItems
                function(callback) {
                    mysql.Order.destroy({
                        buyerId: buyer._id.toString()
                    }, {
                        transaction: t
                    }).success(function() {
                        callback();
                    }).error(function(err) {
                        callback(err);
                    });
                },

                // Add history
                function(callback) {
                    async.each(histories, function(history, eachCallback) {
                        history.save({
                            transaction: t
                        }).success(function() {
                            eachCallback();
                        }).error(function(err) {
                            eachCallback(err);
                        });
                    }, function(err) {
                        callback(err);
                    });
                }
            ], function(err) {
                //err = stress.test();
                if (err) {
                    console.error(err);
                    t.rollback().success(function() {
                        console.log("BSMEAN: Transaction is rolled back - ".red);
                        res.send(500);
                    });
                } else {
                    t.commit().success(function() {
                        console.log("BSMEAN: Transaction is committed - ".green);
                        res.send(200);
                    })
                }
            });
            //});
        }); // end transaction
    });

    // async.waterfall([
    //  // Find an order of a current user
    //  function(callback) {
    //      Order.findOne({
    //          userId: buyer._id
    //      }, function(err, order) {
    //          if (err) {
    //              console.error(err);
    //          }
    //          callback(null, order);
    //      });
    //  },

    //  // Find a history of the user
    //  function(order, callback) {
    //      History.findOne({
    //          buyerId: buyer._id
    //      }, function(err, result) {
    //          // If no history found
    //          if (!result) {
    //              history = new History({
    //                  buyerId: buyer._id,
    //                  quantity: order.quantity,
    //                  total: order.total,
    //                  paymentMethod: 'Credit card',
    //                  products: []
    //              });
    //          } else {
    //              history = result;
    //          }
    //          callback(null, order);
    //      });
    //  },
    //  // Find products
    //  function(order, callback) {
    //      Product.find({
    //          _id: {
    //              $in: order.productIds
    //          }
    //      }, function(err, products) {
    //          if (err) {
    //              console.error(err);
    //          }
    //          callback(null, order, products);
    //      });
    //  },
    //  
    //  function(order, products, callback) {
    //      // Each product
    //      async.each(products, function(product, eachCallback) {
    //          // Find seller
    //          User.findOne({
    //              _id: product.userId
    //          }, function(err, seller) {
    //              // Transfer money
    //              buyer.accounts[accountIndex].balance -= product.price;
    //              var isExist = false;
    //              for (var i = 0; i < sellers.length; i++) {
    //                  // If the seller exist, update it
    //                  if (sellers[i]._id.toString() === seller._id.toString()) {
    //                      sellers[i].accounts[0].balance += product.price;
    //                      isExist = true;
    //                      break;
    //                  }
    //              }
    //              // If the seller doesn't exist
    //              if (!isExist) {
    //                  seller.accounts[0].balance += product.price;
    //                  // Keep a new seller
    //                  sellers.push(seller);
    //              }
    //              // Add history
    //              history.products.push(product);
    //              eachCallback();
    //          });
    //      }, function(err) { // async.each callback
    //          if (err) {
    //              console.error(err);
    //          }
    //          callback(null, order, products);
    //      });
    //  }

    // ], function(err, order, products) { // async.waterfall callback
    //  // Begin a transaction
    //  User.db.db.command({
    //      beginTransaction: 1
    //  }, function(err, result) {
    //      if (err) {
    //          console.error(err);
    //      } else {
    //          console.log("BSMEAN: Transaction is started - ".green + JSON.stringify(result).green);
    //          async.parallel([
    //              // Update buyer
    //              function(callback) {
    //                  buyer.save(function(err) {
    //                      if (err) {
    //                          console.error(err);
    //                      }
    //                      callback();
    //                  });
    //              },
    //              // Delete order order
    //              // function(callback) {
    //              //  Order.remove({
    //              //      _id: order._id
    //              //  }, function(err) {
    //              //      if (err) {
    //              //          console.error(err);
    //              //      }
    //              //      callback();
    //              //  });
    //              // },

    //              // Add a transaction history
    //              function(callback) {
    //                  history.save(function(err) {
    //                      if (err) {
    //                          console.error(err);
    //                      }
    //                      callback();
    //                  });
    //              },

    //              function(callback) {
    //                  async.each(sellers, function(seller, eachCallback) {
    //                      seller.save(function(err) {
    //                          if (err) {
    //                              console.error(err);
    //                          }
    //                          eachCallback();
    //                      });
    //                  }, function(err) {
    //                      if (err) {
    //                          console.error(err);
    //                      }
    //                      callback();

    //                  });
    //              }
    //              //,
    //              // Delete the product
    //              // function(callback) {
    //              //  async.each(products, function(product, eachCallback) {
    //              //      Product.remove({
    //              //          _id: product._id
    //              //      }, function(err) {
    //              //          if (err) {
    //              //              console.error(err);
    //              //          }
    //              //          eachCallback();
    //              //      });
    //              //  }, function(err) {
    //              //      if (err) {
    //              //          console.error(err);
    //              //      }
    //              //      callback();
    //              //  });
    //              // }
    //          ], function(err, result) { // callback async.parallel
    //              // If error occurred, rollback is triggered. 
    //              if (err) {
    //                  User.db.db.command({
    //                      rollbackTransaction: 1
    //                  }, function(err, result) {
    //                      if (err) {
    //                          console.error(err);
    //                      }
    //                      console.log("BSMEAN: Transaction is rolled back - ".red + JSON.stringify(result).red);
    //                      res.send(500);
    //                  });
    //              } else {
    //                  User.db.db.command({
    //                      commitTransaction: 1
    //                  }, function(err, result) {
    //                      if (err) {
    //                          console.error(err);
    //                      } else {
    //                          console.log("BSMEAN: Transaction is committed - ".green + JSON.stringify(result).green);
    //                          res.send(200);
    //                      }
    //                  });
    //              }
    //          }); // close async.parallel
    //      } // close else
    //  }); // close begin transaction
    // }); // close async.waterfall
};
