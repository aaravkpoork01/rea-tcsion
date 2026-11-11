"undefined" == typeof jwplayer && (jwplayer = function() {
    return jwplayer.api ? jwplayer.api.selectPlayer.apply(this, arguments) : void 0
}, jwplayer.version = "6.12.4956", jwplayer.vid = document.createElement("video"), jwplayer.audio = document.createElement("audio"), jwplayer.source = document.createElement("source"), function() {
    var e = {},
        t = Array.prototype,
        n = Object.prototype,
        i = t.slice,
        r = t.concat,
        a = n.toString,
        o = n.hasOwnProperty,
        s = t.map,
        l = t.forEach,
        u = t.filter,
        c = t.every,
        d = t.some,
        f = t.indexOf,
        p = (n = Array.isArray, Object.keys),
        h = function(e) {
            return e instanceof h ? e : this instanceof h ? void 0 : new h(e)
        },
        g = h.each = h.forEach = function(t, n, i) {
            if (null == t) return t;
            if (l && t.forEach === l) t.forEach(n, i);
            else if (t.length === +t.length) {
                for (var r = 0, a = t.length; a > r; r++)
                    if (n.call(i, t[r], r, t) === e) return
            } else {
                var o = h.keys(t);
                for (r = 0, a = o.length; a > r; r++)
                    if (n.call(i, t[o[r]], o[r], t) === e) return
            }
            return t
        };
    h.map = h.collect = function(e, t, n) {
        var i = [];
        return null == e ? i : s && e.map === s ? e.map(t, n) : (g(e, function(e, r, a) {
            i.push(t.call(n, e, r, a))
        }), i)
    }, h.find = h.detect = function(e, t, n) {
        var i;
        return y(e, function(e, r, a) {
            return t.call(n, e, r, a) ? (i = e, !0) : void 0
        }), i
    }, h.filter = h.select = function(e, t, n) {
        var i = [];
        return null == e ? i : u && e.filter === u ? e.filter(t, n) : (g(e, function(e, r, a) {
            t.call(n, e, r, a) && i.push(e)
        }), i)
    }, h.every = h.all = function(t, n, i) {
        n || (n = h.identity);
        var r = !0;
        return null == t ? r : c && t.every === c ? t.every(n, i) : (g(t, function(t, a, o) {
            return (r = r && n.call(i, t, a, o)) ? void 0 : e
        }), !!r)
    };
    var y = h.some = h.any = function(t, n, i) {
        n || (n = h.identity);
        var r = !1;
        return null == t ? r : d && t.some === d ? t.some(n, i) : (g(t, function(t, a, o) {
            return r || (r = n.call(i, t, a, o)) ? e : void 0
        }), !!r)
    };
    h.size = function(e) {
        return null == e ? 0 : e.length === +e.length ? e.length : h.keys(e).length
    }, h.after = function(e, t) {
        return function() {
            return 1 > --e ? t.apply(this, arguments) : void 0
        }
    }, h.sortedIndex = function(e, t, n, i) {
        t = (n = null == n ? h.identity : h.isFunction(n) ? n : h.property(n)).call(i, t);
        for (var r = 0, a = e.length; a > r;) {
            var o = r + a >>> 1;
            n.call(i, e[o]) < t ? r = o + 1 : a = o
        }
        return r
    }, h.find = h.detect = function(e, t, n) {
        var i;
        return y(e, function(e, r, a) {
            return t.call(n, e, r, a) ? (i = e, !0) : void 0
        }), i
    }, y = h.some = h.any = function(t, n, i) {
        n || (n = h.identity);
        var r = !1;
        return null == t ? r : d && t.some === d ? t.some(n, i) : (g(t, function(t, a, o) {
            return r || (r = n.call(i, t, a, o)) ? e : void 0
        }), !!r)
    }, h.contains = h.include = function(e, t) {
        return null != e && (e.length !== +e.length && (e = h.values(e)), 0 <= h.indexOf(e, t))
    }, h.where = function(e, t) {
        return h.filter(e, h.matches(t))
    }, h.difference = function(e) {
        var n = r.apply(t, i.call(arguments, 1));
        return h.filter(e, function(e) {
            return !h.contains(n, e)
        })
    }, h.without = function(e) {
        return h.difference(e, i.call(arguments, 1))
    }, h.indexOf = function(e, t, n) {
        if (null == e) return -1;
        var i = 0,
            r = e.length;
        if (n) {
            if ("number" != typeof n) return e[i = h.sortedIndex(e, t)] === t ? i : -1;
            i = 0 > n ? Math.max(0, r + n) : n
        }
        if (f && e.indexOf === f) return e.indexOf(t, n);
        for (; r > i; i++)
            if (e[i] === t) return i;
        return -1
    }, h.partial = function(e) {
        var t = i.call(arguments, 1);
        return function() {
            for (var n = 0, i = t.slice(), r = 0, a = i.length; a > r; r++) i[r] === h && (i[r] = arguments[n++]);
            for (; n < arguments.length;) i.push(arguments[n++]);
            return e.apply(this, i)
        }
    }, h.memoize = function(e, t) {
        var n = {};
        return t || (t = h.identity),
            function() {
                var i = t.apply(this, arguments);
                return h.has(n, i) ? n[i] : n[i] = e.apply(this, arguments)
            }
    }, h.delay = function(e, t) {
        var n = i.call(arguments, 2);
        return setTimeout(function() {
            return e.apply(null, n)
        }, t)
    }, h.defer = function(e) {
        return h.delay.apply(h, [e, 1].concat(i.call(arguments, 1)))
    }, h.keys = function(e) {
        if (!h.isObject(e)) return [];
        if (p) return p(e);
        var t, n = [];
        for (t in e) h.has(e, t) && n.push(t);
        return n
    }, h.pick = function(e) {
        var n = {},
            a = r.apply(t, i.call(arguments, 1));
        return g(a, function(t) {
            t in e && (n[t] = e[t])
        }), n
    }, h.isArray = n || function(e) {
        return "[object Array]" == a.call(e)
    }, h.isObject = function(e) {
        return e === Object(e)
    }, g("Arguments Function String Number Date RegExp".split(" "), function(e) {
        h["is" + e] = function(t) {
            return a.call(t) == "[object " + e + "]"
        }
    }), h.isArguments(arguments) || (h.isArguments = function(e) {
        return !(!e || !h.has(e, "callee"))
    }), "function" != typeof /./ && (h.isFunction = function(e) {
        return "function" == typeof e
    }), h.isFinite = function(e) {
        return isFinite(e) && !isNaN(parseFloat(e))
    }, h.isNaN = function(e) {
        return h.isNumber(e) && e != +e
    }, h.isBoolean = function(e) {
        return !0 === e || !1 === e || "[object Boolean]" == a.call(e)
    }, h.isNull = function(e) {
        return null === e
    }, h.isUndefined = function(e) {
        return void 0 === e
    }, h.has = function(e, t) {
        return o.call(e, t)
    }, h.identity = function(e) {
        return e
    }, h.constant = function(e) {
        return function() {
            return e
        }
    }, h.property = function(e) {
        return function(t) {
            return t[e]
        }
    }, h.matches = function(e) {
        return function(t) {
            if (t === e) return !0;
            for (var n in e)
                if (e[n] !== t[n]) return !1;
            return !0
        }
    }, h.result = function(e, t) {
        if (null != e) {
            var n = e[t];
            return h.isFunction(n) ? n.call(e) : n
        }
    }, this._ = h
}.call(jwplayer), function(e) {
    function t(e) {
        return function() {
            return o(e)
        }
    }

    function n(e, t, n, r, a) {
        return function() {
            var o, s;
            if (a) n(e);
            else {
                try {
                    if ((o = e.responseXML) && (s = o.firstChild, o.lastChild && "parsererror" === o.lastChild.nodeName)) return void(r && r("Invalid XML", t, e))
                } catch (e) {}
                if (o && s) return n(e);
                (o = i.parseXML(e.responseText)) && o.firstChild ? (e = i.extend({}, e, {
                    responseXML: o
                }), n(e)) : r && r(e.responseText ? "Invalid XML" : t, t, e)
            }
        }
    }
    var i = e.utils = {},
        r = e._;
    i.exists = function(e) {
        switch (typeof e) {
            case "string":
                return 0 < e.length;
            case "object":
                return null !== e;
            case "undefined":
                return !1
        }
        return !0
    }, i.styleDimension = function(e) {
        return e + (0 < e.toString().indexOf("%") ? "" : "px")
    }, i.getAbsolutePath = function(e, t) {
        if (i.exists(t) || (t = document.location.href), i.exists(e)) {
            var n;
            if (i.exists(e)) {
                n = e.indexOf("://");
                var r = e.indexOf("?");
                n = n > 0 && (0 > r || r > n)
            } else n = void 0;
            if (n) return e;
            n = t.substring(0, t.indexOf("://") + 3);
            var a;
            r = t.substring(n.length, t.indexOf("/", n.length + 1));
            0 === e.indexOf("/") ? a = e.split("/") : a = (a = (a = t.split("?")[0]).substring(n.length + r.length + 1, a.lastIndexOf("/"))).split("/").concat(e.split("/"));
            for (var o = [], s = 0; s < a.length; s++) a[s] && i.exists(a[s]) && "." !== a[s] && (".." === a[s] ? o.pop() : o.push(a[s]));
            return n + r + "/" + o.join("/")
        }
    }, i.extend = function() {
        var e = Array.prototype.slice.call(arguments, 0);
        if (1 < e.length) {
            for (var t = e[0], n = function(e, n) {
                    null != n && (t[e] = n)
                }, r = 1; r < e.length; r++) i.foreach(e[r], n);
            return t
        }
        return null
    };
    var a = window.console = window.console || {
        log: function() {}
    };
    i.log = function() {
        var e = Array.prototype.slice.call(arguments, 0);
        "object" == typeof a.log ? a.log(e) : a.log.apply(a, e)
    };
    var o = r.memoize(function(e) {
        return null !== navigator.userAgent.toLowerCase().match(e)
    });
    i.isFF = t(/firefox/i), i.isChrome = t(/chrome/i), i.isIPod = t(/iP(hone|od)/i), i.isIPad = t(/iPad/i), i.isSafari602 = t(/Macintosh.*Mac OS X 10_8.*6\.0\.\d* Safari/i), i.isIETrident = function(e) {
        return e ? (e = parseFloat(e).toFixed(1), o(RegExp("trident/.+rv:\\s*" + e, "i"))) : o(/trident/i)
    }, i.isMSIE = function(e) {
        return e ? (e = parseFloat(e).toFixed(1), o(RegExp("msie\\s*" + e, "i"))) : o(/msie/i)
    }, i.isIE = function(e) {
        return e ? (e = parseFloat(e).toFixed(1)) >= 11 ? i.isIETrident(e) : i.isMSIE(e) : i.isMSIE() || i.isIETrident()
    }, i.isSafari = function() {
        return o(/safari/i) && !o(/chrome/i) && !o(/chromium/i) && !o(/android/i)
    }, i.isIOS = function(e) {
        return o(e ? RegExp("iP(hone|ad|od).+\\sOS\\s" + e, "i") : /iP(hone|ad|od)/i)
    }, i.isAndroidNative = function(e) {
        return i.isAndroid(e, !0)
    }, i.isAndroid = function(e, t) {
        return !(t && o(/chrome\/[123456789]/i) && !o(/chrome\/18/)) && (e ? (i.isInt(e) && !/\./.test(e) && (e += "."), o(RegExp("Android\\s*" + e, "i"))) : o(/Android/i))
    }, i.isMobile = function() {
        return i.isIOS() || i.isAndroid()
    }, i.isIframe = function() {
        return window.frameElement && "IFRAME" === window.frameElement.nodeName
    }, i.saveCookie = function(e, t) {
        document.cookie = "jwplayer." + e + "=" + t + "; path=/"
    }, i.getCookies = function() {
        for (var e = {}, t = document.cookie.split("; "), n = 0; n < t.length; n++) {
            var i = t[n].split("=");
            0 === i[0].indexOf("jwplayer.") && (e[i[0].substring(9, i[0].length)] = i[1])
        }
        return e
    }, i.isInt = function(e) {
        return 0 == parseFloat(e) % 1
    }, i.typeOf = function(e) {
        if (null === e) return "null";
        var t = typeof e;
        return "object" === t && r.isArray(e) ? "array" : t
    }, i.translateEventResponse = function(t, n) {
        var r = i.extend({}, n);
        if (t !== e.events.JWPLAYER_FULLSCREEN || r.fullscreen)
            if ("object" == typeof r.data) {
                var a = r.data;
                delete r.data, r = i.extend(r, a)
            } else "object" == typeof r.metadata && i.deepReplaceKeyName(r.metadata, ["__dot__", "__spc__", "__dsh__", "__default__"], [".", " ", "-", "default"]);
        else r.fullscreen = "true" === r.message, delete r.message;
        return i.foreach(["position", "duration", "offset"], function(e, t) {
            r[t] && (r[t] = Math.round(1e3 * r[t]) / 1e3)
        }), r
    }, i.flashVersion = function() {
        if (i.isAndroid()) return 0;
        var e, t = navigator.plugins;
        try {
            if ("undefined" !== t && (e = t["Shockwave Flash"])) return parseInt(e.description.replace(/\D+(\d+)\..*/, "$1"), 10)
        } catch (e) {}
        if (void 0 !== window.ActiveXObject) try {
            if (e = new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash")) return parseInt(e.GetVariable("$version").split(" ")[1].split(",")[0], 10)
        } catch (e) {}
        return 0
    }, i.getScriptPath = function(e) {
        for (var t = document.getElementsByTagName("script"), n = 0; n < t.length; n++) {
            var i = t[n].src;
            if (i && 0 <= i.indexOf(e)) return i.substr(0, i.indexOf(e))
        }
        return ""
    }, i.deepReplaceKeyName = function(t, n, r) {
        switch (e.utils.typeOf(t)) {
            case "array":
                for (var a = 0; a < t.length; a++) t[a] = e.utils.deepReplaceKeyName(t[a], n, r);
                break;
            case "object":
                i.foreach(t, function(i, a) {
                    var o;
                    if (n instanceof Array && r instanceof Array) {
                        if (n.length !== r.length) return;
                        o = n
                    } else o = [n];
                    for (var s = i, l = 0; l < o.length; l++) s = s.replace(RegExp(n[l], "g"), r[l]);
                    t[s] = e.utils.deepReplaceKeyName(a, n, r), i !== s && delete t[i]
                })
        }
        return t
    };
    var s = i.pluginPathType = {
        ABSOLUTE: 0,
        RELATIVE: 1,
        CDN: 2
    };
    i.getPluginPathType = function(e) {
        if ("string" == typeof e) {
            var t = (e = e.split("?")[0]).indexOf("://");
            if (t > 0) return s.ABSOLUTE;
            var n = e.indexOf("/");
            return e = i.extension(e), !(0 > t && 0 > n) || e && isNaN(e) ? s.RELATIVE : s.CDN
        }
    }, i.getPluginName = function(e) {
        return e.replace(/^(.*\/)?([^-]*)-?.*\.(swf|js)$/, "$2")
    }, i.getPluginVersion = function(e) {
        return e.replace(/[^-]*-?([^\.]*).*$/, "$1")
    }, i.isYouTube = function(e, t) {
        return "youtube" === t || /^(http|\/\/).*(youtube\.com|youtu\.be)\/.+/.test(e)
    }, i.youTubeID = function(e) {
        try {
            return /v[=\/]([^?&]*)|youtu\.be\/([^?]*)|^([\w-]*)$/i.exec(e).slice(1).join("").replace("?", "")
        } catch (e) {
            return ""
        }
    }, i.isRtmp = function(e, t) {
        return 0 === e.indexOf("rtmp") || "rtmp" === t
    }, i.foreach = function(e, t) {
        var n;
        for (n in e) "function" === i.typeOf(e.hasOwnProperty) ? e.hasOwnProperty(n) && t(n, e[n]) : t(n, e[n])
    }, i.isHTTPS = function() {
        return 0 === window.location.href.indexOf("https")
    }, i.repo = function() {
        var t = "http://p.jwpcdn.com/" + e.version.split(/\W/).splice(0, 2).join("/") + "/";
        try {
            i.isHTTPS() && (t = t.replace("http://", "https://ssl."))
        } catch (e) {}
        return t
    }, i.versionCheck = function(t) {
        t = ("0" + t).split(/\W/);
        var n = e.version.split(/\W/),
            i = parseFloat(t[0]),
            r = parseFloat(n[0]);
        return !(i > r || i === r && parseFloat("0" + t[1]) > parseFloat(n[1]))
    }, i.ajax = function(e, t, r, a) {
        var o, s = !1;
        if (0 < e.indexOf("#") && (e = e.replace(/#.*$/, "")), e && 0 <= e.indexOf("://") && e.split("/")[2] !== window.location.href.split("/")[2] && i.exists(window.XDomainRequest))(o = new window.XDomainRequest).onload = n(o, e, t, r, a), o.ontimeout = o.onprogress = function() {}, o.timeout = 5e3;
        else {
            if (!i.exists(window.XMLHttpRequest)) return r && r("", e, o), o;
            var l = o = new window.XMLHttpRequest,
                u = e;
            o.onreadystatechange = function() {
                if (4 === l.readyState) switch (l.status) {
                    case 200:
                        n(l, u, t, r, a)();
                        break;
                    case 404:
                        r("File not found", u, l)
                }
            }
        }
        o.overrideMimeType && o.overrideMimeType("text/xml");
        var c = e,
            d = o;
        o.onerror = function() {
            r("Error loading file", c, d)
        };
        try {
            o.open("GET", e, !0)
        } catch (e) {
            s = !0
        }
        return setTimeout(function() {
            if (s) r && r(e, e, o);
            else try {
                o.send()
            } catch (t) {
                r && r(e, e, o)
            }
        }, 0), o
    }, i.parseXML = function(e) {
        var t;
        try {
            if (window.DOMParser) {
                if ((t = (new window.DOMParser).parseFromString(e, "text/xml")).childNodes && t.childNodes.length && "parsererror" === t.childNodes[0].firstChild.nodeName) return
            } else(t = new window.ActiveXObject("Microsoft.XMLDOM")).async = "false", t.loadXML(e)
        } catch (e) {
            return
        }
        return t
    }, i.between = function(e, t, n) {
        return Math.max(Math.min(e, n), t)
    }, i.seconds = function(e) {
        if (r.isNumber(e)) return e;
        var t = (e = e.replace(",", ".")).split(":"),
            n = 0;
        return "s" === e.slice(-1) ? n = parseFloat(e) : "m" === e.slice(-1) ? n = 60 * parseFloat(e) : "h" === e.slice(-1) ? n = 3600 * parseFloat(e) : 1 < t.length ? (n = parseFloat(t[t.length - 1]), n += 60 * parseFloat(t[t.length - 2]), 3 === t.length && (n += 3600 * parseFloat(t[t.length - 3]))) : n = parseFloat(e), n
    }, i.serialize = function(e) {
        return null === e ? null : "true" === e.toString().toLowerCase() || "false" !== e.toString().toLowerCase() && (isNaN(Number(e)) || 5 < e.length || 0 === e.length ? e : Number(e))
    }, i.addClass = function(e, t) {
        var n = r.isString(e.className) ? e.className.split(" ") : [],
            a = r.isArray(t) ? t : t.split(" ");
        r.each(a, function(e) {
            r.contains(n, e) || n.push(e)
        }), e.className = i.trim(n.join(" "))
    }, i.removeClass = function(e, t) {
        var n = r.isString(e.className) ? e.className.split(" ") : [],
            a = r.isArray(t) ? t : t.split(" ");
        e.className = i.trim(r.difference(n, a).join(" "))
    }, i.emptyElement = function(e) {
        for (; e.firstChild;) e.removeChild(e.firstChild)
    }, i.indexOf = r.indexOf, i.noop = function() {}, i.canCast = function() {
        var t = e.cast;
        return !(!t || !r.isFunction(t.available) || !t.available())
    }
}(jwplayer), function(e) {
    function t(e) {
        var t = document.createElement("style");
        return e && t.appendChild(document.createTextNode(e)), t.type = "text/css", document.getElementsByTagName("head")[0].appendChild(t), t
    }

    function n(e, t, n) {
        return o.exists(t) ? (n = n ? " !important" : "", "string" == typeof t && isNaN(t) ? /png|gif|jpe?g/i.test(t) && 0 > t.indexOf("url") ? "url(" + t + ")" : t + n : 0 === t || "z-index" === e || "opacity" === e ? "" + t + n : /color/i.test(e) ? "#" + o.pad(t.toString(16).replace(/^0x/i, ""), 6) + n : Math.ceil(t) + "px" + n) : ""
    }

    function i(e, t) {
        for (var n = 0; n < e.length; n++) {
            var i, r, a = e[n];
            if (null != a)
                for (i in t) {
                    r = (r = i).split("-");
                    for (var o = 1; o < r.length; o++) r[o] = r[o].charAt(0).toUpperCase() + r[o].slice(1);
                    r = r.join(""), a.style[r] !== t[i] && (a.style[r] = t[i])
                }
        }
    }

    function r(e) {
        var t, n, i, r = s[e].sheet;
        if (r) {
            t = r.cssRules, n = c[e];
            var a = l[i = e];
            for (var o in i += " { ", a) i += o + ": " + a[o] + "; ";
            if (i += "}", void 0 !== n && n < t.length && t[n].selectorText === e) {
                if (i === t[n].cssText) return;
                r.deleteRule(n)
            } else n = t.length, c[e] = n;
            try {
                r.insertRule(i, n)
            } catch (e) {}
        }
    }
    var a, o = e.utils,
        s = {},
        l = {},
        u = null,
        c = {};
    o.cssKeyframes = function(e, n) {
        (i = s.keyframes) || (i = t(), s.keyframes = i);
        var i = i.sheet,
            r = "@keyframes " + e + " { " + n + " }";
        try {
            i.insertRule(r, i.cssRules.length)
        } catch (e) {}
        r = r.replace(/(keyframes|transform)/g, "-webkit-$1");
        try {
            i.insertRule(r, i.cssRules.length)
        } catch (e) {}
    };
    var d = o.css = function(e, i, o) {
        l[e] || (l[e] = {});
        var c = l[e];
        o = o || !1;
        var d, f, p = !1;
        for (d in i) "" !== (f = n(d, i[d], o)) ? f !== c[d] && (c[d] = f, p = !0) : void 0 !== c[d] && (delete c[d], p = !0);
        p && (s[e] || (i = a && a.sheet && a.sheet.cssRules && a.sheet.cssRules.length || 0, (!a || i > 5e4) && (a = t()), s[e] = a), null !== u ? u.styleSheets[e] = l[e] : r(e))
    };
    d.style = function(t, r, a) {
        if (null != t) {
            void 0 === t.length && (t = [t]);
            var o, s = {};
            for (o in r) s[o] = n(o, r[o]);
            if (null === u || a) i(t, s);
            else {
                for (var l in r = (r = t.__cssRules) || {}, s) r[l] = s[l];
                t.__cssRules = r, 0 > e._.indexOf(u.elements, t) && u.elements.push(t)
            }
        }
    }, d.block = function(e) {
        null === u && (u = {
            id: e,
            styleSheets: {},
            elements: []
        })
    }, d.unblock = function(e) {
        if (u && (!e || u.id === e)) {
            for (var t in u.styleSheets) r(t);
            for (e = 0; e < u.elements.length; e++) i(t = u.elements[e], t.__cssRules);
            u = null
        }
    }, o.clearCss = function(e) {
        for (var t in l) 0 <= t.indexOf(e) && delete l[t];
        for (var n in s) 0 <= n.indexOf(e) && r(n)
    }, o.transform = function(e, t) {
        var n = {};
        t = t || "", n.transform = t, n["-webkit-transform"] = t, n["-ms-transform"] = t, n["-moz-transform"] = t, n["-o-transform"] = t, "string" == typeof e ? d(e, n) : d.style(e, n)
    }, o.dragStyle = function(e, t) {
        d(e, {
            "-webkit-user-select": t,
            "-moz-user-select": t,
            "-ms-user-select": t,
            "-webkit-user-drag": t,
            "user-select": t,
            "user-drag": t
        })
    }, o.transitionStyle = function(e, t) {
        navigator.userAgent.match(/5\.\d(\.\d)? safari/i) || d(e, {
            "-webkit-transition": t,
            "-moz-transition": t,
            "-o-transition": t,
            transition: t
        })
    }, o.rotate = function(e, t) {
        o.transform(e, "rotate(" + t + "deg)")
    }, o.rgbHex = function(e) {
        return 3 === (e = String(e).replace("#", "")).length && (e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]), "#" + e.substr(-6)
    }, o.hexToRgba = function(e, t) {
        var n = "rgb",
            i = [parseInt(e.substr(1, 2), 16), parseInt(e.substr(3, 2), 16), parseInt(e.substr(5, 2), 16)];
        return void 0 !== t && 100 !== t && (n += "a", i.push(t / 100)), n + "(" + i.join(",") + ")"
    }
}(jwplayer), function(e) {
    var t = jwplayer._,
        n = e.foreach,
        i = {
            mp4: "video/mp4",
            ogg: "video/ogg",
            oga: "audio/ogg",
            vorbis: "audio/ogg",
            webm: "video/webm",
            aac: "audio/mp4",
            mp3: "audio/mpeg",
            hls: "application/vnd.apple.mpegurl"
        },
        r = {
            mp4: i.mp4,
            f4v: i.mp4,
            m4v: i.mp4,
            mov: i.mp4,
            m4a: i.aac,
            f4a: i.aac,
            aac: i.aac,
            mp3: i.mp3,
            ogv: i.ogg,
            ogg: i.ogg,
            oga: i.vorbis,
            vorbis: i.vorbis,
            webm: i.webm,
            m3u8: i.hls,
            m3u: i.hls,
            hls: i.hls
        },
        a = e.extensionmap = {};
    n(r, function(e, t) {
        a[e] = {
            html5: t
        }
    }), n({
        flv: "video",
        f4v: "video",
        mov: "video",
        m4a: "video",
        m4v: "video",
        mp4: "video",
        aac: "video",
        f4a: "video",
        mp3: "sound",
        smil: "rtmp",
        m3u8: "hls",
        hls: "hls"
    }, function(e, t) {
        a[e] || (a[e] = {}), a[e].flash = t
    }), a.types = i, a.mimeType = function(e) {
        var n;
        return t.find(i, function(t, i) {
            return t === e ? (n = i, !0) : void 0
        }), n
    }, a.extType = function(e) {
        return a.mimeType(r[e])
    }
}(jwplayer.utils), function(e) {
    var t = e.loaderstatus = {
        NEW: 0,
        LOADING: 1,
        ERROR: 2,
        COMPLETE: 3
    };
    e.scriptloader = function(n) {
        function i(e) {
            s = t.ERROR, o.sendEvent(a.ERROR, e)
        }

        function r(e) {
            s = t.COMPLETE, o.sendEvent(a.COMPLETE, e)
        }
        var a = jwplayer.events,
            o = e.extend(this, new a.eventdispatcher),
            s = t.NEW;
        this.load = function() {
            if (s === t.NEW) {
                var o = e.scriptloader.loaders[n];
                if (o && 2 > (s = o.getStatus())) return o.addEventListener(a.ERROR, i), void o.addEventListener(a.COMPLETE, r);
                var l = document.getElementsByTagName("head")[0] || document.documentElement,
                    u = document.createElement("script"),
                    c = !1;
                u.onload = u.onreadystatechange = function(e) {
                    c || this.readyState && "loaded" !== this.readyState && "complete" !== this.readyState || (c = !0, r(e), u.onload = u.onreadystatechange = null, l && u.parentNode && l.removeChild(u))
                }, u.onerror = i, u.src = n, l.insertBefore(u, l.firstChild), s = t.LOADING, e.scriptloader.loaders[n] = this
            }
        }, this.getStatus = function() {
            return s
        }
    }, e.scriptloader.loaders = {}
}(jwplayer.utils), function(e) {
    e.trim = function(e) {
        return e.replace(/^\s+|\s+$/g, "")
    }, e.pad = function(e, t, n) {
        for (n || (n = "0"); e.length < t;) e = n + e;
        return e
    }, e.xmlAttribute = function(e, t) {
        for (var n = 0; n < e.attributes.length; n++)
            if (e.attributes[n].name && e.attributes[n].name.toLowerCase() === t.toLowerCase()) return e.attributes[n].value.toString();
        return ""
    }, e.extension = function(e) {
        return e && "rtmp" !== e.substr(0, 4) ? (t = -1 < e.indexOf("(format=m3u8-") && "m3u8") ? t : -1 < (e = e.substring(e.lastIndexOf("/") + 1, e.length).split("?")[0].split("#")[0]).lastIndexOf(".") ? e.substr(e.lastIndexOf(".") + 1, e.length).toLowerCase() : void 0 : "";
        var t
    }, e.stringToColor = function(e) {
        return 3 === (e = e.replace(/(#|0x)?([0-9A-F]{3,6})$/gi, "$2")).length && (e = e.charAt(0) + e.charAt(0) + e.charAt(1) + e.charAt(1) + e.charAt(2) + e.charAt(2)), parseInt(e, 16)
    }
}(jwplayer.utils), function(e) {
    var t = "touchmove",
        n = "touchstart";
    e.touch = function(i) {
        function r(e) {
            e.type === n ? (l = !0, c = o(f.DRAG_START, e)) : e.type === t ? l && (d || (a(f.DRAG_START, e, c), d = !0), a(f.DRAG, e)) : (l && (d ? a(f.DRAG_END, e) : (e.cancelBubble = !0, a(f.TAP, e))), l = d = !1, c = null)
        }

        function a(e, t, n) {
            u[e] && (t.preventManipulation && t.preventManipulation(), t.preventDefault && t.preventDefault(), t = n || o(e, t)) && u[e](t)
        }

        function o(e, t) {
            var n = null;
            if (t.touches && t.touches.length ? n = t.touches[0] : t.changedTouches && t.changedTouches.length && (n = t.changedTouches[0]), !n) return null;
            var i = s.getBoundingClientRect();
            n = {
                type: e,
                target: s,
                x: n.pageX - window.pageXOffset - i.left,
                y: n.pageY,
                deltaX: 0,
                deltaY: 0
            };
            return e !== f.TAP && c && (n.deltaX = n.x - c.x, n.deltaY = n.y - c.y), n
        }
        var s = i,
            l = !1,
            u = {},
            c = null,
            d = !1,
            f = e.touchEvents;
        return document.addEventListener(t, r), document.addEventListener("touchend", function(e) {
            l && d && a(f.DRAG_END, e), l = d = !1, c = null
        }), document.addEventListener("touchcancel", r), i.addEventListener(n, r), i.addEventListener("touchend", r), this.addEventListener = function(e, t) {
            u[e] = t
        }, this.removeEventListener = function(e) {
            delete u[e]
        }, this
    }
}(jwplayer.utils), jwplayer.utils.touchEvents = {
    DRAG: "jwplayerDrag",
    DRAG_START: "jwplayerDragStart",
    DRAG_END: "jwplayerDragEnd",
    TAP: "jwplayerTap"
}, function(e) {
    e.key = function(t) {
        var n, i, r;
        this.edition = function() {
            return r && r.getTime() < (new Date).getTime() ? "invalid" : n
        }, this.token = function() {
            return i
        }, e.exists(t) || (t = "");
        try {
            var a = (t = e.tea.decrypt(t, "36QXq4W@GSBV^teR")).split("/");
            (n = a[0]) ? /^(free|pro|premium|enterprise|ads)$/i.test(n) ? (i = a[1], a[2] && 0 < parseInt(a[2]) && (r = new Date).setTime(String(a[2]))) : n = "invalid": n = "free"
        } catch (e) {
            n = "invalid"
        }
    }
}(jwplayer.utils), function(e) {
    var t = jwplayer.utils.tea = {};
    t.encrypt = function(e, r) {
        if (0 == e.length) return "";
        var a = t.strToLongs(i.encode(e));
        1 >= a.length && (a[1] = 0);
        for (var o, s = t.strToLongs(i.encode(r).slice(0, 16)), l = a.length, u = a[l - 1], c = a[0], d = Math.floor(6 + 52 / l), f = 0; 0 < d--;) {
            o = (f += 2654435769) >>> 2 & 3;
            for (var p = 0; l > p; p++) u = (u >>> 5 ^ (c = a[(p + 1) % l]) << 2) + (c >>> 3 ^ u << 4) ^ (f ^ c) + (s[3 & p ^ o] ^ u), u = a[p] += u
        }
        return a = t.longsToStr(a), n.encode(a)
    }, t.decrypt = function(e, r) {
        if (0 == e.length) return "";
        for (var a, o = t.strToLongs(n.decode(e)), s = t.strToLongs(i.encode(r).slice(0, 16)), l = o.length, u = o[l - 1], c = o[0], d = 2654435769 * Math.floor(6 + 52 / l); 0 != d;) {
            a = d >>> 2 & 3;
            for (var f = l - 1; f >= 0; f--) u = ((u = o[f > 0 ? f - 1 : l - 1]) >>> 5 ^ c << 2) + (c >>> 3 ^ u << 4) ^ (d ^ c) + (s[3 & f ^ a] ^ u), c = o[f] -= u;
            d -= 2654435769
        }
        return o = (o = t.longsToStr(o)).replace(/\0+$/, ""), i.decode(o)
    }, t.strToLongs = function(e) {
        for (var t = Array(Math.ceil(e.length / 4)), n = 0; n < t.length; n++) t[n] = e.charCodeAt(4 * n) + (e.charCodeAt(4 * n + 1) << 8) + (e.charCodeAt(4 * n + 2) << 16) + (e.charCodeAt(4 * n + 3) << 24);
        return t
    }, t.longsToStr = function(e) {
        for (var t = Array(e.length), n = 0; n < e.length; n++) t[n] = String.fromCharCode(255 & e[n], e[n] >>> 8 & 255, e[n] >>> 16 & 255, e[n] >>> 24 & 255);
        return t.join("")
    };
    var n = {
            code: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function(e, t) {
                var r, a, o, s, l, u, c = [],
                    d = "",
                    f = n.code;
                if ((l = (u = void 0 !== t && t ? i.encode(e) : e).length % 3) > 0)
                    for (; 3 > l++;) d += "=", u += "\0";
                for (l = 0; l < u.length; l += 3) r = (s = (r = u.charCodeAt(l)) << 16 | (a = u.charCodeAt(l + 1)) << 8 | (o = u.charCodeAt(l + 2))) >> 18 & 63, a = s >> 12 & 63, o = s >> 6 & 63, s &= 63, c[l / 3] = f.charAt(r) + f.charAt(a) + f.charAt(o) + f.charAt(s);
                return (c = c.join("")).slice(0, c.length - d.length) + d
            },
            decode: function(e, t) {
                t = void 0 !== t && t;
                var r, a, o, s, l, u, c = [],
                    d = n.code;
                u = t ? i.decode(e) : e;
                for (var f = 0; f < u.length; f += 4) r = (o = (r = d.indexOf(u.charAt(f))) << 18 | (a = d.indexOf(u.charAt(f + 1))) << 12 | (s = d.indexOf(u.charAt(f + 2))) << 6 | (l = d.indexOf(u.charAt(f + 3)))) >>> 16 & 255, a = o >>> 8 & 255, o &= 255, c[f / 4] = String.fromCharCode(r, a, o), 64 == l && (c[f / 4] = String.fromCharCode(r, a)), 64 == s && (c[f / 4] = String.fromCharCode(r));
                return s = c.join(""), t ? i.decode(s) : s
            }
        },
        i = {
            encode: function(e) {
                return (e = e.replace(/[\u0080-\u07ff]/g, function(e) {
                    return e = e.charCodeAt(0), String.fromCharCode(192 | e >> 6, 128 | 63 & e)
                })).replace(/[\u0800-\uffff]/g, function(e) {
                    return e = e.charCodeAt(0), String.fromCharCode(224 | e >> 12, 128 | e >> 6 & 63, 128 | 63 & e)
                })
            },
            decode: function(e) {
                return (e = e.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function(e) {
                    return e = (15 & e.charCodeAt(0)) << 12 | (63 & e.charCodeAt(1)) << 6 | 63 & e.charCodeAt(2), String.fromCharCode(e)
                })).replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function(e) {
                    return e = (31 & e.charCodeAt(0)) << 6 | 63 & e.charCodeAt(1), String.fromCharCode(e)
                })
            }
        }
}(), jwplayer.events = {
    COMPLETE: "COMPLETE",
    ERROR: "ERROR",
    API_READY: "jwplayerAPIReady",
    JWPLAYER_READY: "jwplayerReady",
    JWPLAYER_FULLSCREEN: "jwplayerFullscreen",
    JWPLAYER_RESIZE: "jwplayerResize",
    JWPLAYER_ERROR: "jwplayerError",
    JWPLAYER_SETUP_ERROR: "jwplayerSetupError",
    JWPLAYER_MEDIA_BEFOREPLAY: "jwplayerMediaBeforePlay",
    JWPLAYER_MEDIA_BEFORECOMPLETE: "jwplayerMediaBeforeComplete",
    JWPLAYER_MEDIA_BUFFER: "jwplayerMediaBuffer",
    JWPLAYER_MEDIA_BUFFER_FULL: "jwplayerMediaBufferFull",
    JWPLAYER_MEDIA_ERROR: "jwplayerMediaError",
    JWPLAYER_MEDIA_LOADED: "jwplayerMediaLoaded",
    JWPLAYER_MEDIA_COMPLETE: "jwplayerMediaComplete",
    JWPLAYER_MEDIA_SEEK: "jwplayerMediaSeek",
    JWPLAYER_MEDIA_TIME: "jwplayerMediaTime",
    JWPLAYER_MEDIA_VOLUME: "jwplayerMediaVolume",
    JWPLAYER_MEDIA_META: "jwplayerMediaMeta",
    JWPLAYER_MEDIA_MUTE: "jwplayerMediaMute",
    JWPLAYER_AUDIO_TRACKS: "jwplayerAudioTracks",
    JWPLAYER_AUDIO_TRACK_CHANGED: "jwplayerAudioTrackChanged",
    JWPLAYER_MEDIA_LEVELS: "jwplayerMediaLevels",
    JWPLAYER_MEDIA_LEVEL_CHANGED: "jwplayerMediaLevelChanged",
    JWPLAYER_CAPTIONS_CHANGED: "jwplayerCaptionsChanged",
    JWPLAYER_CAPTIONS_LIST: "jwplayerCaptionsList",
    JWPLAYER_CAPTIONS_LOADED: "jwplayerCaptionsLoaded",
    JWPLAYER_PLAYER_STATE: "jwplayerPlayerState",
    state: {
        BUFFERING: "BUFFERING",
        IDLE: "IDLE",
        PAUSED: "PAUSED",
        PLAYING: "PLAYING"
    },
    JWPLAYER_PLAYLIST_LOADED: "jwplayerPlaylistLoaded",
    JWPLAYER_PLAYLIST_ITEM: "jwplayerPlaylistItem",
    JWPLAYER_PLAYLIST_COMPLETE: "jwplayerPlaylistComplete",
    JWPLAYER_DISPLAY_CLICK: "jwplayerViewClick",
    JWPLAYER_PROVIDER_CLICK: "jwplayerProviderClick",
    JWPLAYER_VIEW_TAB_FOCUS: "jwplayerViewTabFocus",
    JWPLAYER_CONTROLS: "jwplayerViewControls",
    JWPLAYER_USER_ACTION: "jwplayerUserAction",
    JWPLAYER_INSTREAM_CLICK: "jwplayerInstreamClicked",
    JWPLAYER_INSTREAM_DESTROYED: "jwplayerInstreamDestroyed",
    JWPLAYER_AD_TIME: "jwplayerAdTime",
    JWPLAYER_AD_ERROR: "jwplayerAdError",
    JWPLAYER_AD_CLICK: "jwplayerAdClicked",
    JWPLAYER_AD_COMPLETE: "jwplayerAdComplete",
    JWPLAYER_AD_IMPRESSION: "jwplayerAdImpression",
    JWPLAYER_AD_COMPANIONS: "jwplayerAdCompanions",
    JWPLAYER_AD_SKIPPED: "jwplayerAdSkipped",
    JWPLAYER_AD_PLAY: "jwplayerAdPlay",
    JWPLAYER_AD_PAUSE: "jwplayerAdPause",
    JWPLAYER_AD_META: "jwplayerAdMeta",
    JWPLAYER_CAST_AVAILABLE: "jwplayerCastAvailable",
    JWPLAYER_CAST_SESSION: "jwplayerCastSession",
    JWPLAYER_CAST_AD_CHANGED: "jwplayerCastAdChanged"
}, function(e) {
    var t = e.utils;
    e.events.eventdispatcher = function(n, i) {
        function r(e, n, i) {
            if (e)
                for (var r = 0; r < e.length; r++) {
                    var a = e[r];
                    if (a) {
                        null !== a.count && 0 == --a.count && delete e[r];
                        try {
                            a.listener(n)
                        } catch (e) {
                            /*t.log('Error handling "' + i + '" event listener [' + r + "]: " + e.toString(), a.listener, n)*/
                        }
                    }
                }
        }
        var a, o;
        this.resetEventListeners = function() {
            a = {}, o = []
        }, this.resetEventListeners(), this.addEventListener = function(e, n, i) {
            try {
                t.exists(a[e]) || (a[e] = []), "string" === t.typeOf(n) && (n = new Function("return " + n)()), a[e].push({
                    listener: n,
                    count: i || null
                })
            } catch (e) {
                t.log("error", e)
            }
            return !1
        }, this.removeEventListener = function(e, n) {
            var i;
            if (a[e]) {
                try {
                    if (void 0 === n) return void(a[e] = []);
                    for (i = 0; i < a[e].length; i++)
                        if (a[e][i].listener.toString() === n.toString()) {
                            a[e].splice(i, 1);
                            break
                        }
                } catch (e) {
                    t.log("error", e)
                }
                return !1
            }
        }, this.addGlobalListener = function(e, n) {
            try {
                "string" === t.typeOf(e) && (e = new Function("return " + e)()), o.push({
                    listener: e,
                    count: n || null
                })
            } catch (e) {
                t.log("error", e)
            }
            return !1
        }, this.removeGlobalListener = function(e) {
            if (e) {
                try {
                    for (var n = o.length; n--;) o[n].listener.toString() === e.toString() && o.splice(n, 1)
                } catch (e) {
                    t.log("error", e)
                }
                return !1
            }
        }, this.sendEvent = function(s, l) {
            t.exists(l) || (l = {}), t.extend(l, {
                id: n,
                version: e.version,
                type: s
            }), i && t.log(s, l), r(a[s], l, s), r(o, l, s)
        }
    }
}(window.jwplayer), function(e) {
    var t = {},
        n = {};
    e.plugins = function() {}, e.plugins.loadPlugins = function(i, r) {
        return n[i] = new e.plugins.pluginloader(new e.plugins.model(t), r), n[i]
    }, e.plugins.registerPlugin = function(n, i, r, a) {
        var o = e.utils.getPluginName(n);
        t[o] || (t[o] = new e.plugins.plugin(n)), t[o].registerPlugin(n, i, r, a)
    }
}(jwplayer), function(e) {
    e.plugins.model = function(t) {
        this.addPlugin = function(n) {
            var i = e.utils.getPluginName(n);
            return t[i] || (t[i] = new e.plugins.plugin(n)), t[i]
        }, this.getPlugins = function() {
            return t
        }
    }
}(jwplayer), function(e) {
    var t = jwplayer.utils,
        n = jwplayer.events;
    e.pluginmodes = {
        FLASH: 0,
        JAVASCRIPT: 1,
        HYBRID: 2
    }, e.plugin = function(i) {
        function r() {
            switch (t.getPluginPathType(i)) {
                case t.pluginPathType.ABSOLUTE:
                    return i;
                case t.pluginPathType.RELATIVE:
                    return t.getAbsolutePath(i, window.location.href)
            }
        }

        function a() {
            c = setTimeout(function() {
                d = t.loaderstatus.COMPLETE, f.sendEvent(n.COMPLETE)
            }, 1e3)
        }

        function o() {
            d = t.loaderstatus.ERROR, f.sendEvent(n.ERROR, {
                url: i
            })
        }
        var s, l, u, c, d = t.loaderstatus.NEW,
            f = new n.eventdispatcher;
        t.extend(this, f), this.load = function() {
            if (d === t.loaderstatus.NEW)
                if (0 < i.lastIndexOf(".swf")) s = i, d = t.loaderstatus.COMPLETE, f.sendEvent(n.COMPLETE);
                else if (t.getPluginPathType(i) === t.pluginPathType.CDN) d = t.loaderstatus.COMPLETE, f.sendEvent(n.COMPLETE);
            else {
                d = t.loaderstatus.LOADING;
                var e = new t.scriptloader(r());
                e.addEventListener(n.COMPLETE, a), e.addEventListener(n.ERROR, o), e.load()
            }
        }, this.registerPlugin = function(e, i, r, a) {
            c && (clearTimeout(c), c = void 0), u = i, r && a ? (s = a, l = r) : "string" == typeof r ? s = r : "function" == typeof r ? l = r : !r && !a && (s = e), d = t.loaderstatus.COMPLETE, f.sendEvent(n.COMPLETE)
        }, this.getStatus = function() {
            return d
        }, this.getPluginName = function() {
            return t.getPluginName(i)
        }, this.getFlashPath = function() {
            if (s) switch (t.getPluginPathType(s)) {
                case t.pluginPathType.ABSOLUTE:
                    return s;
                case t.pluginPathType.RELATIVE:
                    return 0 < i.lastIndexOf(".swf") ? t.getAbsolutePath(s, window.location.href) : t.getAbsolutePath(s, r())
            }
            return null
        }, this.getJS = function() {
            return l
        }, this.getTarget = function() {
            return u
        }, this.getPluginmode = function() {
            return void 0 !== s && void 0 !== l ? e.pluginmodes.HYBRID : void 0 !== s ? e.pluginmodes.FLASH : void 0 !== l ? e.pluginmodes.JAVASCRIPT : void 0
        }, this.getNewInstance = function(e, t, n) {
            return new l(e, t, n)
        }, this.getURL = function() {
            return i
        }
    }
}(jwplayer.plugins), function(e) {
    var t = e.utils,
        n = e.events,
        i = e._,
        r = t.foreach;
    e.plugins.pluginloader = function(e, a) {
        function o() {
            d || (d = !0, c = t.loaderstatus.COMPLETE, g.sendEvent(n.COMPLETE))
        }

        function s() {
            if (!h && ((!f || 0 === i.keys(f).length) && o(), !d)) {
                var r = e.getPlugins();
                u = i.after(p, o), t.foreach(f, function(e) {
                    e = t.getPluginName(e), e = (i = r[e]).getJS();
                    var i, a = i.getTarget();
                    (i = i.getStatus()) === t.loaderstatus.LOADING || i === t.loaderstatus.NEW || (e && !t.versionCheck(a) && g.sendEvent(n.ERROR, {
                        message: "Incompatible player version"
                    }), u())
                })
            }
        }

        function l(e) {
            h || (g.sendEvent(n.ERROR, {
                message: "File not found"
            }), e.url && t.log("File not found", e.url), s())
        }
        var u, c = t.loaderstatus.NEW,
            d = !1,
            f = a,
            p = i.size(f),
            h = !1,
            g = new n.eventdispatcher;
        t.extend(this, g), this.setupPlugins = function(n, i, a) {
            var o = {
                    length: 0,
                    plugins: {}
                },
                s = 0,
                l = {},
                u = e.getPlugins();
            return r(i.plugins, function(e, r) {
                var c = t.getPluginName(e),
                    d = u[c],
                    f = d.getFlashPath(),
                    p = d.getJS(),
                    h = d.getURL();
                f && (o.plugins[f] = t.extend({}, r), o.plugins[f].pluginmode = d.getPluginmode(), o.length++);
                try {
                    if (p && i.plugins && i.plugins[h]) {
                        var g = document.createElement("div");
                        g.id = n.id + "_" + c, g.style.position = "absolute", g.style.top = 0, g.style.zIndex = s + 10, l[c] = d.getNewInstance(n, t.extend({}, i.plugins[h]), g), s++, n.onReady(a(l[c], g, !0)), n.onResize(a(l[c], g))
                    }
                } catch (e) {
                    t.log("ERROR: Failed to load " + c + ".")
                }
            }), n.plugins = l, o
        }, this.load = function() {
            if (!t.exists(a) || "object" === t.typeOf(a)) {
                c = t.loaderstatus.LOADING, r(a, function(i) {
                    t.exists(i) && ((i = e.addPlugin(i)).addEventListener(n.COMPLETE, s), i.addEventListener(n.ERROR, l))
                });
                var i = e.getPlugins();
                r(i, function(e, t) {
                    t.load()
                })
            }
            s()
        }, this.destroy = function() {
            h = !0, g && (g.resetEventListeners(), g = null)
        }, this.pluginFailed = l, this.getStatus = function() {
            return c
        }
    }
}(jwplayer), function(e) {
    e.parsers = {
        localName: function(e) {
            return e ? e.localName ? e.localName : e.baseName ? e.baseName : "" : ""
        },
        textContent: function(t) {
            return t ? t.textContent ? e.utils.trim(t.textContent) : t.text ? e.utils.trim(t.text) : "" : ""
        },
        getChildNode: function(e, t) {
            return e.childNodes[t]
        },
        numChildren: function(e) {
            return e.childNodes ? e.childNodes.length : 0
        }
    }
}(jwplayer), function(e) {
    var t = e.parsers;
    (t.jwparser = function() {}).parseEntry = function(n, i) {
        for (var r = [], a = [], o = e.utils.xmlAttribute, s = 0; s < n.childNodes.length; s++) {
            var l = n.childNodes[s];
            if ("jwplayer" === l.prefix) {
                var u = t.localName(l);
                "source" === u ? (delete i.sources, r.push({
                    file: o(l, "file"),
                    default: o(l, "default"),
                    label: o(l, "label"),
                    type: o(l, "type")
                })) : "track" === u ? (delete i.tracks, a.push({
                    file: o(l, "file"),
                    default: o(l, "default"),
                    kind: o(l, "kind"),
                    label: o(l, "label")
                })) : (i[u] = e.utils.serialize(t.textContent(l)), "file" === u && i.sources && delete i.sources)
            }
            i.file || (i.file = i.link)
        }
        if (r.length)
            for (i.sources = [], s = 0; s < r.length; s++) 0 < r[s].file.length && (r[s].default = "true" === r[s].default, r[s].label.length || delete r[s].label, i.sources.push(r[s]));
        if (a.length)
            for (i.tracks = [], s = 0; s < a.length; s++) 0 < a[s].file.length && (a[s].default = "true" === a[s].default, a[s].kind = a[s].kind.length ? a[s].kind : "captions", a[s].label.length || delete a[s].label, i.tracks.push(a[s]));
        return i
    }
}(jwplayer), function(e) {
    var t = jwplayer.utils,
        n = t.xmlAttribute,
        i = e.localName,
        r = e.textContent,
        a = e.numChildren,
        o = e.mediaparser = function() {};
    o.parseGroup = function(e, s) {
        var l, u, c = [];
        for (u = 0; u < a(e); u++)
            if ("media" === (l = e.childNodes[u]).prefix && i(l)) switch (i(l).toLowerCase()) {
                case "content":
                    n(l, "duration") && (s.duration = t.seconds(n(l, "duration"))), 0 < a(l) && (s = o.parseGroup(l, s)), n(l, "url") && (s.sources || (s.sources = []), s.sources.push({
                        file: n(l, "url"),
                        type: n(l, "type"),
                        width: n(l, "width"),
                        label: n(l, "label")
                    }));
                    break;
                case "title":
                    s.title = r(l);
                    break;
                case "description":
                    s.description = r(l);
                    break;
                case "guid":
                    s.mediaid = r(l);
                    break;
                case "thumbnail":
                    s.image || (s.image = n(l, "url"));
                    break;
                case "group":
                    o.parseGroup(l, s);
                    break;
                case "subtitle":
                    var d = {};
                    if (d.file = n(l, "url"), d.kind = "captions", 0 < n(l, "lang").length) {
                        var f = d,
                            p = {
                                zh: "Chinese",
                                nl: "Dutch",
                                en: "English",
                                fr: "French",
                                de: "German",
                                it: "Italian",
                                ja: "Japanese",
                                pt: "Portuguese",
                                ru: "Russian",
                                es: "Spanish"
                            };
                        l = p[l = n(l, "lang")] ? p[l] : l, f.label = l
                    }
                    c.push(d)
            }
        for (s.hasOwnProperty("tracks") || (s.tracks = []), u = 0; u < c.length; u++) s.tracks.push(c[u]);
        return s
    }
}(jwplayer.parsers), function(e) {
    function t(t) {
        for (var r = {}, a = 0; a < t.childNodes.length; a++) {
            var s = t.childNodes[a],
                l = o(s);
            if (l) switch (l.toLowerCase()) {
                case "enclosure":
                    r.file = n.xmlAttribute(s, "url");
                    break;
                case "title":
                    r.title = i(s);
                    break;
                case "guid":
                    r.mediaid = i(s);
                    break;
                case "pubdate":
                    r.date = i(s);
                    break;
                case "description":
                    r.description = i(s);
                    break;
                case "link":
                    r.link = i(s);
                    break;
                case "category":
                    r.tags = r.tags ? r.tags + i(s) : i(s)
            }
        }
        return r = e.mediaparser.parseGroup(t, r), r = e.jwparser.parseEntry(t, r), new jwplayer.playlist.item(r)
    }
    var n = jwplayer.utils,
        i = e.textContent,
        r = e.getChildNode,
        a = e.numChildren,
        o = e.localName;
    e.rssparser = {}, e.rssparser.parse = function(e) {
        for (var n = [], i = 0; i < a(e); i++) {
            var s = r(e, i);
            if ("channel" === o(s).toLowerCase())
                for (var l = 0; l < a(s); l++) {
                    var u = r(s, l);
                    "item" === o(u).toLowerCase() && n.push(t(u))
                }
        }
        return n
    }
}(jwplayer.parsers), function(e) {
    var t = e.utils,
        n = e._;
    e.playlist = function(t) {
        var i = [];
        return t = n.isArray(t) ? t : [t], n.each(t, function(t) {
            i.push(new e.playlist.item(t))
        }), i
    }, e.playlist.filterPlaylist = function(e, r) {
        var a = [];
        return n.each(e, function(e) {
            if ((e = t.extend({}, e)).sources = i(e.sources, !1, r), e.sources.length) {
                for (var n = 0; n < e.sources.length; n++) e.sources[n].label = e.sources[n].label || n.toString();
                a.push(e)
            }
        }), a
    };
    var i = e.playlist.filterSources = function(i, r, a) {
        var o, s = [],
            l = r ? e.embed.flashCanPlay : e.embed.html5CanPlay;
        return i ? (n.each(i, function(e) {
            if (e && e.file) {
                var n = t.trim("" + e.file),
                    i = e.type;
                i || (i = t.extension(n), i = t.extensionmap.extType(i)), e = t.extend({}, e, {
                    file: n,
                    type: i
                })
            } else e = void 0;
            e && l(e.file, e.type, a) && (o = o || e.type, e.type === o && s.push(e))
        }), s) : void 0
    }
}(jwplayer), function(e) {
    var t = e.item = function(n) {
        var i, r, a = jwplayer.utils,
            o = a.extend({}, t.defaults, n);
        for (o.tracks = n && a.exists(n.tracks) ? n.tracks : [], 0 === o.sources.length && (o.sources = [new e.source(o)]), i = 0; i < o.sources.length; i++) r = o.sources[i].default, o.sources[i].default = !!r && "true" === r.toString(), o.sources[i] = new e.source(o.sources[i]);
        if (o.captions && !a.exists(n.tracks)) {
            for (n = 0; n < o.captions.length; n++) o.tracks.push(o.captions[n]);
            delete o.captions
        }
        for (i = 0; i < o.tracks.length; i++) o.tracks[i] = new e.track(o.tracks[i]);
        return o
    };
    t.defaults = {
        description: void 0,
        image: void 0,
        mediaid: void 0,
        title: void 0,
        sources: [],
        tracks: []
    }
}(jwplayer.playlist), function(e) {
    var t = e.utils,
        n = e.events,
        i = e.parsers;
    e.playlist.loader = function() {
        function r(t) {
            try {
                var r = t.responseXML.childNodes;
                t = "";
                for (var a = 0; a < r.length && 8 === (t = r[a]).nodeType; a++);
                if ("xml" === i.localName(t) && (t = t.nextSibling), "rss" !== i.localName(t)) o("Not a valid RSS feed");
                else {
                    var l = new e.playlist(i.rssparser.parse(t));
                    s.sendEvent(n.JWPLAYER_PLAYLIST_LOADED, {
                        playlist: l
                    })
                }
            } catch (e) {
                o()
            }
        }

        function a(e) {
            o(e.match(/invalid/i) ? "Not a valid RSS feed" : "")
        }

        function o(e) {
            s.sendEvent(n.JWPLAYER_ERROR, {
                message: e || "Error loading file"
            })
        }
        var s = new n.eventdispatcher;
        t.extend(this, s), this.load = function(e) {
            t.ajax(e, r, a)
        }
    }
}(jwplayer), function(e) {
    var t = jwplayer.utils,
        n = {
            file: void 0,
            label: void 0,
            type: void 0,
            default: void 0
        };
    e.source = function(e) {
        var i = t.extend({}, n);
        return t.foreach(n, function(n) {
            t.exists(e[n]) && (i[n] = e[n], delete e[n])
        }), i.type && 0 < i.type.indexOf("/") && (i.type = t.extensionmap.mimeType(i.type)), "m3u8" === i.type && (i.type = "hls"), "smil" === i.type && (i.type = "rtmp"), i
    }
}(jwplayer.playlist), function(e) {
    var t = jwplayer.utils,
        n = {
            file: void 0,
            label: void 0,
            kind: "captions",
            default: !1
        };
    e.track = function(e) {
        var i = t.extend({}, n);
        return e || (e = {}), t.foreach(n, function(n) {
            t.exists(e[n]) && (i[n] = e[n], delete e[n])
        }), i
    }
}(jwplayer.playlist), function(e) {
    function t(e, t, i) {
        var r = e.style;
        r.backgroundColor = "#000", r.color = "#FFF", r.width = n.styleDimension(i.width), r.height = n.styleDimension(i.height), r.display = "table", r.opacity = 1, (r = (i = document.createElement("p")).style).verticalAlign = "middle", r.textAlign = "center", r.display = "table-cell", r.font = "15px/20px Arial, Helvetica, sans-serif", i.innerHTML = t.replace(":", ":<br>"), e.innerHTML = "", e.appendChild(i)
    }
    var n = e.utils,
        i = e.events,
        r = e._,
        a = e.embed = function(o) {
            function s() {
                if (!w) {
                    var t = h.playlist;
                    if (r.isArray(t)) {
                        if (0 === t.length) return void c();
                        if (!(1 !== t.length || t[0].sources && 0 !== t[0].sources.length && t[0].sources[0].file)) return void c()
                    }
                    if (!A)
                        if (r.isString(t))(p = new e.playlist.loader).addEventListener(i.JWPLAYER_PLAYLIST_LOADED, function(e) {
                            h.playlist = e.playlist, A = !1, s()
                        }), p.addEventListener(i.JWPLAYER_ERROR, function(e) {
                            A = !1, c(e)
                        }), A = !0, p.load(h.playlist);
                        else if (E.getStatus() === n.loaderstatus.COMPLETE) {
                        for (t = 0; t < h.modes.length; t++) {
                            var u = h.modes[t],
                                f = u.type;
                            if (f && a[f]) {
                                var g = n.extend({}, h);
                                if ((P = new a[f](_, u, g, E, o)).supportsConfig()) return P.addEventListener(i.ERROR, l), P.embed(), n.css("object.jwswf, .jwplayer:focus", {
                                    outline: "none"
                                }), n.css(".jw-tab-focus:focus", {
                                    outline: "solid 2px #0B7EF4"
                                }), o
                            }
                        }
                        h.fallback ? (d(t = "No suitable players found and fallback enabled", !0), n.log(t), new a.download(_, h, c)) : (d(t = "No suitable players found and fallback disabled", !1), n.log(t))
                    }
                }
            }

            function l(e) {
                f(v + e.message)
            }

            function u(e) {
                o.dispatchEvent(i.JWPLAYER_ERROR, {
                    message: "Could not load plugin: " + e.message
                })
            }

            function c(e) {
                f(e && e.message ? "Error loading playlist: " + e.message : v + "No playable sources found")
            }

            function d(e, t) {
                clearTimeout(L), L = setTimeout(function() {
                    o.dispatchEvent(i.JWPLAYER_SETUP_ERROR, {
                        message: e,
                        fallback: t
                    })
                }, 0)
            }

            function f(e) {
                w || (m.parentNode.replaceChild(_, m), h.fallback ? (w = !0, t(_, e, h), d(e, !0)) : d(e, !1))
            }
            var p, h = new a.config(o.config),
                g = h.width,
                y = h.height,
                v = "Error loading player: ",
                m = document.getElementById(o.id),
                E = e.plugins.loadPlugins(o.id, h.plugins),
                A = !1,
                w = !1,
                P = null,
                L = -1;
            h.id = o.id, h.aspectratio ? o.config.aspectratio = h.aspectratio : delete o.config.aspectratio;
            var R = o;
            n.foreach(h.events, function(e, t) {
                var n = R[e];
                "function" == typeof n && n.call(R, t)
            });
            var _ = document.createElement("div");
            return _.id = m.id, _.style.width = 0 < g.toString().indexOf("%") ? g : g + "px", _.style.height = 0 < y.toString().indexOf("%") ? y : y + "px", this.embed = function() {
                w || (E.addEventListener(i.COMPLETE, s), E.addEventListener(i.ERROR, u), E.load())
            }, this.destroy = function() {
                P && (P.destroy(), P = null), E && (E.destroy(), E = null), p && (p.resetEventListeners(), p = null)
            }, this.errorScreen = f, this
        };
    e.embed.errorScreen = t
}(jwplayer), function(e) {
    function t(e) {
        if (e.playlist)
            for (var t = 0; t < e.playlist.length; t++) e.playlist[t] = new r(e.playlist[t]);
        else {
            var a = {};
            i.foreach(r.defaults, function(t) {
                n(e, a, t)
            }), a.sources || (e.levels ? (a.sources = e.levels, delete e.levels) : (n(e, t = {}, "file"), n(e, t, "type"), a.sources = t.file ? [t] : [])), e.playlist = [new r(a)]
        }
    }

    function n(e, t, n) {
        i.exists(e[n]) && (t[n] = e[n], delete e[n])
    }
    var i = e.utils,
        r = e.playlist.item;
    (e.embed.config = function(n) {
        var r = {
                fallback: !0,
                height: 270,
                primary: "html5",
                width: 400,
                base: n.base ? n.base : i.getScriptPath("jwplayer.js"),
                aspectratio: ""
            },
            a = (r = {
                type: "html5",
                src: (n = i.extend({}, r, e.defaults, n)).base + "jwplayer.html5.js"
            }, {
                type: "flash",
                src: n.base + "jwplayer.flash.swf"
            });
        if (n.modes = "flash" === n.primary ? [a, r] : [r, a], n.listbar && (n.playlistsize = n.listbar.size, n.playlistposition = n.listbar.position, n.playlistlayout = n.listbar.layout), n.flashplayer && (a.src = n.flashplayer), n.html5player && (r.src = n.html5player), t(n), "string" == typeof(a = n.aspectratio) && i.exists(a)) {
            var o = a.indexOf(":"); - 1 === o ? r = 0 : (r = parseFloat(a.substr(0, o)), a = parseFloat(a.substr(o + 1)), r = 0 >= r || 0 >= a ? 0 : a / r * 100 + "%")
        } else r = 0;
        return -1 === n.width.toString().indexOf("%") ? delete n.aspectratio : r ? n.aspectratio = r : delete n.aspectratio, n
    }).addConfig = function(e, n) {
        return t(n), i.extend(e, n)
    }
}(jwplayer), function(e) {
    function t(e, t) {
        function i(e, t) {
            r[a].style[e] = t
        }
        for (var r = document.querySelectorAll(e), a = 0; a < r.length; a++) n.foreach(t, i)
    }
    var n = e.utils;
    e.embed.download = function(e, i, r) {
        function a(e, t, n) {
            return e = document.createElement(e), t && (e.className = "jwdownload" + t), n && n.appendChild(e), e
        }
        var o, s, l, u, c, d, f, p, h = n.extend({}, i),
            g = h.width ? h.width : 400,
            y = h.height ? h.height : 320;
        if (i = i.logo ? i.logo : {
                prefix: n.repo(),
                file: "logo.png",
                margin: 10
            }, u = h.playlist, h = ["mp4", "aac", "mp3"], u && u.length) {
            for (d = (c = u[0]).sources, u = 0; u < d.length; u++)(f = d[u]).file && (p = f.type || n.extensionmap.extType(n.extension(f.file)), 0 <= n.indexOf(h, p) ? (o = f.file, s = c.image) : n.isYouTube(f.file, p) && (l = f.file));
            o ? (r = o, e && (o = a("a", "display", e), a("div", "icon", o), a("div", "logo", o), r && o.setAttribute("href", n.getAbsolutePath(r))), r = "#" + e.id + " .jwdownload", e.style.width = "", e.style.height = "", t(r + "display", {
                width: n.styleDimension(Math.max(320, g)),
                height: n.styleDimension(Math.max(180, y)),
                background: "black center no-repeat " + (s ? "url(" + s + ")" : ""),
                backgroundSize: "contain",
                position: "relative",
                border: "none",
                display: "block"
            }), t(r + "display div", {
                position: "absolute",
                width: "100%",
                height: "100%"
            }), t(r + "logo", {
                top: i.margin + "px",
                right: i.margin + "px",
                background: "top right no-repeat url(" + i.prefix + i.file + ")"
            }), t(r + "icon", {
                background: "center no-repeat url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgNJREFUeNrs28lqwkAYB/CZqNVDDj2r6FN41QeIy8Fe+gj6BL275Q08u9FbT8ZdwVfotSBYEPUkxFOoks4EKiJdaDuTjMn3wWBO0V/+sySR8SNSqVRKIR8qaXHkzlqS9jCfzzWcTCYp9hF5o+59sVjsiRzcegSckFzcjT+ruN80TeSlAjCAAXzdJSGPFXRpAAMYwACGZQkSdhG4WCzehMNhqV6vG6vVSrirKVEw66YoSqDb7cqlUilE8JjHd/y1MQefVzqdDmiaJpfLZWHgXMHn8F6vJ1cqlVAkEsGuAn83J4gAd2RZymQygX6/L1erVQt+9ZPWb+CDwcCC2zXGJaewl/DhcHhK3DVj+KfKZrMWvFarcYNLomAv4aPRSFZVlTlcSPA5fDweW/BoNIqFnKV53JvncjkLns/n/cLdS+92O7RYLLgsKfv9/t8XlDn4eDyiw+HA9Jyz2eyt0+kY2+3WFC5hluej0Ha7zQQq9PPwdDq1Et1sNsx/nFBgCqWJ8oAK1aUptNVqcYWewE4nahfU0YQnk4ntUEfGMIU2m01HoLaCKbTRaDgKtaVLk9tBYaBcE/6Artdr4RZ5TB6/dC+9iIe/WgAMYADDpAUJAxjAAAYwgGFZgoS/AtNNTF7Z2bL0BYPBV3Jw5xFwwWcYxgtBP5OkE8i9G7aWGOOCruvauwADALMLMEbKf4SdAAAAAElFTkSuQmCC)"
            })) : l ? (i = l, (e = a("iframe", "", e)).src = "http://www.youtube.com/embed/" + n.youTubeID(i), e.width = g, e.height = y, e.style.border = "none") : r()
        }
    }
}(jwplayer), function(e) {
    var t = e.utils,
        n = e.events,
        i = {};
    (e.embed.flash = function(a, o, s, l, u) {
        function c(e, t, n) {
            var i = document.createElement("param");
            i.setAttribute("name", t), i.setAttribute("value", n), e.appendChild(i)
        }

        function d(e, t, n) {
            return function() {
                try {
                    n && document.getElementById(u.id + "_wrapper").appendChild(t);
                    var i = document.getElementById(u.id).getPluginConfig("display");
                    "function" == typeof e.resize && e.resize(i.width, i.height), t.style.left = i.x, t.style.top = i.h
                } catch (e) {}
            }
        }
        var f = new e.events.eventdispatcher,
            p = t.flashVersion();
        t.extend(this, f), this.embed = function() {
            if (s.id = u.id, 10 > p) return f.sendEvent(n.ERROR, {
                message: "Flash version must be 10.0 or greater"
            }), !1;
            var e, r, h = a.id,
                g = u.config.listbar,
                y = t.extend({}, s);
            if ((e = document.getElementById(u.id)).parentNode.replaceChild(a, e), h + "_wrapper" === a.parentNode.id) e = document.getElementById(h + "_wrapper");
            else {
                if (e = document.createElement("div"), (r = document.createElement("div")).style.display = "none", r.id = h + "_aspect", e.id = h + "_wrapper", e.style.position = "relative", e.style.display = "block", e.style.width = t.styleDimension(y.width), e.style.height = t.styleDimension(y.height), u.config.aspectratio) {
                    var v = parseFloat(u.config.aspectratio);
                    r.style.display = "block", r.style.marginTop = u.config.aspectratio, e.style.height = "auto", e.style.display = "inline-block", g && ("bottom" === g.position ? r.style.paddingBottom = g.size + "px" : "right" === g.position && (r.style.marginBottom = -1 * g.size * (v / 100) + "px"))
                }
                a.parentNode.replaceChild(e, a), e.appendChild(a), e.appendChild(r)
            }
            for (0 < (g = l.setupPlugins(u, y, d)).length ? t.extend(y, function(e) {
                    if (!e) return {};
                    var n = {},
                        i = [];
                    return t.foreach(e, function(e, r) {
                        var a = t.getPluginName(e);
                        i.push(e), t.foreach(r, function(e, t) {
                            n[a + "." + e] = t
                        })
                    }), n.plugins = i.join(","), n
                }(g.plugins)) : delete y.plugins, void 0 !== y["dock.position"] && "false" === y["dock.position"].toString().toLowerCase() && (y.dock = y["dock.position"], delete y["dock.position"]), g = y.wmode || (y.height && 40 >= y.height ? "transparent" : "opaque"), r = "height width modes events primary base fallback volume".split(" "), v = 0; v < r.length; v++) delete y[r[v]];
            r = t.getCookies(), t.foreach(r, function(e, t) {
                void 0 === y[e] && (y[e] = t)
            }), (r = window.location.href.split("/")).splice(r.length - 1, 1), r = r.join("/"), y.base = r + "/", i[h] = y, t.isMSIE() ? (a.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" class="jwFlashPlayer" height="100%" id="' + h + '" name="' + h + '" tabindex="0"><param name="movie" value="' + o.src + '"><param name="allowfullscreen" value="true"><param name="allowscriptaccess" value="always"><param name="seamlesstabbing" value="true"><param name="wmode" value="' + g + '"><param name="bgcolor" value="#000000"></object>', (e = e.getElementsByTagName("object")[0]).style.outline = "none") : ((e = document.createElement("object")).setAttribute("type", "application/x-shockwave-flash"), e.setAttribute("data", o.src), e.setAttribute("width", "100%"), e.setAttribute("height", "100%"), e.setAttribute("bgcolor", "#000000"), e.setAttribute("id", h), e.setAttribute("name", h), e.setAttribute("class", "jwFlashPlayer"), e.className = "jwswf", c(e, "allowfullscreen", "true"), c(e, "allowscriptaccess", "always"), c(e, "seamlesstabbing", "true"), c(e, "wmode", g), a.parentNode.replaceChild(e, a)), u.config.aspectratio && (e.style.position = "absolute", e.style.left = "0"), u.container = e, u.setPlayer(e, "flash")
        }, this.supportsConfig = function() {
            if (p) {
                if (!s) return !0;
                if ("string" === t.typeOf(s.playlist)) return !0;
                try {
                    var e = s.playlist[0].sources;
                    if (void 0 === e) return !0;
                    for (var n = 0; n < e.length; n++)
                        if (e[n].file && r(e[n].file, e[n].type)) return !0
                } catch (e) {}
            }
            return !1
        }, this.destroy = function() {}
    }).getVars = function(e) {
        return i[e]
    };
    var r = e.embed.flashCanPlay = function(e, n) {
        if (t.isYouTube(e, n) || t.isRtmp(e, n) || "hls" === n) return !0;
        var i = t.extensionmap[n || t.extension(e)];
        return !!i && !!i.flash
    }
}(jwplayer), function(e) {
    var t, n = e.utils,
        i = n.extensionmap,
        r = e.events;
    e.embed.html5 = function(i, a, o, s, l) {
        function u(e, t, n) {
            return function() {
                try {
                    var r = document.querySelector("#" + i.id + " .jwmain");
                    n && r.appendChild(t), "function" == typeof e.resize && (e.resize(r.clientWidth, r.clientHeight), setTimeout(function() {
                        e.resize(r.clientWidth, r.clientHeight)
                    }, 400)), t.left = r.style.left, t.top = r.style.top
                } catch (e) {}
            }
        }
        var c = new r.eventdispatcher;
        n.extend(this, c), this.embed = function() {
            if (e.html5) {
                s.setupPlugins(l, o, u), n.emptyElement(i);
                var t = e.utils.extend({}, o);
                delete t.volume, t = new e.html5.player(t), l.setPlayer(t, "html5")
            } else this.loadEmbedder()
        }, this.loadEmbedder = function() {
            (t = t || new n.scriptloader(a.src)).addEventListener(r.ERROR, this.loadError), t.addEventListener(r.COMPLETE, this.embed), t.load()
        }, this.loadError = function(e) {
            this.sendEvent(e.type, {
                message: "HTML5 player not found"
            })
        }, this.supportsConfig = function() {
            if (e.vid.canPlayType) try {
                if ("string" === n.typeOf(o.playlist)) return !0;
                for (var t = o.playlist[0].sources, i = 0; i < t.length; i++)
                    if (e.embed.html5CanPlay(t[i].file, t[i].type, o.androidhls)) return !0
            } catch (e) {}
            return !1
        }, this.destroy = function() {
            t && (t.resetEventListeners(), t = null)
        }
    }, e.embed.html5CanPlay = function(t, r, a) {
        if (null !== navigator.userAgent.match(/BlackBerry/i) || n.isIE(9)) return !1;
        if (n.isYouTube(t, r)) return !0;
        var o, s = n.extension(t);
        if ("hls" === (r = r || i.extType(s)))
            if (a) {
                if ((a = n.isAndroidNative)(2) || a(3) || a("4.0")) return !1;
                if (n.isAndroid()) return !0
            } else if (n.isAndroid()) return !1;
        if (n.isRtmp(t, r)) return !1;
        if (!(t = i[r] || i[s]) || t.flash && !t.html5) return !1;
        e: if (t = t.html5) {
            try {
                o = !!e.vid.canPlayType(t);
                break e
            } catch (e) {}
            o = !1
        } else o = !0;
        return o
    }
}(jwplayer), function(e) {
    var t = e.embed,
        n = e.embed.html5CanPlay,
        i = e.utils,
        r = e._,
        a = /\.(js|swf)$/;
    e.cast = e.cast || {}, e.embed = i.extend(function(n) {
        function r() {
            o = "Adobe SiteCatalyst Error: Could not find Media Module"
        }
        var o, s = i.repo(),
            l = i.extend({}, e.defaults),
            u = i.extend({}, l, n.config),
            c = n.config,
            d = u.plugins,
            f = u.analytics,
            p = s + "jwpsrv.js",
            h = s + "sharing.js",
            g = s + "related.js",
            y = s + "gapro.js",
            v = (l = e.key ? e.key : l.key, new e.utils.key(l).edition());
        d = d || {};
        switch ("ads" == v && u.advertising && (a.test(u.advertising.client) ? d[u.advertising.client] = u.advertising : d[s + u.advertising.client + ".js"] = u.advertising), delete c.advertising, c.key = l, u.analytics && a.test(u.analytics.client) && (p = u.analytics.client), delete c.analytics, f && !("ads" === v || "enterprise" === v) && delete f.enabled, "free" != v && f && !1 === f.enabled || (d[p] = f || {}), delete d.sharing, delete d.related, v) {
            case "ads":
            case "enterprise":
                if (c.sitecatalyst) try {
                    window.s && window.s.hasOwnProperty("Media") ? new e.embed.sitecatalyst(n) : r()
                } catch (e) {
                    r()
                }
                case "premium": u.related && (a.test(u.related.client) && (g = u.related.client), d[g] = u.related), u.ga && (a.test(u.ga.client) && (y = u.ga.client), d[y] = u.ga);
            case "pro":
                u.sharing && (a.test(u.sharing.client) && (h = u.sharing.client), d[h] = u.sharing), u.skin && (c.skin = u.skin.replace(/^(beelden|bekle|five|glow|modieus|roundster|stormtrooper|vapor)$/i, i.repo() + "skins/$1.xml"))
        }
        return c.plugins = d, n.config = c, n = new t(n), o && n.errorScreen(o), n
    }, e.embed), e.embed.html5CanPlay = function(t, i) {
        var a = {
            file: t,
            type: i
        };
        return !!(e.html5 && e.html5.chooseProvider ? e.html5.chooseProvider(a) !== e.html5.VideoProvider : r.any(e.unregisteredProviders, function(e) {
            return e.supports(a)
        })) || n.apply(this, arguments)
    }
}(jwplayer), function(e) {
    var t = jwplayer.utils;
    e.sitecatalyst = function(e) {
        function n(e) {
            f.debug && t.log(e)
        }

        function i(e) {
            return (e = (e = (e = e.split("/"))[e.length - 1]).split("?"))[0]
        }

        function r() {
            if (!h) {
                h = !0;
                var e = d.getPosition();
                n("stop: " + o + " : " + e), s.Media.stop(o, e)
            }
        }

        function a() {
            g || (r(), g = !0, n("close: " + o), s.Media.close(o), c = !0, u = 0)
        }
        var o, l, u, c, d = e,
            f = t.extend({}, d.config.sitecatalyst),
            p = {
                onPlay: function() {
                    if (!c) {
                        var e = d.getPosition();
                        h = !1, n("play: " + o + " : " + e), s.Media.play(o, e)
                    }
                },
                onPause: r,
                onBuffer: r,
                onIdle: a,
                onPlaylistItem: function(e) {
                    try {
                        var n;
                        if (c = !0, a(), u = 0, f.mediaName) n = f.mediaName;
                        else {
                            var r = d.getPlaylistItem(e.index);
                            n = r.title ? r.title : r.file ? i(r.file) : r.sources && r.sources.length ? i(r.sources[0].file) : ""
                        }
                        o = n, l = f.playerName ? f.playerName : d.id
                    } catch (e) {
                        t.log(e)
                    }
                },
                onTime: function() {
                    if (c) {
                        var e = d.getDuration();
                        if (-1 == e) return;
                        g = h = c = !1, n("open: " + o + " : " + e + " : " + l), s.Media.open(o, e, l), n("play: " + o + " : 0"), s.Media.play(o, 0)
                    }
                    if (e = d.getPosition(), 3 <= Math.abs(e - u)) {
                        var t = u;
                        n("seek: " + t + " to " + e), n("stop: " + o + " : " + t), s.Media.stop(o, t), n("play: " + o + " : " + e), s.Media.play(o, e)
                    }
                    u = e
                },
                onComplete: a
            },
            h = !0,
            g = !0;
        t.foreach(p, function(e) {
            d[e](p[e])
        })
    }
}(jwplayer.embed), function(e) {
    function t(e, t) {
        e[t] && (e[t] = n.getAbsolutePath(e[t]))
    }
    var n = e.utils,
        i = e._,
        r = window.location.href;
    e.cast.setupCastConfig = function(i, a) {
        var o = n.extend({}, i.config);
        o.cast = n.extend({
            pageUrl: r
        }, a);
        for (var s = "base autostart controls fallback fullscreen width height mobilecontrols modes playlistlayout playlistposition playlistsize primary stretching sharing related ga skin logo listbar events".split(" "), l = s.length; l--;) delete o[s[l]];
        for (var u in s = o.plugins, delete o.plugins, s)
            if (s.hasOwnProperty(u)) {
                var c = s[u];
                if (c.client && (/[\.\/]/.test(c.client) && t(c, "client"), -1 < c.client.indexOf("vast"))) {
                    if (l = o, (c = n.extend({}, c)).client = "vast", delete c.companiondiv, c.schedule) {
                        var d = void 0;
                        for (d in c.schedule) c.schedule.hasOwnProperty(d) && t(c.schedule[d].ad || c.schedule[d], "tag")
                    }
                    t(c, "tag"), l.advertising = c
                }
            } return i.position && (o.position = i.position), 0 < i.item && (o.item = i.item), o.captionLabel = n.getCookies().captionLabel, o.playerVersion = e.version, o
    }, e.cast.setupFlashCastConfig = function(t) {
        var r, a = t.config;
        return a.playlist = t.getPlaylist(), (r = i.find(a.plugins, function(e, t) {
            return 0 < t.indexOf("vast.js")
        })) ? (r.client = "vast", r = {
            advertising: r
        }) : r = {}, (a = i.pick(a, "id captionLabel cast key playlist repeat".split(" "))).cast.pageUrl = window.location.href, n.extend(a, {
            playerVersion: e.version,
            captionLabel: n.getCookies().captionLabel,
            volume: t.getVolume(),
            mute: t.getMute(),
            id: t.id,
            position: t.getPosition(),
            item: t.getPlaylistIndex()
        }, r), a
    }
}(window.jwplayer), function(e, t) {
    function n(e, t) {
        e[t] && (e[t] = r.getAbsolutePath(e[t]))
    }
    var i = t.cast,
        r = t.utils,
        a = t.events,
        o = a.state,
        s = {};
    i.NS = "urn:x-cast:com.longtailvideo.jwplayer", i.debug = !1, i.availability = null, i.available = function(t) {
        t = t || i.availability;
        var n = e.chrome,
            r = "available";
        return n.cast && n.cast.ReceiverAvailability && (r = n.cast.ReceiverAvailability.AVAILABLE), t === r
    }, i.controller = function(l, u) {
        function c(e, t) {
            i.log("send command", e, t);
            var n = {
                command: e
            };
            void 0 !== t && (n.args = t), T.sendMessage(i.NS, n, j, function(e) {
                i.log("error message", e), "Invalid namespace" === e.description && y()
            })
        }

        function d(e, n) {
            var r = JSON.parse(n);
            if (!r) throw "Message not proper JSON";
            if (r.reconcile) {
                W.removeMessageListener(i.NS, d);
                var o = r.diff,
                    s = W;
                o.id && r.appid && r.pageUrl || (o.id = t().id, r.appid = M.appid, r.pageUrl = N, W = T = null), o.id === l.id && r.appid === M.appid && r.pageUrl === N && (T || (l.jwInstreamState() && l.jwInstreamDestroy(!0), m(s), u.sendEvent(a.JWPLAYER_PLAYER_STATE, {
                    oldstate: o.oldstate,
                    newstate: o.newstate
                })), L(r)), W = null
            }
        }

        function f(e) {
            var t;
            x.active = !!e, e = x, t = T && T.receiver ? T.receiver.friendlyName : "", e.deviceName = t, p(a.JWPLAYER_CAST_SESSION)
        }

        function p(e) {
            var t = r.extend({}, x);
            u.sendEvent(e, t)
        }

        function h(t) {
            var n = e.chrome;
            t.code !== n.cast.ErrorCode.CANCEL && (i.log("Cast Session Error:", t, T), t.code === n.cast.ErrorCode.SESSION_ERROR && y())
        }

        function g(t) {
            var n = e.chrome;
            t.code !== n.cast.ErrorCode.CANCEL && (i.log("Cast Session Error:", t, T), t.code === n.cast.ErrorCode.SESSION_ERROR && y())
        }

        function y() {
            T ? (w(), T.stop(A, v), R({
                item: 0
            }), L({
                type: "state",
                diff: {
                    buffer: 0,
                    position: 0,
                    duration: 0
                }
            })) : A()
        }

        function v(e) {
            i.error("Cast Session Stop error:", e, T), A()
        }

        function m(n) {
            if (i.log("Session started:", n), T) y(), J = n;
            else {
                (T = n).addMessageListener(i.NS, P), T.addUpdateListener(E), l.jwPause(!0), l.jwSetFullscreen(!1), k = u.getVideo(), S = u.volume, I = u.mute, (D = new i.provider(c)).init(), u.setVideoProvider(D), l.jwPlay = function(e) {
                    !1 === e ? D.pause() : D.play()
                }, l.jwPause = function(e) {
                    l.jwPlay(!!e)
                }, l.jwLoad = function(e) {
                    "number" === r.typeOf(e) && u.setItem(e), D.load(e)
                }, l.jwPlaylistItem = function(e) {
                    "number" === r.typeOf(e) && u.setItem(e), D.playlistItem(e)
                }, l.jwPlaylistNext = function() {
                    l.jwPlaylistItem(u.item + 1)
                }, l.jwPlaylistPrev = function() {
                    l.jwPlaylistItem(u.item - 1)
                }, l.jwSetVolume = function(e) {
                    r.exists(e) && (C(e = 0 | Math.min(Math.max(0, e), 100)) && (e = Math.max(0, Math.min(e / 100, 1)), T.setReceiverVolumeLevel(e, _, function(e) {
                        i.error("set volume error", e), _()
                    })))
                }, l.jwSetMute = function(e) {
                    r.exists(e) || (e = !O.mute), b(e) && T.setReceiverMuted(!!e, _, function(e) {
                        i.error("set muted error", e), _()
                    })
                }, l.jwGetVolume = function() {
                    return 0 | O.volume
                }, l.jwGetMute = function() {
                    return !!O.mute
                }, l.jwIsBeforePlay = function() {
                    return !1
                };
                var s = l.jwSetCurrentCaptions;
                l.jwSetCurrentCaptions = function(e) {
                    s(e), D.sendCommand("caption", e)
                }, l.jwSkipAd = function(e) {
                    Y && (Y.skipAd(e), (e = Y.getAdModel()).complete = !0, u.sendEvent(a.JWPLAYER_CAST_AD_CHANGED, e))
                }, l.jwClickAd = function(n) {
                    if (Y && 300 < Y.timeSinceClick() && (Y.clickAd(n), u.state !== o.PAUSED)) {
                        var i = {
                            tag: n.tag
                        };
                        n.sequence && (i.sequence = n.sequence), n.podcount && (i.podcount = n.podcount), t(l.id).dispatchEvent(a.JWPLAYER_AD_CLICK, i), e.open(n.clickthrough)
                    }
                }, l.jwPlayAd = l.jwPauseAd = l.jwSetControls = l.jwForceState = l.jwReleaseState = l.jwSetFullscreen = l.jwDetachMedia = l.jwAttachMedia = j;
                var d = t(l.id).plugins;
                d.vast && d.vast.jwPauseAd !== j && (F = {
                    jwPlayAd: d.vast.jwPlayAd,
                    jwPauseAd: d.vast.jwPauseAd
                }, d.vast.jwPlayAd = d.vast.jwPauseAd = j), _(), f(!0), n !== W && (D.setup(t.cast.setupCastConfig(u, M), u), t.cast.loader.sendDummyMedia(n))
            }
        }

        function E(e) {
            i.log("Cast Session status", e), e ? _() : (D.sendEvent(a.JWPLAYER_PLAYER_STATE, {
                oldstate: u.state,
                newstate: o.BUFFERING
            }), A())
        }

        function A() {
            if (i.log("_sessionStopped"), T && (w(), T = null), k) {
                delete l.jwSkipAd, delete l.jwClickAd, l.initializeAPI();
                var e = t(l.id).plugins;
                e.vast && r.extend(e.vast, F), u.volume = S, u.mute = I, u.setVideoProvider(k), u.duration = 0, D && (D.destroy(), D = null), Y && (Y.destroy(), Y = null), u.state !== o.IDLE ? r.isIPad() || r.isIPod() ? (l.jwStop(!0), k.sendEvent(a.JWPLAYER_PLAYER_STATE, {
                    oldstate: o.BUFFERING,
                    newstate: o.IDLE
                })) : (u.state = o.IDLE, l.jwPlay(!0), l.jwSeek(u.position)) : k.sendEvent(a.JWPLAYER_PLAYER_STATE, {
                    oldstate: o.BUFFERING,
                    newstate: o.IDLE
                }), k = null
            }
            f(!1), null !== J && (m(J), J = null)
        }

        function w() {
            T.removeUpdateListener(E), T.removeMessageListener(i.NS, P)
        }

        function P(e, t) {
            var n = JSON.parse(t);
            if (!n) throw "Message not proper JSON";
            L(n)
        }

        function L(e) {
            if ("state" === e.type) Y && (e.diff.newstate || e.diff.position) && (Y.destroy(), Y = null, u.setVideoProvider(D), u.sendEvent(a.JWPLAYER_CAST_AD_CHANGED, {
                done: !0
            })), D.updateModel(e.diff, e.type), R(e.diff);
            else if ("ad" === e.type) {
                null === Y && ((Y = new i.adprovider(i.NS, T)).init(), u.setVideoProvider(Y)), Y.updateModel(e.diff, e.type);
                var t = Y.getAdModel();
                e.diff.clickthrough && (t.onClick = l.jwClickAd), e.diff.skipoffset && (t.onSkipAd = l.jwSkipAd), u.sendEvent(a.JWPLAYER_CAST_AD_CHANGED, t), e.diff.complete && Y.resetAdModel()
            } else "connection" === e.type ? !0 === e.closed && y() : i.error("received unhandled message", e.type, e)
        }

        function R(e) {
            void 0 !== e.item && u.item !== e.item && (u.item = e.item, u.sendEvent(a.JWPLAYER_PLAYLIST_ITEM, {
                index: u.item
            }))
        }

        function _() {
            if (T && T.receiver) {
                var e = T.receiver.volume;
                if (e) {
                    var t = 100 * e.level | 0;
                    b(!!e.muted), C(t)
                }
            }
        }

        function C(e) {
            var t = O.volume !== e;
            return t && (O.volume = e, D.sendEvent(a.JWPLAYER_MEDIA_VOLUME, {
                volume: e
            })), t
        }

        function b(e) {
            var t = O.mute !== e;
            return t && (O.mute = e, D.sendEvent(a.JWPLAYER_MEDIA_MUTE, {
                mute: e
            })), t
        }

        function j() {}
        var S, I, M, T = null,
            x = {
                available: !1,
                active: !1,
                deviceName: ""
            },
            O = {
                volume: null,
                mute: null
            },
            N = r.getAbsolutePath(e.location.href),
            D = null,
            Y = null,
            k = null;
        S = u.volume, I = u.mute;
        var W = null,
            J = null,
            F = null;
        n(M = r.extend({}, s, u.cast), "loadscreen"), n(M, "endscreen"), n(M, "logo"), !M.appid || e.cast && e.cast.receiver || (i.loader.addEventListener("availability", function(e) {
            e = !!i.available(e.availability), x.available !== e && (x.available = e, p(a.JWPLAYER_CAST_AVAILABLE))
        }), i.loader.addEventListener("session", function(e) {
            i.log("existing session", e), !T && !W && (W = e.session).addMessageListener(i.NS, d)
        }), i.loader.initialize(M.appid)), this.startCasting = function() {
            T || l.jwInstreamState() || e.chrome.cast.requestSession(m, h)
        }, this.stopCasting = y, this.openExtension = function() {
            l.jwInstreamState() || e.chrome.cast.requestSession(m, g)
        }
    }, i.log = function() {
        if (i.debug) Array.prototype.slice.call(arguments, 0)
    }, i.error = function() {
        Array.prototype.slice.call(arguments, 0)
    }
}(window, jwplayer), function(e) {
    function t(e) {
        y.log("existing session", e), !g && !p && (p = e.session).addMessageListener(y.NS, n)
    }

    function n(t, i) {
        var r = JSON.parse(i),
            o = p;
        if (!r) throw "Message not proper JSON";
        r.reconcile && (p.removeMessageListener(y.NS, n), r.receiverFriendlyName = p.receiver.friendlyName, r.pageUrl && r.diff.id && r.appid || (r.pageUrl = P, r.diff.id = e().id, r.appid = f, p = g = null), A[r.diff.id] && f === r.appid && r.pageUrl === P && (d = r.diff.id, f = r.appid, u(d, "jwInstreamDestroy"), a(o), u(d, w.message, r), p = null))
    }

    function i() {
        g && (g.removeUpdateListener(l), g.removeMessageListener(y.NS, o), g.stop(function() {
            null != h && (a(h), h = null)
        }.bind(this), s.bind(this)), g = null), u(d, w.cleanup)
    }

    function r(e, t) {
        g.sendMessage(y.NS, {
            command: e,
            args: t
        }, v.noop, function(e) {
            y.error("message send error", e)
        })
    }

    function a(t) {
        var n = e(d);
        g ? (i(), h = t) : ((g = t).addMessageListener(y.NS, o), g.addUpdateListener(l), n = e.cast.setupFlashCastConfig(n), p !== g && (r("setup", n), e.cast.loader.sendDummyMedia(g)), u(d, w.connected, {
            receiverFriendlyName: t.receiver.friendlyName
        }))
    }

    function o(e, t) {
        if (t) {
            var n = JSON.parse(t);
            if (!n) throw "Message not proper JSON";
            u(d, w.message, n)
        }
    }

    function s(e) {
        u(d, w.error, e || {})
    }

    function l(e) {
        e ? c() : i()
    }

    function u(t, n, i) {
        i ? e(t).callInternal(n, i) : e(t).callInternal(n)
    }

    function c() {
        if (g && g.receiver && (n = g.receiver.volume)) {
            var t = 100 * n.level | 0,
                n = !!n.muted;
            e(d).setVolume(t).setMute(n)
        }
    }
    var d, f, p, h, g, y = e.cast,
        v = e.utils,
        m = e._,
        E = window.chrome || {},
        A = {},
        w = {},
        P = v.getAbsolutePath(window.location.href);
    y.NS = "urn:x-cast:com.longtailvideo.jwplayer", y.flash = {
        checkAvailability: function(e, n, i) {
            w = i, f = n, A[e] = !0, y.loader.addEventListener("availability", function(t) {
                "available" === t.availability && u(e, w.available, t)
            }), y.loader.addEventListener("session", t), y.loader.initialize(n)
        },
        startCasting: function(e) {
            d = e, E.cast.requestSession(a.bind(this), s.bind(this))
        },
        stopCasting: i,
        openExtension: function(e) {
            d = e, E.cast.requestSession(a.bind(this), s.bind(this))
        },
        mute: function(e) {
            g.setReceiverMuted(e, c, function(e) {
                y.error("set muted error", e)
            })
        },
        volume: function(e) {
            e = Math.max(0, Math.min(e / 100, 1)), g.setReceiverVolumeLevel(e, c, function(e) {
                y.error("set volume error", e)
            })
        },
        messageReceiver: r,
        canCastItem: function(t) {
            return m.any(t.levels, function(t) {
                return e.embed.html5CanPlay(t.file, t.type) || "hls" === t.type
            })
        }
    }
}(window.jwplayer), function(e, t) {
    function n(e) {
        var n = new t.cast.media.MediaInfo("");
        n.contentType = "video/mp4", (n = new t.cast.media.LoadRequest(n)).autoplay = !1, e.loadMedia(n)
    }

    function i() {
        t && t.cast && t.cast.isAvailable && !c.apiConfig ? (c.apiConfig = new t.cast.ApiConfig(new t.cast.SessionRequest(h), s, l, t.cast.AutoJoinPolicy.ORIGIN_SCOPED), t.cast.initialize(c.apiConfig, o, a)) : 15 > p++ && setTimeout(i, 1e3)
    }

    function r() {
        u && (u.resetEventListeners(), u = null)
    }

    function a() {
        c.apiConfig = null
    }

    function o() {}

    function s(e) {
        g.sendEvent("session", {
            session: e
        }), e.sendMessage(c.NS, {
            whoami: 1
        }), 0 === e.media.length && n(e)
    }

    function l(e) {
        c.availability = e, g.sendEvent("availability", {
            availability: e
        })
    }
    window.chrome = t;
    var u, c = e.cast,
        d = e.utils,
        f = e.events,
        p = 0,
        h = null,
        g = d.extend({
            initialize: function(e) {
                h = e, null !== c.availability ? g.sendEvent("availability", {
                    availability: c.availability
                }) : t && t.cast ? i() : u || ((u = new d.scriptloader("https://www.gstatic.com/cv/js/sender/v1/cast_sender.js")).addEventListener(f.ERROR, r), u.addEventListener(f.COMPLETE, i), u.load())
            }
        }, new f.eventdispatcher("cast.loader"));
    e.cast.loader = g, e.cast.loader.sendDummyMedia = n
}(window.jwplayer, window.chrome || {}), function(e, t) {
    var n = [],
        i = e.utils,
        r = e.events,
        a = e._,
        o = 0,
        s = r.state,
        l = "getBuffer getCaptionsList getControls getCurrentCaptions getCurrentQuality getCurrentAudioTrack getDuration getFullscreen getHeight getLockState getMute getPlaylistIndex getSafeRegion getPosition getQualityLevels getState getVolume getWidth isBeforeComplete isBeforePlay releaseState".split(" "),
        u = "playlistNext stop forceState playlistPrev seek setCurrentCaptions setControls setCurrentQuality setVolume setCurrentAudioTrack".split(" "),
        c = {
            onBufferChange: r.JWPLAYER_MEDIA_BUFFER,
            onBufferFull: r.JWPLAYER_MEDIA_BUFFER_FULL,
            onError: r.JWPLAYER_ERROR,
            onSetupError: r.JWPLAYER_SETUP_ERROR,
            onFullscreen: r.JWPLAYER_FULLSCREEN,
            onMeta: r.JWPLAYER_MEDIA_META,
            onMute: r.JWPLAYER_MEDIA_MUTE,
            onPlaylist: r.JWPLAYER_PLAYLIST_LOADED,
            onPlaylistItem: r.JWPLAYER_PLAYLIST_ITEM,
            onPlaylistComplete: r.JWPLAYER_PLAYLIST_COMPLETE,
            onReady: r.API_READY,
            onResize: r.JWPLAYER_RESIZE,
            onComplete: r.JWPLAYER_MEDIA_COMPLETE,
            onSeek: r.JWPLAYER_MEDIA_SEEK,
            onTime: r.JWPLAYER_MEDIA_TIME,
            onVolume: r.JWPLAYER_MEDIA_VOLUME,
            onBeforePlay: r.JWPLAYER_MEDIA_BEFOREPLAY,
            onBeforeComplete: r.JWPLAYER_MEDIA_BEFORECOMPLETE,
            onDisplayClick: r.JWPLAYER_DISPLAY_CLICK,
            onControls: r.JWPLAYER_CONTROLS,
            onQualityLevels: r.JWPLAYER_MEDIA_LEVELS,
            onQualityChange: r.JWPLAYER_MEDIA_LEVEL_CHANGED,
            onCaptionsList: r.JWPLAYER_CAPTIONS_LIST,
            onCaptionsChange: r.JWPLAYER_CAPTIONS_CHANGED,
            onAdError: r.JWPLAYER_AD_ERROR,
            onAdClick: r.JWPLAYER_AD_CLICK,
            onAdImpression: r.JWPLAYER_AD_IMPRESSION,
            onAdTime: r.JWPLAYER_AD_TIME,
            onAdComplete: r.JWPLAYER_AD_COMPLETE,
            onAdCompanions: r.JWPLAYER_AD_COMPANIONS,
            onAdSkipped: r.JWPLAYER_AD_SKIPPED,
            onAdPlay: r.JWPLAYER_AD_PLAY,
            onAdPause: r.JWPLAYER_AD_PAUSE,
            onAdMeta: r.JWPLAYER_AD_META,
            onCast: r.JWPLAYER_CAST_SESSION,
            onAudioTrackChange: r.JWPLAYER_AUDIO_TRACK_CHANGED,
            onAudioTracks: r.JWPLAYER_AUDIO_TRACKS
        },
        d = {
            onBuffer: s.BUFFERING,
            onPause: s.PAUSED,
            onPlay: s.PLAYING,
            onIdle: s.IDLE
        };
    e.api = function(o) {
        function f(e, t) {
            i.foreach(e, function(e, n) {
                E[e] = function(e) {
                    return t(n, e)
                }
            })
        }

        function p(e, t) {
            var n = "jw" + t.charAt(0).toUpperCase() + t.slice(1);
            E[t] = function() {
                var t = y.apply(this, [n].concat(Array.prototype.slice.call(arguments, 0)));
                return e ? E : t
            }
        }

        function h(e, t) {
            try {
                e.jwAddEventListener(t, 'function(dat) { jwplayer("' + E.id + '").dispatchEvent("' + t + '", dat); }')
            } catch (e) {
                if ("flash" === E.renderingMode) {
                    var n = document.createElement("a");
                    n.href = v.data, n.protocol !== location.protocol && i.log("Warning: Your site [" + location.protocol + "] and JWPlayer [" + n.protocol + "] are hosted using different protocols")
                }
                i.log("Could not add internal listener")
            }
        }

        function g(e, t) {
            return A[e] || (A[e] = [], v && P && h(v, e)), A[e].push(t), E
        }

        function y() {
            if (P) {
                if (v) {
                    var e = Array.prototype.slice.call(arguments, 0),
                        t = e.shift();
                    if ("function" == typeof v[t]) {
                        switch (e.length) {
                            case 6:
                                return v[t](e[0], e[1], e[2], e[3], e[4], e[5]);
                            case 5:
                                return v[t](e[0], e[1], e[2], e[3], e[4]);
                            case 4:
                                return v[t](e[0], e[1], e[2], e[3]);
                            case 3:
                                return v[t](e[0], e[1], e[2]);
                            case 2:
                                return v[t](e[0], e[1]);
                            case 1:
                                return v[t](e[0])
                        }
                        return v[t]()
                    }
                }
                return null
            }
            L.push(arguments)
        }
        var v, m, E = this,
            A = {},
            w = {},
            P = !1,
            L = [],
            R = {},
            _ = {};
        return E.container = o, E.id = o.id, E.setup = function(t) {
            if (e.embed) {
                e.api.destroyPlayer(E.id);
                var n = new e.api(E.container);
                return e.api.addPlayer(n), n.config = t, n._embedder = new e.embed(n), n._embedder.embed(), n
            }
            return E
        }, E.getContainer = function() {
            return E.container
        }, E.addButton = function(e, t, n, r) {
            try {
                _[r] = n, y("jwDockAddButton", e, t, 'jwplayer("' + E.id + '").callback("' + r + '")', r)
            } catch (e) {
                i.log("Could not add dock button" + e.message)
            }
        }, E.removeButton = function(e) {
            y("jwDockRemoveButton", e)
        }, E.callback = function(e) {
            _[e] && _[e]()
        }, E.getMeta = function() {
            return E.getItemMeta()
        }, E.getPlaylist = function() {
            var e = y("jwGetPlaylist");
            return "flash" === E.renderingMode && i.deepReplaceKeyName(e, ["__dot__", "__spc__", "__dsh__", "__default__"], [".", " ", "-", "default"]), e
        }, E.getPlaylistItem = function(e) {
            return i.exists(e) || (e = E.getPlaylistIndex()), E.getPlaylist()[e]
        }, E.getRenderingMode = function() {
            return E.renderingMode
        }, E.setFullscreen = function(e) {
            return i.exists(e) ? y("jwSetFullscreen", e) : y("jwSetFullscreen", !y("jwGetFullscreen")), E
        }, E.setMute = function(e) {
            return i.exists(e) ? y("jwSetMute", e) : y("jwSetMute", !y("jwGetMute")), E
        }, E.lock = function() {
            return E
        }, E.unlock = function() {
            return E
        }, E.load = function(t) {
            return y("jwInstreamDestroy"), e(E.id).plugins.googima && y("jwDestroyGoogima"), y("jwLoad", t), E
        }, E.playlistItem = function(e) {
            return y("jwPlaylistItem", parseInt(e, 10)), E
        }, E.resize = function(e, t) {
            if ("flash" !== E.renderingMode) y("jwResize", e, t);
            else {
                var n = document.getElementById(E.id + "_wrapper"),
                    r = document.getElementById(E.id + "_aspect");
                r && (r.style.display = "none"), n && (n.style.display = "block", n.style.width = i.styleDimension(e), n.style.height = i.styleDimension(t))
            }
            return E
        }, E.play = function(e) {
            if (e !== t) return y("jwPlay", e), E;
            e = E.getState();
            var n = m && m.getState();
            return n && y(n === s.IDLE || n === s.PLAYING || n === s.BUFFERING ? "jwInstreamPause" : "jwInstreamPlay"), y(e === s.PLAYING || e === s.BUFFERING ? "jwPause" : "jwPlay"), E
        }, E.pause = function(e) {
            return e === t ? y((e = E.getState()) === s.PLAYING || e === s.BUFFERING ? "jwPause" : "jwPlay") : y("jwPause", e), E
        }, E.createInstream = function() {
            return new e.api.instream(this, v)
        }, E.setInstream = function(e) {
            return m = e
        }, E.loadInstream = function(e, t) {
            return (m = E.setInstream(E.createInstream()).init(t)).loadItem(e), m
        }, E.destroyPlayer = function() {
            P = !0, y("jwPlayerDestroy")
        }, E.playAd = function(t) {
            var n = e(E.id).plugins;
            n.vast ? n.vast.jwPlayAd(t) : y("jwPlayAd", t)
        }, E.pauseAd = function() {
            var t = e(E.id).plugins;
            t.vast ? t.vast.jwPauseAd() : y("jwPauseAd")
        }, f(d, function(e, t) {
            return w[e] || (w[e] = [], g(r.JWPLAYER_PLAYER_STATE, function(t) {
                var n = t.newstate;
                if (t = t.oldstate, n === e) {
                    var i = w[n];
                    if (i)
                        for (var r = 0; r < i.length; r++) {
                            var a = i[r];
                            "function" == typeof a && a.call(this, {
                                oldstate: t,
                                newstate: n
                            })
                        }
                }
            })), w[e].push(t), E
        }), f(c, g), i.foreach(l, function(e, t) {
            p(!1, t)
        }), i.foreach(u, function(e, t) {
            p(!0, t)
        }), E.remove = function() {
            this._embedder && this._embedder.destroy && this._embedder.destroy(), L = [];
            var e = 1 < a.size(a.where(n, {
                id: E.id
            }));
            e || i.clearCss("#" + E.id);
            var t = document.getElementById(E.id + ("flash" === E.renderingMode ? "_wrapper" : ""));
            if (t) {
                if ("html5" === E.renderingMode) E.destroyPlayer();
                else if (i.isMSIE(8)) {
                    var r = document.getElementById(E.id);
                    if (r && r.parentNode) {
                        for (var o in r.style.display = "none", r) "function" == typeof r[o] && (r[o] = null);
                        r.parentNode.removeChild(r)
                    }
                }
                e || ((e = document.createElement("div")).id = E.id, t.parentNode.replaceChild(e, t))
            }
            n = a.filter(n, function(e) {
                return e.uniqueId !== E.uniqueId
            })
        }, E.registerPlugin = function(t, n, i, r) {
            e.plugins.registerPlugin(t, n, i, r)
        }, E.setPlayer = function(e, t) {
            v = e, E.renderingMode = t
        }, E.detachMedia = function() {
            return "html5" === E.renderingMode ? y("jwDetachMedia") : void 0
        }, E.attachMedia = function(e) {
            return "html5" === E.renderingMode ? y("jwAttachMedia", e) : void 0
        }, E.getAudioTracks = function() {
            return y("jwGetAudioTracks")
        }, E.removeEventListener = function(e, t) {
            var n = A[e];
            if (n)
                for (var i = n.length; i--;) n[i] === t && n.splice(i, 1)
        }, E.dispatchEvent = function(e, t) {
            if (n = A[e])
                for (var n = n.slice(0), a = i.translateEventResponse(e, t), o = 0; o < n.length; o++) {
                    var s = n[o];
                    if ("function" == typeof s) try {
                        e === r.JWPLAYER_PLAYLIST_LOADED && i.deepReplaceKeyName(a.playlist, ["__dot__", "__spc__", "__dsh__", "__default__"], [".", " ", "-", "default"]), s.call(this, a)
                    } catch (e) {
                        i.log("There was an error calling back an event handler", e)
                    }
                }
        }, E.dispatchInstreamEvent = function(e) {
            m && m.dispatchEvent(e, arguments)
        }, E.callInternal = y, E.playerReady = function(e) {
            for (P = !0, v || E.setPlayer(document.getElementById(e.id)), E.container = document.getElementById(E.id), i.foreach(A, function(e) {
                    h(v, e)
                }), g(r.JWPLAYER_PLAYLIST_ITEM, function() {
                    R = {}
                }), g(r.JWPLAYER_MEDIA_META, function(e) {
                    i.extend(R, e.metadata)
                }), g(r.JWPLAYER_VIEW_TAB_FOCUS, function(e) {
                    var t = E.getContainer();
                    !0 === e.hasFocus ? i.addClass(t, "jw-tab-focus") : i.removeClass(t, "jw-tab-focus")
                }), E.dispatchEvent(r.API_READY); 0 < L.length;) y.apply(E, L.shift())
        }, E.getItemMeta = function() {
            return R
        }, E
    }, e.playerReady = function(t) {
        var n = e.api.playerById(t.id);
        n || (n = e.api.selectPlayer(t.id)), n.playerReady(t)
    }, e.api.selectPlayer = function(t) {
        var r;
        return i.exists(t) || (t = 0), t.nodeType ? r = t : "string" == typeof t && (r = document.getElementById(t)), r ? (t = e.api.playerById(r.id)) ? t : new e.api(r) : "number" == typeof t ? n[t] : null
    }, e.api.playerById = function(e) {
        for (var t = 0; t < n.length; t++)
            if (n[t].id === e) return n[t];
        return null
    }, e.api.addPlayer = function(e) {
        for (var t = 0; t < n.length; t++)
            if (n[t] === e) return e;
        return o++, e.uniqueId = o, n.push(e), e
    }, e.api.destroyPlayer = function(e) {
        e = a.where(n, {
            id: e
        }), a.each(e, a.partial(a.result, a, "remove"))
    }
}(window.jwplayer), function(e) {
    var t = e.events,
        n = e.utils,
        i = t.state;
    e.api.instream = function(e, r) {
        function a(t, n) {
            return u[t] || (u[t] = [], r.jwInstreamAddEventListener(t, 'function(dat) { jwplayer("' + e.id + '").dispatchInstreamEvent("' + t + '", dat); }')), u[t].push(n), this
        }

        function o(e, n) {
            return c[e] || (c[e] = [], a(t.JWPLAYER_PLAYER_STATE, function(t) {
                var n = t.newstate,
                    i = t.oldstate;
                if (n === e) {
                    var r = c[n];
                    if (r)
                        for (var a = 0; a < r.length; a++) {
                            var o = r[a];
                            "function" == typeof o && o.call(this, {
                                oldstate: i,
                                newstate: n,
                                type: t.type
                            })
                        }
                }
            })), c[e].push(n), this
        }
        var s, l, u = {},
            c = {},
            d = this;
        d.type = "instream", d.init = function() {
            return e.callInternal("jwInitInstream"), d
        }, d.loadItem = function(t, i) {
            s = t, l = i || {}, "array" === n.typeOf(t) ? e.callInternal("jwLoadArrayInstream", s, l) : e.callInternal("jwLoadItemInstream", s, l)
        }, d.removeEvents = function() {
            u = c = {}
        }, d.removeEventListener = function(e, t) {
            var n = u[e];
            if (n)
                for (var i = n.length; i--;) n[i] === t && n.splice(i, 1)
        }, d.dispatchEvent = function(e, t) {
            if (i = u[e])
                for (var i = i.slice(0), r = n.translateEventResponse(e, t[1]), a = 0; a < i.length; a++) {
                    var o = i[a];
                    "function" == typeof o && o.call(this, r)
                }
        }, d.onError = function(e) {
            return a(t.JWPLAYER_ERROR, e)
        }, d.onMediaError = function(e) {
            return a(t.JWPLAYER_MEDIA_ERROR, e)
        }, d.onFullscreen = function(e) {
            return a(t.JWPLAYER_FULLSCREEN, e)
        }, d.onMeta = function(e) {
            return a(t.JWPLAYER_MEDIA_META, e)
        }, d.onMute = function(e) {
            return a(t.JWPLAYER_MEDIA_MUTE, e)
        }, d.onComplete = function(e) {
            return a(t.JWPLAYER_MEDIA_COMPLETE, e)
        }, d.onPlaylistComplete = function(e) {
            return a(t.JWPLAYER_PLAYLIST_COMPLETE, e)
        }, d.onPlaylistItem = function(e) {
            return a(t.JWPLAYER_PLAYLIST_ITEM, e)
        }, d.onTime = function(e) {
            return a(t.JWPLAYER_MEDIA_TIME, e)
        }, d.onBuffer = function(e) {
            return o(i.BUFFERING, e)
        }, d.onPause = function(e) {
            return o(i.PAUSED, e)
        }, d.onPlay = function(e) {
            return o(i.PLAYING, e)
        }, d.onIdle = function(e) {
            return o(i.IDLE, e)
        }, d.onClick = function(e) {
            return a(t.JWPLAYER_INSTREAM_CLICK, e)
        }, d.onInstreamDestroyed = function(e) {
            return a(t.JWPLAYER_INSTREAM_DESTROYED, e)
        }, d.onAdSkipped = function(e) {
            return a(t.JWPLAYER_AD_SKIPPED, e)
        }, d.play = function(e) {
            r.jwInstreamPlay(e)
        }, d.pause = function(e) {
            r.jwInstreamPause(e)
        }, d.hide = function() {
            e.callInternal("jwInstreamHide")
        }, d.destroy = function() {
            d.removeEvents(), e.callInternal("jwInstreamDestroy")
        }, d.setText = function(e) {
            r.jwInstreamSetText(e || "")
        }, d.getState = function() {
            return r.jwInstreamState()
        }, d.setClick = function(e) {
            r.jwInstreamClick && r.jwInstreamClick(e)
        }
    }
}(jwplayer), function(e) {
    var t = e.api,
        n = t.selectPlayer,
        i = e._;
    t.selectPlayer = function(t) {
        var i = n.apply(this, arguments);
        return i || {
            registerPlugin: function(t, n, i) {
                "jwpsrv" !== t && e.plugins.registerPlugin(t, n, i)
            }
        }
    }, e.unregisteredProviders = [], t.registerProvider = function(t) {
        e && e.html5 && i.isFunction(e.html5.registerProvider) ? e.html5.registerProvider(t) : e.unregisteredProviders.push(t)
    }
}(jwplayer));