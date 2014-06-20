/* global define, document */
define([
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "esri/map",
    "esri/config",
    "esri/dijit/HomeButton",
    "dijit/registry",
    "views/map/MapConfig",
    "views/map/MapModel",
    "modules/HashController"
], function(on, dom, domConstruct, Map, esriConfig, HomeButton, registry, MapConfig, MapModel, HashController) {

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
            esriConfig.defaults.map.basemaps.darkgray = {
                baseMapLayers: [
                    {url: "http://tiles4.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Dark_Gray_Base_Beta/MapServer"}
                ],
                title: "Dark Gray"
            };


            map = new Map("map", {
                basemap: "gray",
                zoom: MapConfig.initalZoom,
                sliderPosition: 'top-right'
            });

            map.on("load", function () {
                self.addWidgets();
            });

        };

        o.addWidgets = function () {
            // Add Home Button
            domConstruct.create("div",{'id': 'home-button', 'class': 'home-butotn'},
                                    document.querySelector(".esriSimpleSliderIncrementButton"), "after");
            var home = new HomeButton({
                map: map
            }, "home-button");
            home.startup();

            

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