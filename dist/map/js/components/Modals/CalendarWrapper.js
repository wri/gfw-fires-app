define(['exports', 'actions/ModalActions', 'actions/MapActions', 'react-dom', 'react'], function (exports, _ModalActions, _MapActions, _reactDom, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _reactDom2 = _interopRequireDefault(_reactDom);

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

  var closeSvg = '<use xlink:href="#shape-close" />';

  var CalendarWrapper = function (_Component) {
    _inherits(CalendarWrapper, _Component);

    function CalendarWrapper() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, CalendarWrapper);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CalendarWrapper.__proto__ || Object.getPrototypeOf(CalendarWrapper)).call.apply(_ref, [this].concat(args))), _this), _this.close = function () {
        _ModalActions.modalActions.hideModal(_reactDom2.default.findDOMNode(_this).parentElement);
        _MapActions.mapActions.setCalendar('');
      }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(CalendarWrapper, [{
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'modal-container' },
          _react2.default.createElement('div', { className: 'calendar-background', onClick: this.close }),
          _react2.default.createElement(
            'div',
            { className: 'calendar-window ' + (app.mobile() === true ? 'narrow' : '') },
            _react2.default.createElement(
              'div',
              { title: 'close', className: 'modal-close close-icon pointer', onClick: this.close },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: closeSvg } })
            ),
            _react2.default.createElement(
              'div',
              { className: 'calendar-wrapper custom-scroll' },
              this.props.children
            )
          )
        );
      }
    }]);

    return CalendarWrapper;
  }(_react.Component);

  exports.default = CalendarWrapper;
});