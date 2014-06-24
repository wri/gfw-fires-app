/* global define, document, alert */
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
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/ArcGISImageServiceLayer",
    "esri/layers/ImageParameters",
    "esri/graphic",
    "esri/urlUtils",
    "dijit/registry",
    "views/map/MapConfig",
    "views/map/MapModel",
    "views/map/LayerController",
    "views/map/Finder",
    "utils/DijitFactory",
    "modules/EventsController"
], function(on, dom, dojoQuery, domConstruct, domClass, arrayUtils, Fx, Map, esriConfig, HomeButton, BasemapGallery, Basemap, BasemapLayer, Locator, 
            Geocoder, Legend, ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, ImageParameters, Graphic, urlUtils, registry, MapConfig, MapModel, 
            LayerController, Finder, DijitFactory, EventsController) {

        var o = {},
            initialized = false,
            view = {
                viewName: "mapView"
            };

        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                EventsController.switchToView(view);
                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/map/map.html"], function(html) {
                dom.byId(view.viewName).innerHTML = html;
                EventsController.switchToView(view);
                MapModel.applyBindings("map-view");
                that.addConfigurations();
                that.createMap();
            });
        };

        o.addConfigurations = function () {

            urlUtils.addProxyRule({
                urlPrefix: MapConfig.landsat8.prefix,
                proxyUrl: MapConfig.proxyUrl
            });

        };

        o.createMap = function () {
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
                basemap: MapConfig.mapOptions.basemap,
                zoom: MapConfig.mapOptions.initalZoom,
                center: MapConfig.mapOptions.center,
                sliderPosition: MapConfig.mapOptions.sliderPosition
            });

            o.map.on("load", function () {
                // Clear out default Esri Graphic at 0,0, dont know why its even there
                o.map.graphics.clear();
                LayerController.setMap(o.map);
                self.addWidgets();
                self.bindEvents();
                self.addLayers();
            });

        };

        o.addWidgets = function () {
            var basemaps = [],
                darkgray,
                geocoder,
                locator,
                home,
                bg;


            // Add Home Button
            domConstruct.create("div",{'id': 'home-button', 'class': 'home-butotn'},
                                    document.querySelector(".esriSimpleSliderIncrementButton"), "after");

            home = new HomeButton({
                map: o.map
            }, "home-button");
            home.startup();

            // Add Darkgray Canvas to Basemap Gallery, first create Basemap
            darkgray = new Basemap({
                layers: [
                    new BasemapLayer({url: MapConfig.mapOptions.darkGrayCanvas})
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

            // Add Listeners for Buttons to Activate Widgets
            var toggleLocatorWidgets = function () {
                // If basemap Gallery is Open, Close it
                if (MapModel.get('showBasemapGallery')) {
                    MapModel.set('showBasemapGallery', false);
                }
                MapModel.set('showLocatorWidgets', !MapModel.get('showLocatorWidgets'));
            };

            var toggleBasemapGallery = function () {
                // If Locator Widgets Panel is Open, Close it
                if (MapModel.get('showLocatorWidgets')) {
                    MapModel.set('showLocatorWidgets', false);
                }
                MapModel.set('showBasemapGallery', !MapModel.get('showBasemapGallery'));
            };

            on(dom.byId("locator-widget-button"), "click", toggleLocatorWidgets);
            on(dom.byId("basemap-gallery-button"), "click", toggleBasemapGallery);
            
        };

        o.bindEvents = function () {

            var self = this;

            on(dom.byId("dms-search"), "change", function (evt) {
                var checked = evt.target ? evt.target.checked : evt.srcElement.checked;
                if (checked) {
                    MapModel.set('showDMSInputs', true);
                    MapModel.set('showLatLongInputs', false);
                }
            });

            on(dom.byId("lat-long-search"), "change", function (evt) {
                var checked = evt.target ? evt.target.checked : evt.srcElement.checked;
                if (checked) {
                    MapModel.set('showLatLongInputs', true);
                    MapModel.set('showDMSInputs', false);
                }
            });

            on(dom.byId("confidence-fires-checkbox"), "change", function (evt) {
                LayerController.updateFiresLayer(true);
            });

            on(dom.byId("fires-checkbox"), "change", function (evt) {
                var value = evt.target ? evt.target.checked : evt.srcElement.checked;
                LayerController.toggleLayerVisibility(MapConfig.firesLayer.id, value);
            });

            on(dom.byId("landsat-image-checkbox"), "change", function (evt) {
                var value = evt.target ? evt.target.checked : evt.srcElement.checked;
                LayerController.toggleLayerVisibility(MapConfig.landsat8.id, value);
            });

            on(dom.byId("search-option-go-button"), "click", function () {
                Finder.searchAreaByCoordinates(o.map);
            });

            on(dom.byId("clear-search-pins"), "click", this.clearSearchPins);
            on(dom.byId("legend-widget-title"), "click", this.toggleLegend);
            on(dom.byId("twitter-conversations-checkbox"), "change", Finder.fetchTwitterData);


            dojoQuery(".active-fires-options").forEach(function (node) {
                on(node, "click", self.toggleFireOption.bind(self));
            });

            dojoQuery(".additional-layers-option").forEach(function (node) {
                on(node, "change", LayerController.updateAdditionalVisibleLayers.bind(LayerController));
            });

        };

        o.addLayers = function () {

            var additionalLayers,
                additionalParams,
                treeCoverLayer,
                landSatLayer,
                firesParams,
                firesLayer;

            additionalParams = new ImageParameters();
            additionalParams.format = "png32";
            additionalParams.layerIds = MapConfig.additionalLayers.defaultLayers;
            additionalParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

            additionalLayers = new ArcGISDynamicMapServiceLayer(MapConfig.additionalLayers.url, {
                imageParameters: additionalParams,
                id: MapConfig.additionalLayers.id,
                visible: false
            });

            treeCoverLayer = new ArcGISImageServiceLayer(MapConfig.treeCoverLayer.url, {
                id: MapConfig.treeCoverLayer.id,
                visible: false
            });

            landSatLayer = new ArcGISImageServiceLayer(MapConfig.landsat8.url, {
                id: MapConfig.landsat8.id,
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

            o.map.addLayers([
                treeCoverLayer,
                landSatLayer,
                additionalLayers,
                firesLayer
            ]);

            landSatLayer.onError = this.layerAddError;
            treeCoverLayer.onError = this.layerAddError;
            additionalLayers.onError = this.layerAddError;
            firesLayer.onError = this.layerAddError;

        };

        o.layerAddError = function (evt) {
            console.dir(evt);
            alert("Error adding Layer");
        };

        o.toggleFireOption = function (evt) {
            var node = evt.target ? evt.target : evt.srcElement;
            dojoQuery(".selected-fire-option").forEach(function (el) {
                domClass.remove(el, "selected-fire-option");
            });
            domClass.add(node, "selected-fire-option");
            LayerController.updateFiresLayer();
        };

        o.clearSearchPins = function () {
            o.map.graphics.clear();
            MapModel.set('showClearPinsOption', false);
        };

        o.toggleLegend = function () {
            var node = dom.byId("legend-widget-container"),
                height = node.offsetHeight === 200 ? 30 : 200;

            Fx.animateProperty({
                node: node,
                properties: {
                    height: height
                },
                duration: 500
            }).play();

        };

        return o;

    });