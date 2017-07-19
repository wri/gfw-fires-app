define(['exports', 'components/Modals/ModalWrapper', 'js/config', 'dojo/dom', 'stores/MapStore', 'actions/ModalActions', 'components/Loader', 'esri/geometry/geometryEngine', 'dojo/promise/all', 'react', 'react-dom', 'intlTelInput'], function (exports, _ModalWrapper, _config, _dom, _MapStore, _ModalActions, _Loader, _geometryEngine, _all, _react, _reactDom, _intlTelInput) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ModalWrapper2 = _interopRequireDefault(_ModalWrapper);

  var _dom2 = _interopRequireDefault(_dom);

  var _Loader2 = _interopRequireDefault(_Loader);

  var _geometryEngine2 = _interopRequireDefault(_geometryEngine);

  var _all2 = _interopRequireDefault(_all);

  var _react2 = _interopRequireDefault(_react);

  var _reactDom2 = _interopRequireDefault(_reactDom);

  var _intlTelInput2 = _interopRequireDefault(_intlTelInput);

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

  var SubscriptionModal = function (_React$Component) {
    _inherits(SubscriptionModal, _React$Component);

    function SubscriptionModal(props) {
      _classCallCheck(this, SubscriptionModal);

      var _this = _possibleConstructorReturn(this, (SubscriptionModal.__proto__ || Object.getPrototypeOf(SubscriptionModal)).call(this, props));

      _this.updateName = function (evt) {
        _this.setState({
          customFeatName: evt.target.value
        });

        _this.state.currentCustomGraphic.attributes.featureName = evt.target.value;
      };

      _this.updateEmail = function (evt) {
        _this.setState({
          email: evt.target.value
        });
      };

      _this.updatePhone = function (evt) {
        _this.setState({
          phoneNumber: evt.target.value
        });
      };

      _this.subscribe = function () {
        var honeyPotValue = _dom2.default.byId(_config.modalText.subscription.verifyInput).value;
        if (honeyPotValue) {
          return;
        }

        // if (!this.state.currentCustomGraphic) {
        //   return;
        // }

        var validPoint = _this.state.currentCustomGraphic ? true : false;
        console.log('validPoint', validPoint);
        var validEmail = _this.validateEmail(_this.state.email);
        var validPhone = _this.validatePhone(_this.state.phoneNumber);

        if (!validPoint) {
          _this.setState({
            pointErrors: true
          });
        } else if (!validPhone && !validEmail) {
          _this.setState({
            emailErrors: true,
            phoneErrors: true
          });
        } else if (_this.state.email && !validEmail) {
          _this.setState({
            emailErrors: true,
            phoneErrors: false
          });
        } else if (_this.state.phoneNumber && !validPhone) {
          _this.setState({
            emailErrors: false,
            phoneErrors: true
          });
        } else {
          _this.setState({
            pointErrors: false,
            emailErrors: false,
            phoneErrors: false,
            isUploading: true
          });

          var subscribeUrl = 'https://gfw-fires.wri.org/subscribe_by_polygon',

          // let subscribeUrl = 'http://54.164.126.73/subscribe_by_polygon',
          subscriptions = [],
              emailParams = void 0,
              smsParams = void 0;

          _this.sendAnalytics('subscription', 'request', 'The user subscribed to alerts.');

          // Simplify the geometry and then add a stringified and simpler version of it to params.features
          var simplifiedGeometry = _geometryEngine2.default.simplify(_this.state.currentCustomGraphic.geometry);

          if (_this.state.email) {
            emailParams = {
              'msg_addr': _this.state.email,
              'msg_type': 'email',
              'area_name': _this.state.customFeatName
            };

            emailParams.features = JSON.stringify({
              'rings': simplifiedGeometry.rings,
              'spatialReference': simplifiedGeometry.spatialReference
            });

            subscriptions.push($.ajax({
              type: 'POST',
              url: subscribeUrl,
              data: emailParams,
              error: _this.error,
              // success: this.success,
              dataType: 'json'
            }));
          }

          if (_this.state.phoneNumber && _this.state.phoneNumber !== 1) {
            var numbersOnly = _this.state.phoneNumber.replace(/\D/g, '');
            // let countryData = $('#phoneInput').intlTelInput('getSelectedCountryData');

            smsParams = {
              'msg_addr': numbersOnly,
              'msg_type': 'sms',
              'area_name': _this.state.customFeatName
            };

            smsParams.features = JSON.stringify({
              'rings': simplifiedGeometry.rings,
              'spatialReference': simplifiedGeometry.spatialReference
            });

            subscriptions.push($.ajax({
              type: 'POST',
              url: subscribeUrl,
              data: smsParams,
              error: _this.error,
              // success: this.success,
              dataType: 'json'
            }));
          }

          (0, _all2.default)(subscriptions).then(_this.success);

          // let sr = new SpatialReference(4326);
          // params.features = JSON.stringify({
          //     'rings': simplifiedGeometry.rings,
          //     'spatialReference': simplifiedGeometry.spatialReference
          // });
        }
      };

      _this.success = function () {
        _this.close();
        _ModalActions.modalActions.showConfirmationModal(_this.state);
        _this.setState({
          isUploading: false
        });
      };

      _this.error = function () {
        _this.close();
        _ModalActions.modalActions.showConfirmationModal('error');
        _this.setState({
          isUploading: false
        });
      };

      _this.deleteFeature = function () {
        _this.close();
        _ModalActions.modalActions.removeCustomFeature(_this.state.currentCustomGraphic);
      };

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      // this.state = mapStore.getState();

      _this.state = {
        currentCustomGraphic: undefined,
        email: '',
        customFeatName: '', //'Custom Feature',
        phoneNumber: '',
        pointErrors: false,
        emailErrors: false,
        phoneErrors: false,
        isSubscribing: false,
        success: false
      };
      return _this;
    }

    _createClass(SubscriptionModal, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        $('#phoneInput').intlTelInput();

        // Only b/c intlTelInput doesn't like values in initialState
        this.setState({
          phoneNumber: 1
        });

        $('#phoneInput').on('countrychange', function (e, countryData) {
          _this2.setState({
            phoneNumber: countryData.dialCode
          });
        });
      }
    }, {
      key: 'storeUpdated',
      value: function storeUpdated() {
        var newState = _MapStore.mapStore.getState();
        if (newState.currentCustomGraphic && newState.currentCustomGraphic !== this.state.currentCustomGraphic) {
          this.setState({
            currentCustomGraphic: newState.currentCustomGraphic,
            customFeatName: newState.currentCustomGraphic.attributes.featureName,
            pointErrors: false
          });
        } else if (!newState.currentCustomGraphic && newState.currentCustomGraphic !== this.state.currentCustomGraphic) {
          this.setState({
            currentCustomGraphic: undefined,
            customFeatName: ''
          });
        }

        if (!this.state.currentCustomGraphic && newState.currentCustomGraphic) {
          this.setState({
            pointErrors: false
          });
        }
      }
    }, {
      key: 'validateEmail',
      value: function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      }
    }, {
      key: 'validatePhone',
      value: function validatePhone(phoneNumber) {
        //todo: use old phone # validation library
        if (phoneNumber.length > 5 || phoneNumber === 1) {
          return true;
        } else {
          return false;
        }
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
      key: 'close',
      value: function close() {
        _ModalActions.modalActions.hideModal(_reactDom2.default.findDOMNode(this).parentElement);
      }
    }, {
      key: 'render',
      value: function render() {
        // let nameToDisplay = this.state.customFeatName;
        // if (this.state.currentCustomGraphic && this.state.currentCustomGraphic.attributes && this.state.customFeatName === 'Custom Feature') {
        //   nameToDisplay = this.state.currentCustomGraphic.attributes.featureName;
        // }
        //
        //value={this.state.customFeatName ? this.state.customFeatName : this.state.currentCustomGraphic.attributes.featureName}
        return _react2.default.createElement(
          _ModalWrapper2.default,
          null,
          _react2.default.createElement(
            'div',
            { className: 'canopy-modal-title' },
            _config.modalText.subscription.title
          ),
          this.state.currentCustomGraphic ? _react2.default.createElement('input', { className: 'longer', value: this.state.customFeatName, onChange: this.updateName }) : null,
          _react2.default.createElement(
            'div',
            { className: 'submit-warning ' + (this.state.pointErrors ? '' : 'hidden') },
            _config.modalText.subscription.warningTextPoints
          ),
          _react2.default.createElement(
            'p',
            null,
            _config.modalText.subscription.emailInstructions
          ),
          _react2.default.createElement('input', { className: 'longer', value: this.state.email, placeholder: _config.modalText.subscription.emailPlaceholder, onChange: this.updateEmail }),
          _react2.default.createElement(
            'div',
            { className: 'submit-warning ' + (this.state.emailErrors ? '' : 'hidden') },
            _config.modalText.subscription.warningTextEmail
          ),
          _react2.default.createElement(
            'p',
            { className: 'sign-up' },
            _config.modalText.subscription.emailExplanationStart,
            _react2.default.createElement(
              'a',
              { href: _config.modalText.subscription.emailExplanationAddress },
              _config.modalText.subscription.emailExplanationDisplay
            ),
            _config.modalText.subscription.emailExplanationEnd
          ),
          _react2.default.createElement(
            'p',
            null,
            _config.modalText.subscription.phoneInstructions
          ),
          _react2.default.createElement('input', { id: 'phoneInput', className: 'longer', value: this.state.phoneNumber, placeholder: _config.modalText.subscription.phonePlaceholder, onChange: this.updatePhone }),
          _react2.default.createElement(
            'p',
            { className: 'sign-up' },
            _config.modalText.subscription.phoneExplanation
          ),
          _react2.default.createElement(
            'div',
            { className: 'submit-warning ' + (this.state.phoneErrors ? '' : 'hidden') },
            _config.modalText.subscription.warningTextPhone
          ),
          _react2.default.createElement('input', { className: 'hidden', id: _config.modalText.subscription.verifyInput }),
          _react2.default.createElement(
            'div',
            { className: 'subscribe-container' },
            this.state.currentCustomGraphic && this.state.currentCustomGraphic.attributes.Layer === 'custom' ? _react2.default.createElement(
              'button',
              { className: 'subscribe-submit left btn red ' + (app.mobile() === true ? 'narrow' : ''), onClick: this.deleteFeature.bind(this) },
              _config.modalText.subscription.deletePlaceholder
            ) : null,
            _react2.default.createElement(
              'button',
              { className: 'subscribe-submit btn red ' + (app.mobile() === true ? 'narrow' : '') + (this.state.currentCustomGraphic && this.state.currentCustomGraphic.attributes.Layer === 'custom' ? ' right' : ''), onClick: this.subscribe.bind(this) },
              _config.modalText.subscription.subscribePlaceholder
            )
          ),
          _react2.default.createElement(_Loader2.default, { active: this.state.isUploading })
        );
      }
    }]);

    return SubscriptionModal;
  }(_react2.default.Component);

  exports.default = SubscriptionModal;
});