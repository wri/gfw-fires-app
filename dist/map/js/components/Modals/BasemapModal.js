define(['exports', 'components/Modals/ModalWrapper', 'actions/MapActions', 'actions/ModalActions', 'dojo/cookie', 'react-dom', 'react'], function (exports, _ModalWrapper, _MapActions, _ModalActions, _cookie, _reactDom, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ModalWrapper2 = _interopRequireDefault(_ModalWrapper);

  var _cookie2 = _interopRequireDefault(_cookie);

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

  var BasemapModal = function (_Component) {
    _inherits(BasemapModal, _Component);

    function BasemapModal(props) {
      _classCallCheck(this, BasemapModal);

      var _this = _possibleConstructorReturn(this, (BasemapModal.__proto__ || Object.getPrototypeOf(BasemapModal)).call(this, props));

      _this.switchBasemap = function () {
        if (_this.state.cookieChecked !== undefined) {
          _this.createCookie(_this.state.cookieChecked);
        }
        _MapActions.mapActions.setBasemap('dark-gray');
        _this.close();
      };

      _this.keepBasemap = function () {
        if (_this.state.cookieChecked !== undefined) {
          _this.createCookie(_this.state.cookieChecked);
        }
        _this.close();
      };

      _this.setCookie = function (evt) {
        //todo: is this {} in setCookie proper object typing?
        _this.setState({
          cookieChecked: evt.target.checked
        });
      };

      _this.createCookie = function (cookieValue) {
        (0, _cookie2.default)('windBasemapDecision', cookieValue, {
          expires: 7
        });
      };

      _this.close = function () {
        _ModalActions.modalActions.hideModal(_reactDom2.default.findDOMNode(_this).parentElement);
      };

      _this.state = {
        cookieChecked: undefined
      };
      return _this;
    }

    _createClass(BasemapModal, [{
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          _ModalWrapper2.default,
          null,
          _react2.default.createElement(
            'div',
            { className: 'modal-content' },
            _react2.default.createElement(
              'div',
              { className: 'modal-source' },
              _react2.default.createElement(
                'h3',
                { className: 'modal-subtitle' },
                'Would you like to change basemaps?'
              ),
              _react2.default.createElement(
                'div',
                { className: 'modal-overview' },
                _react2.default.createElement(
                  'p',
                  null,
                  'The wind layer is best visualized with the Dark Gray Canvas basemap. Would you like to switch to it now.'
                ),
                _react2.default.createElement(
                  'button',
                  { className: 'gfw-btn white basemap-button pointer', onClick: this.switchBasemap },
                  'Yes'
                ),
                _react2.default.createElement(
                  'button',
                  { className: 'gfw-btn white basemap-button pointer', onClick: this.keepBasemap },
                  'No'
                ),
                _react2.default.createElement(
                  'div',
                  { id: 'basemap-checkbox-container' },
                  _react2.default.createElement(
                    'input',
                    { id: 'basemap-cookie-checkbox', onChange: this.setCookie, type: 'checkbox' },
                    'Remember my decision'
                  )
                )
              )
            )
          )
        );
      }
    }]);

    return BasemapModal;
  }(_react.Component);

  exports.default = BasemapModal;
});