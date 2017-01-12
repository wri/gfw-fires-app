define(['exports', 'stores/AnalysisStore', 'react'], function (exports, _AnalysisStore, _react) {
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

  var Timeline = function (_React$Component) {
    _inherits(Timeline, _React$Component);

    function Timeline(props) {
      _classCallCheck(this, Timeline);

      var _this = _possibleConstructorReturn(this, (Timeline.__proto__ || Object.getPrototypeOf(Timeline)).call(this, props));

      _AnalysisStore.analysisStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _AnalysisStore.analysisStore.getState();
      return _this;
    }

    _createClass(Timeline, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_AnalysisStore.analysisStore.getState());
      }
    }, {
      key: 'render',
      value: function render() {
        var className = 'timeline shadow back-white ' + (this.state.timelineVisible === false ? 'hidden' : '');
        return _react2.default.createElement(
          'div',
          { className: className },
          'TODO: timeline'
        );
      }
    }]);

    return Timeline;
  }(_react2.default.Component);

  exports.default = Timeline;
});