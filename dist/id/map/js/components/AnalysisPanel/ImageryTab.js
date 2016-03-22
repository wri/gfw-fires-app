define(['exports', 'components/LayerPanel/ImageryComponent', 'components/LayerPanel/LayerCheckbox', 'js/config', 'stores/MapStore', 'js/constants', 'react'], function (exports, _ImageryComponent, _LayerCheckbox, _config, _MapStore, _constants, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ImageryComponent2 = _interopRequireDefault(_ImageryComponent);

  var _LayerCheckbox2 = _interopRequireDefault(_LayerCheckbox);

  var _constants2 = _interopRequireDefault(_constants);

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

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

  var ImageryTab = function (_React$Component) {
    _inherits(ImageryTab, _React$Component);

    function ImageryTab(props) {
      _classCallCheck(this, ImageryTab);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageryTab).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(ImageryTab, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'render',
      value: function render() {
        var className = 'imagery-tab';
        if (this.props.activeTab !== _config.analysisPanelText.imageryTabId) {
          className += ' hidden';
        }
        var activeLayers = this.state.activeLayers;
        var dgLayer = _config.layersConfig.filter(function (l) {
          return l.id === _constants2.default.digitalGlobe;
        })[0];

        //todo: indent footprints subcehckbox
        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            'h3',
            null,
            _config.analysisPanelText.imageryArea
          ),
          _react2.default.createElement(
            _LayerCheckbox2.default,
            { key: dgLayer.id, childrenVisible: true, layer: dgLayer, checked: activeLayers.indexOf(dgLayer.id) > -1 },
            _react2.default.createElement(_ImageryComponent2.default, _extends({}, this.state, { options: dgLayer.calendar }))
          )
        );
      }
    }]);

    return ImageryTab;
  }(_react2.default.Component);

  exports.default = ImageryTab;
});