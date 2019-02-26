import {layersConfig, errors, mapConfig} from 'js/config';
// import {analysisActions} from 'actions/AnalysisActions';
import WebTiledLayer from 'esri/layers/WebTiledLayer';
import layerFactory from 'helpers/LayerFactory';
import Point from 'esri/geometry/Point';
import Symbols from 'helpers/Symbols';
import Deferred from 'dojo/Deferred';
import Graphic from 'esri/graphic';
import KEYS from 'js/constants';
import EsriMap from 'esri/map';
import alt from 'js/alt';
import on from 'dojo/on';

// Variable to hold the user location graphic, this is deinfed here to make it
// easier to remove at a later point
let userLocation;

class MapActions {

  /**
  * @param {object} mapconfig - May not be the same mapConfig from above, it is initially but map options
  * may be merged into this in the Map component on app load, if url params are present
  */
  createMap (mapconfig) {
    app.debug('MapActions >>> createMap');
    let deferred = new Deferred();
    app.map = new EsriMap(mapconfig.id, mapconfig.options);
    app.map.on('load', () => {
      // Clear out the phantom graphic that esri adds to the graphics layer before resolving
      app.map.graphics.clear();
      app.map.enableScrollWheelZoom();
      deferred.resolve();
    });
    // Add a custom web tiled layer as a basemap
    let customBasemap = new WebTiledLayer(mapconfig.customBasemap.url, mapconfig.customBasemap.options);
    app.map.addLayers([customBasemap]);
    return deferred;
  }

  createLayers () {
    app.debug('MapActions >>> createLayers');
    //- Remove layers from config that have no url unless they are of type graphic(which have no url)
    //- sort by order from the layer config
    //- return an arcgis layer for each config object
    let layers = layersConfig.filter(layer => layer && !layer.disabled && (layer.url || layer.type === 'graphic' || layer.type === 'feature')).sort((a, b) => a.order - b.order).map(layerFactory);
    app.map.addLayers(layers);

    // If there is an error with a particular layer, handle that here
    app.map.on('layers-add-result', result => {
      let addedLayers = result.layers;
      // Check for Errors
      var layerErrors = addedLayers.filter(layer => layer.error);
      if (layerErrors.length > 0) { console.error(layerErrors); }
      // Connect events to the layers that need them
      // LayersHelper.connectLayerEvents();

      // this.connectLayerEvents

      //self.enableLayersFromHash();
    });
  }

