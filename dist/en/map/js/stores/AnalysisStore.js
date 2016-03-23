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
      this.analysisToolsExpanded = true;
      this.imageryToolsExpanded = false;
      this.basemapToolsExpanded = false;
      this.subscribeToolsExpanded = false;
      this.timelineVisible = false;
      this.areaIslandsActive = true;
      this.islands = [];
      this.provinces = [];

      this.bindListeners({
        clearCustomArea: _AnalysisActions.analysisActions.clearCustomArea,
        setAnalysisType: _AnalysisActions.analysisActions.setAnalysisType,
        toggleDrawToolbar: _AnalysisActions.analysisActions.toggleDrawToolbar,
        toggleCustomize: _AnalysisActions.analysisActions.toggleCustomize,
        analyzeCustomArea: _AnalysisActions.analysisActions.analyzeCustomArea,
        setCustomAreaName: _AnalysisActions.analysisActions.setCustomAreaName,
        clearActiveWatershed: _AnalysisActions.analysisActions.clearActiveWatershed,
        toggleAnalysisToolsVisibility: _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility,
        toggleAnalysisToolsExpanded: _AnalysisActions.analysisActions.toggleAnalysisToolsExpanded,
        toggleSubscribeToolsExpanded: _AnalysisActions.analysisActions.toggleSubscribeToolsExpanded,
        toggleImageryToolsExpanded: _AnalysisActions.analysisActions.toggleImageryToolsExpanded,
        toggleBasemapToolsExpanded: _AnalysisActions.analysisActions.toggleBasemapToolsExpanded,
        toggleEsriSearchVisibility: _AnalysisActions.analysisActions.toggleEsriSearchVisibility,
        toggleTimelineVisibility: _AnalysisActions.analysisActions.toggleTimelineVisibility,
        initAreas: _AnalysisActions.analysisActions.initAreas,
        toggleAreaIslandsActive: _AnalysisActions.analysisActions.toggleAreaIslandsActive
      });
    }

    _createClass(AnalysisStore, [{
      key: 'clearActiveWatershed',
      value: function clearActiveWatershed() {
        this.toolbarActive = false;
        this.activeWatershed = null;
      }
    }, {
      key: 'clearCustomArea',
      value: function clearCustomArea() {
        this.toolbarActive = false;
        this.activeCustomArea = null;
      }
    }, {
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
      key: 'toggleAnalysisToolsVisibility',
      value: function toggleAnalysisToolsVisibility() {
        this.analysisToolsVisible = !this.analysisToolsVisible;
      }
    }, {
      key: 'toggleAnalysisToolsExpanded',
      value: function toggleAnalysisToolsExpanded() {
        this.analysisToolsExpanded = !this.analysisToolsExpanded;
      }
    }, {
      key: 'toggleSubscribeToolsExpanded',
      value: function toggleSubscribeToolsExpanded() {
        this.subscribeToolsExpanded = !this.subscribeToolsExpanded;
      }
    }, {
      key: 'toggleImageryToolsExpanded',
      value: function toggleImageryToolsExpanded() {
        this.imageryToolsExpanded = !this.imageryToolsExpanded;
      }
    }, {
      key: 'toggleBasemapToolsExpanded',
      value: function toggleBasemapToolsExpanded() {
        this.basemapToolsExpanded = !this.basemapToolsExpanded;
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
      }
    }, {
      key: 'toggleAreaIslandsActive',
      value: function toggleAreaIslandsActive() {
        this.areaIslandsActive = !this.areaIslandsActive;
      }
    }]);

    return AnalysisStore;
  }();

  var analysisStore = exports.analysisStore = _alt2.default.createStore(AnalysisStore, 'AnalysisStore');
});