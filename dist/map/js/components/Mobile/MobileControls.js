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

  var MobileControls = function (_Component) {
    _inherits(MobileControls, _Component);

    function MobileControls() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, MobileControls);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = MobileControls.__proto__ || Object.getPrototypeOf(MobileControls)).call.apply(_ref, [this].concat(args))), _this), _this.hidePanels = function () {
        if (_MapStore.mapStore.getState().layerPanelVisible === true) {
          _LayerActions.layerActions.toggleLayerPanelVisibility();
        }
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true) {
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
        if (_AnalysisStore.analysisStore.getState().timelineVisible === true) {
          _AnalysisActions.analysisActions.toggleTimelineVisibility();
        }
      }, _this.toggleAnalysis = function () {
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true && _AnalysisStore.analysisStore.getState().activeTab === _config.analysisPanelText.analysisTabId) {
          _this.hidePanels();
        } else {
          _this.hidePanels();
          _AnalysisActions.analysisActions.setAnalysisType(_config.analysisPanelText.analysisTabId);
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
      }, _this.toggleSubscription = function () {
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true && _AnalysisStore.analysisStore.getState().activeTab === _config.analysisPanelText.subscriptionTabId) {
          _this.hidePanels();
        } else {
          _this.hidePanels();
          _AnalysisActions.analysisActions.setAnalysisType(_config.analysisPanelText.subscriptionTabId);
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
      }, _this.toggleLayers = function () {
        if (_MapStore.mapStore.getState().layerPanelVisible === true) {
          _this.hidePanels();
        } else {
          _this.hidePanels();
          _LayerActions.layerActions.toggleLayerPanelVisibility();
        }
      }, _this.toggleTimeline = function () {
        if (_AnalysisStore.analysisStore.getState().timelineVisible === true) {
          _this.hidePanels();
        } else {
          _this.hidePanels();
          _AnalysisActions.analysisActions.toggleTimelineVisibility();
        }
      }, _this.toggleImagery = function () {
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true && _AnalysisStore.analysisStore.getState().activeTab === _config.analysisPanelText.imageryTabId) {
          _this.hidePanels();
        } else {
          _this.hidePanels();
          _AnalysisActions.analysisActions.setAnalysisType(_config.analysisPanelText.imageryTabId);
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
      }, _this.toggleBasemaps = function () {
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true && _AnalysisStore.analysisStore.getState().activeTab === _config.analysisPanelText.basemapTabId) {
          _this.hidePanels();
        } else {
          _this.hidePanels();
          _AnalysisActions.analysisActions.setAnalysisType(_config.analysisPanelText.basemapTabId);
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
      }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(MobileControls, [{
      key: 'render',
      value: function render() {
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
            'FIRE REPORT'
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

    return MobileControls;
  }(_react.Component);

  exports.default = MobileControls;
});