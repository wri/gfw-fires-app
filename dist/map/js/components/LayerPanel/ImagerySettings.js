define(['exports', 'helpers/LayersHelper', 'stores/MapStore', 'actions/LayerActions', 'js/constants', 'react'], function (exports, _LayersHelper, _MapStore, _LayerActions, _constants, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _constants2 = _interopRequireDefault(_constants);

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

  var ImagerySettings = function (_React$Component) {
    _inherits(ImagerySettings, _React$Component);

    function ImagerySettings(props) {
      _classCallCheck(this, ImagerySettings);

      var _this = _possibleConstructorReturn(this, (ImagerySettings.__proto__ || Object.getPrototypeOf(ImagerySettings)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(ImagerySettings, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps, prevState) {
        if (prevState.footprintsVisible !== this.state.footprintsVisible) {
          if (this.state.footprintsVisible) {
            console.log('showing');

            var layerObj = {};
            layerObj.layerId = _constants2.default.boundingBoxes;
            layerObj.footprints = this.state.footprints;
            _LayersHelper2.default.showLayer(layerObj);
            // LayersHelper.showLayer(KEYS.boundingBoxes);
          } else {
            console.log('hidingg');
            _LayersHelper2.default.hideLayer(_constants2.default.boundingBoxes);
          }
        }
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'layer-checkbox indented relative ' + (this.state.footprintsVisible ? ' active' : '') },
          _react2.default.createElement(
            'span',
            { onClick: this.toggleFootprints.bind(this), className: 'toggle-switch pointer' },
            _react2.default.createElement('span', null)
          ),
          _react2.default.createElement(
            'span',
            { onClick: this.toggleFootprints.bind(this), className: 'layer-checkbox-label pointer' },
            'Display Footprints'
          )
        );
      }
    }, {
      key: 'toggleFootprints',
      value: function toggleFootprints() {
        // this.setState({
        //   checked: evt.target.checked
        // });
        _LayerActions.layerActions.toggleFootprintsVisibility();
      }
    }]);

    return ImagerySettings;
  }(_react2.default.Component);

  exports.default = ImagerySettings;
});