define(['exports', './EsriTileCanvasBase', 'dojo/_base/declare'], function (exports, _EsriTileCanvasBase, _declare) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _EsriTileCanvasBase2 = _interopRequireDefault(_EsriTileCanvasBase);

  var _declare2 = _interopRequireDefault(_declare);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = (0, _declare2.default)('GFWImageryLayer', [_EsriTileCanvasBase2.default], {
    filter: function filter(data) {
      return data;
    },

    setUrl: function setUrl(url) {
      this.options.url = url;
      this._extentChanged(true);
    }

  });
});