define(['exports', 'js/config', 'esri/layers/WebTiledLayer', 'helpers/LayerFactory', 'esri/geometry/Point', 'helpers/Symbols', 'dojo/Deferred', 'esri/graphic', 'js/constants', 'esri/map', 'js/alt'], function (exports, _config, _WebTiledLayer, _LayerFactory, _Point, _Symbols, _Deferred, _graphic, _constants, _map, _alt) {
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
      key: 'changeBasemap',
      value: function changeBasemap(basemap) {
        app.debug('MapActions >>> changeBasemap - ' + basemap);
        var layer = void 0,
            labelLayer = void 0,
            baseLayer = void 0,
            landsatLayer = void 0;
        // Basemap can only be one of two options, wri or satellite
        if (basemap === _constants2.default.wriBasemap) {
          landsatLayer = app.map.getLayer(_constants2.default.landsat8);
          if (landsatLayer) {
            landsatLayer.hide();
          }
          layer = app.map.getLayer(basemap);
          labelLayer = app.map.getLayer(_constants2.default.wriBasemapLabel);
          if (layer) {
            layer.show();
          }
          if (labelLayer) {
            labelLayer.show();
          }
          // Remove the satellite layer if its present, wri-basemap should be first in layer ids,
          // if not, then the first layer is satellite
          if (app.map.layerIds[0] !== basemap) {
            baseLayer = app.map.getLayer(app.map.layerIds[0]);
            app.map.removeLayer(baseLayer);
          }
        } else if (basemap === _constants2.default.landsat8) {
          layer = app.map.getLayer(basemap);
          if (layer) {
            layer.show();
          }
        } else {
          landsatLayer = app.map.getLayer(_constants2.default.landsat8);
          if (landsatLayer) {
            landsatLayer.hide();
          }
          // Hide the wri basemap and show the satellite basemap, KEYS.wriBasemap
          app.map.setBasemap(basemap);
          layer = app.map.getLayer(_constants2.default.wriBasemap);
          labelLayer = app.map.getLayer(_constants2.default.wriBasemapLabel);
          if (layer) {
            layer.hide();
          }
          if (labelLayer) {
            labelLayer.hide();
          }
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