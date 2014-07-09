/* global define, document, alert, window */
define([
    "dojo/on",
    "dojo/dom",
    "dojo/query",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/_base/array",
    "dojo/_base/fx",
    "esri/map",
    "esri/config",
    "esri/dijit/HomeButton",
    "esri/dijit/BasemapGallery",
    "esri/dijit/Basemap",
    "esri/dijit/BasemapLayer",
    "esri/dijit/LocateButton",
    "esri/dijit/Geocoder",
    "esri/dijit/Legend",
    "esri/dijit/Scalebar",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/ArcGISImageServiceLayer",
    "esri/layers/ImageParameters",
    "esri/layers/FeatureLayer",
    "esri/InfoTemplate",
    "esri/graphic",
    "esri/urlUtils",
    "dijit/registry",
    "views/map/MapConfig",
    "views/map/MapModel",
    "views/map/LayerController",
    "views/map/WindyController",
    "views/map/Finder",
    "utils/DijitFactory",
    "modules/EventsController",
    "esri/layers/WMTSLayerInfo",
    "esri/layers/WMTSLayer",
    "esri/request",
    "views/map/CustomWMTSLayer"
], function(on, dom, dojoQuery, domConstruct, domClass, arrayUtils, Fx, Map, esriConfig, HomeButton, BasemapGallery, Basemap, BasemapLayer, Locator,
    Geocoder, Legend, Scalebar, ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, ImageParameters, FeatureLayer, InfoTemplate, Graphic, urlUtils, 
    registry, MapConfig, MapModel, LayerController, WindyController, Finder, DijitFactory, EventsController, WMTSLayerInfo, WMTSLayer, esriRequest, CustomWMTSLayer) {

    var o = {},
        initialized = false,
        view = {
            viewId: "mapView",
            viewName: "map"
        };

    o.init = function() {
        var that = this;
        if (initialized) {
            //switch to this view
            o.map.resize();
            EventsController.switchToView(view);
            return;
        }

        initialized = true;
        //otherwise load the view
        require(["dojo/text!views/map/map.html", "dojo/ready"], function(html, ready) {
            dom.byId(view.viewId).innerHTML = html;
            EventsController.switchToView(view);
            ready(function() { // Ensure the map loads to correct size by not loading too early
                MapModel.applyBindings("map-view");
                // Initialize addthis since it was loaded asynchronously
                addthis.init();
                that.addConfigurations();
                that.createMap();
            });
        });
    };

    o.addConfigurations = function() {

        var proxies = MapConfig.proxies;

        var url = document.location.href;
        var proxyUrl = "/proxy/proxy.ashx";

        for (var domain in proxies) {

            if (url.indexOf(domain) === 0) {
                proxyUrl = proxies[domain];
            }
        }

        // Rule to Test Digital Globe Fires Url
        // urlUtils.addProxyRule({
        //     urlPrefix: 'https://services.digitalglobe.com/',
        //     proxyUrl: 'http://rmbp/proxy/dg_proxy.php'
        // });

        urlUtils.addProxyRule({
            urlPrefix: MapConfig.landsat8.prefix,
            proxyUrl: proxyUrl
        });

        urlUtils.addProxyRule({
            urlPrefix: MapConfig.windData.prefix,
            proxyUrl: proxyUrl
        });

    };

    o.createMap = function() {
        var self = this;
        // Add in dark gray basemap
        // esriConfig.defaults.map.basemaps.darkgray = {
        //     baseMapLayers: [
        //         {url: MapConfig.mapOptions.darkGrayCanvas}
        //     ],
        //     title: "Dark Gray"
        // };

        // Add Dojo Dijits to Control Map Options
        DijitFactory.buildDijits(MapConfig.accordionDijits);

        o.map = new Map("map", {
            center: MapConfig.mapOptions.center,
            basemap: MapConfig.mapOptions.basemap,
            zoom: MapConfig.mapOptions.initalZoom,
            minZoom: MapConfig.mapOptions.minZoom,
            sliderPosition: MapConfig.mapOptions.sliderPosition
        });

        o.map.on("load", function() {
            // Clear out default Esri Graphic at 0,0, dont know why its even there

            // Resize Accordion
            registry.byId("fires-map-accordion").resize();

            o.map.graphics.clear();
            WindyController.setMap(o.map);
            LayerController.setMap(o.map);
            Finder.setMap(o.map);
            self.addWidgets();
            self.bindEvents();
            self.addLayers();
            o.map.resize();
        });

    };

    o.addWidgets = function() {
        var basemaps = [],
            scalebar,
            darkgray,
            geocoder,
            locator,
            legend,
            home,
            bg;

        // Add Scalebar
        scalebar = new Scalebar({
            map: o.map,
            scalebarUnit: "metric"
        });

        // Add Home Button
        domConstruct.create("div", {
                'id': 'home-button',
                'class': 'home-butotn'
            },
            document.querySelector(".esriSimpleSliderIncrementButton"), "after");

        home = new HomeButton({
            map: o.map
        }, "home-button");
        home.startup();

        // Add Darkgray Canvas to Basemap Gallery, first create Basemap
        darkgray = new Basemap({
            layers: [
                new BasemapLayer({
                    url: MapConfig.mapOptions.darkGrayCanvas
                })
            ],
            title: "Dark Gray Canvas",
            thumbnailUrl: "app/images/darkGreyThumb.png"
        });
        basemaps.push(darkgray);

        bg = new BasemapGallery({
            map: o.map,
            basemaps: basemaps,
            showArcGISBasemaps: true
        }, "basemap-gallery");
        bg.startup();

        // Add Locator Widget
        locator = new Locator({
            map: o.map,
            highlightLocation: false
        }, "location-widget");
        locator.startup();

        // Add Geocoder Widget
        geocoder = new Geocoder({
            map: o.map
        }, "esri-geocoder-widget");
        geocoder.startup();

        // Add a Legend Widget
        legend = new Legend({
            map: o.map,
            layerInfos: [],
            autoUpdate: true
        }, "legend");
        legend.startup();

        // Add Listeners for Buttons to Activate Widgets
        var toggleLocatorWidgets = function() {
            // If basemap Gallery is Open, Close it
            if (MapModel.get('showBasemapGallery')) {
                MapModel.set('showBasemapGallery', false);
            }

            if (MapModel.get('showShareContainer')) {
                MapModel.set('showShareContainer', false);
            }

            MapModel.set('showLocatorWidgets', !MapModel.get('showLocatorWidgets'));
        };

        var toggleBasemapGallery = function() {
            // If Locator Widgets Panel is Open, Close it
            if (MapModel.get('showLocatorWidgets')) {
                MapModel.set('showLocatorWidgets', false);
            }

            if (MapModel.get('showShareContainer')) {
                MapModel.set('showShareContainer', false);
            }

            MapModel.set('showBasemapGallery', !MapModel.get('showBasemapGallery'));
        };


        var toggleShareContainer = function() {
            // If Locator Widgets Panel is Open, Close it
            if (MapModel.get('showLocatorWidgets')) {
                MapModel.set('showLocatorWidgets', false);
            }
            if (MapModel.get('showBasemapGallery')) {
                MapModel.set('showBasemapGallery', false);
            }

            MapModel.set('showShareContainer', !MapModel.get('showShareContainer'));
        };

        on(dom.byId("locator-widget-button"), "click", toggleLocatorWidgets);
        on(dom.byId("basemap-gallery-button"), "click", toggleBasemapGallery);
        on(dom.byId("share-button"), "click", toggleShareContainer);

    };

    o.bindEvents = function() {

        var self = this;

        on(dom.byId("dms-search"), "change", function(evt) {
            var checked = evt.target ? evt.target.checked : evt.srcElement.checked;
            if (checked) {
                MapModel.set('showDMSInputs', true);
                MapModel.set('showLatLongInputs', false);
            }
        });

        on(dom.byId("lat-long-search"), "change", function(evt) {
            var checked = evt.target ? evt.target.checked : evt.srcElement.checked;
            if (checked) {
                MapModel.set('showLatLongInputs', true);
                MapModel.set('showDMSInputs', false);
            }
        });

        on(o.map, "mouse-move", function(evt) {
            MapModel.set('currentLatitude', evt.mapPoint.getLatitude().toFixed(4));
            MapModel.set('currentLongitude', evt.mapPoint.getLongitude().toFixed(4));
        });

        on(o.map, "click", function(evt) {
            Finder.getActiveFiresInfoWindow(evt);
        });

        on(registry.byId("confidence-fires-checkbox"), "change", function(evt) {
            LayerController.updateFiresLayer(true);
        });

        on(registry.byId("twitter-conversations-checkbox"), "change", function(evt) {
            var value = registry.byId("twitter-conversations-checkbox").checked;
            LayerController.toggleLayerVisibility(MapConfig.tweetLayer.id, value);
        });

        on(registry.byId("fires-checkbox"), "change", function(evt) {
            var value = registry.byId("fires-checkbox").checked;
            LayerController.toggleLayerVisibility(MapConfig.firesLayer.id, value);
        });

        on(registry.byId("landsat-image-checkbox"), "change", function(evt) {
            var value = registry.byId("landsat-image-checkbox").checked;
            LayerController.toggleLayerVisibility(MapConfig.landsat8.id, value);
        });

        registry.byId("windy-layer-checkbox").on('change', function (checked) {
            WindyController.toggleWindLayer(checked);
        });

        registry.byId("digital-globe-checkbox").on('change', function (checked) {
            LayerController.toggleDigitalGlobeLayer(checked);
        });

        on(dom.byId("search-option-go-button"), "click", function() {
            Finder.searchAreaByCoordinates();
        });

        on(dom.byId("report-link"), "click", function() {
            var win = window.open('./app/js/views/report/report.html', 'Report', '');
        });

        on(dom.byId("clear-search-pins"), "click", this.clearSearchPins);
        on(dom.byId("legend-widget-title"), "click", this.toggleLegend);

        registry.byId("forest-transparency-slider").on('change', function(value) {
            LayerController.setTransparency(MapConfig.forestUseLayers.id, value);
        });

        registry.byId("land-cover-transparency-slider").on('change', function(value) {
            LayerController.setTransparency(MapConfig.landCoverLayers.id, value);
        });

        registry.byId("conservation-transparency-slider").on('change', function(value) {
            LayerController.setTransparency(MapConfig.conservationLayers.id, value);
        });

        dojoQuery(".active-fires-options").forEach(function(node) {
            on(node, "click", self.toggleFireOption.bind(self));
        });

        dojoQuery(".esriPopupWrapper").forEach(function(node) {
            domConstruct.create("div", {
                'id': 'close-icon',
                'class': 'close-icon'
            }, node);

            on(node, "click", function() {
                o.map.infoWindow.hide();
            });
        });

        dojoQuery("#forest-use-panel div.checkbox-container div input").forEach(function(node) {
            domClass.add(node, "forest-use-layers-option");
        });

        dojoQuery("#conservation-panel div.checkbox-container div input").forEach(function(node) {
            domClass.add(node, "conservation-layers-option");
        });

        dojoQuery("#land-cover-panel div.checkbox-container div input").forEach(function(node) {
            domClass.add(node, "land-cover-layers-option");
        });

        dojoQuery("#forest-use-panel div.checkbox-container div input").forEach(function(node) {
            on(node, "change", function() {
                //Params are, class to Query to find which layers are checked on or off, and config object for the layer
                LayerController.updateAdditionalVisibleLayers("forest-use-layers-option", MapConfig.forestUseLayers);
            });
        });

        dojoQuery(".conservation-layers-option").forEach(function(node) {
            on(node, "change", function() {
                //Params are, class to Query to find which layers are checked on or off, and config object for the layer
                LayerController.updateAdditionalVisibleLayers("conservation-layers-option", MapConfig.conservationLayers);
            });
        });

        dojoQuery(".land-cover-layers-option").forEach(function(node) {
            on(node, "change", function() {
                //Params are, class to Query to find which layers are checked on or off, and config object for the layer
                LayerController.updateAdditionalVisibleLayers("land-cover-layers-option", MapConfig.landCoverLayers);
            });
        });

    };

    o.addLayers = function() {

        var conservationParams,
            conservationLayer,
            digitalGlobeLayer,
            landCoverParams,
            landCoverLayer,
            forestUseParams,
            forestUseLayer,
            treeCoverLayer,
            landSatLayer,
            firesParams,
            firesLayer;

        conservationParams = new ImageParameters();
        conservationParams.format = "png32";
        conservationParams.layerIds = MapConfig.conservationLayers.defaultLayers;
        conservationParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        conservationLayer = new ArcGISDynamicMapServiceLayer(MapConfig.conservationLayers.url, {
            imageParameters: conservationParams,
            id: MapConfig.conservationLayers.id,
            visible: false
        });

        landCoverParams = new ImageParameters();
        landCoverParams.format = "png32";
        landCoverParams.layerIds = MapConfig.landCoverLayers.defaultLayers;
        landCoverParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        landCoverLayer = new ArcGISDynamicMapServiceLayer(MapConfig.landCoverLayers.url, {
            imageParameters: landCoverParams,
            id: MapConfig.landCoverLayers.id,
            visible: true
        });

        forestUseParams = new ImageParameters();
        forestUseParams.format = "png32";
        forestUseParams.layerIds = MapConfig.forestUseLayers.defaultLayers;
        forestUseParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        forestUseLayer = new ArcGISDynamicMapServiceLayer(MapConfig.forestUseLayers.url, {
            imageParameters: forestUseParams,
            id: MapConfig.forestUseLayers.id,
            visible: false
        });

        treeCoverLayer = new ArcGISImageServiceLayer(MapConfig.treeCoverLayer.url, {
            id: MapConfig.treeCoverLayer.id,
            visible: false
        });

        primaryForestsLayer = new ArcGISImageServiceLayer(MapConfig.primaryForestsLayer.url, {
            id: MapConfig.primaryForestsLayer.id,
            visible: false
        });

        landSatLayer = new ArcGISImageServiceLayer(MapConfig.landsat8.url, {
            id: MapConfig.landsat8.id,
            visible: false
        });

        digitalGlobeLayer = new ArcGISImageServiceLayer(MapConfig.digitalGlobe.url, {
            id: MapConfig.digitalGlobe.id,
            visible: false
        });

        firesParams = new ImageParameters();
        firesParams.format = "png32";
        firesParams.layerIds = MapConfig.firesLayer.defaultLayers;
        firesParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        firesLayer = new ArcGISDynamicMapServiceLayer(MapConfig.firesLayer.url, {
            imageParameters: firesParams,
            id: MapConfig.firesLayer.id,
            visible: true
        });

        var tweet_infotemplate = new InfoTemplate();
        tweet_infotemplate.setContent(Finder.getFireTweetsInfoWindow);

        tweetLayer = new FeatureLayer(MapConfig.tweetLayer.url, {
            mode: FeatureLayer.MODE_ONDEMAND,
            id: MapConfig.tweetLayer.id,
            visible: false,
            outFields: ["*"],
            infoTemplate: tweet_infotemplate
        });

        o.map.addLayers([
            treeCoverLayer,
            landSatLayer,
            landCoverLayer,
            primaryForestsLayer,
            forestUseLayer,
            conservationLayer,
            digitalGlobeLayer,
            firesLayer,
            tweetLayer
        ]);

        // Update the Legend when all layers are added
        on.once(o.map, 'layers-add-result', function(response) {
            var layerInfos = arrayUtils.map(response.layers, function(item) {
                return {
                    layer: item.layer
                };
            });
            layerInfos = arrayUtils.filter(layerInfos, function(item) {
                return item.layer.url.search('ImageServer') < 0;
            });
            registry.byId("legend").refresh(layerInfos);
        });

        landSatLayer.on('error', this.layerAddError);
        treeCoverLayer.on('error', this.layerAddError);
        conservationLayer.on('error', this.layerAddError);
        landCoverLayer.on('error', this.layerAddError);
        forestUseLayer.on('error', this.layerAddError);
        firesLayer.on('error', this.layerAddError);


        // TESTING
        // var test = 'https://services.digitalglobe.com/earthservice/wmtsaccess?connectid=dec7c992-899b-4d85-99b9-8a60a0e6047f';

        // var info = new WMTSLayerInfo({
        //     identifier: 'DigitalGlobe:ImageryTileService',
        //     tileMatrixSet: 'EPSG: 4326', //EPSG:3857:11
        //     format: 'image/jpeg',
        //     style: "_null"
        // });

        // WMTSLayer.prototype._getCapabilities = function () {
        //   esriRequest.setRequestPreCallback(function (ioArgs) {
        //     if (ioArgs.url.search('WMTSCapabilities.xml') > -1) {
        //       //ioArgs.url = 'https://services.digitalglobe.com/earthservice/wmtsaccess/1.0.0/WMTSCapabilities.xml?connectid=dec7c992-899b-4d85-99b9-8a60a0e6047f&REQUEST=GetCapabilities';
        //     }
        //     return ioArgs;
        //   });
        //   var self = this;
        //   esriRequest({
        //       url: 'https://services.digitalglobe.com/earthservice/wmtsaccess/1.0.0/WMTSCapabilities.xml?connectid=dec7c992-899b-4d85-99b9-8a60a0e6047f&REQUEST=GetCapabilities',
        //       handleAs: "text",
        //       load: function () {
        //         console.dir(arguments);
        //         self._parseCapabilities(arguments);
        //       },
        //       error: self._getCapabilitiesError
        //   }, {useProxy: false});
        // };

        // var WMTS = new WMTSLayer(test, {
        //     layerInfo: info
        // });

        // o.map.addLayer(WMTS);

        // WMTS.on('load', function () {
            
        // });

        // WMTS.on('error', function (err) {
        //     console.error(err);
        // });

    };

    o.layerAddError = function(evt) {
        require(["modules/ErrorController"], function(ErrorController) {
            ErrorController.show(10, "Error adding Layer : <br> " + evt.target.url);
        });
    };

    o.toggleFireOption = function(evt) {
        var node = evt.target ? evt.target : evt.srcElement;
        dojoQuery(".selected-fire-option").forEach(function(el) {
            domClass.remove(el, "selected-fire-option");
        });
        domClass.add(node, "selected-fire-option");
        LayerController.updateFiresLayer();
    };

    o.clearSearchPins = function() {
        o.map.graphics.clear();
        MapModel.set('showClearPinsOption', false);
    };

    o.toggleLegend = function() {
        var node = dom.byId("legend-widget-container"),
            height = node.offsetHeight - 2 === 200 ? 30 : 200; //added border, has to have - 2 to get correct height

        Fx.animateProperty({
            node: node,
            properties: {
                height: height
            },
            duration: 500
        }).play();

        if (height === 30) {
            domClass.add("legend-widget-title", "legend-closed");
        } else {
            domClass.remove("legend-widget-title", "legend-closed");
        }

    };

    return o;

});