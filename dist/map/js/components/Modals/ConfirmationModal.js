define(['exports', 'components/Modals/ModalWrapper', 'stores/ModalStore', 'js/config', 'react'], function (exports, _ModalWrapper, _ModalStore, _config, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ModalWrapper2 = _interopRequireDefault(_ModalWrapper);

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

  var ConfirmationModal = function (_Component) {
    _inherits(ConfirmationModal, _Component);

    function ConfirmationModal(props) {
      _classCallCheck(this, ConfirmationModal);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ConfirmationModal).call(this, props));

      _ModalStore.modalStore.listen(_this.storeUpdated.bind(_this));
      var defaultState = _ModalStore.modalStore.getState();
      _this.state = {
        confirmationInfo: defaultState.confirmationInfo
      };
      return _this;
    }

    _createClass(ConfirmationModal, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        var currentState = _ModalStore.modalStore.getState();
        this.setState({ confirmationInfo: currentState.confirmationInfo });
      }
    }, {
      key: 'render',
      value: function render() {

        return _react2.default.createElement(
          _ModalWrapper2.default,
          null,
          _react2.default.createElement(
            'div',
            null,
            this.state.confirmationInfo === 'error' ? _react2.default.createElement(
              'div',
              { className: 'canopy-modal-title' },
              _config.modalText.subscription.subscribeFailTitle
            ) : _react2.default.createElement(
              'div',
              { className: 'canopy-modal-title' },
              _config.modalText.subscription.subscribeTitle
            ),
            this.state.confirmationInfo.email ? _react2.default.createElement(
              'div',
              { className: 'longer' },
              _config.modalText.subscription.emailConfirmation
            ) : null,
            this.state.confirmationInfo.phoneNumber ? _react2.default.createElement(
              'div',
              { className: 'longer' },
              _config.modalText.subscription.phoneConfirmation
            ) : null,
            this.state.confirmationInfo === 'error' ? _react2.default.createElement(
              'div',
              { className: 'longer' },
              _config.modalText.subscription.error
            ) : null
          )
        );
      }
    }, {
      key: 'tableMap',
      value: function tableMap(item, label) {
        return _react2.default.createElement(
          'dl',
          { className: 'source-row' },
          _react2.default.createElement(
            'dt',
            null,
            label
          ),
          _react2.default.createElement('dd', { dangerouslySetInnerHTML: { __html: item } })
        );
      }
    }, {
      key: 'summaryMap',
      value: function summaryMap(item) {
        if (typeof item === 'string') {
          return _react2.default.createElement('p', { dangerouslySetInnerHTML: { __html: item } });
        } else {
          return _react2.default.createElement(
            'ul',
            null,
            item.map(function (listItem) {
              return _react2.default.createElement('li', { dangerouslySetInnerHTML: { __html: listItem } });
            })
          );
        }
      }
    }, {
      key: 'paragraphMap',
      value: function paragraphMap(item) {
        return _react2.default.createElement('p', { dangerouslySetInnerHTML: { __html: item } });
      }
    }, {
      key: 'htmlContentMap',
      value: function htmlContentMap(item) {
        return _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: item } });
      }
    }]);

    return ConfirmationModal;
  }(_react.Component);

  exports.default = ConfirmationModal;
});