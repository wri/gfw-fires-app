define(['exports', 'actions/LayerActions', 'actions/MapActions', 'js/config', 'utils/params', 'js/constants', 'dojo/io-query', 'dojo/hash'], function (exports, _LayerActions, _MapActions, _config, _params, _constants, _ioQuery, _hash) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var params = _interopRequireWildcard(_params);

  var _constants2 = _interopRequireDefault(_constants);

  var _ioQuery2 = _interopRequireDefault(_ioQuery);

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
    prepareStateForUrl: function prepareStateForUrl() {
      app.debug('ShareHelper >>> prepareStateForUrl');
      // let {activeLayers, activeBasemap} = mapStore.getState();
      // let {activeLayers, activeBasemap} = configObj;
      var shareObject = {};

      var activeLayers = app && app.activeLayers ? app.activeLayers : [];
      var activeBasemap = app.map.getBasemap();

      var shareParams = {};

      // if (app.activeLayers) {
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
      shareParams = shareObject;
      // }
      // debugger
      return params.toQuery(shareParams);
    },
    applyStateFromUrl: function applyStateFromUrl(state) {
      app.debug('ShareHelper >>> applyStateFromUrl');

      var activeLayers = state.activeLayers;
      var activeBasemap = state.activeBasemap;
      var x = state.x;
      var y = state.y;
      var z = state.z;

      if (!activeLayers || !activeBasemap) {
        var initialState = void 0,
            hasHash = void 0;

        var url = window.location.href;

        if (url.split && url.split('#')) {
          hasHash = url.split('#').length === 2 && url.split('#')[1].length > 1;
        }

        var inithash = _config.defaults.initialHash;

        if (hasHash & url) {
          initialState = _ioQuery2.default.queryToObject(url.split('#')[1]);
        } else {
          initialState = _ioQuery2.default.queryToObject(inithash.split('#')[1]);
        }

        activeLayers = initialState.activeLayers;
        activeBasemap = initialState.activeBasemap;
        x = initialState.x;
        y = initialState.y;
        z = initialState.z;
      }

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
    handleHashChange: function handleHashChange() {
      app.debug('ShareHelper >>> handleHashChange');

      var url = this.prepareStateForUrl();
      console.log(url);
      // if (url.indexOf('activeLayers' > -1)) {
      (0, _hash2.default)(url);
      // }
    }
  };
  // import {mapStore} from 'stores/MapStore';

  exports.default = ShareHelper;
});