import {layerActions} from 'actions/LayerActions';
import {mapActions} from 'actions/MapActions';
// import {mapStore} from 'stores/MapStore';
import {defaults} from 'js/config';
import * as params from 'utils/params';
import KEYS from 'js/constants';
import ioQuery from 'dojo/io-query';
import hash from 'dojo/hash';


const ShareHelper = {

  prepareStateForUrl () {
    app.debug('ShareHelper >>> prepareStateForUrl');
    // let {activeLayers, activeBasemap} = mapStore.getState();
    // let {activeLayers, activeBasemap} = configObj;
    let shareObject = {};

    let activeLayers = app && app.activeLayers ? app.activeLayers : [];
    let activeBasemap = app.map.getBasemap();

    let shareParams = {};

    // if (app.activeLayers) {
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
      shareParams = shareObject;
    // }
    // debugger
    return params.toQuery(shareParams);
  },

  applyStateFromUrl (state) {
    app.debug('ShareHelper >>> applyStateFromUrl');

    let activeLayers = state.activeLayers;
    let activeBasemap = state.activeBasemap;
    let x = state.x;
    let y = state.y;
    let z = state.z;

    if (!activeLayers || !activeBasemap) {
      let initialState, hasHash;

      let url = window.location.href;

      if (url.split && url.split('#')) {
        hasHash = (url.split('#').length === 2 && url.split('#')[1].length > 1);
      }

      let inithash = defaults.initialHash;

      if (hasHash & url) {
        initialState = ioQuery.queryToObject(url.split('#')[1]);
      } else {
        initialState = ioQuery.queryToObject(inithash.split('#')[1]);
      }

      activeLayers = initialState.activeLayers;
      activeBasemap = initialState.activeBasemap;
      x = initialState.x;
      y = initialState.y;
      z = initialState.z;

    }

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

  handleHashChange () {
    app.debug('ShareHelper >>> handleHashChange');

    let url = this.prepareStateForUrl();
    console.log(url)
    // if (url.indexOf('activeLayers' > -1)) {
      hash(url);
    // }
  }

};
export { ShareHelper as default };
// export default new ShareHelper();
// export const applyStateFromUrl = ShareHelper.applyStateFromUrl;
// export const prepareStateForUrl = ShareHelper.prepareStateForUrl;
