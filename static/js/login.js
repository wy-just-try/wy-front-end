define("login", function(require, exports, module) {
	'use strict';
	require('publicHeader');
	var $ = require('jquery'),
		_md5 = require('md5');

	//接口变量
	var _cgi = {
		login: {
			url: '//wy626.com/cgi/wy/login/login',	//登录接口
			params: {
				account: '',	//账号
				passwd: '',		//密码
				verifyPic: ''	//图形验码
			}
		},
		verifyPic: {
			url: '//wy626.com/cgi/wy/misc/gen-pic'	//动态生成图形验证码接口
		}
	};

	/**
	 * 绑定事件
	 * @return {[type]} [description]
	 */
	function bindEvent() {
		//登录
		$('#login').on('click', function(e) {
			_cgi.login.params.account = $('#account').val();
			_cgi.login.params.passwd = _md5.hex_md5($('#passwd').val());
			_cgi.login.params.verifyPic = $('#verifyPic').val();

			$.ajax({
				url: _cgi.login.url,
				type: 'post',
				dataType: 'json',
				data: _cgi.login.params,
				success: function(obj) {
					hideWarning();
					if (obj.errCode == 0) {
						location.href = '//wy626.com/index.shtml';
					} else if (obj.errCode == 1) {
						$('#account').parent().next().show();
					} else if (obj.errCode == 2) {
						$('#passwd').parent().next().show();
					} else if (obj.errCode == 3) {
						$('#verifyPic').parent().next().show();
					} else {
						confirm('网络异常，请稍后再试！');
					}
				},
				error: function(xmlHttp, err) {
					confirm('网络异常，请稍后再试！');
				}
			});
		});

		//更新图形验证码
		$('#updatePic').on('click', function(e) {
			$(this).attr('src', _cgi.verifyPic.url);
		});

		//忘记密码
		$('#forgetPass').on('click', function(e) {
			location.href = '//wy626.com/forgetpasswd.shtml';
		});
	}

	/**
	 * 隐藏所有验证出错信息
	 * @return {[type]} [description]
	 */
	function hideWarning() {
		$('#account').parent().next().hide();
		$('#passwd').parent().next().hide();
		$('#verifyPic').parent().next().hide();
	}

	/**
	 * 页面入口
	 * @return {[type]} [description]
	 */
	exports.init = function() {
		// $('#updatePic').attr('src', _cgi.verifyPic.url);
		bindEvent();
	};
});