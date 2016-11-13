define('forgetPasswd', function(require, exports, module) {
	'use strict';
	var $ = require('jquery');

	//公用变量
	var _sendMsgFlag = false,	//是否正在发送短信
		_isCellphoneOk = false;	//输入手机号是否可用于找回密码
	
	//提示文本
	var _text = {
		cellPhone: '手机号码输入有误，请重新输入',
		verifyMsg: '短信验证码输入错误，请重新输入',
		verifyPic: '图形验证码输入错误，请重新输入'
	};
	
	//接口变量
	var _cgi = {
		findPasswd: {
			url: '//wy626.com/cgi/wy/login/find-password',
			params: {
				cellPhone: '',	//手机号码
				verifyPic: '',	//图形验证码
				verifyMsg: ''	//短信验证码
			}
		},
		isRegistered: {
			url: '//wy626.com/cgi/wy/login/check-registered',	//重复注册查询
			params: {
				account: '',	//账号
				cellPhone: ''	//手机号码
			}
		},
		verifyPic: {
			url: '//wy626.com/cgi/wy/misc/gen-pic'	//动态生成图形验证码
		},
		verifyMsg: {
			url: '//wy626.com/cgi/wy/misc/gen-msg',	//动态生成短信验证码
			params: {
				cellPhone: ''	//手机号码
			}
		}
	};

	/**
	 * 绑定事件
	 * @return {[type]} [description]
	 */
	function bindEvent() {
		//手机号码校验
		$('#cellPhone').on('change input', function(e) {
			if (e.type === 'change') {
				if (!/^1\d{10}$/g.test($(this).val())) {
					return;
				}
				_cgi.isRegistered.params.cellPhone = $(this).val();
				_cgi.isRegistered.params.account = '';
				
				$.ajax({
					url: _cgi.isRegistered.url,
					type: 'post',
					dataType: 'json',
					data: _cgi.isRegistered.params,
					success: function(obj) {
						if (obj.errCode == 0) {
							_isCellphoneOk = true;
							$('#getMsg').addClass('active');
						} else {
							$(this).parent().next()
								.text(_text.cellPhone)
								.show();
							$('#getMsg').removeClass('active');
						}
					}.bind(this),
					error: function(xmlHttp, err) {
						console.log('重复注册查询接口调用失败！');
					}
				});
			} else {
				$(this).parent().next().hide();
			}
		});

		//验证码校验
		$('#verifyPic, #verifyMsg').on('input', function(e) {
			if ($(this).val() !== '') {
				$(this).parent().next().hide();
			} else {
				$(this).parent().next()
					.text(_text[$(this).attr('id')])
					.show();
			}
		});

		//获取短信验证码
		$('#getMsg').on('click', function(e) {
			var count = 80;
			if ($(this).hasClass('active')) {
				if (/^1\d{10}$/g.test($('#cellPhone').val())) {
					_cgi.verifyMsg.params.cellPhone = $('#cellPhone').val();
					$.ajax({
						url: _cgi.verifyMsg.url,
						type: 'post',
						dataType: 'json',
						data: _cgi.verifyMsg.params,
						success: function(obj) {
							if (obj.errCode == 0) {
								_sendMsgFlag = true;
								$(this).removeClass('active');
								$(this).parent().next()
									.text('验证码已发送至手机，请查收！')
									.show();
								var timer = setInterval(function() {
									$(this).text(count--);
									if (count === 0) {
										clearInterval(timer);
										$(this).text('获取验证码').addClass('active');
										_sendMsgFlag = false;
									}
								}.bind(this), 1000);
							} else if (obj.errCode == 1) {
								confirm('网络异常，请稍后再试！');
							} else if (obj.errCode == 2) {
								confirm('手机号码输入有误！');
							}
						}.bind(this),
						error: function(xmlHttp, err) {
							confirm('网络异常，请稍后再试！');
						}
					});
				}
			}
		});

		//获取图形验证码
		$('#updatePic').on('click', function(e) {
			$(this).attr('src', _cgi.verifyPic.url);
		});

		//立即找回
		$('#findPasswd').on('click', function(e) {
			if ($('.error-msg').is(':visible')) {
				confirm('信息不全或者验证信息不通过！');
				return;
			}

			_cgi.findPasswd.params.cellPhone = $('#cellPhone').val();
			_cgi.findPasswd.params.verifyMsg = $('#verifyMsg').val();
			_cgi.findPasswd.params.verifyPic = $('#verifyPic').val();

			$.ajax({
				url: _cgi.findPasswd.url,
				type: 'post',
				dataType: 'json',
				data: _cgi.findPasswd.params,
				success: function(obj) {
					if (obj.errCode == 0) {
						confirm('新随机登录密码已发送至手机，请查收！');
					} else if (obj.errCode == 1) {
						$('#verifyPic').parent().next()
							.text(_text.verifyPic)
							.show();
					} else if (obj.errCode == 2) {
						$('#verifyMsg').parent().next()
							.text(_text.verifyMsg)
							.show();
					} else if (obj.errCode == 3) {
						$('#cellPhone').parent().next()
							.text(_text.cellPhone)
							.show();
					} else {
						confirm('网络异常，请稍后再试！');
					}
				},
				error: function(xmlHttp, err) {
					confirm('网络异常，请稍后再试！');
				}
			});
		});
	}

	/**
	 * 页面入口
	 * @return {[type]} [description]
	 */
	exports.init = function() {
		bindEvent();
	};
});