  zoomToUserLocation () {
    app.debug('MapActions >>> zoomToUserLocation');
    if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
      navigator.geolocation.getCurrentPosition(geoposition => {
        let coords = geoposition.coords;
        // If there is alerady a location graphic present, remove it
        if (userLocation) { app.map.graphics.remove(userLocation); }
        // Add a graphic to the map and zoom to it
        userLocation = new Graphic(new Point([coords.longitude, coords.latitude]), Symbols.getSVGPointSymbol(), { id: 'userLocation' });
        app.map.centerAndZoom(userLocation.geometry, 18);
        app.map.graphics.add(userLocation);
      }, err => {
        alert(errors.geolocationFailure(err.message));
      });
    } else {
      alert(errors.geolocationUnavailable);
    }
  }
  connectLayerEvents() {
    app.debug('MapActions >>> connectLayerEvents');
    this.dispatch();
  }

  setDGDate (date) {
    app.debug('MapActions >>> setDGDate');
    this.dispatch(date);
  }

  dispatchExtent (extent) {
    app.debug('MapActions >>> dispatchExtent');
    this.dispatch(extent);
  }

  setAnalysisDate (date) {
    app.debug('MapActions >>> setAnalysisDate');
    this.dispatch(date);
  }

  setArchiveDate (date) {
    app.debug('MapActions >>> setArchiveDate');
    this.dispatch(date);
  }

  setViirsArchiveDate (date) {
    app.debug('MapActions >>> setViirsArchiveDate');
    this.dispatch(date);
  }

  setModisArchiveDate (date) {
    app.debug('MapActions >>> setModisArchiveDate');
    this.dispatch(date);
  }

  setNoaaDate (date) {
    app.debug('MapActions >>> setNoaaDate');
    this.dispatch(date);
  }

  setRiskDate (date) {
    app.debug('MapActions >>> setRiskDate');
    this.dispatch(date);
  }

  setRainDate (date) {
    app.debug('MapActions >>> setRainDate');
    this.dispatch(date);
  }

  setAirQDate (date) {
    app.debug('MapActions >>> setAirQDate');
    this.dispatch(date);
  }

  setWindDate (date) {
    app.debug('MapActions >>> setWindDate');
    this.dispatch(date);
  }

  setActivePlanetPeriod (basemap) {
    app.debug('MapActions >>> setActivePlanetPeriod');
    this.dispatch(basemap);
  }

  setActivePlanetCategory (category) {
    app.debug('MapActions >>> setActivePlanetCategory');
    this.dispatch(category);
  }

  setActivePlanetBasemap (basemap) {
    app.debug('MapActions >>> setActivePlanetBasemap');
    this.dispatch(basemap);
  }

  setMasterDate (date) {
    app.debug('MapActions >>> setMasterDate');
    this.dispatch(date);
  }

  togglePanels () {
    app.debug('MapActions >>> togglePanels');
    this.dispatch();
  }

  setBasemap (basemap) {
    app.debug('MapActions >>> setBasemap');
    this.dispatch(basemap);
  }

  setImagery (imagery) {
    app.debug('MapActions >>> setImagery');
    this.dispatch(imagery);
  }

  changeBasemap (basemap) {
    app.debug(`MapActions >>> changeBasemap - ${basemap}`);
    let layer, labelLayer, baseLayer, landsatLayer, planetLayer;
    // Base can be 4 options, WRI, Satellite, Planet, or generic
    if (basemap === KEYS.wriBasemap) {
      // Hide all other basemaps
      landsatLayer = app.map.getLayer(KEYS.landsat8);
      planetLayer = app.map.getLayer(KEYS.planetBasemap);
      if (landsatLayer) { landsatLayer.hide(); }
      if (planetLayer) { planetLayer.hide(); }
      // Show the correct basemap
      if (app.map.layerIds[0] !== basemap) {
        baseLayer = app.map.getLayer(app.map.layerIds[0]);
        app.map.removeLayer(baseLayer);
      }
      layer = app.map.getLayer(KEYS.wriBasemap);
      labelLayer = app.map.getLayer(KEYS.wriBasemapLabel);
      if (layer) { layer.show(); }
      if (labelLayer) { labelLayer.show(); }
    } else if (basemap === KEYS.landsat8) {
      // Hide all other basemaps
      planetLayer = app.map.getLayer(KEYS.planetBasemap);
      if (planetLayer) { planetLayer.hide(); }
      // Show the correct basemap
      layer = app.map.getLayer(basemap);
      if (layer) {
        on.once(layer, 'update-end', () => {
          const currentBasemap = app.map.getLayer(app.map.layerIds[0]);
          currentBasemap.hide();
        });
        layer.show();
      }
    } else if (typeof basemap === 'object') {
      // Hide all other basemaps
      layer = app.map.getLayer(KEYS.wriBasemap);
      landsatLayer = app.map.getLayer(KEYS.landsat8);
      planetLayer = app.map.getLayer(KEYS.planetBasemap);
      // if (layer) { layer.hide(); }
      // if (landsatLayer) { landsatLayer.hide(); }
      if (planetLayer) { app.map.removeLayer(planetLayer); }
      // Show the correct basemap
      const { value } = basemap;
      // Note - we replace the url template with what the JS API 3.x API documents, it just works this way?
      // ex "https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_2016_01_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png"
      // ex  "https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_2016_01_mosaic/gmap/${level}/${col}/${row}.png"
      const slippyUrl = value.replace(/{TileRow}/, '${row}').replace(/{TileCol}/, '${col}').replace(/{TileMatrix}/, '${level}');
      const planetBasemap = new WebTiledLayer(slippyUrl, {
        id: KEYS.planetBasemap,
        visible: true
      });
      // app.map.setBasemap(app.map.getBasemap());
      app.map.addLayer(planetBasemap, 3);
    } else {
      // Hide all other basemaps
      landsatLayer = app.map.getLayer(KEYS.landsat8);
      planetLayer = app.map.getLayer(KEYS.planetBasemap);
      layer = app.map.getLayer(KEYS.wriBasemap);
      labelLayer = app.map.getLayer(KEYS.wriBasemapLabel);
      if (landsatLayer) { landsatLayer.hide(); }
      if (planetLayer) { planetLayer.hide(); }
      if (layer) { layer.hide(); }
      if (labelLayer) { labelLayer.hide(); }
      // Show the correct basemap
      app.map.setBasemap(basemap);
    }
  }

  centerAndZoomLatLng (lat, lng, zoomLevel) {
    app.map.centerAndZoom(new Point(lng, lat), zoomLevel);
  }

  setCalendar (footprints) {
    this.dispatch(footprints);
  }

  updateOverlays(overlays) {
    this.dispatch(overlays);
  }

  reset () {
    app.debug('MapActions >>> reset');
    // Reset the Store, this will also reset layers, layer definitions, and all React components
    alt.recycle();
    // Reset the Canopy Density slider
    var slider = $('#tree-cover-slider').data('ionRangeSlider');
    if (slider) { slider.reset(); }
    //- Reset Esris Search Dijit and clear any graphics
    app.map.graphics.clear();
    //- Reset the Map to its original zoom and location
    app.map.centerAndZoom(mapConfig.options.center, mapConfig.options.zoom);
  }

  toggleImageryVisible(bool) {
    return bool;
  }

}

export const mapActions = alt.createActions(MapActions);
