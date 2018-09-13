import {layerActions} from 'actions/LayerActions';
import {mapActions} from 'actions/MapActions';
import {layersConfig} from 'js/config';
import * as params from 'utils/params';
import KEYS from 'js/constants';
import hash from 'dojo/hash';


const ShareHelper = {

  activeImagery: '',

  prepareStateForUrl (basemap, imagery, activeCategory, activePlanetPeriod) {
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

    shareObject.activeImagery = imagery ? imagery : this.activeImagery;
    shareObject.planetCategory = activeCategory ? activeCategory : null;
    shareObject.planetPeriod = activePlanetPeriod ? activePlanetPeriod : null;

    //- Set X, Y, and Zoom
    let centerPoint = app.map.extent.getCenter();
    shareObject.x = centerPoint.getLongitude().toFixed(6);
    shareObject.y = centerPoint.getLatitude().toFixed(6);
    shareObject.z = app.map.getLevel();
    shareParams = shareObject;

    return params.toQuery(shareParams);
  },

  applyStateFromUrl (state) {
    // console.log('ShareHelper >>> applyStateFromUrl');

    let activeLayers = state.activeLayers;
    let activeBasemap = state.activeBasemap;
    let activeImagery = state.activeImagery;
    let planetCategory = state.planetCategory;
    let planetPeriod = state.planetPeriod;
    let x = state.x;
    let y = state.y;
    let z = state.z;

    if (activeImagery && planetPeriod !== 'null') {
      mapActions.setActivePlanetCategory(planetCategory);
      mapActions.setActivePlanetPeriod(planetPeriod);
      mapActions.setImagery(activeImagery);
    }

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
        } else if (id.indexOf('firesHistory') > -1) {
          id = KEYS.fireHistory;
        }
        layerActions.addActiveLayer(id);
      });

      // activeFires & viirsFires are on by default, we need to turn them off if not present in state
      if (layerIds.indexOf(KEYS.activeFires) === -1) {
        layerActions.removeActiveLayer(KEYS.activeFires);
      }
      if (layerIds.indexOf(KEYS.viirsFires) === -1) {
        layerActions.removeActiveLayer(KEYS.viirsFires);
      }
    }

    if (app.map.loaded && (x && y && z)) {
      app.map.centerAndZoom([x, y], z);
    }
  },

  applyInitialState () {
    app.debug('ShareHelper >>> applyInitialState');
    let url = this.prepareStateForUrl();
    hash(url);
  },

  handleHashChange (basemap, imagery, activeCategory, activePlanetPeriod) {
    let url = this.prepareStateForUrl(basemap, imagery, activeCategory, activePlanetPeriod);
    this.imagery = imagery;
    hash(url);
  }

};
export { ShareHelper as default };
