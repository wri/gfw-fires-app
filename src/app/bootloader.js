/* global window, document, location */
// ENV to dev for Development, pro for Production
(function(win, doc) {
    'use strict';
    var ENV = 'dev',
        version = "0.1.8",
        src = 'http://js.arcgis.com/3.10/',
        css = {
            'dev': [{
                src: 'http://js.arcgis.com/3.10/js/esri/css/esri.css',
                cdn: true
            }, {
                src: 'app/css/app.css',
                cdn: false
            }, {
                src: 'app/css/contentPages.css',
                cdn: false
            }, {
                src: 'app/css/responsive.css',
                cdn: false
            }, {
                src: 'app/css/intlTelInput.css',
                cdn: false
            }, {
                src: 'http://js.arcgis.com/3.8/js/dojo/dijit/themes/tundra/tundra.css',
                cdn: true
            }],
            'pro': [{
                src: 'http://js.arcgis.com/3.10/js/esri/css/esri.css',
                cdn: true
            }, {
                src: 'app/css/app.css',
                cdn: false
            }, {
                src: 'app/css/contentPages.css',
                cdn: false
            }, {
                src: 'app/css/responsive.css',
                cdn: false
            }, {
                src: 'app/css/intlTelInput.css',
                cdn: false
            }, {
                src: 'http://js.arcgis.com/3.8/js/dojo/dijit/themes/tundra/tundra.css',
                cdn: true
            }]
        },
        URL = location.pathname.replace(/\/[^/]+$/, '') + '/app',
        dojoConfig = {
            parseOnLoad: false,
            isDebug: false,
            textPluginHeaders: {
                "X-Requested-With": null
            },
            async: true,
            cacheBust: 'v=' + version,
            packages: [{
                name: 'libs',
                location: URL + '/libs'
            }, {
                name: 'main',
                location: URL + '/js/main'
            }, {
                name: 'modules',
                location: URL + '/js/modules'
            }, {
                name: 'views',
                location: URL + '/js/views'
            }, {
                name: 'utils',
                location: URL + '/js/utils'
            }],
            aliases: [
                ["knockout", "libs/knockout-3.1.0"],

                ["dom-style", "dojo/dom-style"],
                ["dom-class", "dojo/dom-class"],
                ["topic", "dojo/topic"],
                ["dom", "dojo/dom"],
                ["on", "dojo/on"]
            ],
            deps: [
                'main/Main',
                'dojo/domReady!'
            ],
            callback: function(main) {
                main.init();
            }
        }; // End dojoConfig

    var addthis_share = {
        url_transforms: {
            shorten: {
                twitter: 'bitly',
                facebook: 'bitly'
            }
        },
        shorteners: {
            bitly: {}
        }
    }; //end addThis_share

    var loadScript = function(src, attrs) {
        var s = doc.createElement('script'),
            h = doc.getElementsByTagName('head')[0];
        s.setAttribute('src', src);
        s.setAttribute('async', 'true');
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                s.setAttribute(key, attrs[key]);
            }
        }
        h.parentNode.insertBefore(s, h);
    };

    var loadStyle = function(src, isCDN) {
        var l = doc.createElement('link'),
            path = isCDN ? src : src + '?v=' + version,
            h = doc.getElementsByTagName('head')[0];
        l.setAttribute('rel', 'stylesheet');
        l.setAttribute('type', 'text/css');
        l.setAttribute('href', path);
        l.media = "only x";
        h.parentNode.insertBefore(l, h);
        setTimeout(function () {
            l.media = "all";
        });
    };

    // Load Esri Dependencies
    function loadDependencies() {
        win.dojoConfig = dojoConfig;
        loadScript(src);
        var files = css[ENV];
        for (var i = 0, length = files.length; i < length; i++) {
            loadStyle(files[i].src, files[i].cdn);
        }
    }

    win.requestAnimationFrame = (function() {
        return win.requestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            win.mozRequestAnimationFrame ||
            win.oRequestAnimationFrame ||
            win.msRequestAnimationFrame;
    })();

    // Make Sure scripts and css are not loaded in a blocking fashion
    if (win.requestAnimationFrame) {
        win.requestAnimationFrame(loadDependencies);
    } else if (doc.readyState === "loaded") {
        loadDependencies();
    } else {
        win.onload = loadDependencies;
    }

})(window, document);