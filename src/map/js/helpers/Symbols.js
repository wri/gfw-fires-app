import PictureMarkerSymbol from 'esri/symbols/PictureMarkerSymbol';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import {symbolConfig} from 'js/config';
import KEYS from 'js/constants';
import Color from 'esri/Color';

let watershedDefaultSymbol,
    svgMarkerSymbol,
    bbSymbol,
    pointSymbol;

const Symbols = {
  getBBSymbol: () => {
    if (bbSymbol) { return bbSymbol; }
    bbSymbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(symbolConfig.bbSymbol), 2),
      new Color([0, 255, 0, 0])
    );
    return bbSymbol;
  },

  getWatershedDefaultSymbol: () => {
    if (watershedDefaultSymbol) { return watershedDefaultSymbol; }
    // Get a reference to the default symbol for this layer
    let watershedLayer = app.map.getLayer(KEYS.watershed);
    watershedDefaultSymbol = watershedLayer.renderer.getSymbol();
    return watershedDefaultSymbol;
  },

  getSVGPointSymbol: () => {
    if (svgMarkerSymbol) { return svgMarkerSymbol; }
    svgMarkerSymbol = new SimpleMarkerSymbol();
    svgMarkerSymbol.setPath(symbolConfig.svgPath);
    svgMarkerSymbol.setColor(new Color(symbolConfig.gfwBlue));
    svgMarkerSymbol.setOutline(null);
    svgMarkerSymbol.setSize(24);
    return svgMarkerSymbol;
  },

  getPointSymbol: () => {
    if (pointSymbol) { return pointSymbol; }
    pointSymbol = new PictureMarkerSymbol({
      url: symbolConfig.pointUrl,
      xoffset: 6,
      yoffset: 6,
      height: 27, //approx 36px
      width: 27
    });
    return pointSymbol;
  }

};

export { Symbols as default };
