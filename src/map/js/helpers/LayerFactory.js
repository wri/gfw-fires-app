import DynamicLayer from 'esri/layers/ArcGISDynamicMapServiceLayer';
import TiledLayer from 'esri/layers/ArcGISTiledMapServiceLayer';
import ImageLayer from 'esri/layers/ArcGISImageServiceLayer';
import ImageParameters from 'esri/layers/ImageParameters';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import FeatureLayer from 'esri/layers/FeatureLayer';
import PictureMarkerSymbol from 'esri/symbols/PictureMarkerSymbol';
import LayerDrawingOptions from 'esri/layers/LayerDrawingOptions';
import SimpleRenderer from 'esri/renderers/SimpleRenderer';
import WMSLayer from 'esri/layers/WMSLayer';
import {errors} from 'js/config';

/**
* Map Function that gets called for each entry in the provided layers config and returns an array of ArcGIS Layers
* @param {object} layer - Layer Config object, see the layersConfig object in js/map/config.js for example
* @return {Layer} esriLayer - Some sort of esri layer, current types are:
*   - ArcGISDynamicMapServiceLayer
*   - ArcGISTiledMapServiceLayer
*   - ArcGISImageServiceLayer
*   - FeatureLayer
*/
export default (layer) => {
  if ((!layer.url && (layer.type !== 'graphic' && layer.type !== 'feature')) || !layer.type) { throw new Error(errors.missingLayerConfig); }

  let esriLayer, options = {};
  console.log('inside layerfactory', layer);
  switch (layer.type) {
    case 'tiled':
      options.id = layer.id;
      options.visible = layer.visible || false;
      esriLayer = new TiledLayer(layer.url, options);
      break;
    case 'image':
      options.id = layer.id;
      options.visible = layer.visible || false;
      options.opacity = layer.opacity || 1;
      options.maxScale = layer.maxScale || null;
      options.minScale = layer.minScale || null;
      esriLayer = new ImageLayer(layer.url, options);
      break;
    case 'wind':
      break;
    case 'dynamic':
      // Create some image parameters
      let imageParameters = new ImageParameters();
      imageParameters.layerOption = ImageParameters.LAYER_OPTION_SHOW;
      imageParameters.layerIds = layer.layerIds;
      imageParameters.format = 'png32';
      if (layer.defaultDefinitionExpression) {
        let layerDefs = [];
        // layerDefs[layer.layerIds[0]] = layer.defaultDefinitionExpression;
        // imageParameters.layerDefinitions = layerDefs;

        layer.layerIds.forEach(val => {
          layerDefs[val] = layer.defaultDefinitionExpression;
        });
        imageParameters.layerDefinitions = layerDefs;
      }
      // Populate the options and then add the layer
      options.id = layer.id;
      options.visible = layer.visible || false;
      options.opacity = layer.opacity || 1.0;
      options.maxScale = layer.maxScale; // || 1.0;
      options.minScale = layer.minScale; // || 1.0;
      options.imageParameters = imageParameters;
      esriLayer = new DynamicLayer(layer.url, options);
      if (layer.id === 'fireFly') {
        const layerDrawingOptions = [];
        const layerDrawingOption = new LayerDrawingOptions();
        const symbol = new PictureMarkerSymbol(
          'https://static.arcgis.com/images/Symbols/Firefly/FireflyB20.png', 20, 20
        );
        layerDrawingOption.renderer = new SimpleRenderer(symbol);
        layerDrawingOptions[21] = layerDrawingOption;
        esriLayer.setLayerDrawingOptions(layerDrawingOptions);
      }
      break;
    case 'feature':
      options.id = layer.id;
      options.visible = layer.visible || false;
      options.definitionExpression = layer.defaultDefinitionExpression || '';

      if (layer.url) {
        esriLayer = new FeatureLayer(layer.url + '/' + layer.layerIds[0], options);
      } else {
        let featureCollection = {
          layerDefinition: layer.layerDefinition,
          featureSet: null
        };
        esriLayer = new FeatureLayer(featureCollection, options);
        if (layer.renderer) {
          esriLayer.setRenderer(layer.renderer);
        }
      }
      break;
    case 'graphic':
      options.id = layer.id;
      options.visible = layer.visible || false;
      esriLayer = new GraphicsLayer(options);
      break;
    case 'firefly':
      options.id = layer.id;
      options.visible = layer.visible || false;
      options.definitionExpression = layer.defaultDefinitionExpression || '';
      
      var renderer = new SimpleRenderer(symbol);
      esriLayer = new FeatureLayer(layer.url + '/' + layer.layerIds[0], options);
      esriLayer.setRenderer(renderer);
      break;
    default:
      throw new Error(errors.incorrectLayerConfig(layer.type));
  }

  return esriLayer;
};
