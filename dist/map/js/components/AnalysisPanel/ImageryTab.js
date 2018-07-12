define(['exports', 'components/LayerPanel/ImageryComponent', 'js/config', 'actions/ModalActions', 'actions/MapActions', 'stores/MapStore', 'helpers/LayersHelper', 'js/constants', 'react', 'components/AnalysisPanel/PlanetImagery'], function (exports, _ImageryComponent, _config, _ModalActions, _MapActions, _MapStore, _LayersHelper, _constants, _react, _PlanetImagery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ImageryComponent2 = _interopRequireDefault(_ImageryComponent);

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _constants2 = _interopRequireDefault(_constants);

  var _react2 = _interopRequireDefault(_react);

  var _PlanetImagery2 = _interopRequireDefault(_PlanetImagery);

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

  var useSvg = '<use xlink:href="#shape-info" />';

  var ImageryTab = function (_React$Component) {
    _inherits(ImageryTab, _React$Component);

    function ImageryTab(props) {
      _classCallCheck(this, ImageryTab);

      var _this = _possibleConstructorReturn(this, (ImageryTab.__proto__ || Object.getPrototypeOf(ImageryTab)).call(this, props));

      _this.clickedImagery = function (evt) {
        var currImagery = void 0;
        var _this$state = _this.state,
            activeImagery = _this$state.activeImagery,
            activeBasemap = _this$state.activeBasemap;
        var clickedImagery = evt.currentTarget.dataset.basemap;

        var dgLayer = _config.layersConfig.filter(function (l) {
          return l.id === _constants2.default.digitalGlobe;
        })[0];
        if (activeImagery === clickedImagery) {
          if (clickedImagery === _constants2.default.planetBasemap) {
            _MapActions.mapActions.changeBasemap(activeBasemap);
          } else {
            _LayersHelper2.default.hideLayer(dgLayer.id);
          }
        } else {
          currImagery = clickedImagery;
        }

        _this.setState({ activeImagery: currImagery });
      };

      _this.showInfo = function (evt) {
        evt.stopPropagation();
        var id = evt.currentTarget.parentElement.dataset.basemap === 'planetBasemap' ? evt.currentTarget.parentElement.dataset.basemap : 'dg-00';
        _ModalActions.modalActions.showLayerInfo(id);
      };

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _extends({}, _MapStore.mapStore.getState(), {
        activeImagery: ''
      });
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
        var dgLayer = _config.layersConfig.filter(function (l) {
          return l.id === _constants2.default.digitalGlobe;
        })[0];

        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            'h3',
            null,
            _config.analysisPanelText.imageryArea
          ),
          _react2.default.createElement(
            'div',
            { 'data-basemap': _constants2.default.planetBasemap, className: 'basemap-item ' + (this.state.activeImagery === _constants2.default.planetBasemap ? 'active' : ''), onClick: this.clickedImagery },
            _react2.default.createElement('span', { className: 'basemap-thumbnail dark-gray-basemap ' + (this.state.activeImagery === _constants2.default.planetBasemap ? 'active' : '') }),
            _react2.default.createElement(
              'div',
              { className: 'basemap-label' },
              'Planet Basemaps'
            ),
            _react2.default.createElement(
              'span',
              { className: 'info-icon pointer info-icon-center ' + (this.state.iconLoading === _constants2.default.planetBasemap ? 'iconLoading' : ''), onClick: this.showInfo.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
            ),
            this.state.activeImagery === _constants2.default.planetBasemap && _react2.default.createElement(_PlanetImagery2.default, { monthlyBasemaps: this.props.monthlyPlanetBasemaps, quarterlyBasemaps: this.props.quarterlyPlanetBasemaps, active: this.state.activeImagery === _constants2.default.planetBasemap })
          ),
          _react2.default.createElement(
            'div',
            { 'data-basemap': _constants2.default.digitalGlobeBasemap, className: 'basemap-item ' + (this.state.activeImagery === _constants2.default.digitalGlobeBasemap ? 'active' : ''), onClick: this.clickedImagery },
            _react2.default.createElement('span', { className: 'basemap-thumbnail dark-gray-basemap ' + (this.state.activeImagery === _constants2.default.digitalGlobeBasemap ? 'active' : '') }),
            _react2.default.createElement(
              'div',
              { className: 'basemap-label' },
              'DigitalGlobe - FirstLook'
            ),
            _react2.default.createElement(
              'span',
              { className: 'info-icon pointer info-icon-center ' + (this.state.iconLoading === _constants2.default.digitalGlobeBasemap ? 'iconLoading' : ''), onClick: this.showInfo.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
            ),
            this.state.activeImagery === _constants2.default.digitalGlobeBasemap && _react2.default.createElement(_ImageryComponent2.default, _extends({}, this.state, { options: dgLayer.calendar, active: this.state.activeImagery === _constants2.default.digitalGlobeBasemap, layer: dgLayer }))
          )
        );
      }
    }]);

    return ImageryTab;
  }(_react2.default.Component);

  exports.default = ImageryTab;
});