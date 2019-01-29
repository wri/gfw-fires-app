define(['exports', 'js/config', 'stores/MapStore', 'react', 'chosen', 'components/AnalysisPanel/GlobalCountryReport'], function (exports, _config, _MapStore, _react, _chosen, _GlobalCountryReport) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _react2 = _interopRequireDefault(_react);

  var _chosen2 = _interopRequireDefault(_chosen);

  var _GlobalCountryReport2 = _interopRequireDefault(_GlobalCountryReport);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

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

  var AnalysisTab = function (_React$Component) {
    _inherits(AnalysisTab, _React$Component);

    function AnalysisTab(props) {
      _classCallCheck(this, AnalysisTab);

      var _this = _possibleConstructorReturn(this, (AnalysisTab.__proto__ || Object.getPrototypeOf(AnalysisTab)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _extends({ localErrors: false }, _MapStore.mapStore.getState());
      return _this;
    }

    _createClass(AnalysisTab, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'sendAnalytics',
      value: function sendAnalytics(eventType, action, label) {
        //todo: why is this request getting sent so many times?
        ga('A.send', 'event', eventType, action, label);
        ga('B.send', 'event', eventType, action, label);
        ga('C.send', 'event', eventType, action, label);
      }
    }, {
      key: 'render',
      value: function render() {
        var className = 'text-center';
        if (this.props.activeTab !== _config.analysisPanelText.analysisTabId) {
          className += ' hidden';
        }
        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            'h4',
            { className: 'analysis__title' },
            _config.analysisPanelText.analysisAreaTitle
          ),
          _react2.default.createElement(
            'div',
            null,
            _config.analysisPanelText.analysisAreaHeader
          ),
          _react2.default.createElement(
            'div',
            { className: 'reports-container' },
            _react2.default.createElement(_GlobalCountryReport2.default, this.props)
          )
        );
      }
    }]);

    return AnalysisTab;
  }(_react2.default.Component);

  exports.default = AnalysisTab;
});