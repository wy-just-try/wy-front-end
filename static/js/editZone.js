define('editZone', function(require, exports, module) {
	'use strict';
	var $ = require('jquery');

	/********************消息协议*************************
	 * {
	 * 	 type: 0, //0:文档加载状态; 1:模板数据
	 * 	 data: {
	 * 	 	//具体传值请参见下方定义
	 * 	 }
	 * }
	 *
	 * type为0时data传值:
	 * 		status: true //true:文档加载成功; false:文档加载失败
	 *
	 * type为1时data传值:
	 * 		title: '' //标题
	 * 	 	desc: '' //描述(展示于模板页面上的描述)
	 * 	 	img: {
	 * 	 		url: '', //图片地址
	 * 	 		width: '', //图片宽度
	 * 	 		height: '' //图片高度
	 * 	 	}
	 * 	 	link: '' //跳转链接
	 * 	 	callback: '' //回调函数,以字符串方式传递(用eval实现,没必要时不推荐使用)
	 *****************************************************/

	 /******************四种可编辑类CSS类名****************
	  *	wy-edit: 表示此区域内容可编辑
	  *	wy-active: 表示此区域处于激活编辑状态
	  *	wy-edit-title: 标题元素
	  *	wy-edit-desc: 描述文字元素
	  *	wy-edit-img: 图片元素
	  *	wy-edit-link: 链接url元素
	  ****************************************************/

	//公用变量
	var _activeElement = null; //当前激活编辑元素

	//静态变量
	var DESTURL = 'http://wy626.com/editindex.shtml';

	//事件绑定
	function bindEvent() {
		$(document).on('click', '.wy-edit', function(e) {
			e.preventDefault();
			$(_activeElement).removeClass('wy-active');
			$(this).addClass('wy-active');
			_activeElement = this;

			var owner = $(this).prop('class').match(/wy-edit-\w*/g);
			var transport = {};
			if (owner !== null) {
				switch (owner[0]) {
					case 'wy-edit-title':
						transport.title = $(this).text();
						break;
					case 'wy-edit-desc':
						transport.desc = $(this).text();
						break;
					case 'wy-edit-img':
						transport.img = {};
						transport.img.url = $(this).attr('src') || $(this).css('background-image');
						transport.img.width = parseInt($(this).width()) * 2; //以320屏幕为基准，建议宽度乘以2
						transport.img.height = parseInt($(this).height()) * 2; //以320屏幕为基准，建议高度乘以2
						break;
					case 'wy-edit-link':
						transport.link = $(this).attr('href');
						break;
					default:
						console.error('模板编辑格式有误');
						break;
				}
			}
			if ($(this).find('.wy-edit-title').length !== 0) {
				transport.hasOwnProperty('title') || (transport.title = $(this).find('.wy-edit-title').text());
			}
			if ($(this).find('.wy-edit-desc').length !== 0) {
				transport.hasOwnProperty('desc') || (transport.desc = $(this).find('.wy-edit-desc').text());
			}
			if ($(this).find('.wy-edit-img').length !== 0) {
				if(!transport.hasOwnProperty('img')) {
					transport.img = {};
					transport.img.url = $(this).find('.wy-edit-img').attr('src') || $(this).find('.wy-edit-img').css('background-image').match(/"(.*)"/)[1];
					transport.img.width = parseInt($(this).find('.wy-edit-img').width()) * 2; //以320屏幕为基准，建议宽度乘以2
					transport.img.height = parseInt($(this).find('.wy-edit-img').height()) * 2; //以320屏幕为基准，建议高度乘以2
				}
			}
			if ($(this).find('.wy-edit-link').length !== 0) {
				transport.hasOwnProperty('link') || (transport.link = $(this).find('.wy-edit-link').attr('href'));
			}

			window.top.postMessage({
				type: 1,
				data: transport
			}, DESTURL);
		});

		//监听父窗口消息
		window.addEventListener('message', function(e) {
			console.log(e.data);
			if (e.origin !== 'http://wy626.com') {
				return;
			}

			var temp = e.data;
			if (temp.type === 1) {
				var editer = $('.wy-edit.wy-active');
				if (temp.data.hasOwnProperty('title')) {
					if (editer.hasClass('wy-edit-title')) {
						editer.text(temp.data.title);
					} else {
						editer.find('.wy-edit-title').text(temp.data.title);
					}
				}
				if (temp.data.hasOwnProperty('desc')) {
					if (editer.hasClass('wy-edit-desc')) {
						editer.text(temp.data.desc);
					} else {
						editer.find('.wy-edit-desc').text(temp.data.desc);
					}
				}
				if (temp.data.hasOwnProperty('img')) {
					var image;
					if (editer.hasClass('wy-edit-img')) {
						image = editer;
					} else {
						image = editer.find('.wy-edit-img');
					}
					if (image.prop('nodeName') === 'IMG') {
						image.attr('src', temp.data.img.url);
					} else {
						image.css('background-image', 'url("' + temp.data.img.url + '")');
					}
				}
				if (temp.data.hasOwnProperty('link')) {
					if (editer.hasClass('wy-edit-link')) {
						editer.attr('href', temp.data.link);
					} else {
						editer.find('.wy-edit-link').attr('href', temp.data.link);
					}
				}
			}
		});
	}

	exports.init = function() {
		//页面加载完成
		$(function() {
			bindEvent();
			//通知父页面iframe加载完成
			window.top.postMessage({
				type: 0,
				data: {
					status: true
				}
			}, DESTURL);
		});
	}
});