import {layerActions} from 'actions/LayerActions';
import {mapActions} from 'actions/MapActions';
import {layersConfig} from 'js/config';
import * as params from 'utils/params';
import KEYS from 'js/constants';
import hash from 'dojo/hash';

const ShareHelper = {

  prepareStateForUrl (basemap) {
    app.debug('ShareHelper >>> prepareStateForUrl');
    let shareObject = {}, activeLayers = [];

    layersConfig.forEach((l) => {
      if (!l.disabled) {
        let mapLayer = app.map.getLayer(l.id);
        if (l.id === 'windDirection') {
          mapLayer = app.map.getLayer('Wind_Direction');
        }
        if (mapLayer && mapLayer.visible) {
          activeLayers.push(l.id);
        }
      }
    });

    let activeBasemap = app.map.getBasemap();
    if (basemap) {
      activeBasemap = basemap;
    }

    let shareParams = {};

    if (activeLayers.length > 0) {
      shareObject.activeLayers = activeLayers.join(',');
    }

    shareObject.activeBasemap = activeBasemap;

    //- Set X, Y, and Zoom
    let centerPoint = app.map.extent.getCenter();
    shareObject.x = Math.round(centerPoint.getLongitude());
    shareObject.y = Math.round(centerPoint.getLatitude());
    shareObject.z = app.map.getLevel();
    shareParams = shareObject;

    return params.toQuery(shareParams);
  },

  applyStateFromUrl (state) {
    app.debug('ShareHelper >>> applyStateFromUrl');

    let activeLayers = state.activeLayers;
    let activeBasemap = state.activeBasemap;
    let x = state.x;
    let y = state.y;
    let z = state.z;

    if (activeBasemap) {
      mapActions.setBasemap(activeBasemap);
    }

    if (activeLayers) {
      let layerIds = activeLayers.split(',');
      layerIds.forEach(id => {
        if (id === 'protectedAreasHelper' && parseInt(z) > 6) {
          let helper = app.map.getLayer(id);
          helper.show();
          layerActions.addActiveLayer('protectedAreas');
        }
        layerActions.addActiveLayer(id);
      });

      // activeFires is on by default, we need to turn it off if not present in the shared state
      if (layerIds.indexOf(KEYS.activeFires) === -1) {
        layerActions.removeActiveLayer(KEYS.activeFires);
      }
    }

    if (app.map.loaded && (x && y && z)) {
      app.map.centerAndZoom([x, y], z);
    }
  },

  applyInitialState () {
    app.debug('ShareHelper >>> applyInitialState');
    let url = this.prepareStateForUrl();
    console.log(url);

    hash(url);
  },

  handleHashChange (basemap) {
    app.debug('ShareHelper >>> handleHashChange');
    let url = this.prepareStateForUrl(basemap);
    console.log(url);

    hash(url);
  }

};
export { ShareHelper as default };
