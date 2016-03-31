import {layerActions} from 'actions/LayerActions';
import {mapActions} from 'actions/MapActions';
import {mapStore} from 'stores/MapStore';
import * as params from 'utils/params';
import KEYS from 'js/constants';

const ShareHelper = {

  applyStateFromUrl (state) {
    app.debug('ShareHelper >>> applyStateFromUrl');

    let {activeLayers, activeBasemap, x, y, z} = state;

    if (activeLayers) {
      let layerIds = activeLayers.split(',');
      layerIds.forEach(id => {
        layerActions.addActiveLayer(id);
      });

      // activeFires is on by default, we need to turn it off if not present in the shared state
      if (layerIds.indexOf(KEYS.activeFires) === -1) {
        layerActions.removeActiveLayer(KEYS.activeFires);
      }

    }

    if (activeBasemap) {
      mapActions.setBasemap(activeBasemap);
    }

    if (app.map.loaded && (x && y && z)) {
      app.map.centerAndZoom([x, y], z);
    }

  },

  prepareStateForUrl () {
    app.debug('ShareHelper >>> prepareStateForUrl');
    let {activeLayers, activeBasemap} = mapStore.getState();
    let shareObject = {};

    if (activeLayers.length > 0) {
      shareObject.activeLayers = activeLayers.join(',');
    }

    //- If the active basemap is not equal to the default, include it
    // if (activeBasemap !== KEYS.wriBasemap) {
      shareObject.activeBasemap = activeBasemap;
    // }

    //- Set X, Y, and Zoom
    let centerPoint = app.map.extent.getCenter();
    shareObject.x = Math.round(centerPoint.getLongitude());
    shareObject.y = Math.round(centerPoint.getLatitude());
    shareObject.z = app.map.getLevel();

    return params.toQuery(shareObject);
  }

};

export const applyStateFromUrl = ShareHelper.applyStateFromUrl;
export const prepareStateForUrl = ShareHelper.prepareStateForUrl;
