define('publicHeader', function(require, exports, module) {
	'use strict';
	var $ = require('jquery');

	//顶层导航
	$('#pubBeginDesign, #pubAboutwe, #pubManageCenter').hover(function(e) {
		$(this).addClass('pointer-active');
		$(this).next().show();
	}, function(e) {
		$(this).removeClass('pointer-active');
	});

	$(document).on('mouseenter mouseleave', '.nav a.nav-name', function(e) {
		if (e.type === 'mouseenter') {
			$(this).find('li').addClass('active');
			$(this).find('ul').show();
		} else {
			$(this).find('ul').hide();
			$(this).find('li').removeClass('active');
		}
	});

	//二级导航
	$('#pubCreateWeb, #pubCreatePage').hover(function(e) {
		e.stopPropagation();
		$(this).addClass('active');
	}, function(e) {
		$(this).removeClass('active');
	});

	$('.nav ul>li:first-child').mouseleave(function(e) {
		$(this).children('ul').hide();
	});

	//点击事件响应
	$('#pubCreateWeb, #pubCreatePage').on('click', function(e) {
		if ($(this).attr('id') === 'pubCreateWeb') {
			location.href = '//wy626.com/indextemplate.shtml';
		} else {
			location.href = '//wy626.com/createpage.shtml';
		}
	});

	$('#pubAboutwe').on('click', function(e) {
		location.href = '//wy626.com/aboutwe.shtml';
	});

	$('#pubManageCenter').on('click', function(e) {
		location.href = '//wy626.com/managecenter.shtml';
	});

	$(document).on('click', '#pubLogin', function(e) {
		location.href = '//wy626.com/login.shtml';
	});

	$(document).on('click', '#pubLogout', function(e) {
		$.ajax({
			url: '//wy626.com/cgi/wy/login/logout',
			type: 'post',
			dataType: 'json',
			data: {
				account: $(this).data('account')
			}
		}).done(function(obj) {
			if (obj.errCode == 0) {
				$(this).closest('a').hide();
				$('#pubLogin').show();
			} else {
				confirm('网络异常，请稍后再试！');
			}
		}.bind(this)).fail(function(xmlHttp, status, err) {
			confirm('网络异常，请稍后再试！');
		});
	});
});