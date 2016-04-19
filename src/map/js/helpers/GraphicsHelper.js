import Polygon from 'esri/geometry/Polygon';
import Point from 'esri/geometry/Point';
import Symbols from 'helpers/Symbols';
import Graphic from 'esri/graphic';
import KEYS from 'js/constants';

const graphicsHelper = {
  /**
  * Add a feature to the map for the purpose of showing an active watershed for analysis
  * @param {Graphic} feature - Esri Feature object returned from a query
  */
  addActiveWatershed: feature => {
    console.log(feature);
    let layer = app.map.getLayer(KEYS.watershedAnalysis);
    if (layer) {
      layer.add(new Graphic(
        feature.geometry,
        Symbols.getWatershedHoverSymbol(),
        feature.attributes
      ));
    }
  },

  /**
  * Add upstream watershed to the map
  * @param {Feature} feature - Esri feature returned from GeoProcessor.submitJob
  */
  addUpstreamGraphic: feature => {
    let layer = app.map.getLayer(KEYS.customAnalysis);
    if (layer) {
      layer.add(new Graphic(
        feature.geometry,
        Symbols.getUpstreamSymbol(),
        feature.attributes
      ));
    }
  },

  /**
  * Add a point to the map from the draw tool or lat long tool, this is for CustomArea Analysis ONLY
  * @param {object} geometry - Esri Point geometry
  */
  addCustomPoint: geometry => {
    let layer = app.map.getLayer(KEYS.customAnalysis);
    if (layer) {
      layer.add(new Graphic(
        geometry,
        Symbols.getSVGPointSymbol()
      ));
    }
  },

  /**
  * Generate a point from the lat/lon inputs, or any valid lat/lon
  * @param {number} lat - Valid latitude between -90 and 90
  * @param {number} lon - Valid longitude between -180 and 180
  * @return {point} point - return an esri point object that can be used for future methods
  */
  generatePointFromLatLng: (lat, lon) => {
    return new Point(lon, lat);
  },

  /**
  * Generate a Graphic from the provided feature JSON
  * @param {object} feature - must have geometry and should have attributes
  * @return {Graphic} - return an Esri Graphic object that can be used for future methods
  */
  makePolygon: feature => {
    if (!feature.geometry.spatialReference) { feature.geometry.spatialReference = { wkid: 102100 }; }
    return new Graphic(
      new Polygon(feature.geometry),
      null, //- No symbol necessary
      feature.attributes || {}
    );
  },

  /**
  * Generate a Graphic from the provided feature JSON
  * @param {object} feature - must have geometry and should have attributes
  * @return {Graphic} - return an Esri Graphic object that can be used for future methods
  */
  makePoint: (geometry, attributes) => {
    return new Graphic(
      new Point(geometry),
      Symbols.getSVGPointSymbol(),
      attributes || null
    );
  },

  /**
  * Clear features from the custom analysis graphics layer
  */
  clearCustomAreas () {
    let layer = app.map.getLayer(KEYS.customAnalysis);
    if (layer) { layer.clear(); }
  },

  /**
  * Clear all features from the map
  * TODO: May be able to delete this as this may not be necessary
  */
  clearFeatures () {
    app.map.graphics.clear();
  }

};

export { graphicsHelper as default };
