/* global window, document, location */
// ENV to dev for Development, pro for Production
(function(win, doc) {
    'use strict';

    var src = [
            'http://js.arcgis.com/3.9/',
            'http://code.jquery.com/jquery-1.11.0.min.js'
        ],
        css = [
            'http://js.arcgis.com/3.9/js/esri/css/esri.css',
            '../../../css/report.css?v=0.6.9'
        ],
        URL = location.pathname.replace(/app\/js\/views\/report.*/, '') + 'app',
        dojoConfig = {
            parseOnLoad: false,
            isDebug: false,
            textPluginHeaders: {
                "X-Requested-With": null
            },
            async: true,
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
                ["knockout", "libs/knockout-3.2.0"],
                ["dom-style", "dojo/dom-style"],
                ["dom-class", "dojo/dom-class"],
                ["topic", "dojo/topic"],
                ["dom", "dojo/dom"],
                ["on", "dojo/on"]
            ],
            deps: [
                'views/report/ReportBuilder',
                'dojo/domReady!'
            ],
            callback: function(ReportBuilder) {
                ReportBuilder.init();
                loadScript('http://code.highcharts.com/modules/exporting.js');
            }
        }; // End dojoConfig

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

    var loadStyle = function(src) {
        var l = doc.createElement('link');
        l.setAttribute('rel', 'stylesheet');
        l.setAttribute('type', 'text/css');
        l.setAttribute('href', src);
        doc.getElementsByTagName('head')[0].appendChild(l);
    };

    function loadDependencies() {
        // Load Esri Dependencies
        win.dojoConfig = dojoConfig;
        for (var i = 0, len = css.length; i < len; i++) {
            loadStyle(css[i]);
        }
        for (var j = 0, size = src.length; j < size; j++) {
            loadScript(src[j]);
        }
    }

    win.requestAnimationFrame = (function() {
        return win.requestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            win.mozRequestAnimationFrame ||
            win.oRequestAnimationFrame ||
            win.msRequestAnimationFrame;
    })();

    if (win.requestAnimationFrame) {
        win.requestAnimationFrame(loadDependencies);
    } else if (doc.readyState === "loaded") {
        loadDependencies();
    } else {
        win.onload = loadDependencies;
    }

})(window, document);