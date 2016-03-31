define(['exports', 'esri/geometry/Polygon', 'utils/symbols', 'esri/graphic'], function (exports, _Polygon, _symbols, _graphic) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _Polygon2 = _interopRequireDefault(_Polygon);

  var _symbols2 = _interopRequireDefault(_symbols);

  var _graphic2 = _interopRequireDefault(_graphic);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  //- Really crappy UUID generator but it works
  var cfid = 0;
  var customFeatureUUIDGenerator = function customFeatureUUIDGenerator() {
    return ++cfid;
  };

  exports.default = {

    /**
    * @param {object} geometry - Valid esri grometry from the draw tool, any valid polygon geo would work
    * @return {Graphic}
    */
    generateDrawnPolygon: function generateDrawnPolygon(geometry) {
      return new _graphic2.default(new _Polygon2.default(geometry), _symbols2.default.getCustomSymbol(), { OBJECTID: customFeatureUUIDGenerator() });
    },

    /**
    * This currently only supports polygon uploads
    * @param {object} - featureCollection - Feature Collection returned from Esri's generate features API
    * @return {array<Graphic>}
    */
    generatePolygonsFromUpload: function generatePolygonsFromUpload(featureCollection) {
      var graphics = [];
      // Create an array of features from all the layers and feature sets
      featureCollection.layers.forEach(function (layer) {
        var featureSet = layer.featureSet;

        featureSet.features.forEach(function (feature) {
          graphics.push(new _graphic2.default(new _Polygon2.default(feature.geometry), _symbols2.default.getCustomSymbol(), feature.attributes));
        });
      });

      return graphics;
    }

  };
});