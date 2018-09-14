define(['exports', 'actions/LayerActions', 'actions/MapActions', 'js/config', 'utils/params', 'js/constants', 'dojo/hash'], function (exports, _LayerActions, _MapActions, _config, _params, _constants, _hash) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var params = _interopRequireWildcard(_params);

  var _constants2 = _interopRequireDefault(_constants);

  var _hash2 = _interopRequireDefault(_hash);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  var ShareHelper = {

    activeImagery: '',

    prepareStateForUrl: function prepareStateForUrl(basemap, imagery, activeCategory, activePlanetPeriod) {
      app.debug('ShareHelper >>> prepareStateForUrl');
      var shareObject = {},
          activeLayers = [];

      _config.layersConfig.forEach(function (l) {
        if (!l.disabled) {
          var mapLayer = app.map.getLayer(l.id);
          if (l.id === 'windDirection') {
            mapLayer = app.map.getLayer('Wind_Direction');
          }
          if (mapLayer && mapLayer.visible) {
            activeLayers.push(l.id);
          }
        }
      });

      var activeBasemap = app.map.getBasemap();

      if (basemap) {
        activeBasemap = basemap;
      }

      var shareParams = {};

      if (activeLayers.length > 0) {
        shareObject.activeLayers = activeLayers.join(',');
      }

      shareObject.activeBasemap = activeBasemap;

      shareObject.activeImagery = imagery ? imagery : this.activeImagery;
      shareObject.planetCategory = activeCategory ? activeCategory : null;
      shareObject.planetPeriod = activePlanetPeriod ? activePlanetPeriod : null;

      //- Set X, Y, and Zoom
      var centerPoint = app.map.extent.getCenter();
      shareObject.x = centerPoint.getLongitude().toFixed(6);
      shareObject.y = centerPoint.getLatitude().toFixed(6);
      shareObject.z = app.map.getLevel();
      shareParams = shareObject;

      return params.toQuery(shareParams);
    },
    applyStateFromUrl: function applyStateFromUrl(state) {
      // console.log('ShareHelper >>> applyStateFromUrl');

      var activeLayers = state.activeLayers;
      var activeBasemap = state.activeBasemap;
      var activeImagery = state.activeImagery;
      var planetCategory = state.planetCategory;
      var planetPeriod = state.planetPeriod;
      var x = state.x;
      var y = state.y;
      var z = state.z;

      if (activeImagery && planetPeriod !== 'null') {
        _MapActions.mapActions.setActivePlanetCategory(planetCategory);
        _MapActions.mapActions.setActivePlanetPeriod(planetPeriod);
        _MapActions.mapActions.setImagery(activeImagery);
      }

      if (activeBasemap) {
        _MapActions.mapActions.setBasemap(activeBasemap);
      }

      if (activeLayers) {
        var layerIds = activeLayers.split(',');
        layerIds.forEach(function (id) {
          if (id === 'protectedAreasHelper' && parseInt(z) > 6) {
            var helper = app.map.getLayer(id);
            helper.show();
            _LayerActions.layerActions.addActiveLayer('protectedAreas');
          } else if (id.indexOf('firesHistory') > -1) {
            id = _constants2.default.fireHistory;
          }
          _LayerActions.layerActions.addActiveLayer(id);
        });

        // activeFires & viirsFires are on by default, we need to turn them off if not present in state
        if (layerIds.indexOf(_constants2.default.activeFires) === -1) {
          _LayerActions.layerActions.removeActiveLayer(_constants2.default.activeFires);
        }
        if (layerIds.indexOf(_constants2.default.viirsFires) === -1) {
          _LayerActions.layerActions.removeActiveLayer(_constants2.default.viirsFires);
        }
      }

      if (app.map.loaded && x && y && z) {
        app.map.centerAndZoom([x, y], z);
      }
    },
    applyInitialState: function applyInitialState() {
      app.debug('ShareHelper >>> applyInitialState');
      var url = this.prepareStateForUrl();
      (0, _hash2.default)(url);
    },
    handleHashChange: function handleHashChange(basemap, imagery, activeCategory, activePlanetPeriod) {
      var url = this.prepareStateForUrl(basemap, imagery, activeCategory, activePlanetPeriod);
      this.imagery = imagery;
      (0, _hash2.default)(url);
    }
  };
  exports.default = ShareHelper;
});