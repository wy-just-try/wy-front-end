define('editSub', function(require, exports, module) {
	require('publicHeader');
	'use strict';
	var $ = require('jquery'),
		_util = require('libUtil'),
		_ui = require('libUi');

	//公用变量
	var _iframeWindow = document.getElementById('editZone').contentWindow, //iframe窗口对象
		_url = decodeURIComponent(_util.getQuery('url')), //二级页面链接
		_subContent = {}; //frame postMessage对象内容

	//接口
	var CGI = {
		getTempUrl: {
			url: '//wy626.com/cgi/wy/template/get-temp-url', //获取模板页面
			params: {
				url: '' //页面链接
			}
		},
		updateTemp: {
			url: '//wy626.com/cgi/wy/template/update-temp', //更新模板内容
			params: {
				weiName: '', //页面标题
				url: '', //页面链接
				content: '' //页面内容
			}
		},
		uploadImg: {
			url: '//wy626.com/cgi/wy/misc/upload-img', //图片上传
			params: {
				file: '' //图片文件对象
			}
		}
	}

	function bindEvent() {
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
								url: obj.data.picUrl
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
					$('#subpage > .link > input').val(_subContent.data.link);
				} else {
					$('#subpage').hide();
				}
				//恶魔函数用法
				if (_subContent.data.hasOwnProperty('callback')) {
					eval('(' + _subContent.data.callback + ')()');
				}
			}
		});
		//清除编辑区内容
		$('#clear').on('click', function(e) {
			_iframeWindow.postMessage({
				type: 1,
				data: {
					title: '',
					desc: '',
					img: {
						url: ''
					},
					link: 'javascript:;'
				}
			}, _url);
		});
		//保存编辑内容
		$('#save').on('click', function(e) {
			saveContent();
		});
	}

	//保存编辑内容
	function saveContent() {
		CGI.updateTemp.params.weiName = $('#weiName').val() || '微网站';
		CGI.updateTemp.params.url = _url;
		CGI.updateTemp.params.content = _iframeWindow.document.documentElement.outerHTML;
		$.ajax({
			url: CGI.updateTemp.url,
			type: 'post',
			dataType: 'json',
			data: CGI.updateTemp.params
		}).done(function(obj) {
			if (obj.errCode == 0) {
				_ui.tipDialog({
					content: '保存成功！'
				});
			} else {
				confirm('网络异常，请稍后再试');
			}
		}).fail(function(xmlHttp, status, err) {
			confirm('网络异常，请稍后再试');
		});
	}

	//获取模板页面
	function getTempUrl() {
		CGI.getTempUrl.params.url = _url;
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
			} else {
				confirm('网络异常，请稍后再试');
			}
		}).fail(function(xmlHttp, status, err) {
			confirm('网络异常，请稍后再试');
		});
	}

	//页面入口
	exports.init = function() {
		getTempUrl();
		bindEvent();
	}
});