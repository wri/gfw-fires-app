define(['exports', 'actions/AnalysisActions', 'js/config', 'js/alt'], function (exports, _AnalysisActions, _config, _alt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.analysisStore = undefined;

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

  var AnalysisStore = function () {
    function AnalysisStore() {
      _classCallCheck(this, AnalysisStore);

      // TODO: review state for unused properties
      this.toolbarActive = false;
      this.activeWatershed = null;
      this.activeCustomArea = null;
      this.activeTab = _config.analysisPanelText.analysisTabId;
      this.customAreaName = _config.analysisPanelText.customAreaNamePlaceholder;
      this.esriSearchVisible = false;
      this.analysisToolsVisible = app.mobile() === false;
      this.customizeOpen = false;
      this.customizeCountryOpen = false;

      this.imageryOpen = false;
      this.analysisToolsExpanded = true;
      this.imageryToolsExpanded = false;
      this.basemapToolsExpanded = false;
      this.subscribeToolsExpanded = false;
      this.timelineVisible = false;
      this.analysisSourceGFW = true;
      this.islands = [];
      this.provinces = [];
      this.countries = [];
      this.adm1 = [];

      this.monthlyPlanetBasemaps = [];
      this.quarterlyPlanetBasemaps = [];

      this.bindListeners({
        setAnalysisType: _AnalysisActions.analysisActions.setAnalysisType,
        toggleDrawToolbar: _AnalysisActions.analysisActions.toggleDrawToolbar,
        toggleCustomize: _AnalysisActions.analysisActions.toggleCustomize,
        toggleCountryCustomize: _AnalysisActions.analysisActions.toggleCountryCustomize,
        toggleImageryOptions: _AnalysisActions.analysisActions.toggleImageryOptions,
        analyzeCustomArea: _AnalysisActions.analysisActions.analyzeCustomArea,
        setCustomAreaName: _AnalysisActions.analysisActions.setCustomAreaName,
        toggleAnalysisToolsVisibility: _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility,
        toggleAnalysisToolsExpanded: _AnalysisActions.analysisActions.toggleAnalysisToolsExpanded,
        toggleSubscribeToolsExpanded: _AnalysisActions.analysisActions.toggleSubscribeToolsExpanded,
        toggleImageryToolsExpanded: _AnalysisActions.analysisActions.toggleImageryToolsExpanded,
        toggleBasemapToolsExpanded: _AnalysisActions.analysisActions.toggleBasemapToolsExpanded,
        toggleEsriSearchVisibility: _AnalysisActions.analysisActions.toggleEsriSearchVisibility,
        toggleTimelineVisibility: _AnalysisActions.analysisActions.toggleTimelineVisibility,
        toggleAnalysisSource: _AnalysisActions.analysisActions.toggleAnalysisSource,
        initAreas: _AnalysisActions.analysisActions.initAreas,
        saveMonthlyPlanetBasemaps: _AnalysisActions.analysisActions.saveMonthlyPlanetBasemaps,
        saveQuarterlyPlanetBasemaps: _AnalysisActions.analysisActions.saveQuarterlyPlanetBasemaps
      });
    }

    _createClass(AnalysisStore, [{
      key: 'analyzeCustomArea',
      value: function analyzeCustomArea(feature) {
        this.activeCustomArea = feature;
      }
    }, {
      key: 'setCustomAreaName',
      value: function setCustomAreaName(newName) {
        this.customAreaName = newName;
      }
    }, {
      key: 'setAnalysisType',
      value: function setAnalysisType(tabId) {
        this.activeTab = tabId;
      }
    }, {
      key: 'toggleAnalysisSource',
      value: function toggleAnalysisSource() {
        this.analysisSourceGFW = !this.analysisSourceGFW;
      }
    }, {
      key: 'toggleDrawToolbar',
      value: function toggleDrawToolbar(status) {
        this.toolbarActive = status;
      }
    }, {
      key: 'toggleCustomize',
      value: function toggleCustomize() {
        this.customizeOpen = !this.customizeOpen;
      }
    }, {
      key: 'toggleCountryCustomize',
      value: function toggleCountryCustomize() {
        this.customizeCountryOpen = !this.customizeCountryOpen;
      }
    }, {
      key: 'toggleImageryOptions',
      value: function toggleImageryOptions() {
        this.imageryOpen = !this.imageryOpen;
      }
    }, {
      key: 'toggleAnalysisToolsVisibility',
      value: function toggleAnalysisToolsVisibility() {
        this.analysisToolsVisible = !this.analysisToolsVisible;
      }
    }, {
      key: 'toggleAnalysisToolsExpanded',
      value: function toggleAnalysisToolsExpanded() {
        this.analysisToolsExpanded = !this.analysisToolsExpanded;
        if (this.analysisToolsExpanded === true) {
          this.subscribeToolsExpanded = false;
          this.imageryToolsExpanded = false;
          this.basemapToolsExpanded = false;
        }
      }
    }, {
      key: 'toggleSubscribeToolsExpanded',
      value: function toggleSubscribeToolsExpanded() {
        this.subscribeToolsExpanded = !this.subscribeToolsExpanded;
        if (this.subscribeToolsExpanded === true) {
          this.analysisToolsExpanded = false;
          this.imageryToolsExpanded = false;
          this.basemapToolsExpanded = false;
        }
      }
    }, {
      key: 'toggleImageryToolsExpanded',
      value: function toggleImageryToolsExpanded() {
        this.imageryToolsExpanded = !this.imageryToolsExpanded;
        if (this.imageryToolsExpanded === true) {
          this.analysisToolsExpanded = false;
          this.subscribeToolsExpanded = false;
          this.basemapToolsExpanded = false;
        }
      }
    }, {
      key: 'toggleBasemapToolsExpanded',
      value: function toggleBasemapToolsExpanded() {
        this.basemapToolsExpanded = !this.basemapToolsExpanded;
        if (this.basemapToolsExpanded === true) {
          this.analysisToolsExpanded = false;
          this.imageryToolsExpanded = false;
          this.subscribeToolsExpanded = false;
        }
      }
    }, {
      key: 'toggleEsriSearchVisibility',
      value: function toggleEsriSearchVisibility() {
        this.esriSearchVisible = !this.esriSearchVisible;
      }
    }, {
      key: 'toggleTimelineVisibility',
      value: function toggleTimelineVisibility() {
        this.timelineVisible = !this.timelineVisible;
      }
    }, {
      key: 'initAreas',
      value: function initAreas(areas) {
        this.islands = areas.islands;
        this.provinces = areas.provinces;
        this.countries = areas.countries;
        this.adm1 = areas.adm1;
      }
    }, {
      key: 'savePlanetBasemaps',
      value: function savePlanetBasemaps(basemaps) {
        this.planetBasemaps = basemaps;
      }
    }, {
      key: 'saveMonthlyPlanetBasemaps',
      value: function saveMonthlyPlanetBasemaps(basemaps) {
        this.monthlyPlanetBasemaps = basemaps;
      }
    }, {
      key: 'saveQuarterlyPlanetBasemaps',
      value: function saveQuarterlyPlanetBasemaps(basemaps) {
        this.quarterlyPlanetBasemaps = basemaps;
      }
    }]);

    return AnalysisStore;
  }();

  var analysisStore = exports.analysisStore = _alt2.default.createStore(AnalysisStore, 'AnalysisStore');
});