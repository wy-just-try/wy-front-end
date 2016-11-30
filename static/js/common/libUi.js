define('libUi', function(require, exports, module) {
	'use strict';
	var $ = require('jquery'),
		_util = require('libUtil');

	var libUi = {
		/**
		 * 确认对话框
		 * @param  {object} option 对话框控制参数
		 * @param {string} [option.title='对话框'] 对话框标题，不传则默认为'对话框'
		 * @param {string} option.content 必传参数，对话框内容
		 * @param {function} [option.confirm] 点击'确定'回调函数，不传则执行删除对话框操作
		 * @param {function} [option.cancel] 点击'取消'回调函数，不传则执行删除对话框操作
		 * @return {null}
		 */
		confirmDialog: function(option) {
			var	text =
				'<div class="dialog-container">' +
			        '<div class="screen-mask"></div>' +
			        '<div class="dialog">' +
			            '<div class="title">' +
			                '<span>{#title#}</span>' +
			            '</div>' +
			            '<div class="content">{#content#}</div>' +
			            '<div class="operate">' +
			                '<div class="confirm">确定</div>' +
			                '<div class="cancel">取消</div>' +
			            '</div>' +
			        '</div>' +
			    '</div>';
			if ($('.dialog-container').length === 0) {
				text = _util.renderTpl(text, {
					'{#title#}': typeof option.title === 'undefined' ? '对话框' : option.title,
					'{#content#}': option.content
				});
				$('body').append(text);
			} else {
				console.log('对话框异常');
			}

			$(document).on('click.confirm-dialog', '.dialog-container .confirm', function(e) {
				if (typeof option.confirm === 'function') {
					option.confirm();
				} else if (typeof option.confirm !== 'undefined') {
					console.log('对话框传参有误');
				}
				$(document).off('.confirm-dialog');
				$('.dialog-container').remove();
			});
			$(document).on('click.confirm-dialog', '.dialog-container .cancel', function(e) {
				if (typeof option.cancel === 'function') {
					option.cancel();
				} else if (typeof option.cancel !== 'undefined') {
					console.log('对话框传参有误');
				}
				$(document).off('.confirm-dialog');
				$('.dialog-container').remove();
			});
		},
		/**
		 * tips对话框
		 * @param  {object} option tip对话框控制参数
		 * @param  {string} [option.title='提示框'] tip对话框标题，不传则默认显示'提示框'
		 * @param  {string} option.content tip对话框内容，必填参数
		 * @return {null}
		 */
		tipDialog: function(option) {
			var text =
				'<div class="tip-container">' +
			        '<div class="screen-mask"></div>' +
			        '<div class="tip">' +
			            '<div class="title">' +
			                '<span>{#title#}</span>' +
			            '</div>' +
			            '<div class="content">{#content#}</div>' +
			        '</div>' +
			    '</div>';
			if ($('.tip-container').length === 0) {
				text = _util.renderTpl(text, {
					'{#title#}': typeof option.title === 'undefined' ? '提示框' : option.title,
					'{#content#}': option.content
				});
				$('body').append(text);
			} else {
				console.log('tip对话框异常');
			}
			$(document).on('click.tip-dialog', '.tip-container .screen-mask', function(e) {
				console.log('haha');
				if (typeof option.confirm === 'function') {
					option.confirm();
				} else if (typeof option.confirm !== 'undefined') {
					console.log('tip对话框传参有误');
				}
				$(document).off('.tip-dialog');
				$('.tip-container').remove();
			});
		}
	}

	module.exports = libUi;
});