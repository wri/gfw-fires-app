define(['exports', 'esri/layers/ArcGISDynamicMapServiceLayer', 'esri/layers/ArcGISTiledMapServiceLayer', 'esri/layers/ArcGISImageServiceLayer', 'esri/layers/ImageParameters', 'esri/layers/GraphicsLayer', 'esri/layers/FeatureLayer', 'js/layers/GFWImageryLayer', 'js/config', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/PictureMarkerSymbol', 'esri/layers/LayerDrawingOptions', 'esri/renderers/SimpleRenderer'], function (exports, _ArcGISDynamicMapServiceLayer, _ArcGISTiledMapServiceLayer, _ArcGISImageServiceLayer, _ImageParameters, _GraphicsLayer, _FeatureLayer, _GFWImageryLayer, _config, _SimpleMarkerSymbol, _PictureMarkerSymbol, _LayerDrawingOptions, _SimpleRenderer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ArcGISDynamicMapServiceLayer2 = _interopRequireDefault(_ArcGISDynamicMapServiceLayer);

  var _ArcGISTiledMapServiceLayer2 = _interopRequireDefault(_ArcGISTiledMapServiceLayer);

  var _ArcGISImageServiceLayer2 = _interopRequireDefault(_ArcGISImageServiceLayer);

  var _ImageParameters2 = _interopRequireDefault(_ImageParameters);

  var _GraphicsLayer2 = _interopRequireDefault(_GraphicsLayer);

  var _FeatureLayer2 = _interopRequireDefault(_FeatureLayer);

  var _GFWImageryLayer2 = _interopRequireDefault(_GFWImageryLayer);

  var _SimpleMarkerSymbol2 = _interopRequireDefault(_SimpleMarkerSymbol);

  var _PictureMarkerSymbol2 = _interopRequireDefault(_PictureMarkerSymbol);

  var _LayerDrawingOptions2 = _interopRequireDefault(_LayerDrawingOptions);

  var _SimpleRenderer2 = _interopRequireDefault(_SimpleRenderer);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = function (layer) {
    if (!layer.url && layer.type !== 'graphic' && layer.type !== 'feature' || !layer.type) {
      throw new Error(_config.errors.missingLayerConfig);
    }

    var esriLayer = void 0,
        options = {};

    switch (layer.type) {
      case 'tiled':
        options.id = layer.id;
        options.visible = layer.visible || false;
        esriLayer = new _ArcGISTiledMapServiceLayer2.default(layer.url, options);
        break;
      case 'image':
        options.id = layer.id;
        options.visible = layer.visible || false;
        options.opacity = layer.opacity || 1;
        options.maxScale = layer.maxScale || null;
        options.minScale = layer.minScale || null;
        esriLayer = new _ArcGISImageServiceLayer2.default(layer.url, options);
        if (layer.definitionExpression) {
          esriLayer.setDefinitionExpression(layer.definitionExpression);
        }
        break;
      case 'wind':
        break;
      case 'dynamic':
        // Create some image parameters
        var imageParameters = new _ImageParameters2.default();
        imageParameters.layerOption = _ImageParameters2.default.LAYER_OPTION_SHOW;
        imageParameters.layerIds = layer.layerIds;
        imageParameters.format = 'png32';
        if (layer.defaultDefinitionExpression) {
          var layerDefs = [];

          layer.layerIds.forEach(function (val) {
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
        esriLayer = new _ArcGISDynamicMapServiceLayer2.default(layer.url, options);
        if (layer.id === 'viirsFires' || layer.id === 'activeFires') {
          // These two layers get firefly points placed on them.
          // We use the 3.X API's `setLayerDrawingOptions()` to override the respective layers.

          var layerDrawingOptions = [];
          var layerDrawingOption = new _LayerDrawingOptions2.default();

          // More colors available here: https://www.esri.com/arcgis-blog/products/arcgis-living-atlas/mapping/whats-new-in-arcgis-online-firefly/
          var imageUrl = layer.id === 'viirsFires' ? // 'https://static.arcgis.com/images/Symbols/Firefly/FireflyD20.png' :
          // 'https://static.arcgis.com/images/Symbols/Firefly/FireflyC20.png';
          'http://gis-gfw.wri.org/FireflyD20.png' : 'http://gis-gfw.wri.org/FireflyC20.png';

          var symbol = new _PictureMarkerSymbol2.default(imageUrl, 16, 16);

          layerDrawingOption.renderer = new _SimpleRenderer2.default(symbol);
          layerDrawingOptions[layer.layerIds[0]] = layerDrawingOption;
          esriLayer.setLayerDrawingOptions(layerDrawingOptions);
        }
        break;
      case 'feature':
        options.id = layer.id;
        options.visible = layer.visible || false;
        options.definitionExpression = layer.defaultDefinitionExpression || '';
        if (layer.url) {
          esriLayer = new _FeatureLayer2.default(layer.url + '/' + layer.layerIds[0], options);

          var simpleJSON = {
            type: 'simple',
            label: '',
            description: ''
          };

          var _imageUrl = void 0;
          if (layer.id === 'viirsFires') {
            _imageUrl = 'https://static.arcgis.com/images/Symbols/Firefly/FireflyD20.png'; // "http://gis-gfw.wri.org/FireflyD20.png"
          } else if (layer.id === 'activeFires') {
            _imageUrl = 'https://static.arcgis.com/images/Symbols/Firefly/FireflyC20.png'; // "http://gis-gfw.wri.org/FireflyC20.png";
          }

          simpleJSON.symbol = new _PictureMarkerSymbol2.default(_imageUrl, 16, 16);

          esriLayer.renderer = new _SimpleRenderer2.default(simpleJSON);
        } else {
          var featureCollection = {
            layerDefinition: layer.layerDefinition,
            featureSet: null
          };
          esriLayer = new _FeatureLayer2.default(featureCollection, options);
        }
        break;
      case 'graphic':
        options.id = layer.id;
        options.visible = layer.visible || false;
        esriLayer = new _GraphicsLayer2.default(options);
        break;
      case 'imagery':
        options.id = layer.id;
        options.url = layer.url;
        options.visible = false;
        esriLayer = new _GFWImageryLayer2.default(options);
        esriLayer.order = layer.order;
        break;
      default:
        throw new Error(_config.errors.incorrectLayerConfig(layer.type));
    }

    return esriLayer;
  };
});