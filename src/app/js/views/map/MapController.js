/* global define, document */
define([
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "esri/map",
    "esri/config",
    "esri/dijit/HomeButton",
    "esri/dijit/BasemapGallery",
    "esri/dijit/Basemap",
    "esri/dijit/BasemapLayer",
    "esri/dijit/LocateButton",
    "dijit/registry",
    "views/map/MapConfig",
    "views/map/MapModel",
    "modules/HashController"
], function(on, dom, domConstruct, Map, esriConfig, HomeButton, BasemapGallery, Basemap, BasemapLayer, Locator, registry, MapConfig, MapModel, HashController) {

        var o = {},
            initialized = false,
            viewName = "mapView",
            map;




        o.init = function() {
            var that = this;
            if (initialized) {
                //switch to this view
                HashController.switchToView(viewName);
                return;
            }

            initialized = true;
            //otherwise load the view
            require(["dojo/text!views/map/map.html"], function(html) {
                dom.byId(viewName).innerHTML = html;
                HashController.switchToView(viewName);
                MapModel.applyBindings("map-view");
                that.createMap();
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


            map = new Map("map", {
                basemap: MapConfig.mapOptions.basemap,
                zoom: MapConfig.mapOptions.initalZoom,
                sliderPosition: 'top-right'
            });

            map.on("load", function () {
                self.addWidgets();
            });

        };

        o.addWidgets = function () {
            var basemaps = [],
                darkgray,
                locator,
                home,
                bg;


            // Add Home Button
            domConstruct.create("div",{'id': 'home-button', 'class': 'home-butotn'},
                                    document.querySelector(".esriSimpleSliderIncrementButton"), "after");

            home = new HomeButton({
                map: map
            }, "home-button");
            home.startup();

            // Add Darkgray Canvas to Basemap Gallery, first create Basemap
            darkgray = new Basemap({
                layers: [
                    new BasemapLayer({url: MapConfig.mapOptions.darkGrayCanvas})
                ],
                title: "Dark Gray Canvas",
                thumbnailUrl: ""
            });
            basemaps.push(darkgray);

            bg = new BasemapGallery({
                map: map,
                basemaps: basemaps,
                showArcGISBasemaps: true
            }, "basemap-gallery");
            bg.startup();

            // Add Locator Widget
            locator = new Locator({
              map: map,
              highlightLocation: false
            }, "location-widget");
            locator.startup();

            // Add Listeners for Buttons to Activate Widgets
            var toggleLocatorWidgets = function () {
                MapModel.set('showLocatorWidgets', !MapModel.get('showLocatorWidgets'));
            };

            var toggleBasemapGallery = function () {
                MapModel.set('showBasemapGallery', !MapModel.get('showBasemapGallery'));
            };

            on(dom.byId("locator-widget-button"), "click", toggleLocatorWidgets);
            on(dom.byId("basemap-gallery-button"), "click", toggleBasemapGallery);
            
        };

        //listen to key

        //trigger event 



        return o;


    });