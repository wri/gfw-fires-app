define(['exports', 'actions/LayerActions', 'actions/AnalysisActions', 'stores/MapStore', 'stores/AnalysisStore', 'js/config', 'utils/svgs', 'react'], function (exports, _LayerActions, _AnalysisActions, _MapStore, _AnalysisStore, _config, _svgs, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _react2 = _interopRequireDefault(_react);

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

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var Map = function (_React$Component) {
    _inherits(Map, _React$Component);

    function Map(props) {
      _classCallCheck(this, Map);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Map).call(this, props));

      _this.toggleLayers = _this.toggleLayers.bind(_this);
      _this.toggleAnalysis = _this.toggleAnalysis.bind(_this);
      _this.toggleSubscription = _this.toggleSubscription.bind(_this);
      _this.toggleTimeline = _this.toggleTimeline.bind(_this);
      _this.toggleImagery = _this.toggleImagery.bind(_this);
      _this.toggleBasemaps = _this.toggleBasemaps.bind(_this);
      return _this;
    }

    _createClass(Map, [{
      key: 'hidePanels',
      value: function hidePanels() {
        if (_MapStore.mapStore.getState().layerPanelVisible === true) {
          _LayerActions.layerActions.toggleLayerPanelVisibility();
        }
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true) {
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
        if (_AnalysisStore.analysisStore.getState().timelineVisible === true) {
          _AnalysisActions.analysisActions.toggleTimelineVisibility();
        }
      }
    }, {
      key: 'toggleAnalysis',
      value: function toggleAnalysis() {
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true && _AnalysisStore.analysisStore.getState().activeTab === _config.analysisPanelText.analysisTabId) {
          this.hidePanels();
        } else {
          this.hidePanels();
          _AnalysisActions.analysisActions.setAnalysisType(_config.analysisPanelText.analysisTabId);
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
      }
    }, {
      key: 'toggleSubscription',
      value: function toggleSubscription() {
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true && _AnalysisStore.analysisStore.getState().activeTab === _config.analysisPanelText.subscriptionTabId) {
          this.hidePanels();
        } else {
          this.hidePanels();
          _AnalysisActions.analysisActions.setAnalysisType(_config.analysisPanelText.subscriptionTabId);
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
      }
    }, {
      key: 'toggleLayers',
      value: function toggleLayers() {
        if (_MapStore.mapStore.getState().layerPanelVisible === true) {
          this.hidePanels();
        } else {
          this.hidePanels();
          _LayerActions.layerActions.toggleLayerPanelVisibility();
        }
      }
    }, {
      key: 'toggleTimeline',
      value: function toggleTimeline() {
        if (_AnalysisStore.analysisStore.getState().timelineVisible === true) {
          this.hidePanels();
        } else {
          this.hidePanels();
          _AnalysisActions.analysisActions.toggleTimelineVisibility();
        }
      }
    }, {
      key: 'toggleImagery',
      value: function toggleImagery() {
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true && _AnalysisStore.analysisStore.getState().activeTab === _config.analysisPanelText.imageryTabId) {
          this.hidePanels();
        } else {
          this.hidePanels();
          _AnalysisActions.analysisActions.setAnalysisType(_config.analysisPanelText.imageryTabId);
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
      }
    }, {
      key: 'toggleBasemaps',
      value: function toggleBasemaps() {
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true && _AnalysisStore.analysisStore.getState().activeTab === _config.analysisPanelText.basemapTabId) {
          this.hidePanels();
        } else {
          this.hidePanels();
          _AnalysisActions.analysisActions.setAnalysisType(_config.analysisPanelText.basemapTabId);
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
      }
    }, {
      key: 'render',
      value: function render() {

        // <button onClick={this.toggleTimeline}>
        //   <CalendarSvg/>
        //   Timeline
        // </button>
        // <button onClick={this.toggleBasemaps}>
        //   <BasemapSvg />
        //   BASEMAPS
        // </button>
        return _react2.default.createElement(
          'div',
          { id: 'mobile-controls', className: 'mobile-controls mobile-show' },
          _react2.default.createElement(
            'button',
            { onClick: this.toggleLayers },
            _react2.default.createElement(_svgs.BasemapSvg, null),
            'LAYERS'
          ),
          _react2.default.createElement(
            'button',
            { onClick: this.toggleAnalysis },
            _react2.default.createElement(_svgs.AnalysisSvg, null),
            'ANALYZE'
          ),
          _react2.default.createElement(
            'button',
            { onClick: this.toggleSubscription },
            _react2.default.createElement(_svgs.AlertsSvg, null),
            'ALERTS'
          ),
          _react2.default.createElement(
            'button',
            { onClick: this.toggleImagery },
            _react2.default.createElement(_svgs.ImagerySvg, null),
            'IMAGERY'
          )
        );
      }
    }]);

    return Map;
  }(_react2.default.Component);

  exports.default = Map;
});