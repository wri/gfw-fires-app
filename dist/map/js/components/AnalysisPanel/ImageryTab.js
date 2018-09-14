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
        var currImagery = '';
        var activeImagery = _this.state.activeImagery;
        var clickedImagery = evt.currentTarget.dataset.basemap;


        if (activeImagery === clickedImagery && clickedImagery !== _constants2.default.planetBasemap) {
          var dgLayer = _config.layersConfig.filter(function (l) {
            return l.id === _constants2.default.digitalGlobe;
          })[0];
          _LayersHelper2.default.hideLayer(dgLayer.id);
        } else {
          currImagery = clickedImagery;
          if (clickedImagery === _constants2.default.planetBasemap && app.map.getLayer('planetBasemap')) {
            app.map.removeLayer(app.map.getLayer('planetBasemap'));
          }
        }

        _MapActions.mapActions.setImagery(currImagery);
      };

      _this.showInfo = function (evt) {
        evt.stopPropagation();
        var id = evt.currentTarget.parentElement.dataset.basemap === 'planetBasemap' ? evt.currentTarget.parentElement.dataset.basemap : 'dg-00';
        _ModalActions.modalActions.showLayerInfo(id);
      };

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
        var _state = this.state,
            activeImagery = _state.activeImagery,
            iconLoading = _state.iconLoading,
            activePlanetPeriod = _state.activePlanetPeriod,
            activeCategory = _state.activeCategory,
            activePlanetBasemap = _state.activePlanetBasemap;
        var _props = this.props,
            monthlyPlanetBasemaps = _props.monthlyPlanetBasemaps,
            quarterlyPlanetBasemaps = _props.quarterlyPlanetBasemaps,
            activeTab = _props.activeTab;
        var planetBasemap = _constants2.default.planetBasemap,
            digitalGlobe = _constants2.default.digitalGlobe,
            digitalGlobeBasemap = _constants2.default.digitalGlobeBasemap;


        var className = 'imagery-tab';
        if (activeTab !== _config.analysisPanelText.imageryTabId) {
          className += ' hidden';
        }
        var dgLayer = _config.layersConfig.filter(function (l) {
          return l.id === digitalGlobe;
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
            { 'data-basemap': planetBasemap, className: 'basemap-item ' + (activeImagery === planetBasemap ? 'active' : ''), onClick: this.clickedImagery },
            _react2.default.createElement('span', { className: 'basemap-thumbnail planet-basemap-image ' + (activeImagery === planetBasemap ? 'active' : '') }),
            _react2.default.createElement(
              'div',
              { className: 'basemap-label' },
              'Planet Basemaps',
              _react2.default.createElement(
                'div',
                { className: 'layer-checkbox-sublabel basemap-sublabel' },
                '(Monthly/quarterly, 4.77m, global)'
              )
            ),
            _react2.default.createElement(
              'span',
              { className: 'info-icon pointer info-icon-center ' + (iconLoading === planetBasemap ? 'iconLoading' : ''), onClick: this.showInfo.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
            ),
            activeImagery === planetBasemap && _react2.default.createElement(_PlanetImagery2.default, { activeCategory: activeCategory, activePlanetBasemap: activePlanetBasemap, activeImagery: activeImagery, activePlanetPeriod: activePlanetPeriod, monthlyBasemaps: monthlyPlanetBasemaps, quarterlyBasemaps: quarterlyPlanetBasemaps, active: activeImagery === planetBasemap })
          ),
          _react2.default.createElement(
            'div',
            { 'data-basemap': digitalGlobeBasemap, className: 'basemap-item ' + (activeImagery === digitalGlobeBasemap ? 'active' : ''), onClick: this.clickedImagery },
            _react2.default.createElement('span', { className: 'basemap-thumbnail digital-globe-basemap ' + (activeImagery === digitalGlobeBasemap ? 'active' : '') }),
            _react2.default.createElement(
              'div',
              { className: 'basemap-label' },
              'DigitalGlobe',
              _react2.default.createElement(
                'div',
                { className: 'layer-checkbox-sublabel basemap-sublabel' },
                '(2014-15, 0.3-1m, selected Indonesia locations)'
              )
            ),
            _react2.default.createElement(
              'span',
              { className: 'info-icon pointer info-icon-center ' + (iconLoading === digitalGlobeBasemap ? 'iconLoading' : ''), onClick: this.showInfo.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
            ),
            activeImagery === digitalGlobeBasemap && _react2.default.createElement(_ImageryComponent2.default, _extends({}, this.state, { options: dgLayer.calendar, active: activeImagery === digitalGlobeBasemap, layer: dgLayer }))
          )
        );
      }
    }]);

    return ImageryTab;
  }(_react2.default.Component);

  exports.default = ImageryTab;
});