import DynamicLayer from "esri/layers/ArcGISDynamicMapServiceLayer";
import TiledLayer from "esri/layers/ArcGISTiledMapServiceLayer";
import ImageLayer from "esri/layers/ArcGISImageServiceLayer";
import ImageParameters from "esri/layers/ImageParameters";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import FeatureLayer from "esri/layers/FeatureLayer";
import GFWImageryLayer from "js/layers/GFWImageryLayer";
import { errors } from "js/config";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import LayerDrawingOptions from "esri/layers/LayerDrawingOptions";
import SimpleRenderer from "esri/renderers/SimpleRenderer";

/**
 * Map Function that gets called for each entry in the provided layers config and returns an array of ArcGIS Layers
 * @param {object} layer - Layer Config object, see the layersConfig object in js/map/config.js for example
 * @return {Layer} esriLayer - Some sort of esri layer, current types are:
 *   - ArcGISDynamicMapServiceLayer
 *   - ArcGISTiledMapServiceLayer
 *   - ArcGISImageServiceLayer
 *   - FeatureLayer
 */
export default layer => {
  if (
    (!layer.url && layer.type !== "graphic" && layer.type !== "feature") ||
    !layer.type
  ) {
    throw new Error(errors.missingLayerConfig);
  }

  let esriLayer,
    options = {};

  switch (layer.type) {
    case "tiled":
      options.id = layer.id;
      options.visible = layer.visible || false;
      esriLayer = new TiledLayer(layer.url, options);
      break;
    case "image":
      options.id = layer.id;
      options.visible = layer.visible || false;
      options.opacity = layer.opacity || 1;
      options.maxScale = layer.maxScale || null;
      options.minScale = layer.minScale || null;
      esriLayer = new ImageLayer(layer.url, options);
      if (layer.definitionExpression) {
        esriLayer.setDefinitionExpression(layer.definitionExpression);
      }
      break;
    case "wind":
      break;
    case "dynamic":
      // Create some image parameters
      let imageParameters = new ImageParameters();
      imageParameters.layerOption = ImageParameters.LAYER_OPTION_SHOW;
      imageParameters.layerIds = layer.layerIds;
      imageParameters.format = "png32";
      if (layer.defaultDefinitionExpression) {
        let layerDefs = [];

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
      if (layer.id === "viirsFires" || layer.id === "activeFires") {
        // These two layers get firefly points placed on them.
        // We use the 3.X API's `setLayerDrawingOptions()` to override the respective layers.

        const layerDrawingOptions = [];
        const layerDrawingOption = new LayerDrawingOptions();

        // More colors available here: https://www.esri.com/arcgis-blog/products/arcgis-living-atlas/mapping/whats-new-in-arcgis-online-firefly/
        const imageUrl =
          layer.id === "viirsFires"
            ? // 'https://static.arcgis.com/images/Symbols/Firefly/FireflyD20.png' :
              // 'https://static.arcgis.com/images/Symbols/Firefly/FireflyC20.png';
              "http://gis-gfw.wri.org/FireflyD20.png"
            : "http://gis-gfw.wri.org/FireflyC20.png";

        const symbol = new PictureMarkerSymbol(imageUrl, 16, 16);

        layerDrawingOption.renderer = new SimpleRenderer(symbol);
        layerDrawingOptions[layer.layerIds[0]] = layerDrawingOption;
        esriLayer.setLayerDrawingOptions(layerDrawingOptions);
      }
      break;
    case "feature":
      options.id = layer.id;
      options.visible = layer.visible || false;
      options.definitionExpression = layer.defaultDefinitionExpression || "";
      if (layer.url) {
        // if (layer.id === "activeFires") {
        //   const simpleJson = {
        //     type: "simple",
        //     label: "",
        //     description: "",
        //     symbol: {
        //       color: [210, 105, 30, 191],
        //       size: 6,
        //       angle: 0,
        //       xoffset: 0,
        //       yoffset: 0,
        //       type: "esriSMS",
        //       style: "esriSMSCircle",
        //       outline: {
        //         color: [0, 0, 128, 255],
        //         width: 0,
        //         type: "esriSLS",
        //         style: "esriSLSSolid"
        //       }
        //     }
        //   };

        //   options.renderer = new SimpleRenderer(simpleJson);
        // } else if (layer.id === "viirsFires") {
        //   const simpleJson = {
        //     type: "simple",
        //     label: "",
        //     description: "",
        //     symbol: {
        //       color: [255, 255, 255, 1],
        //       size: 6,
        //       angle: 0,
        //       xoffset: 0,
        //       yoffset: 0,
        //       type: "esriSMS",
        //       style: "esriSMSCircle",
        //       outline: {
        //         color: [0, 0, 128, 255],
        //         width: 0,
        //         type: "esriSLS",
        //         style: "esriSLSSolid"
        //       }
        //     }
        //   };

        //   options.renderer = new SimpleRenderer(simpleJson);
        // }
        esriLayer = new FeatureLayer(
          layer.url + "/" + layer.layerIds[0],
          options
        );
        let simpleJson;
        if (layer.id === "activeFires") {
          simpleJson = {
            type: "simple",
            label: "",
            description: "",
            symbol: {
              color: [210, 105, 30, 191],
              size: 6,
              angle: 0,
              xoffset: 0,
              yoffset: 0,
              type: "esriSMS",
              style: "esriSMSCircle",
              outline: {
                color: [0, 0, 128, 255],
                width: 0,
                type: "esriSLS",
                style: "esriSLSSolid"
              }
            }
          };
        } else if (layer.id === "viirsFires") {
          simpleJson = {
            type: "simple",
            label: "",
            description: "",
            symbol: {
              color: [191, 30, 105, 210],
              size: 6,
              angle: 0,
              xoffset: 0,
              yoffset: 0,
              type: "esriSMS",
              style: "esriSMSCircle",
              outline: {
                color: [0, 0, 128, 255],
                width: 0,
                type: "esriSLS",
                style: "esriSLSSolid"
              }
            }
          };
          esriLayer.renderer = new SimpleRenderer(simpleJson);
        }
      } else {
        let featureCollection = {
          layerDefinition: layer.layerDefinition,
          featureSet: null
        };
        esriLayer = new FeatureLayer(featureCollection, options);
      }
      break;
    case "graphic":
      options.id = layer.id;
      options.visible = layer.visible || false;
      esriLayer = new GraphicsLayer(options);
      break;
    case "imagery":
      options.id = layer.id;
      options.url = layer.url;
      options.visible = false;
      esriLayer = new GFWImageryLayer(options);
      esriLayer.order = layer.order;
      break;
    default:
      throw new Error(errors.incorrectLayerConfig(layer.type));
  }

  return esriLayer;
};
