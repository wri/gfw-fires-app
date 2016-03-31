define(['exports', 'esri/layers/RasterFunction'], function (exports, _RasterFunction) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _RasterFunction2 = _interopRequireDefault(_RasterFunction);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = {

    /**
    * Generate a Colormap Raster Function that Remaps the data to the output values
    * @param {array} colormap - An Array of arrays representing the colormap, eg. [[1, 225, 225, 225]]
    * @param {array} inputRanges - [inclusive, exclusive], if your doing 1 - 3, should look like [1, 4]
    * @param {array} outputValues
    */
    getColormapRemap: function getColormapRemap(colormap, inputRanges, outputValues) {
      app.debug('rasterFunctions >>> getColormapRemap');
      return new _RasterFunction2.default({
        'rasterFunction': 'Colormap',
        'rasterFunctionArguments': {
          'Colormap': colormap,
          'Raster': {
            'rasterFunction': 'Remap',
            'rasterFunctionArguments': {
              'InputRanges': inputRanges,
              'OutputValues': outputValues,
              'AllowUnmatched': false
            }
          }
        },
        'variableName': 'Raster'
      });
    }

  };
});