'use strict';

exports.test = function() {
	var prob = Math.random();
	if (prob < 0.5) return 'Error: Stress test';
	else return null;
};
