import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import Color from 'esri/Color';

let customSymbol;

export default {

  getCustomSymbol: () => {
    if (customSymbol) { return customSymbol; }
    customSymbol = new SimpleFillSymbol(
      SimpleLineSymbol.STYLE_SOLID,
      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([3, 188, 255]), 3),
      new Color([210, 210, 210, 0.0])
    );
    return customSymbol;
  }

};
