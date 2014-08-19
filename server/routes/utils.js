'use strict';

// Verify whether user already logged in or not
exports.isLoggedIn = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        req.flash('error', 'Please sign in');
        res.redirect('/introduction');
    }
};
