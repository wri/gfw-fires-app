/* global window, document, location */
// ENV to dev for Development, pro for Production
(function(win, doc) {
    'use strict';
    var ENV = 'dev',
        version = "0.1.0",
        src = 'http://js.arcgis.com/3.9/',
        css = {
            'dev': [{
                src: 'http://js.arcgis.com/3.9/js/esri/css/esri.css',
                cdn: true
            }, {
                src: 'app/css/app.css',
                cdn: false
            }, {
                src: 'app/css/map.css',
                cdn: false
            }, {
                src: 'app/css/contentPages.css',
                cdn: false
            }, {
                src: 'app/css/responsive.css',
                cdn: false
            }, {
                src: 'http://js.arcgis.com/3.8/js/dojo/dijit/themes/tundra/tundra.css',
                cdn: true
            }],
            'pro': [{
                src: 'http://js.arcgis.com/3.9/js/esri/css/esri.css',
                cdn: true
            }, {
                src: 'app/css/app.css',
                cdn: false
            }, {
                src: 'app/css/map.css',
                cdn: false
            }, {
                src: 'app/css/contentPages.css',
                cdn: false
            }, {
                src: 'app/css/responsive.css',
                cdn: false
            }, {
                src: 'http://js.arcgis.com/3.8/js/dojo/dijit/themes/tundra/tundra.css',
                cdn: true
            }]
        },
        URL = location.pathname.replace(/\/[^/]+$/, '') + 'app',
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
        var s = doc.createElement('script');
        s.setAttribute('src', src);
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                s.setAttribute(key, attrs[key]);
            }
        }
        doc.getElementsByTagName('body')[0].appendChild(s);
    };

    var loadStyle = function(src, isCDN) {
        var l = doc.createElement('link'),
            path = isCDN ? src : src + '?v=' + version;
        l.setAttribute('rel', 'stylesheet');
        l.setAttribute('type', 'text/css');
        l.setAttribute('href', path);
        doc.getElementsByTagName('body')[0].appendChild(l);
    };

    // Load Esri Dependencies
    win.dojoConfig = dojoConfig;
    loadScript(src);
    var files = css[ENV];
    for (var i = 0, length = files.length; i < length; i++) {
        loadStyle(files[i].src, files[i].cdn);
    }

})(window, document);