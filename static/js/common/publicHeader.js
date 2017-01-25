define('publicHeader', function(require, exports, module) {
	'use strict';
	var $ = require('jquery'),
		_cookie = require('libCookie');

	//校验登录
	(function() {
		var user = _cookie.get('_user_'),
			userName = _cookie.get('username'),
			locate = location.href;
		if (user !== null) {
			$.ajax({
				url: '//wy626.com/cgi/wy/login/check',
				type: 'post',
				dataType: 'json',
				data: user
			}).done(function(obj) {
				if (obj.errCode == 0) {
					$('#pubLogin').hide();
					$('#pubLogout').data('account', user)
						.closest('a').show()
						.find('span').text(userName);
				} else if (obj.errCode == 1) {
					$('#pubLogin').show();
					$('#pubLogout').closest('a').hide();
					if (!/\/login\.shtml/.test(locate)) {
						if (loginFilter()) {
							location.href = '//wy626.com/login.shtml';
						}
					}
				} else {
					confirm('网络异常，请稍后再试！');
				}
			}).fail(function(xmlHttp, status, err) {
				confirm('网络异常，请稍后再试！');
			});
		} else {
			$('#pubLogin').show();
			$('#pubLogout').closest('a').hide();
			if (!/\/login\.shtml/.test(location.href)) {
				if (loginFilter()) {
					location.href = '//wy626.com/login.shtml';
				}
			}
		}
	})();

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
			location.href = '//wy626.com/editpage.shtml';
		}
	});

	$('#pubAboutwe').on('click', function(e) {
		location.href = '//wy626.com/aboutus.shtml';
	});

	$('#pubManageCenter').on('click', function(e) {
		location.href = '//wy626.com/manageweb.shtml';
	});

	$(document).on('click', '#pubLogin', function(e) {
		location.href = '//wy626.com/login.shtml';
	});

	$(document).on('click', '.header .logo', function(e) {
		location.href = '//wy626.com';
	});

	//退出登录
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

	/**
	 * 非登录验证页面过滤
	 * @return {[boolean]} false: 无须登录验证；true: 须要登录验证
	 */
	function loginFilter()
	{
		switch (location.href)
		{
			case 'http://wy626.com/':
			case 'http://wy626.com/aboutus.shtml':
			case 'http://wy626.com/forgetpasswd.shtml':
				return false;
			default:
				return true;
		}

		return true;
	}
});