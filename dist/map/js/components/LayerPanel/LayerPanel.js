define(['exports', 'components/LayerPanel/WaterStressLegend', 'components/LayerPanel/LandCoverLegend', 'components/LayerPanel/SedimentLegend', 'components/LayerPanel/DensityDisplay', 'components/LayerPanel/LayerCheckbox', 'components/LayerPanel/FiresControls', 'components/LayerPanel/FireHistoryTimeline', 'components/LayerPanel/ForestControls', 'components/LayerPanel/PlantationControls', 'components/LayerPanel/ViirsControls', 'components/LayerPanel/ArchiveControls', 'components/LayerPanel/NoaaControls', 'components/LayerPanel/BurnScarsLegend', 'components/LayerPanel/RiskControls', 'components/LayerPanel/RainControls', 'components/LayerPanel/AirControls', 'components/LayerPanel/WindControls', 'components/LayerPanel/LayerTransparency', 'components/LayerPanel/ImageryComponent', 'components/LayerPanel/LayerGroup', 'components/LayerPanel/DamsLegend', 'js/config', 'stores/MapStore', 'actions/MapActions', 'js/constants', 'react'], function (exports, _WaterStressLegend, _LandCoverLegend, _SedimentLegend, _DensityDisplay, _LayerCheckbox, _FiresControls, _FireHistoryTimeline, _ForestControls, _PlantationControls, _ViirsControls, _ArchiveControls, _NoaaControls, _BurnScarsLegend, _RiskControls, _RainControls, _AirControls, _WindControls, _LayerTransparency, _ImageryComponent, _LayerGroup, _DamsLegend, _config, _MapStore, _MapActions, _constants, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _WaterStressLegend2 = _interopRequireDefault(_WaterStressLegend);

  var _LandCoverLegend2 = _interopRequireDefault(_LandCoverLegend);

  var _SedimentLegend2 = _interopRequireDefault(_SedimentLegend);

  var _DensityDisplay2 = _interopRequireDefault(_DensityDisplay);

  var _LayerCheckbox2 = _interopRequireDefault(_LayerCheckbox);

  var _FiresControls2 = _interopRequireDefault(_FiresControls);

  var _FireHistoryTimeline2 = _interopRequireDefault(_FireHistoryTimeline);

  var _ForestControls2 = _interopRequireDefault(_ForestControls);

  var _PlantationControls2 = _interopRequireDefault(_PlantationControls);

  var _ViirsControls2 = _interopRequireDefault(_ViirsControls);

  var _ArchiveControls2 = _interopRequireDefault(_ArchiveControls);

  var _NoaaControls2 = _interopRequireDefault(_NoaaControls);

  var _BurnScarsLegend2 = _interopRequireDefault(_BurnScarsLegend);

  var _RiskControls2 = _interopRequireDefault(_RiskControls);

  var _RainControls2 = _interopRequireDefault(_RainControls);

  var _AirControls2 = _interopRequireDefault(_AirControls);

  var _WindControls2 = _interopRequireDefault(_WindControls);

  var _LayerTransparency2 = _interopRequireDefault(_LayerTransparency);

  var _ImageryComponent2 = _interopRequireDefault(_ImageryComponent);

  var _LayerGroup2 = _interopRequireDefault(_LayerGroup);

  var _DamsLegend2 = _interopRequireDefault(_DamsLegend);

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

  var LayerPanel = function (_React$Component) {
    _inherits(LayerPanel, _React$Component);

    function LayerPanel(props) {
      _classCallCheck(this, LayerPanel);

      var _this = _possibleConstructorReturn(this, (LayerPanel.__proto__ || Object.getPrototypeOf(LayerPanel)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(LayerPanel, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'clickedBasemap',
      value: function clickedBasemap(id) {
        _MapActions.mapActions.setBasemap(id);
      }
    }, {
      key: 'checkboxMap',
      value: function checkboxMap(group) {
        var _this2 = this;

        return function (layer) {
          var activeLayers = _this2.state.activeLayers;
          // Exclude Layers not part of this group
          if (layer.group !== group) {
            return null;
          }

          // Some layers have legends or tools and they should be rendered inside the layer checkbox
          var childComponent = void 0;

          switch (layer.id) {
            case _constants2.default.waterStress:
              childComponent = _react2.default.createElement(_WaterStressLegend2.default, { url: layer.url, layerIds: layer.layerIds });
              break;
            case _constants2.default.sediment:
              childComponent = _react2.default.createElement(_SedimentLegend2.default, { url: layer.url, layerIds: layer.layerIds });
              break;
            case _constants2.default.majorDams:
              childComponent = _react2.default.createElement(_DamsLegend2.default, { url: layer.url, layerIds: layer.layerIds });
              break;
            case _constants2.default.activeFires:
              childComponent = _react2.default.createElement(_FiresControls2.default, _extends({ loaded: _this2.props.loaded }, _this2.state));
              break;
            case _constants2.default.viirsFires:
              childComponent = _react2.default.createElement(_ViirsControls2.default, _extends({ loaded: _this2.props.loaded }, _this2.state));
              break;
            case _constants2.default.archiveFires:
              childComponent = _react2.default.createElement(_ArchiveControls2.default, { options: layer.calendar, loaded: _this2.props.loaded });
              break;
            case _constants2.default.noaa18Fires:
              childComponent = _react2.default.createElement(_NoaaControls2.default, { options: layer.calendar, loaded: _this2.props.loaded });
              break;
            case _constants2.default.burnScars:
              childComponent = _react2.default.createElement(_BurnScarsLegend2.default, _extends({ url: layer.url, layerIds: layer.layerIds }, _this2.state));
              break;
            case _constants2.default.treeCoverDensity:
              childComponent = _react2.default.createElement(_DensityDisplay2.default, _this2.state);
              break;
            case _constants2.default.primaryForests:
              childComponent = _react2.default.createElement(_ForestControls2.default, _extends({ loaded: _this2.props.loaded }, _this2.state));
              break;
            case _constants2.default.peatlands:
              childComponent = _react2.default.createElement(_LandCoverLegend2.default, { url: layer.url, layerIds: layer.layerIds });
              break;
            case _constants2.default.fireWeather:
              childComponent = _react2.default.createElement(_RiskControls2.default, { options: layer.calendar, loaded: _this2.props.loaded });
              break;
            case _constants2.default.fireHistory:
              childComponent = _react2.default.createElement(_FireHistoryTimeline2.default, _extends({}, _this2.state, { loaded: _this2.props.loaded }));
              break;
            case _constants2.default.lastRainfall:
              childComponent = _react2.default.createElement(_RainControls2.default, { options: layer.calendar, loaded: _this2.props.loaded });
              break;
            case _constants2.default.airQuality:
              childComponent = _react2.default.createElement(_AirControls2.default, { options: layer.calendar, loaded: _this2.props.loaded });
              break;
            case _constants2.default.windDirection:
              childComponent = _react2.default.createElement(_WindControls2.default, { options: layer.calendar, loaded: _this2.props.loaded });
              break;
            case _constants2.default.digitalGlobe:
              childComponent = _react2.default.createElement(_ImageryComponent2.default, _extends({}, _this2.state, { domId: layer.calendar.domId, domClass: layer.calendar.domClass, childDomClass: layer.calendar.childDomClass, startDate: layer.calendar.startDate, currentDate: layer.calendar.currentDate }));
              break;
            case _constants2.default.plantationTypes:
              childComponent = _react2.default.createElement(_PlantationControls2.default, _extends({ loaded: _this2.props.loaded }, _this2.state));
              break;
            default:
              childComponent = null;
          }

          return _react2.default.createElement(
            _LayerCheckbox2.default,
            { disabled: layer.disabled, key: layer.id, layer: layer, checked: activeLayers.indexOf(layer.id) > -1 },
            childComponent
          );
        };
      }
    }, {
      key: 'render',
      value: function render() {
        var className = 'layer-panel map-component custom-scroll shadow';
        var landUseLayers = _config.layersConfig.filter(function (l) {
          return l.group === 'forestUse';
        }).map(this.checkboxMap('forestUse'), this);
        var fireRiskLayers = _config.layersConfig.filter(function (l) {
          return l.group === 'fireRisk';
        }).map(this.checkboxMap('fireRisk'), this);
        var conservationLayers = _config.layersConfig.filter(function (l) {
          return l.group === 'conservation';
        }).map(this.checkboxMap('conservation'), this);
        var landCoverLayers = _config.layersConfig.filter(function (l) {
          return l.group === 'landCover';
        }).map(this.checkboxMap('landCover'), this);
        if (app.mobile() === true && this.state.layerPanelVisible === false) {
          className += ' hidden';
        }
        if (this.state.panelsHidden === true && className.indexOf('hidden') === -1) {
          className += ' hidden';
        }

        //{layersConfig.map(this.checkboxMap('landCover'), this)}
        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            _LayerGroup2.default,
            { activeLayers: this.state.activeLayers, label: 'Fires' },
            _config.layersConfig.map(this.checkboxMap('fires'), this)
          ),
          _react2.default.createElement(
            _LayerGroup2.default,
            { activeLayers: this.state.activeLayers, label: 'Fire Risk' },
            _react2.default.createElement(_LayerTransparency2.default, { initalOpacity: .80, layers: fireRiskLayers }),
            _config.layersConfig.map(this.checkboxMap('fireRisk'), this)
          ),
          _react2.default.createElement(
            _LayerGroup2.default,
            { activeLayers: this.state.activeLayers, label: 'Land use' },
            _react2.default.createElement(_LayerTransparency2.default, { layers: landUseLayers }),
            landUseLayers[0],
            _config.layerPanelText.concessions,
            landUseLayers[1],
            landUseLayers[2],
            landUseLayers[3],
            landUseLayers[4],
            _config.layerPanelText.concessionsGreenpeace,
            landUseLayers[5],
            landUseLayers[6],
            landUseLayers[7],
            landUseLayers[8]
          ),
          _react2.default.createElement(
            _LayerGroup2.default,
            { activeLayers: this.state.activeLayers, label: 'Conservation' },
            _react2.default.createElement(_LayerTransparency2.default, { layers: conservationLayers }),
            conservationLayers[0]
          ),
          _react2.default.createElement(
            _LayerGroup2.default,
            { activeLayers: this.state.activeLayers, label: 'Land Cover' },
            _react2.default.createElement(_LayerTransparency2.default, { layers: landCoverLayers }),
            landCoverLayers[0],
            landCoverLayers[1],
            landCoverLayers[2],
            landCoverLayers[3]
          ),
          _react2.default.createElement(
            _LayerGroup2.default,
            { activeLayers: this.state.activeLayers, label: 'Air Quality' },
            _config.layersConfig.map(this.checkboxMap('airQuality'), this)
          ),
          _react2.default.createElement(
            _LayerGroup2.default,
            { activeLayers: this.state.activeLayers, label: 'Stories' },
            _config.layersConfig.map(this.checkboxMap('stories'), this)
          ),
          _react2.default.createElement(
            'div',
            { className: 'mobile-show' },
            _react2.default.createElement(
              'div',
              { className: 'layer-category' },
              _react2.default.createElement(
                'div',
                { className: 'layer-category-label pointer' },
                'Basemaps'
              ),
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                  'div',
                  { className: 'flex flex-wrap flex-justify-between padding' },
                  _react2.default.createElement(
                    'div',
                    { className: 'basemap-item narrow pointer', onClick: this.clickedBasemap.bind(this, _constants2.default.darkGrayBasemap) },
                    _react2.default.createElement('div', { className: 'basemap-thumbnail dark-gray-basemap ' + (this.state.activeBasemap === _constants2.default.darkGrayBasemap ? 'active' : '') }),
                    _react2.default.createElement(
                      'div',
                      { className: 'basemap-label narrow' },
                      _config.controlPanelText.darkGrayBasemap
                    )
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'basemap-item narrow pointer', onClick: this.clickedBasemap.bind(this, _constants2.default.topoBasemap) },
                    _react2.default.createElement('div', { className: 'basemap-thumbnail topo-basemap ' + (this.state.activeBasemap === _constants2.default.topoBasemap ? 'active' : '') }),
                    _react2.default.createElement(
                      'div',
                      { className: 'basemap-label narrow' },
                      _config.controlPanelText.topoBasemap
                    )
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'basemap-item narrow pointer', onClick: this.clickedBasemap.bind(this, _constants2.default.wriBasemap) },
                    _react2.default.createElement('div', { className: 'basemap-thumbnail wri-basemap ' + (this.state.activeBasemap === _constants2.default.wriBasemap ? 'active' : '') }),
                    _react2.default.createElement(
                      'div',
                      { className: 'basemap-label narrow' },
                      _config.controlPanelText.wriBasemap
                    )
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'basemap-item narrow pointer', onClick: this.clickedBasemap.bind(this, _constants2.default.imageryBasemap) },
                    _react2.default.createElement('div', { className: 'basemap-thumbnail imagery-basemap ' + (this.state.activeBasemap === _constants2.default.imageryBasemap ? 'active' : '') }),
                    _react2.default.createElement(
                      'div',
                      { className: 'basemap-label narrow' },
                      _config.controlPanelText.imageryBasemap
                    )
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'basemap-item narrow pointer', onClick: this.clickedBasemap.bind(this, _constants2.default.osmBasemap) },
                    _react2.default.createElement('div', { className: 'basemap-thumbnail osm-basemap ' + (this.state.activeBasemap === _constants2.default.osmBasemap ? 'active' : '') }),
                    _react2.default.createElement(
                      'div',
                      { className: 'basemap-label narrow' },
                      _config.controlPanelText.osmBasemap
                    )
                  )
                )
              )
            )
          )
        );
      }
    }]);

    return LayerPanel;
  }(_react2.default.Component);

  exports.default = LayerPanel;
});