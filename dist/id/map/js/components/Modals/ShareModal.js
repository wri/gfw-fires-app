define(['exports', 'components/Modals/ModalWrapper', 'stores/ModalStore', 'js/config', 'utils/AppUtils', 'react'], function (exports, _ModalWrapper, _ModalStore, _config, _AppUtils, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ModalWrapper2 = _interopRequireDefault(_ModalWrapper);

  var _AppUtils2 = _interopRequireDefault(_AppUtils);

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

  var facebookSvg = '<use xlink:href="#icon-facebook" />';
  var twitterSvg = '<use xlink:href="#icon-twitter" />';
  var googleSvg = '<use xlink:href="#icon-googleplus" />';

  var windowOptions = 'toolbar=0,status=0,height=650,width=450';

  var ShareModal = function (_React$Component) {
    _inherits(ShareModal, _React$Component);

    function ShareModal(props) {
      _classCallCheck(this, ShareModal);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ShareModal).call(this, props));

      _ModalStore.modalStore.listen(_this.storeUpdated.bind(_this));
      var defaultState = _ModalStore.modalStore.getState();
      _this.state = {
        bitlyUrl: defaultState.bitlyUrl,
        copyText: _config.modalText.share.copyButton
      };
      return _this;
    }

    _createClass(ShareModal, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        var newState = _ModalStore.modalStore.getState();
        this.setState({
          bitlyUrl: newState.bitlyUrl,
          copyText: _config.modalText.share.copyButton
        });
      }
    }, {
      key: 'copyShare',
      value: function copyShare() {
        var element = this.refs.shareInput;
        if (_AppUtils2.default.copySelectionFrom(element)) {
          this.setState({ copyText: _config.modalText.share.copiedButton });
        } else {
          alert(_config.modalText.share.copyFailure);
        }
      }
    }, {
      key: 'shareGoogle',
      value: function shareGoogle() {
        var url = _config.modalText.share.googleUrl(this.state.bitlyUrl);
        window.open(url, 'Google Plus', windowOptions);
      }
    }, {
      key: 'shareFacebook',
      value: function shareFacebook() {
        var url = _config.modalText.share.facebookUrl(this.state.bitlyUrl);
        window.open(url, 'Facebook', windowOptions);
      }
    }, {
      key: 'shareTwitter',
      value: function shareTwitter() {
        var url = _config.modalText.share.twitterUrl(this.state.bitlyUrl);
        window.open(url, 'Twitter', windowOptions);
      }
    }, {
      key: 'handleFocus',
      value: function handleFocus(e) {
        setTimeout(function () {
          e.target.select();
        }, 0);
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          _ModalWrapper2.default,
          null,
          _react2.default.createElement(
            'div',
            { className: 'modal-title' },
            _config.modalText.share.title
          ),
          _react2.default.createElement(
            'div',
            { className: 'share-instructions' },
            _config.modalText.share.linkInstructions
          ),
          _react2.default.createElement(
            'div',
            { className: 'share-input' },
            _react2.default.createElement('input', { ref: 'shareInput', type: 'text', readOnly: true, value: this.state.bitlyUrl, onClick: this.handleFocus }),
            _react2.default.createElement(
              'button',
              { className: 'gfw-btn white pointer', onClick: this.copyShare.bind(this) },
              this.state.copyText
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'share-items' },
            _react2.default.createElement(
              'div',
              { title: 'Google Plus', className: 'share-card googleplus-modal pointer', onClick: this.shareGoogle.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: googleSvg } })
            ),
            _react2.default.createElement(
              'div',
              { title: 'Twitter', className: 'share-card twitter-modal pointer', onClick: this.shareTwitter.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: twitterSvg } })
            ),
            _react2.default.createElement(
              'div',
              { title: 'Facebook', className: 'share-card facebook-modal pointer', onClick: this.shareFacebook.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: facebookSvg } })
            )
          )
        );
      }
    }]);

    return ShareModal;
  }(_react2.default.Component);

  exports.default = ShareModal;
});