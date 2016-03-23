define(['exports', 'actions/ModalActions', 'actions/MapActions', 'stores/ModalStore', 'react'], function (exports, _ModalActions, _MapActions, _ModalStore, _react) {
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

  var closeSvg = '<use xlink:href="#shape-close" />';

  var CalendarWrapper = function (_React$Component) {
    _inherits(CalendarWrapper, _React$Component);

    function CalendarWrapper() {
      _classCallCheck(this, CalendarWrapper);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(CalendarWrapper).apply(this, arguments));
    }

    _createClass(CalendarWrapper, [{
      key: 'close',
      value: function close() {
        _ModalActions.modalActions.hideModal(_react2.default.findDOMNode(this).parentElement);
        _MapActions.mapActions.setCalendar('');
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'modal-container' },
          _react2.default.createElement('div', { className: 'calendar-background', onClick: this.close.bind(this) }),
          _react2.default.createElement(
            'div',
            { className: 'calendar-window ' + (app.mobile() === true ? 'narrow' : '') },
            _react2.default.createElement(
              'div',
              { title: 'close', className: 'modal-close close-icon pointer', onClick: this.close.bind(this) },
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
  }(_react2.default.Component);

  exports.default = CalendarWrapper;
});