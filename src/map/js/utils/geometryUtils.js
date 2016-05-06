import Polygon from 'esri/geometry/Polygon';
import symbols from 'utils/symbols';
import Graphic from 'esri/graphic';

//- Really crappy UUID generator but it works
let cfid = 0;
const customFeatureUUIDGenerator = () => ++cfid;

export default {

  /**
  * @param {object} geometry - Valid esri grometry from the draw tool, any valid polygon geo would work
  * @return {Graphic}
  */
  generateDrawnPolygon: (geometry) => {
    return new Graphic(
      new Polygon(geometry),
      symbols.getCustomSymbol(),
      { OBJECTID: customFeatureUUIDGenerator() }
    );
  },

  /**
  * This currently only supports polygon uploads
  * @param {object} - featureCollection - Feature Collection returned from Esri's generate features API
  * @return {array<Graphic>}
  */
  generatePolygonsFromUpload: (featureCollection) => {
    let graphics = [];
    // Create an array of features from all the layers and feature sets
    featureCollection.layers.forEach((layer) => {
      let {featureSet} = layer;
      featureSet.features.forEach((feature) => {
        graphics.push(new Graphic(
          new Polygon(feature.geometry),
          symbols.getCustomSymbol(),
          feature.attributes
        ));
      });
    });

    return graphics;
  }

};
