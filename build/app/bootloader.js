! function(s, e) {
    "use strict";

    function t() {
        s.dojoConfig = r, d(c);
        for (var e = i[n], t = 0, a = e.length; a > t; t++) m(e[t].src, e[t].cdn);
        p("app/images/favicon.ico")
    }
    var n = "dev",
        a = "0.1.8",
        c = "http://js.arcgis.com/3.10/",
        i = {
            dev: [{
                src: "http://js.arcgis.com/3.10/js/esri/css/esri.css",
                cdn: !0
            }, {
                src: "app/css/app.css",
                cdn: !1
            }, {
                src: "app/css/contentPages.css",
                cdn: !1
            }, {
                src: "app/css/responsive.css",
                cdn: !1
            }, {
                src: "app/css/intlTelInput.css",
                cdn: !1
            }, {
                src: "app/css/map.css",
                cdn: !1
            }, {
                src: "http://js.arcgis.com/3.8/js/dojo/dijit/themes/tundra/tundra.css",
                cdn: !0
            }],
            pro: [{
                src: "http://js.arcgis.com/3.10/js/esri/css/esri.css",
                cdn: !0
            }, {
                src: "app/css/app.css",
                cdn: !1
            }, {
                src: "app/css/contentPages.css",
                cdn: !1
            }, {
                src: "app/css/responsive.css",
                cdn: !1
            }, {
                src: "app/css/intlTelInput.css",
                cdn: !1
            }, {
                src: "app/css/map.css",
                cdn: !1
            }, {
                src: "http://js.arcgis.com/3.8/js/dojo/dijit/themes/tundra/tundra.css",
                cdn: !0
            }]
        },
        o = location.pathname.replace(/\/[^/]+$/, "") + "/app",
        r = {
            parseOnLoad: !1,
            isDebug: !1,
            textPluginHeaders: {
                "X-Requested-With": null
            },
            async: !0,
            cacheBust: "v=" + a,
            packages: [{
                name: "libs",
                location: o + "/libs"
            }, {
                name: "main",
                location: o + "/js/main"
            }, {
                name: "modules",
                location: o + "/js/modules"
            }, {
                name: "views",
                location: o + "/js/views"
            }, {
                name: "utils",
                location: o + "/js/utils"
            }],
            aliases: [
                ["knockout", "libs/knockout-3.1.0"],
                ["dom-style", "dojo/dom-style"],
                ["dom-class", "dojo/dom-class"],
                ["topic", "dojo/topic"],
                ["dom", "dojo/dom"],
                ["on", "dojo/on"]
            ],
            deps: ["main/Main", "dojo/domReady!"],
            callback: function(s) {
                s.init()
            }
        },
        d = function(s, t) {
            var n = e.createElement("script"),
                a = e.getElementsByTagName("head")[0];
            n.setAttribute("src", s);
            for (var c in t) t.hasOwnProperty(c) && n.setAttribute(c, t[c]);
            a.appendChild(n)
        },
        m = function(s, t) {
            var n = e.createElement("link"),
                c = t ? s : s + "?v=" + a,
                i = e.getElementsByTagName("head")[0];
            n.setAttribute("rel", "stylesheet"), n.setAttribute("type", "text/css"), n.setAttribute("href", c), n.media = "only x", i.appendChild(n), setTimeout(function() {
                n.media = "all"
            })
        },
        p = function(s) {
            var t = e.createElement("link"),
                n = e.getElementsByTagName("head")[0];
            t.setAttribute("rel", "shortcut icon"), t.setAttribute("type", "image/png"), t.setAttribute("href", s), n.appendChild(t), setTimeout(function() {
                t.media = "all"
            })
        };
    s.requestAnimationFrame = function() {
        return s.requestAnimationFrame || s.webkitRequestAnimationFrame || s.mozRequestAnimationFrame || s.oRequestAnimationFrame || s.msRequestAnimationFrame
    }(), s.requestAnimationFrame ? s.requestAnimationFrame(t) : "loaded" === e.readyState ? t() : s.onload = t
}(window, document);