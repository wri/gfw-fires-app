define(['exports', 'helpers/GraphicsHelper', 'dojo/Deferred', 'utils/request', 'js/config'], function (exports, _GraphicsHelper, _Deferred, _request, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _GraphicsHelper2 = _interopRequireDefault(_GraphicsHelper);

  var _Deferred2 = _interopRequireDefault(_Deferred);

  var _request2 = _interopRequireDefault(_request);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var AnalysisHelper = {

    findWatershed: function findWatershed(pointGeometry) {
      app.debug('AnalysisActions >>> findWatershed');
      var deferred = new _Deferred2.default();
      _request2.default.getWatershedByGeometry(pointGeometry).then(function (feature) {
        if (feature) {
          deferred.resolve(feature);
          app.map.setExtent(feature.geometry.getExtent(), true);
        } else {
          deferred.reject(_config.errors.featureNotFound);
        }
      }, function (err) {
        console.error(err);
        deferred.reject(err);
      });
      return deferred;
    },

    performUpstreamAnalysis: function performUpstreamAnalysis(geometry) {
      _request2.default.getUpstreamAnalysis(geometry).then(function (dataValue) {
        dataValue.features.forEach(function (feature) {
          _GraphicsHelper2.default.addUpstreamGraphic(feature);
        });
      }, console.error);
    }

  };

  exports.default = AnalysisHelper;
});