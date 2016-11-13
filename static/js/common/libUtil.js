define("libUtil", function(require, exports, module) {
    "use strict";

    var utilModule = {};
    /**
     * @desc 简单的模板替换方法，针对{#xxx#}替换的strReplace的性能优化版，只会替换{#xxx#}
     * @param {String} tpl  模板字符串
     * @param {Object} data 模板替换值对象，需要以"{#xxx#}"为key。
     */
    function renderTpl(tpl, data) {
        if(!tpl || !data){
            return;
        }
        return tpl.replace(/\{#\w+#\}/g, function(key){
            return data[key] === undefined? key : data[key];
        });
    };
    utilModule.renderTpl = renderTpl; //暴露此接口


    /**
     * @desc 实现html文本替换为实体的功能。 会将如&lt;, &gt;, &amp;替换为他们的html实体&amp;lt;, &amp;gt;, &amp;amp;
     * @param {String} str  必要参数，需要escape替换的字符串
     * @param {String} [type="html"]  默认为HTML文本的转换。当传入"attr"时，表示HTML属性值的替换（如放入src属性的图片url）。
     */
    utilModule.htmlEscape = function(str, type) {
        if (type === "attr") {
            return str.replace(/[&'"<>\/\\\-\x00-\x1f\x80-\xff]/g, function(r) {
                return "&#" + r.charCodeAt(0) + ";";
            });
        } else {
            return str.replace(/[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r) {
                return "&#" + r.charCodeAt(0) + ";";
            });
        }
    };
    /**
     * @desc 获取指定序列化的字符串或者页面search字符串中指定参数名的值并返回。 search字符串指的是页面地址中?以后的参数字符串。
     * @param {String} name  必要参数， 需要获取的参数名。
     * @param {String} [str]  序列化字符串。 不传入时为页面的search字符串。
     * @return {(String|null)} 获取到的值，如果不为null将进行一次decodeURIComponent()处理。
     */
    function getQuery(name, str) {
        str = str || location.search;
        var reg = new RegExp("(?:^|[?&])" + name + "=([^&]*)(?:&|$)"),
            result = str.match(reg);
        return result ? (result[1] ? decodeURIComponent(result[1]) : "") : null;
    }
    utilModule.getQuery = getQuery; // 暴露此接口
    /**
     * @desc 格式化时间。可以传入格式按照指定格式格式化，或者返回一个包含时间信息的对象自行拼接格式
     * @param {String} [format="datetime"]  需要的时间格式。字符串内包含的YYYY、MM、DD、HH、mm、SS、sss分别表示年、月、日、时、分、秒、毫秒。<br>
                       特殊值"date"表示"YYYY-MM-DD"，"time"表示"HH:mm:SS", "datetime"表示"YYYY-MM-DD HH:mm:SS"，"object"表示返回时间值对象<br>
                       传入"object"时，此方法将返回一个包含上述属性的对象，此对象还包含更加同易读的属性名，比如year等同于YYYY， millisecond等同于sss<br>
                       <em>传入其他格式时，请注意对格式值做间隔，连续的属性值也会被解析，比如YYYYYYYY将会被替换为两次年份。如有特殊需要，可使用"object"自行拼接</em>
     * @param {Date|int} [time]  表示需要格式化的Date对象或者一个13位毫秒计的时间戳（直接传入Date处理）。不传入时使用当前本地时间。
     * @return {(String|Object)} 转换得到的时间格式字符串，或者时间信息对象
     * @example <caption>一些使用情况：</caption>
        var util = require("dm.qwd.libUtil");
        // 按照格式YYYY/MM/DD HH:mm:SS.sss展示一个当前的时间
        // 弹窗 2015/12/16 16:39:05.328
        alert(util.formatTime("YYYY/MM/DD HH:mm:SS.sss"));

        // 获得一个时间的对象并自己拼接
        // 弹窗 这个支持YYYY/MM/DD的玩意儿在12月16日完成
        var timeObject = util.formatTime("object");
        alert("这个支持YYYY/MM/DD的玩意儿在"+timeObject.month+"月"+timeObject.date+"日完成");
     */
    utilModule.formatTime = function(format, time) {
        var dateToFormat, formatObject;
        if (!format || format === "datetime") {
            format = "YYYY-MM-DD HH:mm:SS";
        } else if (format === "date") {
            format = "YYYY-MM-DD";
        } else if (format === "time") {
            format = "HH:mm:SS";
        }
        if (time instanceof Date) {
            dateToFormat = time;
        } else if (!isNaN(parseInt(time))) {
            dateToFormat = new Date(parseInt(time));
        } else {
            dateToFormat = new Date();
        }
        formatObject = {
            "YYYY": dateToFormat.getFullYear(),
            "MM": strPad(dateToFormat.getMonth() + 1, 2, "0"),
            "DD": strPad(dateToFormat.getDate(), 2, "0"),
            "HH": strPad(dateToFormat.getHours(), 2, "0"),
            "mm": strPad(dateToFormat.getMinutes(), 2, "0"),
            "SS": strPad(dateToFormat.getSeconds(), 2, "0"),
            "sss": strPad(dateToFormat.getMilliseconds(), 3, "0")
        };
        // 虽然这里直接用strReplace来做替换存在许多潜在的问题，但足够我们平常的使用。
        // 如果需要更复杂的使用方式，就还是留给使用自己做拼接，所以提供返回Object的方式
        if (format !== "object") {
            return renderTpl(format, formatObject);
        } else {
            formatObject.year = formatObject.YYYY;
            formatObject.month = formatObject.MM;
            formatObject.day = formatObject.DD;
            formatObject.hour = formatObject.HH;
            formatObject.minute = formatObject.mm;
            formatObject.second = formatObject.SS;
            formatObject.millisecond = formatObject.sss;
            return formatObject;
        }
    };


    /**
     * @desc 使用指定值填充字符串至指定的长度。
     * @alias module:qwd/libUtil.strPad
     * @param {String} str  必要参数， 需要被扩充的字符串，如果传入的值不是字符串，将对其调用toString()，如果不存在此方法，当做空字符串处理。
     * @param {int} [len]  必要参数，需要填充到的长度，不传入此参数或者传入的长度小于传入字符串的原本长度时，将不进行填充处理。
     * @param {String} [pad=" "] 填充用的字符串，默认为一个空格" "。
     * @param {Boolean} [toLeft=true] 是否填充至左边，传入false填充至右边。
     * @return {String} 填充后的字符串，或原字符串（如果未执行填充）。
     * @example <caption>将一个数组所有元素一一弹窗出来，且为每一个元素加上如"#01"这样的序号</caption>
        var util = require("dm.qwd.libUtil");
        var arr = ["a", "b", "c"];
        for (var i = 0, len = arr.length; i < len; i++){
            // 将依次弹窗 #01a #02b #03c
            alert(util.strPad(util.strPad(i+1, 2, "0"),3,"#") + arr[i]);
        }
     */
    function strPad(str, len, pad, toLeft) {
        if (str === undefined) {
            return;
        }
        str = typeof str === "string" ? str : ((str && str.toString) ? str.toString() : "");
        var strLen = str.length,
            paddingStr = "";
        if (!len || strLen >= len) {
            return str;
        }
        pad = pad || " ";
        toLeft = toLeft !== undefined ? (!!toLeft) : true;
        for (var left = len - strLen; left > 0; left--) {
            paddingStr += pad;
        }
        return toLeft ? (paddingStr + str) : (str + paddingStr);
    }
    utilModule.strPad = strPad; // 暴露此接口

    /**
     * 去掉网址开头的"http:"或者"https:"，保留"//xxx.xx.xxx"
     * @alias module:qwd/libUtil.trimProtocol
     * @param  {String} url 需要去除协议的URL地址
     * @param {Boolean} [addSlash=false] 对于不带协议的地址，是否补上"//"。默认false不补全。<em>注意相对路径一定不能补"//"！<em>
     * @return {String}     协议去除后的URL地址
     */
    function trimProtocol(url, addSlash) {
        var matches = url.match(/^(https?:)?\/\//);
        addSlash = typeof addSlash === "undefined" ? false : addSlash;
        if (!matches) { // 如果地址没有"http://" 或 "https://"这样的开头，根据参数决定是否加上
            return addSlash ? ("//" + url) : url;
        }
        if (matches[1]) { // 将带有的http:或者https:去掉，只保留//以兼容后续https升级
            return url.replace(matches[1], "");
        }
        return url;
    }
    utilModule.trimProtocol = trimProtocol;


    /**
     * 增加网址的协议前缀为"xxx://xxx.xx.xxx"
     * @param  {String} url 需要增加协议的URL地址
     * @param {String} [protocol=location.protocol] 增加的协议类型，默认为当前页面的协议。
     *                                              如果使用这个参数，注意参数需要传入"http:"或者"https:" （有冒号）
     * @return {String}     增加协议后的URL地址
     */
    utilModule.addProtocol = function addProtocol(url,protocol){
        var matches =url.match(/^(https?:)\/\//);
        protocol = typeof protocol === "undefined" ? location.protocol : protocol;
        if(!matches){
            return protocol + url;
        }
        if(matches){
            return url.replace(matches[1], protocol);
        }

        return url;
    };

    /**
     * @desc 用于请求后台CGI时，去掉请求参数对象中值为空的key且组合成字符串参数
     * @param {Object} obj 必传参数，CGI传参对象
     * @return {String} 经过组合拼接后的传参字符串
     * @example
     * var params = {
     *     st: "v1",
     *     et: "", //String形传值为空，被丢弃
     *     len: 0, //Int形传值为0,被保留
     *     ie: "utf-8"
     * };
     *
     * toParams(params);
     * //以上输出：&st=v1&len=0&ie=utf-8
     */
    utilModule.toParams = function(obj) {
        var str = [];
        if (obj == null) {
            return "";
        }
        for (var key in obj) {
            if (typeof obj[key] == "string" && obj[key] !== "") {
                str.push("&" + key + "=" + obj[key]);
            } else if (typeof obj[key] != "string") {
                str.push("&" + key + "=" + obj[key]);
            }
        }
        return str.join("");
    };

    /**
     * @desc 用于事件监听，事件删除，事件触发
     * @property {object} object.obj 总事件池，其中每个key对应一个事件池，eg. {key0: [fn0, fn1, ...], key1: [fn0, fn1, ...]}
     * @property {function} object.listen 事件池监听函数句柄
     * @property {function} object.remove 事件池删除函数句柄
     * @property {function} object.trigger 事件池触发函数句柄
     * @example
     * //首先监听一个事件，PS：如示例中，把order0和order1对应的函数加入到了testkey的事件池中
     * events.listen("testkey", function() {
     *     console.log("order0--testkey事件池被触发！");
     * });
     * events.listen("testkey", function() {
     *     console.log("order1--testkey事件池被触发！");
     * });
     * //触发testkey事件池，执行testkey中所有的监听事件，即输出为:
     * //order0--testkey事件池被触发！
     * //order1--testkey事件池被触发！
     * events.trigger("testkey");
     *
     *
     * //删除某个key对应的事件池
     * events.remove("testkey");
     */
    utilModule.events = (function() {
        var obj, listen, remove, trigger, _this;
        obj = {};
        _this = this;
        listen = function(key, eventfn) { //将事件加入监听队列
            var stack, _ref; //stack：队列的池子
            stack = (_ref = obj[key]) != null ? _ref : obj[key] = [];
            return stack.push(eventfn);
        };
        remove = function(key) {
            var _ref;
            return (_ref = obj[key]) != null ? _ref.length = 0 : void 0; //清空队列中方法
        };
        trigger = function() { //触发事件
            var fn, stack, _i, _len, _ref, key;
            key = Array.prototype.shift.call(arguments);
            stack = (_ref = obj[key]) != null ? _ref : obj[key] = []; //检查是否有这个元素
            for (_i = 0, _len = stack.length; _i < _len; _i++) {
                fn = stack[_i];
                if (fn.apply(_this, arguments) === false) {
                    return false;
                }
            }
        };
        return {
            obj: obj,
            listen: listen,
            remove: remove,
            trigger: trigger
        };
    })();

    /**
     * 表示当前环境的取值，可能的取值有: 微信- "weixin"， QQ- "qq"，IPAD和IPHONE- "apple"， 安卓- "andorid"，未知 - ""（表示暂不做支持）
     * <p><em>这个和libCordova的environment值的相同，实际上现在libCordova用的是这个值。
     * 稍微对原有正则做了一些删减的优化，因为其实没必要那么详细。没有检测出来的返回为空字符串。</em></p>
     * @type {String}
     */
    utilModule.environment = (function(ua){
        var regExp = {
                "android": /Android/,
                "apple": /iP(?:ad|hone|od)\s/,
                "qq": /QQ\/(?:[\d\.]+)/
            },
            environment = "";
        if (ua.toLowerCase().indexOf('micromessenger') > -1) {
            environment = "weixin";
        } else if(regExp.qq.test(ua)){
            environment = "qq";
        } else if (regExp.apple.test(ua)) {
            environment = "apple";
        } else if (regExp.android.test(ua)) {
            environment = "android";
        }
        return environment;
    })(navigator.userAgent);

    return utilModule;
});
