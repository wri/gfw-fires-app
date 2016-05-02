define(['exports', 'react'], function (exports, _react) {
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

  var LastRainLegend = function (_React$Component) {
    _inherits(LastRainLegend, _React$Component);

    function LastRainLegend(props) {
      _classCallCheck(this, LastRainLegend);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LastRainLegend).call(this, props));

      //- Set legend Info to an empty array until data is returned
      _this.state = {
        legendInfos: []
      };
      return _this;
    }

    _createClass(LastRainLegend, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        // Request.getLegendInfos(this.props.url, this.props.layerIds).then(legendInfos => {
        //   this.setState({ legendInfos: legendInfos });
        // });
      }
    }, {
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps, nextState) {
        return nextState.legendInfos.length !== this.state.legendInfos.length;
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'last-rain-legend' },
          _react2.default.createElement(
            'div',
            { id: 'lastRainLegendDataColors' },
            _react2.default.createElement(
              'div',
              { id: 'lastRainLegendDataColorsBottom' },
              _react2.default.createElement(
                'div',
                { id: 'lastRainLegend' },
                _react2.default.createElement(
                  'div',
                  { className: 'lastRainLegendRow' },
                  _react2.default.createElement(
                    'span',
                    { className: 'lastRainLegendData lastRainLegendDataHighest' },
                    '40 or more days'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'lastRainLegendRow' },
                  _react2.default.createElement(
                    'span',
                    { className: 'lastRainLegendData lastRainLegendDataMedium' },
                    '20 days'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'lastRainLegendRow' },
                  _react2.default.createElement(
                    'span',
                    { className: 'lastRainLegendData lastRainLegendDataLow' },
                    '0 days'
                  )
                )
              )
            )
          )
        );
      }
    }]);

    return LastRainLegend;
  }(_react2.default.Component);

  exports.default = LastRainLegend;


  LastRainLegend.propTypes = {
    url: _react2.default.PropTypes.string.isRequired,
    layerIds: _react2.default.PropTypes.array.isRequired
  };
});