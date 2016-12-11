define('manageMenu', function(require, exports, module) {
	'use strict';
	var $ = require('jquery');
	$(document).on('mouseenter mouseleave', '#pubManageWeb, #pubManagePage, #pubManageAccount', function(e) {
		if (e.type === 'mouseenter') {
			$(this).addClass('active')
				.siblings().removeClass('active');
		} else {
			$(this).removeClass('active');
		}
	});
	$('#pubManageWeb').on('click', function(e) {
		location.replace('//wy626.com/manageweb.shtml');
	});
	$('#pubManagePage').on('click', function(e) {
		location.replace('//wy626.com/managepage.shtml');
	});
	$('#pubManageAccount').on('click', function(e) {
		location.replace('//wy626.com/manageaccount.shtml');
	});
});