define(['exports', 'esri/symbols/SimpleFillSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/Color'], function (exports, _SimpleFillSymbol, _SimpleLineSymbol, _Color) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _SimpleFillSymbol2 = _interopRequireDefault(_SimpleFillSymbol);

  var _SimpleLineSymbol2 = _interopRequireDefault(_SimpleLineSymbol);

  var _Color2 = _interopRequireDefault(_Color);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var customSymbol = void 0,
      imagerySymbol = void 0;

  exports.default = {

    getCustomSymbol: function getCustomSymbol() {
      if (customSymbol) {
        return customSymbol;
      }
      customSymbol = new _SimpleFillSymbol2.default(_SimpleLineSymbol2.default.STYLE_SOLID, new _SimpleLineSymbol2.default(_SimpleLineSymbol2.default.STYLE_SOLID, new _Color2.default([3, 188, 255]), 3), new _Color2.default([210, 210, 210, 0.0]));
      return customSymbol;
    },

    getImagerySymbol: function getImagerySymbol() {
      if (imagerySymbol) {
        return imagerySymbol;
      }
      imagerySymbol = new _SimpleFillSymbol2.default(_SimpleLineSymbol2.default.STYLE_SOLID, new _SimpleLineSymbol2.default(_SimpleLineSymbol2.default.STYLE_SOLID, new _Color2.default([210, 210, 210, 0]), 1), new _Color2.default([210, 210, 210, 0.0]));
      return imagerySymbol;
    }
  };
});