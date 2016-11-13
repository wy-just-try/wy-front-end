define('register', function(require, exports, module) {
	'use strict';
	var $ = require('jquery'),
		_md5 = require('md5');

	//公用变量
	var _sendMsgFlag = false;	//是否正在发送短信
	
	//注册输入文本提示
	var _text = {
		account: '账号输入格式错误，请重新输入',
		passwd: '密码输入格式错误，请重新输入',
		confirmPass: '验证密码输入格式错误，请重新输入',
		name: '用户姓名输入格式错误，请重新输入',
		cellPhone: '手机号码输入格式错误，请重新输入',
		mail: '邮箱输入格式错误，请重新输入',
		verifyMsg: '短信验证码输入错误，请重新输入',
		verifyPic: '图形验证码错误，请重新输入'
	}

	//接口变量
	var _cgi = {
		register: {
			url: '//wy626.com/cgi/wy/login/register',	//注册账号
			params: {
				account: '',	//账号
				passwd: '',		//密码
				name: '',		//姓名
				cellPhone: '',	//手机号码
				mailUrl: '',	//邮箱地址
				landLine: '',	//座机号码
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
	 * 绑定注册事件
	 * @return {[type]} [description]
	 */
	function bindEvent() {
		//重复注册查询
		$('#account, #cellPhone').on('change', function(e) {
			var warnText = '',
				ele = e.srcElement || e.target,
				id = $(ele).attr('id');
			if (id === 'account') {
				if (!/^\w{6,18}$/g.test($(this).val())) {
					return;
				}
				_cgi.isRegistered.params.account = $(this).val();
				_cgi.isRegistered.params.cellPhone = '';
			} else {
				if (!/^1\d{10}$/g.test($(this).val())) {
					return;
				}
				_cgi.isRegistered.params.cellPhone = $(this).val();
				_cgi.isRegistered.params.account = '';
			}

			$.ajax({
				url: _cgi.isRegistered.url,
				type: 'post',
				dataType: 'json',
				data: _cgi.isRegistered.params,
				success: function(obj) {
					if (obj.errCode != 0) {
						if (id === 'cellPhone') {
							warnText = '该手机号码已被注册！';
						} else {
							warnText = '该账号已被注册！';
						}
						$(ele).parent().next().text(warnText).show();
					}
				},
				error: function(xmlHttp, err) {
					console.log('重复注册查询接口调用失败！');
				}
			});
		});

		//格式校验
		$('#account, #passwd, #confirmPass, #name, #cellPhone, #mail, #verifyMsg, #verifyPic').on('input', function(e) {
			var ele = e.srcElement || e.target,
				vText = $(ele).val(),
				warn = $(ele).parent().next();
			switch ($(ele).attr('id')) {
				case 'account':
					if (/^\w{6,18}$/g.test(vText)) {
						warn.text(_text.account).hide();
					} else {
						warn.text(_text.account).show();
					}
					break;
				case 'passwd':
					if (/^\w{6,18}$/g.test(vText)) {
						warn.text(_text.passwd).hide();
					} else {
						warn.text(_text.passwd).show();
					}
					break;
				case 'confirmPass':
					if (/^\w{6,18}$/g.test(vText)) {
						if (vText == $('#passwd').val()) {
							warn.text(_text.confirmPass).hide();
						} else {
							warn.text('密码验证错误，请重新输入').show();
						}
					} else {
						warn.text(_text.confirmPass).show();
					}
					break;
				case 'name':
					if (/^[^<>=\.\s]{1,20}$/g.test(vText)) {
						warn.text(_text.name).hide();
					} else {
						warn.text(_text.name).show();
					}
					break;
				case 'cellPhone':
					if (/^1\d{10}$/g.test(vText)) {
						warn.text(_text.cellPhone).hide();
						if (!_sendMsgFlag) {
							$('#getMsg').addClass('active');
						}
					} else {
						warn.text(_text.cellPhone).show();
						$('#getMsg').removeClass('active');
					}
					break;
				case 'mail':
					if (/^\w+@\w+\.com$/g.test(vText)) {
						warn.text(_text.mail).hide();
					} else {
						warn.text(_text.mail).show();
					}
					break;
				case 'verifyPic':
					if (vText !== '') {
						warn.hide();
					} else {
						warn.text(_text.verifyPic).show();
					}
					break;
				case 'verifyMsg':
					if (vText !== '') {
						warn.hide();
					} else {
						warn.text(_text.verifyMsg).show();
					}
					break;
			}
		});

		//注册
		$('#register').on('click', function(e) {
			if ($('.error-msg').is(':visible')) {
				confirm('注册信息输入不全或者信息验证不通过！');
				return;
			}

			_cgi.register.params.account = $('#account').val(),
			_cgi.register.params.passwd = _md5.hex_md5($('#passwd').val()),
			_cgi.register.params.name = $('#name').val(),
			_cgi.register.params.cellPhone = $('#cellPhone').val(),
			_cgi.register.params.verifyMsg = $('#verifyMsg').val(),
			_cgi.register.params.mailUrl = $('#mail').val(),
			_cgi.register.params.verifyPic = $('#verifyPic').val()

			$.ajax({
				url: _cgi.register.url,
				type: 'post',
				dataType: 'json',
				data: _cgi.register.params,
				success: function(obj) {
					if (obj.errCode == 0) {
						location.replace('//wy626.com/login.shtml');
					} else if (obj.errCode == 1) {
						$('#verifyPic').parent().next().text(_text.verifyPic).show();
					} else if (obj.errCode == 2) {
						$('#verifyMsg').parent().next().text(_text.verifyMsg).show();
					} else {
						confirm('网络异常，请稍后再试！');
					}
				},
				error: function(xmlHttp, err) {
					confirm('网络异常，请稍后再试！');
				}
			});
		});

		//登录
		$('#login').on('click', function(e) {
			location.href = '//wy626.com/login.shtml';
		});

		//获取短信验证码
		$('#getMsg').on('click', function(e) {
			var count = 80;
			if ($(this).hasClass('active')) {
				if (/^1\d{10}$/g.test($('#cellPhone').val())) {
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
								confirm('手机号码输入不合法！');
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
	}

	/**
	 * 页面入口
	 * @return {[type]} [description]
	 */
	exports.init = function() {
		bindEvent();
	};
});