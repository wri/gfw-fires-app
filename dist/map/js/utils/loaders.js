define(['exports', 'dojo/Deferred'], function (exports, _Deferred) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.loadJS = exports.loadCSS = undefined;

  var _Deferred2 = _interopRequireDefault(_Deferred);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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

      var deferred = new _Deferred2.default();

      var script = document.createElement('script');
      script.src = url;
      script.async = async || false;
      script.onload = deferred.resolve();
      script.onerror = deferred.reject();
      requestAnimationFrame(function () {
        document.getElementsByTagName('head')[0].appendChild(script);
      });

      // let promise = new Promise((resolve, reject) => {
      //   let script = document.createElement('script');
      //   script.src = url;
      //   script.async = async || false;
      //   script.onload = resolve;
      //   script.onerror = reject;
      //   requestAnimationFrame(function () { document.getElementsByTagName('head')[0].appendChild(script); });
      // });
      return deferred;
    }

  };

  var loadCSS = exports.loadCSS = loaders.loadCSS;
  var loadJS = exports.loadJS = loaders.loadJS;
});