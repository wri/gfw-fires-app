define(['exports', 'utils/request', 'react'], function (exports, _request, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _request2 = _interopRequireDefault(_request);

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

  var ForestryLegend = function (_React$Component) {
    _inherits(ForestryLegend, _React$Component);

    function ForestryLegend(props) {
      _classCallCheck(this, ForestryLegend);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ForestryLegend).call(this, props));

      _this.state = { legendInfos: [] };
      return _this;
    }

    _createClass(ForestryLegend, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        _request2.default.getLegendInfos(this.props.url, this.props.layerIds).then(function (legendInfos) {
          _this2.setState({ legendInfos: legendInfos });
        });
      }
    }, {
      key: 'itemMapper',
      value: function itemMapper(item, index) {
        return _react2.default.createElement(
          'div',
          { className: 'legend-row', key: index },
          _react2.default.createElement('img', { title: item.label, src: 'data:image/png;base64,' + item.imageData }),
          _react2.default.createElement(
            'div',
            { className: 'legend-label' },
            item.label
          )
        );
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'legend-container' },
          this.state.legendInfos.length === 0 ? _react2.default.createElement(
            'div',
            { className: 'legend-unavailable' },
            'No Legend'
          ) : _react2.default.createElement(
            'div',
            { className: 'forestry-legend' },
            this.state.legendInfos.map(this.itemMapper, this)
          )
        );
      }
    }]);

    return ForestryLegend;
  }(_react2.default.Component);

  exports.default = ForestryLegend;
});