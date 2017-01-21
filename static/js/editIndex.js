define('editIndex', function(require, exports, module) {
	require('publicHeader');
	'use strict';
	var $ = require('jquery'),
		_util = require('libUtil'),
		_ui = require('libUi');

	//公用变量
	var _iframeWindow = document.getElementById('editZone').contentWindow, //iframe窗口对象
		_url = decodeURIComponent(_util.getQuery('url')), //模板原始链接
		_destUrl = localStorage.getItem('destUrl'), //模板访问链接
		_subContent = {}, //frame postMessage对象内容
		_subStatus = 0; //0:自定义跳转链接;1:二级模板;2:无跳转;

	//接口
	var CGI = {
		getTempUrl: {
			url: '//wy626.com/cgi/wy/template/get-temp-url', //获取模板页面
			params: {
				url: '' //页面短链接
			}
		},
		updateTemp: {
			url: '//wy626.com/cgi/wy/template/update-temp', //更新模板内容
			params: {
				weiName: '', //微网站标题
				weiDesc: '', //徽网站描述
				url: '', //页面短链接
				content: '' //页面内容
			}
		},
		getTempIndex: {
			url: '//wy626.com/cgi/wy/template/get-temp-index', //获取模板索引信息
			params: {
				type: 2 //二级模板
			}
		},
		genTemp: {
			url: '//wy626.com/cgi/wy/template/gen-temp', //生成模板页面
			params: {
				type: 2, //二级模板
				name: '', //二级模板ID
				url: '' //徽网站地址
			}
		},
		uploadImg: {
			url: '//wy626.com/cgi/wy/misc/upload-img', //图片上传
			params: {
				file: '' //图片文件对象
			}
		}
	}

	//初始化函数
	function intial() {
		getTempUrl();
		getSubpageIndex();
	}

	//事件绑定
	function bindEvent() {
		//查看微网站地址
		$(document).on('click', '#webUrl', function(e) {
			_ui.tipDialog({
				title: '微网站访问地址',
				content: _destUrl
			});
		});

		//鼠标经过子模板样式
		$(document).on('mouseenter mouseleave', '#subIndexContent .content', function(e) {
			if (e.type === 'mouseenter') {
				$(this).find('img').addClass('active')
					.next().show();
			} else {
				$(this).find('img').removeClass('active')
					.next().hide();
			}
		}).on('click', '#subTemplate .close', function(e) {
			$('#subTemplate').hide();
		});

		//子页面编辑区事件响应
		$(document).on('click', '#subpage span.active', function(e) {
			if ($(this).hasClass('first')) {
				_ui.confirmDialog({
					content: '保存编辑内容并跳转至子模板页面？',
					confirm: function() {
						saveContent(true);
					}
				});
			} else {
				$('#subTemplate').show();
			}
		});

		//选择二级模板
		$(document).on('click', '#subTemplate .btn-confirm', function(e) {
			//套用模板并生成二级页面
			CGI.genTemp.params.name = $(this).data('id');
			CGI.genTemp.params.url = _url;
			$.ajax({
				url: CGI.genTemp.url,
				type: 'post',
				dataType: 'json',
				data: CGI.genTemp.params
			}).done(function(obj) {
				if (obj.errCode == 0) {
					_ui.confirmDialog({
						content: '保存编辑内容并跳转新子模板页面？',
						confirm: function() {
							//这里由于存在时序问题故使用直接操作iframe元素的方式来替代postMessage方式
							var editer = $(_iframeWindow.document.documentElement).find('.wy-edit.wy-active');
							if (editer.hasClass('wy-edit-link')) {
								editer.attr('href', obj.data.originUrl);
							} else {
								editer.find('.wy-edit-link').attr('href', obj.data.originUrl);
							}
							_subContent.data.link = obj.data.originUrl;
							saveContent(true);
						}
					});
				} else {
					confirm('网络异常，请稍后再试');
				}
			}).fail(function(xmlHttp, status, err) {
				confirm('网络异常，请稍后再试');
			});
		});

		//激活子页面编辑选项
		$(document).on('click', '#subpage i', function(e) {
			$(this).addClass('active');
			if ($(this).parent().hasClass('type')) { //模板跳转地址
				$('#subpage > .link > i').removeClass('active');
				$('#subpage > .link > input').val('').prop('disabled', true);
				if (_subStatus === 1) {
					$('#subpage .first').addClass('active');
					$('#subpage .second').text('重选模板').addClass('active');
				} else {
					$('#subpage .first').removeClass('active');
					$('#subpage .second').text('选择模板').addClass('active');
				}
				_iframeWindow.postMessage({
					type: 1,
					data: {
						link: _subContent.data.link ? _subContent.data.link : 'javascript:;'
					}
				}, _url);
			} else { //自定义跳转地址
				$('#subpage > .type > i').removeClass('active');
				$('#subpage > .link > input').prop('disabled', false);
				$('#subpage .first').removeClass('active');
				$('#subpage .second').text('选择模板').removeClass('active');
				_iframeWindow.postMessage({
					type: 1,
					data: {
						link: 'javascript:;'
					}
				}, _url);
			}
		});

		//实时同步编辑区和展示区内容
		$(document).on('input', '#title input', function(e) {
			_iframeWindow.postMessage({
				type: 1,
				data: {
					title: $(this).val() || '菜单'
				}
			}, _url);
		}).on('input', '#abstract textarea', function(e) {
			_iframeWindow.postMessage({
				type: 1,
				data: {
					desc: $(this).val() || '描述'
				}
			}, _url);
		}).on('input', '#subpage input', function(e) {
			_iframeWindow.postMessage({
				type: 1,
				data: {
					link: $(this).val() || 'javascript:;'
				}
			}, _url);
		}).on('input', '#weiName', function(e) {
			$(_iframeWindow.document.head)
				.find('title').text($(this).val() || '微网站');
		});

		//图片上传
		$(document).on('change', '#uploadImg input[type="file"]', function(e) {
			var vForm = new FormData();
			vForm.append('file', this.files[0]);
			vForm.append('url', _url);
			$.ajax({
				url: CGI.uploadImg.url,
				type: 'post',
				dataType: 'json',
				contentType: false,
				processData: false,
				data: vForm
			}).done(function(obj) {
				if (obj.errCode == 0) {
					_iframeWindow.postMessage({
						type: 1,
						data: {
							img: {
								url: obj.picUrl
							}
						}
					}, _url);
				} else {
					confirm('网络异常，请稍后再试');
				}
			}).fail(function(xmlHttp, status, err) {
				confirm('网络异常，请稍后再试')
			});
		});

		//监听iframe消息
		window.addEventListener('message', function(e) {
			console.log(e.data);
			// e.source.postMessage('from parent', 'http://wy626.com/template/html/test.shtml');
			if (e.origin !== 'http://wy626.com') {
				return;
			}

			_subContent = e.data;
			if (_subContent.type === 0) {
				if (_subContent.data.status) {
					//to do
				}
			} else if (_subContent.type === 1) {
				$('.content .middle').hide();
				$('#subpage').hide();
				if (_subContent.data.hasOwnProperty('title')) {
					$('.content .middle').show()
						.find('#title').show()
						.find('input').val(_subContent.data.title);
				} else {
					$('#title').hide();
				}
				if (_subContent.data.hasOwnProperty('desc')) {
					$('.content .middle').show()
						.find('#abstract').show()
						.find('textarea').val(_subContent.data.desc);
				} else {
					$('#abstract').hide();
				}
				if (_subContent.data.hasOwnProperty('img')) {
					$('.content .middle').show()
						.find('#uploadImg').show()
						.find('>span').text('建议图片大小为:' + _subContent.data.img.width + ' * ' + _subContent.data.img.height);
				} else {
					$('#uploadImg').hide();
				}
				if (_subContent.data.hasOwnProperty('link')) {
					$('#subpage').show();
					if (/\/subtemp\//.test(_subContent.data.link)) { //二级模板
						_subStatus = 1;
						$('#subpage > .link > i').removeClass('active')
							.next().val('')
							.prop('disabled', true);
						$('#subpage > .type').find('i').addClass('active').parent()
							.find('.first').addClass('active').parent()
							.find('.second').text('重选模板').addClass('active');
					} else if (/javascript/.test(_subContent.data.link) || $.trim(_subContent.data.link) === '') { //空跳转
						_subStatus = 2;
						$('#subpage > .link > i').removeClass('active')
							.next().val('')
							.prop('disabled', true);
						$('#subpage > .type').find('i').addClass('active').parent()
							.find('.first').removeClass('active').parent()
							.find('.second').text('选择模板').addClass('active');
					} else { //自定义跳转
						_subStatus = 0;
						$('#subpage > .type').find('.l').removeClass('active')
							.last().text('选择模板');
						$('#subpage > .link > i').addClass('active')
							.next().val(_subContent.data.link)
							.prop('disabled', false);
					}
				} else {
					$('#subpage').hide();
				}
				//恶魔函数用法
				if (_subContent.data.hasOwnProperty('callback')) {
					eval('(' + _subContent.data.callback + ')()');
				}
			}
		});
		//保存编辑内容
		$('#save').on('click', function(e) {
			saveContent(false);
		});
	}

	/**
	 * 保存编辑内容
	 * @param  {Boolean} isLink true:页面跳转；false:不跳转
	 * @return {null}
	 */
	function saveContent(isLink) {
		CGI.updateTemp.params.weiName = $('#weiName').val() || '微网站';
		CGI.updateTemp.params.weiDesc = $('#weiDesc').val();
		CGI.updateTemp.params.url = _destUrl;
		CGI.updateTemp.params.content = _iframeWindow.document.documentElement.outerHTML;
		$.ajax({
			url: CGI.updateTemp.url,
			type: 'post',
			dataType: 'json',
			data: CGI.updateTemp.params
		}).done(function(obj) {
			if (obj.errCode == 0) {
				if (isLink) {
					location.href = '//wy626.com/editsub.shtml?url=' + encodeURIComponent(_subContent.data.link);
				} else {
					_ui.tipDialog({
						content: '保存成功！'
					});
				}
			} else {
				confirm('网络异常，请稍后再试');
			}
		}).fail(function(xmlHttp, status, err) {
			confirm('网络异常，请稍后再试');
		});
	}

	//获取模板页面
	function getTempUrl() {
		CGI.getTempUrl.params.url = _destUrl;
		$.ajax({
			url: CGI.getTempUrl.url,
			type: 'post',
			dataType: 'json',
			data: CGI.getTempUrl.params
		}).done(function(obj) {
			if (obj.errCode == 0) {
				//加载iframe文档
				$('#editZone').attr('src', obj.data.tempUrl);
				$('#weiName').val(obj.data.weiName);
				$('#weiDesc').val(obj.data.desc);
			} else {
				confirm('网络异常，请稍后再试');
			}
		}).fail(function(xmlHttp, status, err) {
			confirm('网络异常，请稍后再试');
		});
	}

	//获取二级页面模板索引信息
	function getSubpageIndex() {
		$.ajax({
			url: CGI.getTempIndex.url,
			type: 'post',
			dataType: 'json',
			data: CGI.getTempIndex.params
		}).done(function(obj) {
			if (obj.errCode == 0) {
				renderHtml(obj.data);
			} else if (obj.errCode == 1){
				location.href = '//wy626.com/login.shtml';
			} else {
				confirm('网络异常，请稍后再试');
			}
		}).fail(function(xmlHttp, status, err) {
			confirm('网络异常，请稍后再试')
		});
	}

	//渲染模板页面
	function renderHtml(data) {
		var arr = [],
			html = $('#subpageIndex').html();
		for (var i=0; i<data.length; i++) {
			arr.push(_util.renderTpl(html, {
				'{#name#}': data[i].name,
				'{#title#}': data[i].title,
				'{#picUrl#}': data[i].picUrl
			}));
		}

		$('#subIndexContent').html(arr.join(''));
	}

	//页面入口
	exports.init = function() {
		intial();
		bindEvent();
	}
});