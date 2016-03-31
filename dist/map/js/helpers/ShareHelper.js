define(['exports', 'actions/LayerActions', 'actions/MapActions', 'stores/MapStore', 'utils/params', 'js/constants'], function (exports, _LayerActions, _MapActions, _MapStore, _params, _constants) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.prepareStateForUrl = exports.applyStateFromUrl = undefined;

  var params = _interopRequireWildcard(_params);

  var _constants2 = _interopRequireDefault(_constants);

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
    applyStateFromUrl: function applyStateFromUrl(state) {
      app.debug('ShareHelper >>> applyStateFromUrl');

      var activeLayers = state.activeLayers;
      var activeBasemap = state.activeBasemap;
      var x = state.x;
      var y = state.y;
      var z = state.z;


      if (activeLayers) {
        var layerIds = activeLayers.split(',');
        layerIds.forEach(function (id) {
          _LayerActions.layerActions.addActiveLayer(id);
        });

        // activeFires is on by default, we need to turn it off if not present in the shared state
        if (layerIds.indexOf(_constants2.default.activeFires) === -1) {
          _LayerActions.layerActions.removeActiveLayer(_constants2.default.activeFires);
        }
      }

      if (activeBasemap) {
        _MapActions.mapActions.setBasemap(activeBasemap);
      }

      if (app.map.loaded && x && y && z) {
        app.map.centerAndZoom([x, y], z);
      }
    },
    prepareStateForUrl: function prepareStateForUrl() {
      app.debug('ShareHelper >>> prepareStateForUrl');

      var _mapStore$getState = _MapStore.mapStore.getState();

      var activeLayers = _mapStore$getState.activeLayers;
      var activeBasemap = _mapStore$getState.activeBasemap;

      var shareObject = {};

      if (activeLayers.length > 0) {
        shareObject.activeLayers = activeLayers.join(',');
      }

      //- If the active basemap is not equal to the default, include it
      // if (activeBasemap !== KEYS.wriBasemap) {
      shareObject.activeBasemap = activeBasemap;
      // }

      //- Set X, Y, and Zoom
      var centerPoint = app.map.extent.getCenter();
      shareObject.x = Math.round(centerPoint.getLongitude());
      shareObject.y = Math.round(centerPoint.getLatitude());
      shareObject.z = app.map.getLevel();

      return params.toQuery(shareObject);
    }
  };

  var applyStateFromUrl = exports.applyStateFromUrl = ShareHelper.applyStateFromUrl;
  var prepareStateForUrl = exports.prepareStateForUrl = ShareHelper.prepareStateForUrl;
});