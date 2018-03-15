define(['exports', 'helpers/LayersHelper', 'react'], function (exports, _LayersHelper, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

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

  var LayerTransparency = function (_React$Component) {
    _inherits(LayerTransparency, _React$Component);

    function LayerTransparency(props) {
      _classCallCheck(this, LayerTransparency);

      var _this = _possibleConstructorReturn(this, (LayerTransparency.__proto__ || Object.getPrototypeOf(LayerTransparency)).call(this, props));

      _this.state = { opacity: props.initalOpacity || 1 };
      return _this;
    }

    _createClass(LayerTransparency, [{
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'layer-transparency' },
          _react2.default.createElement(
            'div',
            null,
            'Transparency'
          ),
          _react2.default.createElement('input', { type: 'range', min: '0', max: '1', step: '0.01',
            value: this.state.opacity,
            onChange: this.changeOpacity.bind(this) })
        );
      }
    }, {
      key: 'changeOpacity',
      value: function changeOpacity(event) {
        event.target.value = +event.target.value;
        this.setState({ opacity: event.target.value });

        this.props.layers.forEach(function (layer) {
          _LayersHelper2.default.changeOpacity({
            layerId: layer.key,
            value: event.target.value
          });
        });
      }
    }]);

    return LayerTransparency;
  }(_react2.default.Component);

  exports.default = LayerTransparency;
});