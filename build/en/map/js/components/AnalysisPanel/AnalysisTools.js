define(['exports', 'components/AnalysisPanel/TabControls', 'components/AnalysisPanel/AnalysisTab', 'components/AnalysisPanel/SubscriptionTab', 'components/AnalysisPanel/ImageryTab', 'components/AnalysisPanel/BasemapTab', 'actions/AnalysisActions', 'js/config', 'stores/AnalysisStore', 'react'], function (exports, _TabControls, _AnalysisTab, _SubscriptionTab, _ImageryTab, _BasemapTab, _AnalysisActions, _config, _AnalysisStore, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _TabControls2 = _interopRequireDefault(_TabControls);

  var _AnalysisTab2 = _interopRequireDefault(_AnalysisTab);

  var _SubscriptionTab2 = _interopRequireDefault(_SubscriptionTab);

  var _ImageryTab2 = _interopRequireDefault(_ImageryTab);

  var _BasemapTab2 = _interopRequireDefault(_BasemapTab);

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

  var AnalysisTools = function (_React$Component) {
    _inherits(AnalysisTools, _React$Component);

    function AnalysisTools(props) {
      _classCallCheck(this, AnalysisTools);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AnalysisTools).call(this, props));

      _AnalysisActions.analysisActions.initAreas();
      _AnalysisStore.analysisStore.listen(_this.storeUpdated.bind(_this));
      var defaultState = _AnalysisStore.analysisStore.getState();
      _this.state = defaultState;
      return _this;
    }

    _createClass(AnalysisTools, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        var newState = _AnalysisStore.analysisStore.getState();
        this.setState(newState);
      }
    }, {
      key: 'clearAnalysis',
      value: function clearAnalysis() {
        if (this.state.activeTab === _config.analysisPanelText.subscriptionTabId) {
          _AnalysisActions.analysisActions.clearCustomArea();
        } else {
          _AnalysisActions.analysisActions.clearActiveWatershed();
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var className = 'analysis-tools map-component shadow';
        if (app.mobile() === true && this.state.analysisToolsVisible === false) {
          className += ' hidden';
        }
        if (app.mobile() === true) {
          className += ' isMobileTools';
        }

        return _react2.default.createElement(
          'div',
          { className: className },
          app.mobile() === true ? undefined : _react2.default.createElement(_TabControls2.default, this.state),
          _react2.default.createElement(
            'div',
            { className: 'tab-container custom-scroll ' + (app.mobile() === false && this.state.analysisToolsExpanded === false ? 'hidden' : '') },
            _react2.default.createElement(_AnalysisTab2.default, this.state),
            _react2.default.createElement(_SubscriptionTab2.default, this.state),
            _react2.default.createElement(_ImageryTab2.default, this.state),
            _react2.default.createElement(_BasemapTab2.default, this.state)
          )
        );
      }
    }]);

    return AnalysisTools;
  }(_react2.default.Component);

  exports.default = AnalysisTools;
});