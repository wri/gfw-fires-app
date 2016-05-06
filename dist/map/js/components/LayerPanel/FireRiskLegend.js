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

  var FireRiskLegend = function (_React$Component) {
    _inherits(FireRiskLegend, _React$Component);

    function FireRiskLegend(props) {
      _classCallCheck(this, FireRiskLegend);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FireRiskLegend).call(this, props));

      //- Set legend Info to an empty array until data is returned
      _this.state = {
        legendInfos: []
      };
      return _this;
    }

    _createClass(FireRiskLegend, [{
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
          { className: 'fire-risk-legend' },
          _react2.default.createElement(
            'div',
            { id: 'fireRiskLegendDataColors' },
            _react2.default.createElement(
              'div',
              { id: 'fireRiskLegendDataColorsBottom' },
              _react2.default.createElement('div', { id: 'fireRiskLegendNoData' }),
              _react2.default.createElement(
                'div',
                { id: 'fireRiskLegend' },
                _react2.default.createElement(
                  'div',
                  { className: 'fireRiskLegendRow' },
                  _react2.default.createElement(
                    'span',
                    { className: 'fireRiskLegendData fireRiskLegendDataHighest' },
                    'Very High Risk'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'fireRiskLegendRow' },
                  _react2.default.createElement(
                    'span',
                    { className: 'fireRiskLegendData fireRiskLegendDataHigh' },
                    'High Risk'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'fireRiskLegendRow' },
                  _react2.default.createElement(
                    'span',
                    { className: 'fireRiskLegendData fireRiskLegendDataMedium' },
                    'Moderate Risk'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'fireRiskLegendRow' },
                  _react2.default.createElement(
                    'span',
                    { className: 'fireRiskLegendData fireRiskLegendDataLow' },
                    'Low Risk'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'fireRiskLegendRow' },
                  _react2.default.createElement(
                    'span',
                    { className: 'fireRiskLegendData fireRiskLegendDataLowest' },
                    'Very Low Risk'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'fireRiskLegendRow' },
                  _react2.default.createElement(
                    'span',
                    { className: 'fireRiskLegendData' },
                    'No Data'
                  )
                )
              )
            )
          )
        );
      }
    }]);

    return FireRiskLegend;
  }(_react2.default.Component);

  exports.default = FireRiskLegend;


  FireRiskLegend.propTypes = {
    url: _react2.default.PropTypes.string.isRequired,
    layerIds: _react2.default.PropTypes.array.isRequired
  };
});