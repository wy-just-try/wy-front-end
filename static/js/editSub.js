define('editSub', function(require, exports, module) {
    'use strict';
    require('publicHeader');
    var $ = require('jquery'),
        _util = require('libUtil'),
        _ui = require('libUi');
    //公用变量
    var _iframeWindow = document.getElementById('editZone').contentWindow, //iframe窗口对象
        _url = decodeURIComponent(_util.getQuery('url')), //二级页面链接
        _subContent = {}; //frame postMessage对象内容
    // 初始化富文本编辑器
    function initUEditor() {
        var ue = UE.getEditor('editZone', {
            autoHeight: false
        });
        ue.ready(function() {
            //设置编辑器的内容
            ue.setContent('');
            //获取html内容，返回: <p>Hello World</p>
            var html = ue.getContent();
            //获取纯文本内容，返回: Hello World
            var txt = ue.getContentTxt();
            console.log(ue.getAllHtml());
            // 所有的操作在此进行 --- BEGIN
            // 所有的操作在此进行 --- END
        });
    }
    //页面入口
    exports.init = function() {
        initUEditor();
    };
});