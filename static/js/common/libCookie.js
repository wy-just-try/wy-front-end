define("libCookie", function(require, exports, module) {
	"use strict";
    
    /**
     * 京享街公用的cookie模块，主要处理cookie相关的工作。
     * <p><em>与dmc.cookie存在些许的不同。比如使用的是encode/decodeURIComponent而不是使用escape和unescape来编码解码cookie值。</em></p>
     * @version 1.0.0
     * @module qwd/libCookie
     */
    
    /**
     * @desc 获取指定name的cookie值
     * @alias module:qwd/libCookie.get
     * @param {String} name 必要参数，需要获取的cookie名。
     * @return {(String|null)} 获取到的cookie值，会经过一次decodeURIComponent()。 注意区分： 不存在指定cookie时会返回null，而空值的cookie是返回空字符串""。
     */
    function getCookie(name) {
        //读取COOKIE
        var reg = new RegExp("(?:^| )" + name + "(?:=([^;]*))?(?:;|$)"), val = document.cookie.match(reg);
        return val ? (val[1] ? decodeURIComponent(val[1]) : "") : null;
    }
    
    /**
     * @desc 设置一个指定信息的cookie
     * @alias module:qwd/libCookie.set
     * @param {String} name 必要参数， 设置的cookie名
     * @param {String} value 必要参数，设置的cookie值。
     * @param {(Number|Date)} [expires] 这条cookie的过期时间。传入Date直接当过期时间，传入数字当多少分钟处理。不设置时cookie默认随浏览器进程存活
     * @param {String} [path="/"] cookie储存的路径，不设置默认"/"
     * @param {String} [domain] cookie储存的域名，不设置默认为当前域
     * @param {Boolean} [secure] 是否为https的cookie，不设置默认为false
     */
    function setCookie(name, value, expires, path, domain, secure) {
        if( name === undefined || value === undefined){
            return;
        }
        var expireStr;
        if(expires !== undefined ){
            expires = (expires instanceof Date)? expires : // 如果已经是Date对象，直接使用
                        new Date(Date.now() + (parseInt(expires) || 0) * 60000); // 否则当做分钟数处理, 兼容以前格式。
            expireStr = ";expires=" + expires.toGMTString();
        } else {
            expireStr = "";
        }
        path = path || "/";
        
        document.cookie = name + "=" + encodeURIComponent(value) + expireStr + ";path=" + path +
                            ( domain ? ';domain=' + domain : '') + ( secure ? ';secure' : '');
    }
    
    /**
     * @desc 删除一个指定信息的cookie<br>
        <em>注意： 如果cookie在父域且调用时并没有传入domain的情况，此方法并不一定会删掉指定name的cookie，因为这样只会清除当前域下的cookie值。<br>
            如果确定需要清除掉所有叫name的cookie,需要针对父域也调用一次。</em>
     * @alias module:qwd/libCookie.del
     * @param {String} name 必要参数， 需要删除的cookie名
     * @param {String} [path="/"] cookie储存的路径，不设置默认"/"
     * @param {String} [domain] cookie储存的域名，不设置默认为当前域
     * @param {Boolean} [secure] 是否为https的cookie，不设置默认为false
     */
    function deleteCookie(name, path, domain, secure) {
        if(!name){
            return;
        }
        setCookie(name, "", -100, path, domain, secure);    // 删除cookie其实就是将设置成已过期的cookie
    }
    
    // 暴露接口
    exports.set = setCookie;
    exports.get = getCookie;
    exports.del = deleteCookie;
});