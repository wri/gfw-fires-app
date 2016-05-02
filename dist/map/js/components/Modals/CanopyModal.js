define(['exports', 'components/Modals/ModalWrapper', 'actions/ModalActions', 'helpers/LayersHelper', 'js/config', 'stores/MapStore', 'utils/loaders', 'react'], function (exports, _ModalWrapper, _ModalActions, _LayersHelper, _config, _MapStore, _loaders, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ModalWrapper2 = _interopRequireDefault(_ModalWrapper);

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

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

  var CanopyModal = function (_React$Component) {
    _inherits(CanopyModal, _React$Component);

    function CanopyModal(props) {
      _classCallCheck(this, CanopyModal);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(CanopyModal).call(this, props));
    }

    _createClass(CanopyModal, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        (0, _loaders.loadJS)(_config.assetUrls.rangeSlider).then(function () {
          setTimeout(function () {
            $('#tree-cover-slider').ionRangeSlider({
              type: 'single',
              values: _config.modalText.canopy.slider,
              hide_min_max: true,
              grid_snap: true,
              to_fixed: true,
              from_min: 1,
              from_max: 7,
              grid: true,
              from: 5,
              onFinish: _this2.sliderChanged,
              onUpdate: _this2.sliderUpdated,
              prettify: function prettify(value) {
                return value + '%';
              }
            });
          }, 3000);
        }, console.error);
        // Update with the default values
        var defaults = _MapStore.mapStore.getState();
        _LayersHelper2.default.updateTreeCoverDefinitions(defaults.canopyDensity);
      }
    }, {
      key: 'sliderChanged',
      value: function sliderChanged(data) {
        _ModalActions.modalActions.updateCanopyDensity(data.from_value);
        _LayersHelper2.default.updateTreeCoverDefinitions(data.from_value);
      }
    }, {
      key: 'sliderUpdated',
      value: function sliderUpdated(data) {
        // Component was reset, reset the default definition as well
        _LayersHelper2.default.updateTreeCoverDefinitions(data.from_value);
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          _ModalWrapper2.default,
          null,
          _react2.default.createElement(
            'div',
            { id: 'canopy', className: 'canopy-modal-title' },
            _config.modalText.canopy.title
          ),
          _react2.default.createElement(
            'div',
            { className: 'trees' },
            _react2.default.createElement('div', { className: 'tree-icon' }),
            _react2.default.createElement('div', { className: 'forest-icon' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'slider-container' },
            _react2.default.createElement('div', { id: 'tree-cover-slider' })
          )
        );
      }
    }]);

    return CanopyModal;
  }(_react2.default.Component);

  exports.default = CanopyModal;
});