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
    "esri/symbols/PictureMarkerSymbol",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/ImageParameters",
    "esri/graphic",
    "dijit/registry",
    "views/map/MapConfig",
    "views/map/MapModel",
    "utils/DijitFactory",
    "modules/EventsController"
], function(on, dom, dojoQuery, domConstruct, domClass, arrayUtils, Fx, Map, esriConfig, HomeButton, BasemapGallery, Basemap, BasemapLayer, Locator, Geocoder, 
            PictureSymbol, Point, webMercatorUtils, ArcGISDynamicMapServiceLayer, ImageParameters, Graphic, registry, MapConfig, MapModel, 
            DijitFactory, EventsController) {

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

            // Add Dojo Dijits to Control Map Options
            DijitFactory.buildDijits(MapConfig.accordionDijits);

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
                self.updateFiresLayer(true);
            });

            on(dom.byId("fires-checkbox"), "change", function (evt) {
                var value = evt.target ? evt.target.checked : evt.srcElement.checked;
                self.toggleLayerVisibility(MapConfig.firesLayer.id, value);
            });


            on(dom.byId("search-option-go-button"), "click", this.searchAreaByCoordinates);
            on(dom.byId("clear-search-pins"), "click", this.clearSearchPins);
            on(dom.byId("legend-widget-title"), "click", this.toggleLegend);

            dojoQuery(".active-fires-options").forEach(function (node) {
                on(node, "click", self.toggleFireOption.bind(self));
            });

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

        o.addLayers = function () {

            var firesParams,
                firesLayer;

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
                firesLayer
            ]);

        };

        o.toggleLayerVisibility = function (layerId, visibility) {
            var layer = o.map.getLayer(layerId);
            if (layer) {
                layer.setVisibility(visibility);
            }
        };

        o.toggleFireOption = function (evt) {
            var node = evt.target ? evt.target : evt.srcElement;
            dojoQuery(".selected-fire-option").forEach(function (el) {
                domClass.remove(el, "selected-fire-option");
            });
            domClass.add(node, "selected-fire-option");
            this.updateFiresLayer();
        };

        o.updateFiresLayer = function (updateVisibleLayers) {
            var node = dojoQuery(".selected-fire-option")[0],
                time = new Date(),
                checkboxStatus = dom.byId("confidence-fires-checkbox").checked,
                defs = [],
                dateString = "",
                where = "",
                visibleLayers,
                layer;

            switch (node.id) {
                case "fires72":
                    dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate() - 3) + " " +
                                 time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
                    where += "ACQ_DATE > date '" + dateString + "'";
                    break;
                case "fires48":
                    dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate() - 2) + " " +
                                 time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
                    where += "ACQ_DATE > date '" + dateString + "'";
                    break;
                case "fires24":
                    dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate() - 1) + " " +
                                 time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
                    where += "ACQ_DATE > date '" + dateString + "'";
                    break;
                default:
                    where = "1 = 1";
                    break;
            }

            for (var i = 0, length = MapConfig.firesLayer.defaultLayers.length; i < length; i++) {
                defs[i] = where;
            }

            layer = o.map.getLayer(MapConfig.firesLayer.id);
            if (layer) {
                layer.setLayerDefinitions(defs);
            }

            if (updateVisibleLayers) {
                if (checkboxStatus) {
                    visibleLayers = [0,1];
                } else {
                    visibleLayers = [0,1,2,3];
                }
                if (layer) {
                    layer.setVisibleLayers(visibleLayers);
                }
            }

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