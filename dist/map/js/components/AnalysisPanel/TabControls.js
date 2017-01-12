define(['exports', 'actions/AnalysisActions', 'js/config', 'utils/svgs', 'react'], function (exports, _AnalysisActions, _config, _svgs, _react) {
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

  var TabControls = function (_React$Component) {
    _inherits(TabControls, _React$Component);

    function TabControls() {
      _classCallCheck(this, TabControls);

      return _possibleConstructorReturn(this, (TabControls.__proto__ || Object.getPrototypeOf(TabControls)).apply(this, arguments));
    }

    _createClass(TabControls, [{
      key: 'click',
      value: function click(tabId) {
        switch (tabId) {
          case _config.analysisPanelText.analysisTabId:
            _AnalysisActions.analysisActions.toggleAnalysisToolsExpanded();
            break;
          case _config.analysisPanelText.subscriptionTabId:
            _AnalysisActions.analysisActions.toggleSubscribeToolsExpanded();
            break;
          case _config.analysisPanelText.imageryTabId:
            _AnalysisActions.analysisActions.toggleImageryToolsExpanded();
            break;
          case _config.analysisPanelText.basemapTabId:
            _AnalysisActions.analysisActions.toggleBasemapToolsExpanded();
        }

        _AnalysisActions.analysisActions.setAnalysisType(tabId);
      }
    }, {
      key: 'render',
      value: function render() {
        var left = 0;
        if (this.props.activeTab === _config.analysisPanelText.subscriptionTabId) {
          left = '25%';
        } else if (this.props.activeTab === _config.analysisPanelText.imageryTabId) {
          left = '50%';
        } else if (this.props.activeTab === _config.analysisPanelText.basemapTabId) {
          left = '75%';
        }
        var styles = {
          left: left,
          opacity: this.props.analysisToolsExpanded === false ? 0 : 1
        };

        return _react2.default.createElement(
          'div',
          { className: 'no-shrink tabs' },
          _react2.default.createElement(
            'div',
            { className: 'gfw-btn pointer inline-block ' + (this.props.analysisToolsExpanded !== false && this.props.activeTab === _config.analysisPanelText.analysisTabId ? 'active' : ''),
              onClick: this.click.bind(this, _config.analysisPanelText.analysisTabId) },
            _react2.default.createElement(
              'span',
              { className: 'tooltipmap' },
              _config.analysisPanelText.analysisTabLabel
            ),
            _react2.default.createElement(_svgs.AnalysisSvg, null)
          ),
          _react2.default.createElement(
            'div',
            { className: 'gfw-btn pointer inline-block ' + (this.props.subscribeToolsExpanded !== false && this.props.activeTab === _config.analysisPanelText.subscriptionTabId ? 'active' : ''),
              onClick: this.click.bind(this, _config.analysisPanelText.subscriptionTabId) },
            _react2.default.createElement(
              'span',
              { className: 'tooltipmap' },
              _config.analysisPanelText.subscriptionTabLabel
            ),
            _react2.default.createElement(_svgs.AlertsSvg, null)
          ),
          _react2.default.createElement(
            'div',
            { className: 'gfw-btn pointer inline-block ' + (this.props.imageryToolsExpanded !== false && this.props.activeTab === _config.analysisPanelText.imageryTabId ? 'active' : ''),
              onClick: this.click.bind(this, _config.analysisPanelText.imageryTabId) },
            _react2.default.createElement(
              'span',
              { className: 'tooltipmap' },
              _config.analysisPanelText.imageryTabLabel
            ),
            _react2.default.createElement(_svgs.ImagerySvg, null)
          ),
          _react2.default.createElement(
            'div',
            { className: 'gfw-btn pointer inline-block ' + (this.props.basemapToolsExpanded !== false && this.props.activeTab === _config.analysisPanelText.basemapTabId ? 'active' : ''),
              onClick: this.click.bind(this, _config.analysisPanelText.basemapTabId) },
            _react2.default.createElement(
              'span',
              { className: 'tooltipmap' },
              _config.analysisPanelText.basemapTabLabel
            ),
            _react2.default.createElement(_svgs.BasemapSvg, null)
          ),
          _react2.default.createElement('div', { className: 'tab-indicator relative', style: styles })
        );
      }
    }]);

    return TabControls;
  }(_react2.default.Component);

  exports.default = TabControls;
});