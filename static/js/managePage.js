define('managePage', function(require, exports, module) {
	'use strict';
	require('publicHeader');
	require('manageMenu');
	var $ = require('jquery'),
		_util = require('libUtil'),
		_ui = require('libUi');

	//接口
	var CGI = {
		getPageAll: {
			url: '//wy626.com/cgi/wy/page/get-all' //页面总览
		},
		delPage: {
			url: '//wy626.com/cgi/wy/page/del-page', //删除页面
			params: {
				url: '' //页面短链接
			}
		}
	}

	//渲染页面信息
	function renderHtml(data) {
		var arr = [],
			text = $('#pageTpl').html();
		for (var i=0; i<data.length; i++) {
			arr.push(_util.renderTpl(text, {
				'{#pageName#}': data[i].pageName,
				'{#pageDesc#}': data[i].pageDesc,
				'{#destUrl#}': data[i].destUrl
			}));
		}

		$('#pageContent tbody').html(arr.join(''));
	}

	//页面入口
	exports.init = function() {
		//获取徽网站总览
		$.ajax({
			url: CGI.getPageAll.url,
			type: 'post',
			dataType: 'json'
		}).done(function(obj) {
			if (obj.errCode == 0) {
				if (obj.data.length === 0) {
					$('#pageContent').hide();
					_ui.tipDialog({
						content: '您还没有创建任何图文页面哟！'
					});
				} else {
					renderHtml(obj.data);
				}
			} else {
				confirm('网络异常，请稍后再试');
			}
		}).fail(function(xmlHttp, status, err) {
			confirm('网络异常，请稍后再试');
		});

		//事件监听
		$('#pageContent').on('click', '.share', function(e) {
			var originUrl = $(this).closest('tr').data('url');
			_ui.tipDialog({
				title: '页面访问地址',
				content: originUrl
			});
		}).on('click', '.delete', function(e) {
			var me = this,
				originUrl = $(me).closest('tr').data('url');
			_ui.confirmDialog({
				content: '确认要删除此页面吗？',
				confirm: function() {
					CGI.delPage.params.url = originUrl;
					$.ajax({
						url: CGI.delPage.url,
						type: 'post',
						dataType: 'json',
						data: CGI.delPage.params
					}).done(function(obj) {
						if (obj.errCode == 0) {
							$(me).closest('tr').remove();
						} else {
							confirm('网络异常，请稍后再试');
						}
					}).fail(function(xmlHttp, status, err) {
						confirm('网络异常，请稍后再试');
					});
				}
			});
		}).on('click', '.edit', function(e) {
			var originUrl = $(this).closest('tr').data('url');
			location.href = '//wy626.com/editpage.shtml?url=' + encodeURIComponent(originUrl);
		});
	}
});