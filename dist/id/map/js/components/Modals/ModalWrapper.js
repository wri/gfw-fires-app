define(['exports', 'actions/ModalActions', 'stores/ModalStore', 'react'], function (exports, _ModalActions, _ModalStore, _react) {
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

  var ModalWrapper = function (_React$Component) {
    _inherits(ModalWrapper, _React$Component);

    function ModalWrapper(props) {
      _classCallCheck(this, ModalWrapper);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ModalWrapper).call(this, props));

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
      key: 'close',
      value: function close() {
        _ModalActions.modalActions.hideModal(_react2.default.findDOMNode(this).parentElement);
      }
    }, {
      key: 'render',
      value: function render() {
        //todo: hide footer with proper child
        //<a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank" className="btn green uppercase download-mobile-link">Learn more or download data</a>
        //  if (this.props.downloadData) {
        //    debugger
        //  }

        return _react2.default.createElement(
          'div',
          { className: 'modal-container' },
          _react2.default.createElement('div', { className: 'modal-background', onClick: this.close.bind(this) }),
          _react2.default.createElement(
            'div',
            { className: 'modal-window' },
            _react2.default.createElement(
              'div',
              { title: 'close', className: 'modal-close close-icon pointer', onClick: this.close.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: closeSvg } })
            ),
            _react2.default.createElement(
              'div',
              { className: 'modal-wrapper custom-scroll ' + (this.props.children && this.props.children[0] && !this.props.downloadData ? '' : 'has-footer') },
              this.props.children,
              this.props.children && this.props.children[0] ? null : _react2.default.createElement(
                'div',
                { className: 'modal-footer' },
                _react2.default.createElement(
                  'div',
                  { className: 'm-btncontainer is-center' },
                  _react2.default.createElement(
                    'a',
                    { href: this.props.downloadData, target: '_blank', className: 'btn green uppercase download-mobile-link' },
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
  }(_react2.default.Component);

  exports.default = ModalWrapper;
});