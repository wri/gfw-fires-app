define(['exports', 'components/Modals/ModalWrapper', 'js/config', 'dojo/dom', 'stores/MapStore', 'actions/ModalActions', 'components/Loader', 'esri/geometry/geometryEngine', 'dojo/Deferred', 'dojo/request/xhr', 'react'], function (exports, _ModalWrapper, _config, _dom, _MapStore, _ModalActions, _Loader, _geometryEngine, _Deferred, _xhr, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ModalWrapper2 = _interopRequireDefault(_ModalWrapper);

  var _dom2 = _interopRequireDefault(_dom);

  var _Loader2 = _interopRequireDefault(_Loader);

  var _geometryEngine2 = _interopRequireDefault(_geometryEngine);

  var _Deferred2 = _interopRequireDefault(_Deferred);

  var _xhr2 = _interopRequireDefault(_xhr);

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

  var SubscriptionModal = function (_React$Component) {
    _inherits(SubscriptionModal, _React$Component);

    function SubscriptionModal(props) {
      _classCallCheck(this, SubscriptionModal);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SubscriptionModal).call(this, props));

      _this.updateName = function (evt) {
        _this.setState({
          customFeatName: evt.target.value
        });
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

        var validEmail = _this.validateEmail(_this.state.email);
        var validPhone = _this.validatePhone(_this.state.phoneNumber);

        if (!_this.state.email || !validEmail) {
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
            emailErrors: false,
            phoneErrors: false,
            isUploading: true
          });

          var subscribeUrl = 'https://gfw-fires.wri.org/subscribe_by_polygon',

          // deferred = new Deferred(),
          params = {
            'msg_addr': _this.state.email,
            'msg_type': 'email',
            'area_name': _this.state.currentCustomGraphic.attributes.ALERTS_LABEL
          };

          // Simplify the geometry and then add a stringified and simpler version of it to params.features
          var simplifiedGeometry = _geometryEngine2.default.simplify(_this.state.currentCustomGraphic.geometry);
          params.features = JSON.stringify({
            'rings': simplifiedGeometry.rings,
            'spatialReference': simplifiedGeometry.spatialReference
          });

          var success = function () {
            var _this2 = this;

            // alert('succcesss');
            setTimeout(function () {
              _this2.close();
              _this2.setState({
                isUploading: false
              });
            }, 500);
          }.bind(_this);
          var error = function () {
            var _this3 = this;

            // alert('error');
            setTimeout(function () {
              _this3.close();
              _this3.setState({
                isUploading: false
              });
            }, 1000);
          }.bind(_this);

          $.ajax({
            type: 'POST',
            url: subscribeUrl,
            data: params,
            error: error,
            success: success,
            dataType: 'json'
          });

          // let postRequest = $.post(subscribeUrl, params, function( data ) {
          //   console.log(data);
          //   alert( 'success' );
          // })
          //   .fail(function() {
          //     alert( 'error' );
          //   })
          //   .always(function() {
          //     this.setState({
          //       isUploading: false
          //     });
          //   });

          // xhr(subscribeUrl, {
          //   handleAs: 'json',
          //   method: 'POST',
          //   data: params
          // }).then(function() {
          //   this.setState({
          //     isUploading: false
          //   });
          //   alert('success');
          //
          //   deferred.resolve(true);
          //
          // }, function(err) {
          // this.setState({
          //   isUploading: false
          // });
          //   alert('There was an error subsrcribing at this time. ' + err.message);
          //   deferred.resolve(false);
          // });

          // return deferred.promise;

          // todo: submit the request, and on success or failure, hide the loader
        }
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
        phoneNumber: '',
        emailErrors: false,
        phoneErrors: false,
        isSubscribing: false,
        success: false
      };
      return _this;
    }

    _createClass(SubscriptionModal, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        var newState = _MapStore.mapStore.getState();
        if (newState.currentCustomGraphic !== this.state.currentCustomGraphic) {
          this.setState({ currentCustomGraphic: newState.currentCustomGraphic });
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
        if (phoneNumber.length > 5) {
          return true;
        } else {
          return false;
        }
      }
    }, {
      key: 'close',
      value: function close() {
        _ModalActions.modalActions.hideModal(_react2.default.findDOMNode(this).parentElement);
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          _ModalWrapper2.default,
          null,
          _react2.default.createElement(
            'div',
            { className: 'canopy-modal-title' },
            _config.modalText.subscription.title
          ),
          this.state.currentCustomGraphic ? _react2.default.createElement('input', { className: 'longer', value: this.state.customFeatName !== undefined ? this.state.customFeatName : this.state.currentCustomGraphic.attributes.featureName, onChange: this.updateName }) : null,
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
            null,
            _config.modalText.subscription.phoneInstructions
          ),
          _react2.default.createElement('input', { className: 'longer', value: this.state.phoneNumber, placeholder: _config.modalText.subscription.phonePlaceholder, onChange: this.updatePhone }),
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
          _react2.default.createElement(_Loader2.default, { active: this.state.isUploading }),
          _react2.default.createElement(
            'div',
            { className: 'submit-success ' + (this.state.success ? '' : 'hidden') },
            _config.modalText.subscription.successMessage
          )
        );
      }
    }]);

    return SubscriptionModal;
  }(_react2.default.Component);

  exports.default = SubscriptionModal;
});