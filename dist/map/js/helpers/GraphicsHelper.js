define(['exports', 'esri/geometry/Polygon', 'esri/geometry/Point', 'helpers/Symbols', 'esri/graphic', 'js/constants'], function (exports, _Polygon, _Point, _Symbols, _graphic, _constants) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _Polygon2 = _interopRequireDefault(_Polygon);

  var _Point2 = _interopRequireDefault(_Point);

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
    * Add a feature to the map for the purpose of showing an active watershed for analysis
    * @param {Graphic} feature - Esri Feature object returned from a query
    */
    addActiveWatershed: function addActiveWatershed(feature) {
      console.log(feature);
      var layer = app.map.getLayer(_constants2.default.watershedAnalysis);
      if (layer) {
        layer.add(new _graphic2.default(feature.geometry, _Symbols2.default.getWatershedHoverSymbol(), feature.attributes));
      }
    },

    /**
    * Add upstream watershed to the map
    * @param {Feature} feature - Esri feature returned from GeoProcessor.submitJob
    */
    addUpstreamGraphic: function addUpstreamGraphic(feature) {
      var layer = app.map.getLayer(_constants2.default.customAnalysis);
      if (layer) {
        layer.add(new _graphic2.default(feature.geometry, _Symbols2.default.getUpstreamSymbol(), feature.attributes));
      }
    },

    /**
    * Add a point to the map from the draw tool or lat long tool, this is for CustomArea Analysis ONLY
    * @param {object} geometry - Esri Point geometry
    */
    addCustomPoint: function addCustomPoint(geometry) {
      var layer = app.map.getLayer(_constants2.default.customAnalysis);
      if (layer) {
        layer.add(new _graphic2.default(geometry, _Symbols2.default.getSVGPointSymbol()));
      }
    },

    /**
    * Generate a point from the lat/lon inputs, or any valid lat/lon
    * @param {number} lat - Valid latitude between -90 and 90
    * @param {number} lon - Valid longitude between -180 and 180
    * @return {point} point - return an esri point object that can be used for future methods
    */
    generatePointFromLatLng: function generatePointFromLatLng(lat, lon) {
      return new _Point2.default(lon, lat);
    },

    /**
    * Generate a Graphic from the provided feature JSON
    * @param {object} feature - must have geometry and should have attributes
    * @return {Graphic} - return an Esri Graphic object that can be used for future methods
    */
    makePolygon: function makePolygon(feature) {
      if (!feature.geometry.spatialReference) {
        feature.geometry.spatialReference = { wkid: 102100 };
      }
      return new _graphic2.default(new _Polygon2.default(feature.geometry), null, //- No symbol necessary
      feature.attributes || {});
    },

    /**
    * Generate a Graphic from the provided feature JSON
    * @param {object} feature - must have geometry and should have attributes
    * @return {Graphic} - return an Esri Graphic object that can be used for future methods
    */
    makePoint: function makePoint(geometry, attributes) {
      return new _graphic2.default(new _Point2.default(geometry), _Symbols2.default.getSVGPointSymbol(), attributes || null);
    },

    clearActiveWatersheds: function clearActiveWatersheds() {
      var layer = app.map.getLayer(_constants2.default.watershedAnalysis);
      if (layer) {
        layer.clear();
      }
    },
    clearCustomAreas: function clearCustomAreas() {
      var layer = app.map.getLayer(_constants2.default.customAnalysis);
      if (layer) {
        layer.clear();
      }
    },
    clearFeatures: function clearFeatures() {
      app.map.graphics.clear();
    }
  };

  exports.default = graphicsHelper;
});