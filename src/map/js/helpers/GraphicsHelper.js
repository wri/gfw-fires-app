import Symbols from 'helpers/Symbols';
import Graphic from 'esri/graphic';
import KEYS from 'js/constants';

const graphicsHelper = {

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
  }

};

export { graphicsHelper as default };
