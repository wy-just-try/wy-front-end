define('manageAccount', function(require, exports, module) {
	'use strict';
	require('publicHeader');
	require('manageMenu');
	var $ = require('jquery'),
		_md5 = require('md5');

	//公用变量
	var _old = $('.old-password'),
		_new = $('.new-password');

	//接口
	var CGI = {
		updatePwd: {
			url: '//wy626.com/cgi/wy/login/update-passwd', //修改密码
			params: {
				oldPasswd: '', //旧密码
				newPasswd: '' //新密码
			}
		}
	};

	//页面入口
	exports.init = function() {
		//事件监听
		_old.on('input', 'input', function(e) {
			if ($.trim($(this).val()) === '') {
				_old.find('p').show();
			} else {
				_old.find('p').hide();
			}
		});
		_new.on('input', 'li:eq(0) input', function(e) {
			_new.find('li:eq(1) .error-msg').hide();
			if (/^\w{6,18}$/.test($(this).val())) {
				_new.find('li:eq(0) .error-msg').hide();
				_new.find('li:eq(1) input').prop('disabled', false);
			} else {
				_new.find('li:eq(0) .error-msg').show();
				_new.find('li:eq(1) input').val('').prop('disabled', true);
			}
		});
		_new.on('input', 'li:eq(1) input', function(e) {
			_new.find('li:eq(1) .error-msg').hide();
		});
		$('#save').on('click', function(e) {
			//未输入原密码或者原密码输入有误
			if ($.trim(_old.find('input').val()) === '' || _old.find('p').is(':visible')) {
				_old.find('p').show();
				return;
			}
			//未输入新密码
			if ($.trim(_new.find('li:eq(0) input').val()) === '') {
				_new.find('li:eq(0) .error-msg').show();
				return;
			}
			//新密码格式错误或者新密码确认有误
			if (_new.find('li:eq(0) .error-msg').is(':visible')) {
				return;
			} else {
				if (_new.find('li:eq(1) input').val() !== _new.find('li:eq(0) input').val()) {
					_new.find('li:eq(1) .error-msg').show();
					return;
				}
			}

			CGI.updatePwd.params.oldPasswd = _md5.hex_md5($.trim(_old.find('input').val()));
			CGI.updatePwd.params.newPasswd = _md5.hex_md5($.trim(_new.find('li:eq(1) input').val()));
			$.ajax({
				url: CGI.updatePwd.url,
				type: 'post',
				dataType: 'json',
				data: CGI.updatePwd.params
			}).done(function(obj) {
				if (obj.errCode == 0 || obj.errCode == 2) {
					location.href = '//wy626.com/login.shtml';
				} else if (obj.errCode == 1) {
					_old.find('p').show();
				} else {
					confirm('网络异常，请稍后再试');
				}
			}).fail(function(xmlHttp, status, err) {
				confirm('网络异常，请稍后再试');
			});
		});
	}
});