define('manageWeb', function(require, exports, module) {
	'use strict';
	require('publicHeader');
	require('manageMenu');
	var $ = require('jquery'),
		_util = require('libUtil'),
		_ui = require('libUi');

	//接口
	var CGI = {
		getWeiAll: {
			url: '//wy626.com/cgi/wy/weisite/get-wei-all' //微网站总览
		},
		delWei: {
			url: '//wy626.com/cgi/wy/weisite/del-wei', //删除微网站
			params: {
				url: '' //微网站短链接
			}
		}
	}

	//渲染微网站
	function renderHtml(data) {
		var arr = [],
			text = $('#weiTpl').html();
		for (var i=0; i<data.length; i++) {
			arr.push(_util.renderTpl(text, {
				'{#weiName#}': data[i].weiName,
				'{#weiText#}': data[i].weiText,
				'{#destUrl#}': data[i].destUrl,
				'{#originUrl#}': data[i].originUrl
			}));
		}

		$('#weiContent tbody').html(arr.join(''));
	}

	//页面入口
	exports.init = function() {
		//获取徽网站总览
		$.ajax({
			url: CGI.getWeiAll.url,
			type: 'post',
			dataType: 'json'
		}).done(function(obj) {
			if (obj.errCode == 0) {
				if (obj.data.length === 0) {
					$('#weiContent').hide();
					_ui.tipDialog({
						content: '您还没有创建属于自己的微网站哟！'
					});
				} else {
					renderHtml(obj.data);
				}
			} else {
				_util.linkLogin();
			}
		}).fail(function(xmlHttp, status, err) {
			confirm('网络异常，请稍后再试');
		});

		//事件监听
		$('#weiContent').on('click', '.share', function(e) {
			var destUrl = $(this).closest('tr').data('url');
			_ui.tipDialog({
				title: '微网站访问地址',
				content: destUrl
			});
		}).on('click', '.delete', function(e) {
			var me = this,
				destUrl = $(me).closest('tr').data('url');
			_ui.confirmDialog({
				content: '确认要删除此网站吗？',
				confirm: function() {
					CGI.delWei.params.url = destUrl;
					$.ajax({
						url: CGI.delWei.url,
						type: 'post',
						dataType: 'json',
						data: CGI.delWei.params
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
			var originUrl = $(this).find('span').data('origin');
			localStorage.setItem('destUrl', $(this).closest('tr').data('url'));
			location.href = '//wy626.com/editindex.shtml?url=' + encodeURIComponent(originUrl);
		});
	}
});