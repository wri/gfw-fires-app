define(['exports', 'js/config', 'utils/request', 'react'], function (exports, _config, _request, _react) {
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

  var WaterStressLegend = function (_React$Component) {
    _inherits(WaterStressLegend, _React$Component);

    function WaterStressLegend(props) {
      _classCallCheck(this, WaterStressLegend);

      var _this = _possibleConstructorReturn(this, (WaterStressLegend.__proto__ || Object.getPrototypeOf(WaterStressLegend)).call(this, props));

      //- Set legend Info to an empty array until data is returned
      _this.state = {
        legendInfoLevels: [],
        legendInfoNoData: []
      };
      return _this;
    }

    _createClass(WaterStressLegend, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        _request2.default.getLegendInfos(this.props.url, this.props.layerIds).then(function (legendInfos) {
          _this2.setState({
            legendInfoLevels: legendInfos.slice(0, legendInfos.length - 2),
            legendInfoNoData: legendInfos.slice(legendInfos.length - 2)
          });
        });
      }
    }, {
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps, nextState) {
        return nextState.legendInfoLevels.length !== this.state.legendInfoLevels.length;
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'legend-container' },
          this.state.legendInfoLevels.length === 0 ? _react2.default.createElement(
            'div',
            { className: 'legend-unavailable' },
            'No Legend'
          ) : _react2.default.createElement(
            'div',
            { className: 'water-stress-legend' },
            _react2.default.createElement(
              'div',
              { className: 'legend-row' },
              _react2.default.createElement(
                'div',
                { className: 'legend-label' },
                _config.layerPanelText.waterStressLegend.min
              ),
              this.state.legendInfoLevels.map(this.imgMapper, this),
              _react2.default.createElement(
                'div',
                { className: 'legend-label' },
                _config.layerPanelText.waterStressLegend.max
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'legend-row no-data-labels' },
              _react2.default.createElement(
                'div',
                { className: 'legend-label' },
                _config.layerPanelText.waterStressLegend.arid
              ),
              _react2.default.createElement(
                'div',
                { className: 'legend-label' },
                _config.layerPanelText.waterStressLegend.nodata
              ),
              this.state.legendInfoNoData.map(this.imgMapper, this)
            )
          )
        );
      }
    }, {
      key: 'imgMapper',
      value: function imgMapper(legendInfo, index) {
        return _react2.default.createElement('img', { key: index, title: legendInfo.label, src: 'data:image/png;base64,' + legendInfo.imageData });
      }
    }]);

    return WaterStressLegend;
  }(_react2.default.Component);

  exports.default = WaterStressLegend;
});