define(['exports', 'helpers/GraphicsHelper', 'js/config', 'esri/request', 'dojo/promise/all', 'js/alt'], function (exports, _GraphicsHelper, _config, _request, _all, _alt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.analysisActions = undefined;

  var _GraphicsHelper2 = _interopRequireDefault(_GraphicsHelper);

  var _request2 = _interopRequireDefault(_request);

  var _all2 = _interopRequireDefault(_all);

  var _alt2 = _interopRequireDefault(_alt);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var AnalysisActions = function () {
    function AnalysisActions() {
      _classCallCheck(this, AnalysisActions);
    }

    _createClass(AnalysisActions, [{
      key: 'analyzeCustomArea',
      value: function analyzeCustomArea(feature) {
        app.debug('AnalysisActions >>> analyzeCustomArea');
        _GraphicsHelper2.default.addCustomPoint(feature);
        this.dispatch(feature);
      }
    }, {
      key: 'setCustomAreaName',
      value: function setCustomAreaName(newName) {
        app.debug('AnalysisActions >>> setCustomAreaName');
        this.dispatch(newName);
      }
    }, {
      key: 'setAnalysisType',
      value: function setAnalysisType(tabId) {
        this.dispatch(tabId);
      }
    }, {
      key: 'toggleAnalysisSource',
      value: function toggleAnalysisSource() {
        this.dispatch();
      }
    }, {
      key: 'toggleDrawToolbar',
      value: function toggleDrawToolbar(status) {
        this.dispatch(status);
      }
    }, {
      key: 'toggleCustomize',
      value: function toggleCustomize() {
        this.dispatch();
      }
    }, {
      key: 'toggleCountryCustomize',
      value: function toggleCountryCustomize() {
        this.dispatch();
      }
    }, {
      key: 'toggleImageryOptions',
      value: function toggleImageryOptions() {
        this.dispatch();
      }
    }, {
      key: 'toggleAnalysisToolsVisibility',
      value: function toggleAnalysisToolsVisibility() {
        this.dispatch();
      }
    }, {
      key: 'toggleAnalysisToolsExpanded',
      value: function toggleAnalysisToolsExpanded() {
        this.dispatch();
      }
    }, {
      key: 'toggleSubscribeToolsExpanded',
      value: function toggleSubscribeToolsExpanded() {
        this.dispatch();
      }
    }, {
      key: 'toggleImageryToolsExpanded',
      value: function toggleImageryToolsExpanded() {
        this.dispatch();
      }
    }, {
      key: 'toggleBasemapToolsExpanded',
      value: function toggleBasemapToolsExpanded() {
        this.dispatch();
      }
    }, {
      key: 'toggleEsriSearchVisibility',
      value: function toggleEsriSearchVisibility() {
        this.dispatch();
      }
    }, {
      key: 'toggleTimelineVisibility',
      value: function toggleTimelineVisibility() {
        this.dispatch();
      }
    }, {
      key: 'toggleAreaIslandsActive',
      value: function toggleAreaIslandsActive() {
        this.dispatch();
      }
    }, {
      key: 'initAreas',
      value: function initAreas() {
        var _this = this;

        (0, _all2.default)({
          islands: (0, _request2.default)(_config.analysisConfig.requests.islands),
          provinces: (0, _request2.default)(_config.analysisConfig.requests.provinces),
          countries: (0, _request2.default)(_config.analysisConfig.requests.countries),
          adm1: (0, _request2.default)(_config.analysisConfig.requests.adm1)
        }).then(function (responses) {
          _this.dispatch({
            islands: responses.islands.features.map(function (f) {
              return f.attributes.ISLAND;
            }).sort(),
            provinces: responses.provinces.features.map(function (f) {
              return f.attributes.PROVINCE;
            }).sort(),
            countries: responses.countries.features.map(function (f) {
              return f.attributes.NAME_0;
            }).sort(),
            adm1: responses.adm1.features.map(function (f) {
              return f.attributes;
            })
          });
        });
      }
    }]);

    return AnalysisActions;
  }();

  var analysisActions = exports.analysisActions = _alt2.default.createActions(AnalysisActions);
});