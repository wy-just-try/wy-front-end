define('indexTemplate', function(require, exports, module) {
	'use strict';
	require('publicHeader');
	var $ = require('jquery'),
		_util = require('libUtil'),
		_ui = require('libUi');

	//公用变量
	//接口
	var _cgi = {
		indexTemp: {
			url: '//wy626.com/cgi/wy/template/get-temp-index',
			params: {
				type: 1	//1:首页模板；2: 二级页面模板；
			}
		},
		genTemp: {
			url: '//wy626.com/cgi/wy/template/gen-temp',
			params: {
				type: 1,	//1:首页模板; 2:二级页面模板;
				name: ''	//模板ID
			}
		}
	};

	//绑定事件
	function bindEvent() {
		$(document).on('mouseenter mouseleave', '#tempContainer > li', function(e) {
			if (e.type === 'mouseenter') {
				$(this).find('.design').show();
			} else {
				$(this).find('.design').hide();
			}
		});
		$(document).on('click', '#tempContainer .btn-design', function(e) {
			e.preventDefault();
			_cgi.genTemp.params.name = $(this).find('span').data('id');
			$.ajax({
				url: _cgi.genTemp.url,
				type: 'post',
				dataType: 'json',
				data: _cgi.genTemp.params
			}).done(function(obj) {
				if (obj.errCode == 0) {
					localStorage.setItem('destUrl', obj.data.destUrl);
					location.href = '//wy626.com/editindex.shtml?url=' + encodeURIComponent(obj.data.originUrl);
				} else if (obj.errCode == 2) {
					_ui.tipDialog({
						content: '每个账户至多可免费创建5个微网站，请到"管理中心"管理微网站哦！'
					});
				} else {
					confirm('网络异常，请稍后再试！');
				}
			}).fail(function(xmlHttp, status, err) {
				confirm('网络异常，请稍后再试！');
			});
		});
	}

	//渲染模板页面
	function renderHtml(data) {
		var arr = [],
			html = $('#template').html();
		for (var i=0; i<data.length; i++) {
			arr.push(_util.renderTpl(html, {
				'{#name#}': data[i].name,
				'{#title#}': data[i].title,
				'{#picUrl#}': data[i].picUrl,
				'{#desc#}': data[i].desc
			}));
		}

		$('#tempContainer').html(arr.join(''));
	}

	exports.init = function() {
		$.ajax({
			url: _cgi.indexTemp.url,
			type: 'post',
			dataType: 'json',
			data: _cgi.indexTemp.params
		}).done(function(obj) {
			if (obj.errCode == 0) {
				if (obj.data.length === 0) {
					console.log('不存在任何模板');
					return;
				}
				renderHtml(obj.data);
			} else if (obj.errCode == 1) {
				_util.linkLogin();
			} else if (obj.errCode == 2) {
				confirm('网络异常，请稍后再试！');
			}
		}).fail(function(xmlHttp, status, err) {
			confirm('网络异常，请稍后再试！');
		});

		bindEvent();
	};
});