define(['exports', 'helpers/Symbols', 'esri/graphic', 'js/constants'], function (exports, _Symbols, _graphic, _constants) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _Symbols2 = _interopRequireDefault(_Symbols);

  var _graphic2 = _interopRequireDefault(_graphic);

  var _constants2 = _interopRequireDefault(_constants);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var graphicsHelper = {

    /**
    * Add a point to the map from the draw tool or lat long tool, this is for CustomArea Analysis ONLY
    * @param {object} geometry - Esri Point geometry
    */
    addCustomPoint: function addCustomPoint(geometry) {
      var layer = app.map.getLayer(_constants2.default.customAnalysis);
      if (layer) {
        layer.add(new _graphic2.default(geometry, _Symbols2.default.getSVGPointSymbol()));
      }
    }

  };

  exports.default = graphicsHelper;
});