/* global define, window */
define([
	"dojo/dom",
	"dojo/ready",
	"dojo/Deferred",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/promise/all",
	"esri/map",
	"esri/Color",
	"esri/layers/ImageParameters",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"esri/symbols/SimpleFillSymbol",
	"esri/tasks/AlgorithmicColorRamp",
	"esri/tasks/ClassBreaksDefinition",
	"esri/tasks/GenerateRendererParameters",
	"esri/layers/LayerDrawingOptions",
	"esri/tasks/GenerateRendererTask",
	"views/map/MapConfig"
], function (dom, ready, Deferred, domStyle, domClass, all, Map, Color, ImageParameters, ArcGISDynamicLayer, SimpleFillSymbol, 
						 AlgorithmicColorRamp, ClassBreaksDefinition, GenerateRendererParameters, LayerDrawingOptions, GenerateRendererTask, MapConfig) {

	var PRINT_CONFIG = {
		zoom: 5,
		basemap: 'gray',
		slider: false,
		mapcenter: [100, -1.2],
		districtLayer: {
			url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
			id: 'district-bounds',
			defaultLayers: [4],
			layerId: 4,
			classBreaksField: 'fire_count',
			classBreaksMethod: 'natural-breaks',
			breakCount: 5,
			fromHex: "#fcddd1",
			toHex: "#930016"
		}
	};

	return {

		init: function () {
			var self = this;
			ready(function () {
				self.showReport();
				all([
					self.buildFiresMap(),
					self.buildDistrictFiresMap()
				]).then(function (res) {
					console.log("Printing");
				});
			});
		},

		buildFiresMap: function () {
			var deferred = new Deferred(),
					fireParams,
					fireLayer,
					map;

			map = new Map("simple-fires-map", {
				basemap: PRINT_CONFIG.basemap,
        zoom: PRINT_CONFIG.zoom,
        center: PRINT_CONFIG.mapcenter,
        slider: PRINT_CONFIG.slider
			});

			fireParams = new ImageParameters();
      fireParams.format = "png32";
      fireParams.layerIds = MapConfig.firesLayer.defaultLayers;
      fireParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

      fireLayer = new ArcGISDynamicLayer(MapConfig.firesLayer.url, {
          imageParameters: fireParams,
          id: MapConfig.firesLayer.id,
          visible: true
      });

			map.addLayer(fireLayer);

			map.on('load', function () {
				map.disableMapNavigation();
			});

			fireLayer.on('load', function () {
				deferred.resolve(true);
			});

			return deferred.promise;
		},

		buildDistrictFiresMap: function () {
			var deferred = new Deferred(),
					options = [],
					districtFiresParams,
					districtFiresLayer,
					generateParams,
					generateTask,
					colorRamp,
					classDef,
					renderer,
					ldos,
					map;

			map = new Map("district-fires-map", {
				basemap: PRINT_CONFIG.basemap,
        zoom: PRINT_CONFIG.zoom,
        center: PRINT_CONFIG.mapcenter,
        slider: PRINT_CONFIG.slider
			});

			districtFiresParams = new ImageParameters();
      districtFiresParams.format = "png32";
      districtFiresParams.layerIds = PRINT_CONFIG.districtLayer.defaultLayers;
      districtFiresParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

      districtFiresLayer = new ArcGISDynamicLayer(PRINT_CONFIG.districtLayer.url, {
          imageParameters: districtFiresParams,
          id: PRINT_CONFIG.districtLayer.id,
          visible: true
      });

      classDef = new ClassBreaksDefinition();
      classDef.classificationField = PRINT_CONFIG.districtLayer.classBreaksField;
      classDef.classificationMethod = PRINT_CONFIG.districtLayer.classBreaksMethod;
      classDef.breakCount = PRINT_CONFIG.districtLayer.breakCount;
      classDef.baseSymbol = new SimpleFillSymbol();

      colorRamp = new AlgorithmicColorRamp();
      colorRamp.fromColor = Color.fromHex(PRINT_CONFIG.districtLayer.fromHex);
      colorRamp.toColor = Color.fromHex(PRINT_CONFIG.districtLayer.toHex);
      colorRamp.algorithm = "hsv";
      classDef.colorRamp = colorRamp;

      generateParams = new GenerateRendererParameters();
      generateParams.classificationDefinition = classDef;

      renderer = new GenerateRendererTask(PRINT_CONFIG.districtLayer.url + "/" + PRINT_CONFIG.districtLayer.layerId);
      renderer.execute(generateParams, function (customRenderer) {
      	ldos = new LayerDrawingOptions();
      	ldos.renderer = customRenderer;
      	options[PRINT_CONFIG.districtLayer.layerId] = ldos;
      	districtFiresLayer.setLayerDrawingOptions(options);
      	map.addLayer(districtFiresLayer);
      	districtFiresLayer.on('update-end', function () {
      		console.log('Updating');
      	});
      	districtFiresLayer.on('load', function () {
      		console.log('Loaded');
      	});
      	deferred.resolve(true);
      }, function () {
      	deferred.resolve(true);
      });

			map.on('load', function () {
				map.disableMapNavigation();
			});

			return deferred.promise;
		},

		showReport: function () {
			domStyle.set("loading-screen","display","none");
			domStyle.set("report","display","block");
		}

	};

});