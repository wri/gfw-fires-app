define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var loaders = {

    loadCSS: function loadCSS(url) {
      var sheet = document.createElement('link');
      sheet.rel = 'stylesheet';
      sheet.type = 'text/css';
      sheet.href = url;
      requestAnimationFrame(function () {
        document.getElementsByTagName('head')[0].appendChild(sheet);
      });
    },

    loadJS: function loadJS(url, async) {
      var promise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = url;
        script.async = async || false;
        script.onload = resolve;
        script.onerror = reject;
        requestAnimationFrame(function () {
          document.getElementsByTagName('head')[0].appendChild(script);
        });
      });
      return promise;
    }

  };

  var loadCSS = exports.loadCSS = loaders.loadCSS;
  var loadJS = exports.loadJS = loaders.loadJS;
});