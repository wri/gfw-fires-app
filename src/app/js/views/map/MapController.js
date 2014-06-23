/* global define, document, alert */
define([
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/_base/array",
    "esri/map",
    "esri/config",
    "esri/dijit/HomeButton",
    "esri/dijit/BasemapGallery",
    "esri/dijit/Basemap",
    "esri/dijit/BasemapLayer",
    "esri/dijit/LocateButton",
    "esri/symbols/PictureMarkerSymbol",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/graphic",
    "dijit/registry",
    "views/map/MapConfig",
    "views/map/MapModel",
    "modules/HashController"
], function(on, dom, domConstruct, arrayUtils, Map, esriConfig, HomeButton, BasemapGallery, Basemap, BasemapLayer, Locator, 
            PictureSymbol, Point, webMercatorUtils, Graphic, registry, MapConfig, MapModel, HashController) {

        var o = {},
            initialized = false,
            viewName = "mapView";




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

            o.map = new Map("map", {
                basemap: MapConfig.mapOptions.basemap,
                zoom: MapConfig.mapOptions.initalZoom,
                sliderPosition: 'top-right'
            });

            o.map.on("load", function () {
                // Clear out default Esri Graphic at 0,0, dont know why its even there
                o.map.graphics.clear();
                self.addWidgets();
                self.bindEvents();
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


            on(dom.byId("search-option-go-button"), "click", this.searchAreaByCoordinates);
            on(dom.byId("clear-search-pins"), "click", this.clearSearchPins);

        };

        o.searchAreaByCoordinates = function () {
            var values = {},
                latitude, longitude,
                invalidValue = false,
                invalidMessage = "You did not enter a valid value.  Please check that your location values are all filled in and nubmers only.",
                symbol = new PictureSymbol('app/images/RedStickPin.png', 32, 32),
                attributes = {},
                point,
                graphic,
                getValue = function (value) {
                    if (!invalidValue) {
                        invalidValue = isNaN(parseInt(value));
                    }
                    return isNaN(parseInt(value)) ? 0 : parseInt(value);
                },
                nextAvailableId = function () {
                    var value = 0;
                    arrayUtils.forEach(o.map.graphics.graphics, function (g) {
                        if (g.attribtues) {
                            if (g.attributes.locatorValue) {                            
                                value = Math.max(value, parseInt(g.attributes.locatorValue));
                            }
                        }
                    });
                    return value;
                };

            // If the DMS Coords View is present, get the appropriate corrdinates and convert them
            if (MapModel.get('showDMSInputs')) {
                values.dlat = getValue(dom.byId('degreesLatInput').value);
                values.mlat = getValue(dom.byId('minutesLatInput').value);
                values.slat = getValue(dom.byId('secondsLatInput').value);
                values.dlon = getValue(dom.byId('degreesLonInput').value);
                values.mlon = getValue(dom.byId('minutesLonInput').value);
                values.slon = getValue(dom.byId('secondsLonInput').value);
                latitude = values.dlat + (values.mlat / 60) + (values.slat / 3600);
                longitude = values.dlon + (values.mlon / 60) + (values.slon / 3600);
            } else { // Else, get LatLong Coordinates and Zoom to them
                latitude = getValue(dom.byId('latitudeInput').value);
                longitude = getValue(dom.byId('longitudeInput').value);
            }

            if (invalidValue) {
                alert(invalidMessage);
            } else {
                point = webMercatorUtils.geographicToWebMercator(new Point(longitude, latitude));
                attributes.locatorValue = nextAvailableId();
                attributes.id = 'LOCATOR_' + attributes.locatorValue;
                graphic = new Graphic(point, symbol, attributes);
                o.map.graphics.add(graphic);
                o.map.centerAndZoom(point, 7);
                MapModel.set('showClearPinsOption', true);
            }

        };

        o.clearSearchPins = function () {
            o.map.graphics.clear();
            MapModel.set('showClearPinsOption', false);
        };

        //listen to key

        //trigger event 



        return o;


    });