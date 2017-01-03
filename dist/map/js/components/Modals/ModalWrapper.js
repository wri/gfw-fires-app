define(['exports', 'actions/ModalActions', 'stores/ModalStore', 'react-dom', 'react'], function (exports, _ModalActions, _ModalStore, _reactDom, _react) {
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

  var ModalWrapper = function (_Component) {
    _inherits(ModalWrapper, _Component);

    function ModalWrapper(props) {
      _classCallCheck(this, ModalWrapper);

      var _this = _possibleConstructorReturn(this, (ModalWrapper.__proto__ || Object.getPrototypeOf(ModalWrapper)).call(this, props));

      _this.close = function () {
        _ModalActions.modalActions.hideModal(_reactDom2.default.findDOMNode(_this).parentElement);
      };

      _this.sendDownloadAnalytics = function (evt) {
        _this.sendAnalytics('map', 'download', 'The user is downloading data via a layer info panel.');
      };

      _ModalStore.modalStore.listen(_this.storeUpdated.bind(_this));
      var defaultState = _ModalStore.modalStore.getState();
      _this.state = {
        layerInfo: defaultState.modalLayerInfo
      };
      return _this;
    }

    _createClass(ModalWrapper, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        var currentState = _ModalStore.modalStore.getState();
        this.setState({ layerInfo: currentState.modalLayerInfo });
      }
    }, {
      key: 'sendAnalytics',
      value: function sendAnalytics(eventType, action, label) {
        //todo: why is this request getting sent so many times?
        ga('A.send', 'event', eventType, action, label);
        ga('B.send', 'event', eventType, action, label);
        ga('C.send', 'event', eventType, action, label);
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'modal-container' },
          _react2.default.createElement('div', { className: 'modal-background', onClick: this.close }),
          _react2.default.createElement(
            'div',
            { className: 'modal-window ' + (app.mobile() === true ? 'narrow' : '') },
            _react2.default.createElement('div', { title: 'close', className: 'modal-close close-icon pointer', onClick: this.close }),
            _react2.default.createElement(
              'div',
              { className: 'modal-wrapper custom-scroll ' + (this.props.children && this.props.children[0] || !this.props.downloadData ? '' : 'has-footer') },
              this.props.children,
              this.props.children && this.props.children[0] || !this.props.downloadData ? null : _react2.default.createElement(
                'div',
                { className: 'modal-footer' },
                _react2.default.createElement(
                  'div',
                  { className: 'm-btncontainer is-center' },
                  _react2.default.createElement(
                    'a',
                    { href: this.props.downloadData, onClick: this.sendDownloadAnalytics, target: '_blank', className: 'btn green uppercase download-mobile-link' },
                    'Learn more or download data'
                  )
                )
              )
            )
          )
        );
      }
    }]);

    return ModalWrapper;
  }(_react.Component);

  exports.default = ModalWrapper;
});