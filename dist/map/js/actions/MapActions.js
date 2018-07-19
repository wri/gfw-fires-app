define(['exports', 'js/config', 'esri/layers/WebTiledLayer', 'helpers/LayerFactory', 'esri/geometry/Point', 'helpers/Symbols', 'dojo/Deferred', 'esri/graphic', 'js/constants', 'esri/map', 'js/alt', 'dojo/on'], function (exports, _config, _WebTiledLayer, _LayerFactory, _Point, _Symbols, _Deferred, _graphic, _constants, _map, _alt, _on) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.mapActions = undefined;

  var _WebTiledLayer2 = _interopRequireDefault(_WebTiledLayer);

  var _LayerFactory2 = _interopRequireDefault(_LayerFactory);

  var _Point2 = _interopRequireDefault(_Point);

  var _Symbols2 = _interopRequireDefault(_Symbols);

  var _Deferred2 = _interopRequireDefault(_Deferred);

  var _graphic2 = _interopRequireDefault(_graphic);

  var _constants2 = _interopRequireDefault(_constants);

  var _map2 = _interopRequireDefault(_map);

  var _alt2 = _interopRequireDefault(_alt);

  var _on2 = _interopRequireDefault(_on);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
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

  // Variable to hold the user location graphic, this is deinfed here to make it
  // easier to remove at a later point
  var userLocation = void 0;

  var MapActions = function () {
    function MapActions() {
      _classCallCheck(this, MapActions);
    }

    _createClass(MapActions, [{
      key: 'createMap',
      value: function createMap(mapconfig) {
        app.debug('MapActions >>> createMap');
        var deferred = new _Deferred2.default();
        app.map = new _map2.default(mapconfig.id, mapconfig.options);
        app.map.on('load', function () {
          // Clear out the phantom graphic that esri adds to the graphics layer before resolving
          app.map.graphics.clear();
          app.map.enableScrollWheelZoom();
          deferred.resolve();
        });
        // Add a custom web tiled layer as a basemap
        var customBasemap = new _WebTiledLayer2.default(mapconfig.customBasemap.url, mapconfig.customBasemap.options);
        app.map.addLayers([customBasemap]);
        return deferred;
      }
    }, {
      key: 'createLayers',
      value: function createLayers() {
        app.debug('MapActions >>> createLayers');
        //- Remove layers from config that have no url unless they are of type graphic(which have no url)
        //- sort by order from the layer config
        //- return an arcgis layer for each config object
        var layers = _config.layersConfig.filter(function (layer) {
          return layer && !layer.disabled && (layer.url || layer.type === 'graphic' || layer.type === 'feature');
        }).sort(function (a, b) {
          return a.order - b.order;
        }).map(_LayerFactory2.default);
        app.map.addLayers(layers);

        // If there is an error with a particular layer, handle that here
        app.map.on('layers-add-result', function (result) {
          var addedLayers = result.layers;
          // Check for Errors
          var layerErrors = addedLayers.filter(function (layer) {
            return layer.error;
          });
          if (layerErrors.length > 0) {
            console.error(layerErrors);
          }
          // Connect events to the layers that need them
          // LayersHelper.connectLayerEvents();

          // this.connectLayerEvents

          //self.enableLayersFromHash();
        });
      }
    }, {
      key: 'zoomToUserLocation',
      value: function zoomToUserLocation() {
        app.debug('MapActions >>> zoomToUserLocation');
        if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
          navigator.geolocation.getCurrentPosition(function (geoposition) {
            var coords = geoposition.coords;
            // If there is alerady a location graphic present, remove it
            if (userLocation) {
              app.map.graphics.remove(userLocation);
            }
            // Add a graphic to the map and zoom to it
            userLocation = new _graphic2.default(new _Point2.default([coords.longitude, coords.latitude]), _Symbols2.default.getSVGPointSymbol(), { id: 'userLocation' });
            app.map.centerAndZoom(userLocation.geometry, 18);
            app.map.graphics.add(userLocation);
          }, function (err) {
            alert(_config.errors.geolocationFailure(err.message));
          });
        } else {
          alert(_config.errors.geolocationUnavailable);
        }
      }
    }, {
      key: 'connectLayerEvents',
      value: function connectLayerEvents() {
        app.debug('MapActions >>> connectLayerEvents');
        this.dispatch();
      }
    }, {
      key: 'setDGDate',
      value: function setDGDate(date) {
        app.debug('MapActions >>> setDGDate');
        this.dispatch(date);
      }
    }, {
      key: 'dispatchExtent',
      value: function dispatchExtent(extent) {
        app.debug('MapActions >>> dispatchExtent');
        this.dispatch(extent);
      }
    }, {
      key: 'setAnalysisDate',
      value: function setAnalysisDate(date) {
        app.debug('MapActions >>> setAnalysisDate');
        this.dispatch(date);
      }
    }, {
      key: 'setArchiveDate',
      value: function setArchiveDate(date) {
        app.debug('MapActions >>> setArchiveDate');
        this.dispatch(date);
      }
    }, {
      key: 'setViirsArchiveDate',
      value: function setViirsArchiveDate(date) {
        app.debug('MapActions >>> setViirsArchiveDate');
        this.dispatch(date);
      }
    }, {
      key: 'setModisArchiveDate',
      value: function setModisArchiveDate(date) {
        app.debug('MapActions >>> setModisArchiveDate');
        this.dispatch(date);
      }
    }, {
      key: 'setNoaaDate',
      value: function setNoaaDate(date) {
        app.debug('MapActions >>> setNoaaDate');
        this.dispatch(date);
      }
    }, {
      key: 'setRiskDate',
      value: function setRiskDate(date) {
        app.debug('MapActions >>> setRiskDate');
        this.dispatch(date);
      }
    }, {
      key: 'setRainDate',
      value: function setRainDate(date) {
        app.debug('MapActions >>> setRainDate');
        this.dispatch(date);
      }
    }, {
      key: 'setAirQDate',
      value: function setAirQDate(date) {
        app.debug('MapActions >>> setAirQDate');
        this.dispatch(date);
      }
    }, {
      key: 'setWindDate',
      value: function setWindDate(date) {
        app.debug('MapActions >>> setWindDate');
        this.dispatch(date);
      }
    }, {
      key: 'setActivePlanetPeriod',
      value: function setActivePlanetPeriod(basemap) {
        app.debug('MapActions >>> setActivePlanetPeriod');
        this.dispatch(basemap);
      }
    }, {
      key: 'setActivePlanetCategory',
      value: function setActivePlanetCategory(category) {
        app.debug('MapActions >>> setActivePlanetCategory');
        this.dispatch(category);
      }
    }, {
      key: 'setActivePlanetBasemap',
      value: function setActivePlanetBasemap(basemap) {
        app.debug('MapActions >>> setActivePlanetBasemap');
        this.dispatch(basemap);
      }
    }, {
      key: 'setMasterDate',
      value: function setMasterDate(date) {
        app.debug('MapActions >>> setMasterDate');
        this.dispatch(date);
      }
    }, {
      key: 'togglePanels',
      value: function togglePanels() {
        app.debug('MapActions >>> togglePanels');
        this.dispatch();
      }
    }, {
      key: 'setBasemap',
      value: function setBasemap(basemap) {
        app.debug('MapActions >>> setBasemap');
        this.dispatch(basemap);
      }
    }, {
      key: 'setImagery',
      value: function setImagery(imagery) {
        app.debug('MapActions >>> setImagery');
        this.dispatch(imagery);
      }
    }, {
      key: 'changeBasemap',
      value: function changeBasemap(basemap) {
        app.debug('MapActions >>> changeBasemap - ' + basemap);
        var layer = void 0,
            labelLayer = void 0,
            baseLayer = void 0,
            landsatLayer = void 0,
            planetLayer = void 0;
        // Base can be 4 options, WRI, Satellite, Planet, or generic
        if (basemap === _constants2.default.wriBasemap) {
          // Hide all other basemaps
          landsatLayer = app.map.getLayer(_constants2.default.landsat8);
          planetLayer = app.map.getLayer(_constants2.default.planetBasemap);
          if (landsatLayer) {
            landsatLayer.hide();
          }
          if (planetLayer) {
            planetLayer.hide();
          }
          // Show the correct basemap
          if (app.map.layerIds[0] !== basemap) {
            baseLayer = app.map.getLayer(app.map.layerIds[0]);
            app.map.removeLayer(baseLayer);
          }
          layer = app.map.getLayer(_constants2.default.wriBasemap);
          labelLayer = app.map.getLayer(_constants2.default.wriBasemapLabel);
          if (layer) {
            layer.show();
          }
          if (labelLayer) {
            labelLayer.show();
          }
        } else if (basemap === _constants2.default.landsat8) {
          // Hide all other basemaps
          planetLayer = app.map.getLayer(_constants2.default.planetBasemap);
          if (planetLayer) {
            planetLayer.hide();
          }
          // Show the correct basemap
          layer = app.map.getLayer(basemap);
          if (layer) {
            _on2.default.once(layer, 'update-end', function () {
              var currentBasemap = app.map.getLayer(app.map.layerIds[0]);
              currentBasemap.hide();
            });
            layer.show();
          }
        } else if ((typeof basemap === 'undefined' ? 'undefined' : _typeof(basemap)) === 'object') {
          // Hide all other basemaps
          layer = app.map.getLayer(_constants2.default.wriBasemap);
          landsatLayer = app.map.getLayer(_constants2.default.landsat8);
          planetLayer = app.map.getLayer(_constants2.default.planetBasemap);
          if (layer) {
            layer.hide();
          }
          if (landsatLayer) {
            landsatLayer.hide();
          }
          if (planetLayer) {
            app.map.removeLayer(planetLayer);
          }
          // Show the correct basemap
          var value = basemap.value;

          // Note - we replace the url template with what the JS API 3.x API documents, it just works this way?
          // ex "https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_2016_01_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png"
          // ex  "https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_2016_01_mosaic/gmap/${level}/${col}/${row}.png"
          var slippyUrl = value.replace(/{TileRow}/, '${row}').replace(/{TileCol}/, '${col}').replace(/{TileMatrix}/, '${level}');
          var planetBasemap = new _WebTiledLayer2.default(slippyUrl, {
            id: _constants2.default.planetBasemap,
            visible: true
          });
          app.map.setBasemap(app.map.getBasemap());
          app.map.addLayer(planetBasemap, 3);
        } else {
          // Hide all other basemaps
          landsatLayer = app.map.getLayer(_constants2.default.landsat8);
          planetLayer = app.map.getLayer(_constants2.default.planetBasemap);
          layer = app.map.getLayer(_constants2.default.wriBasemap);
          labelLayer = app.map.getLayer(_constants2.default.wriBasemapLabel);
          if (landsatLayer) {
            landsatLayer.hide();
          }
          if (planetLayer) {
            planetLayer.hide();
          }
          if (layer) {
            layer.hide();
          }
          if (labelLayer) {
            labelLayer.hide();
          }
          // Show the correct basemap
          app.map.setBasemap(basemap);
        }
      }
    }, {
      key: 'centerAndZoomLatLng',
      value: function centerAndZoomLatLng(lat, lng, zoomLevel) {
        app.map.centerAndZoom(new _Point2.default(lng, lat), zoomLevel);
      }
    }, {
      key: 'setCalendar',
      value: function setCalendar(footprints) {
        this.dispatch(footprints);
      }
    }, {
      key: 'updateOverlays',
      value: function updateOverlays(overlays) {
        this.dispatch(overlays);
      }
    }, {
      key: 'reset',
      value: function reset() {
        app.debug('MapActions >>> reset');
        // Reset the Store, this will also reset layers, layer definitions, and all React components
        _alt2.default.recycle();
        // Reset the Canopy Density slider
        var slider = $('#tree-cover-slider').data('ionRangeSlider');
        if (slider) {
          slider.reset();
        }
        //- Reset Esris Search Dijit and clear any graphics
        app.map.graphics.clear();
        //- Reset the Map to its original zoom and location
        app.map.centerAndZoom(_config.mapConfig.options.center, _config.mapConfig.options.zoom);
      }
    }]);

    return MapActions;
  }();

  var mapActions = exports.mapActions = _alt2.default.createActions(MapActions);
});