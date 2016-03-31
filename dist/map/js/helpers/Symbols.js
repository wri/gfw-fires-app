define(['exports', 'esri/symbols/PictureMarkerSymbol', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleFillSymbol', 'esri/symbols/SimpleLineSymbol', 'js/config', 'js/constants', 'esri/Color'], function (exports, _PictureMarkerSymbol, _SimpleMarkerSymbol, _SimpleFillSymbol, _SimpleLineSymbol, _config, _constants, _Color) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _PictureMarkerSymbol2 = _interopRequireDefault(_PictureMarkerSymbol);

  var _SimpleMarkerSymbol2 = _interopRequireDefault(_SimpleMarkerSymbol);

  var _SimpleFillSymbol2 = _interopRequireDefault(_SimpleFillSymbol);

  var _SimpleLineSymbol2 = _interopRequireDefault(_SimpleLineSymbol);

  var _constants2 = _interopRequireDefault(_constants);

  var _Color2 = _interopRequireDefault(_Color);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var watershedDefaultSymbol = void 0,
      svgMarkerSymbol = void 0,
      bbSymbol = void 0,
      pointSymbol = void 0;

  var Symbols = {
    getBBSymbol: function getBBSymbol() {
      if (bbSymbol) {
        return bbSymbol;
      }
      bbSymbol = new _SimpleFillSymbol2.default(_SimpleFillSymbol2.default.STYLE_SOLID, new _SimpleLineSymbol2.default(_SimpleLineSymbol2.default.STYLE_SOLID, new _Color2.default(_config.symbolConfig.bbSymbol), 2), new _Color2.default([0, 255, 0, 0]));
      return bbSymbol;
    },

    getWatershedDefaultSymbol: function getWatershedDefaultSymbol() {
      if (watershedDefaultSymbol) {
        return watershedDefaultSymbol;
      }
      // Get a reference to the default symbol for this layer
      var watershedLayer = app.map.getLayer(_constants2.default.watershed);
      watershedDefaultSymbol = watershedLayer.renderer.getSymbol();
      return watershedDefaultSymbol;
    },

    getSVGPointSymbol: function getSVGPointSymbol() {
      if (svgMarkerSymbol) {
        return svgMarkerSymbol;
      }
      svgMarkerSymbol = new _SimpleMarkerSymbol2.default();
      svgMarkerSymbol.setPath(_config.symbolConfig.svgPath);
      svgMarkerSymbol.setColor(new _Color2.default(_config.symbolConfig.gfwBlue));
      svgMarkerSymbol.setOutline(null);
      svgMarkerSymbol.setSize(24);
      return svgMarkerSymbol;
    },

    getPointSymbol: function getPointSymbol() {
      if (pointSymbol) {
        return pointSymbol;
      }
      pointSymbol = new _PictureMarkerSymbol2.default({
        url: _config.symbolConfig.pointUrl,
        xoffset: 6,
        yoffset: 6,
        height: 27, //approx 36px
        width: 27
      });
      return pointSymbol;
    }

  };

  exports.default = Symbols;
});