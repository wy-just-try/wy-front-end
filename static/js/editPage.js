define('editPage', function(require, exports, module) {
    'use strict';
    require('publicHeader');
    var $ = require('jquery'),
        _util = require('libUtil'),
        _ui = require('libUi');
    var _ue;
    var CGI = {
        update: '//wy626.com/cgi/wy/page/gen-page'
    };
    //公用变量
    var _iframeWindow = document.getElementById('editZone').contentWindow, //iframe窗口对象
        _url = decodeURIComponent(_util.getQuery('url')), //二级页面链接
        _subContent = {}; //frame postMessage对象内容
    // 初始化富文本编辑器
    function initUEditor() {
        _ue = UE.getEditor('editZone', {
            autoHeight: false
        });
        _ue.ready(function() {
            $('#desc').show();
            //设置编辑器的内容
            _ue.setContent('');
            var html = _ue.getContent();
            //获取纯文本内容，返回: Hello World
            var txt = _ue.getContentTxt();
            console.log(_ue.getContent());
            // 所有的操作在此进行 --- BEGIN
            // 所有的操作在此进行 --- END
        });
    }
    $(document).on('click', '.article .content .desc .type i', function () {
        var $this = $(this);
        $this.closest('.type').find('i').removeClass('active');
        $this.addClass('active');
    })
    .on('click', '.btn-save', function() {
        var content = _ue.getContent();
        var title = $.trim($('#weiTitle').val());
        var desc = $.trim($('#weiDesc').val());
        if (!content) {
            alert('文本内容不能为空');
            return;
        }
        if (!title) {
            alert('页面标题不能为空');
            return;
        }
        if (!desc) {
            alert('页面描述不能为空');
            return;
        }
        $.ajax({
            url: CGI.update,
            type: 'post',
            dataType: 'json',
            data: {
                title: title,
                desc: desc,
                content: content
            }
        }).done(function(obj) {
            if (obj.errCode === 0) {
                //
            } else {
                alert('网络异常，请稍后再试');
            }
        }).fail(function() {
            alert('网络异常，请稍后再试');
        });
    });
    //页面入口
    exports.init = function() {
        initUEditor();
    };
});