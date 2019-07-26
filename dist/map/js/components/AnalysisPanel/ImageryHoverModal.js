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

  var ImageryHoverModal = function (_Component) {
    _inherits(ImageryHoverModal, _Component);

    function ImageryHoverModal() {
      _classCallCheck(this, ImageryHoverModal);

      return _possibleConstructorReturn(this, (ImageryHoverModal.__proto__ || Object.getPrototypeOf(ImageryHoverModal)).apply(this, arguments));
    }

    _createClass(ImageryHoverModal, [{
      key: 'render',
      value: function render() {
        var _props = this.props,
            top = _props.top,
            left = _props.left,
            selectedImagery = _props.selectedImagery;


        return _react2.default.createElement(
          'div',
          { className: 'imagery-hover-modal', style: { top: top + 'px', left: left + 'px' } },
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'h4',
              null,
              'Instrument:'
            ),
            selectedImagery.attributes.instrument
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'h4',
              null,
              'Date:'
            ),
            window.Kalendae.moment(selectedImagery.attributes.date_time).format('DD-MM-YYYY, h:mm a')
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'h4',
              null,
              'Cloud Coverage:'
            ),
            selectedImagery.attributes.cloud_score.toFixed(0),
            '%'
          )
        );
      }
    }]);

    return ImageryHoverModal;
  }(_react.Component);

  exports.default = ImageryHoverModal;
});