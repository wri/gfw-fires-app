define([], function () {
    'use strict';

    /* global window, document, location */
    // ENV to dev for Development, pro for Production
    (function (win, doc) {
        'use strict';

        var src = ['https://js.arcgis.com/3.20/', 'https://code.jquery.com/jquery-1.11.0.min.js'],
            css = ['https://js.arcgis.com/3.20/js/esri/css/esri.css', '../css/report.css'],
            base = location.pathname.replace(/\/[^/]+$/, '/'),
            dojoConfig = {
            parseOnLoad: false,
            isDebug: false,
            textPluginHeaders: {
                "X-Requested-With": null
            },
            async: true,
            packages: [{
                name: 'libs',
                location: base + '/libs'
            }, {
                name: 'main',
                location: base + '/js/main'
            }, {
                name: 'modules',
                location: base + '/js/modules'
            }, {
                name: 'views',
                location: base + '/js/views'
            }, {
                name: 'utils',
                location: base + '/js/utils'
            }],
            aliases: [
            // ["knockout", "libs/knockout-3.2.0"],
            ["dom-style", "dojo/dom-style"], ["dom-class", "dojo/dom-class"], ["topic", "dojo/topic"], ["dom", "dojo/dom"], ["on", "dojo/on"]],
            deps: ['views/report/ReportBuilder', 'dojo/domReady!'],
            callback: function callback(ReportBuilder) {
                ReportBuilder.init();
                loadScript('http://code.highcharts.com/modules/exporting.js');
            }
        }; // End dojoConfig

        var loadScript = function loadScript(src, attrs) {
            var s = doc.createElement('script');
            s.setAttribute('src', src);
            for (var key in attrs) {
                if (attrs.hasOwnProperty(key)) {
                    s.setAttribute(key, attrs[key]);
                }
            }
            doc.getElementsByTagName('body')[0].appendChild(s);
        };

        var loadStyle = function loadStyle(src) {
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

        win.requestAnimationFrame = function () {
            return win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.oRequestAnimationFrame || win.msRequestAnimationFrame;
        }();

        if (win.requestAnimationFrame) {
            win.requestAnimationFrame(loadDependencies);
        } else if (doc.readyState === "loaded") {
            loadDependencies();
        } else {
            win.onload = loadDependencies;
        }
    })(window, document);
});