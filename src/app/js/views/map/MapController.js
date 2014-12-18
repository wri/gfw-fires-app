/* global define, document, alert, window */
define([
    "dojo/on",
    "dojo/dom",
    "dojo/query",
    "dojo/dom-construct",
    "dojo/number",
    "dojo/dom-class",
    "dojo/_base/array",
    "dojo/_base/fx",
    "dojo/promise/all",
    "dojo/Deferred",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "esri/map",
    "esri/config",
    "esri/dijit/HomeButton",
    "esri/geometry/Point",
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
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Extent",
    "esri/InfoTemplate",
    "esri/graphic",
    "esri/urlUtils",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "dijit/registry",
    "views/map/MapConfig",
    "views/map/MapModel",
    "views/map/LayerController",
    "views/map/WindyController",
    "views/map/Finder",
    "views/report/ReportOptionsController",
    "utils/DijitFactory",
    "modules/EventsController",
    "esri/request",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/tasks/PrintTask",
    "esri/tasks/PrintParameters",
    "esri/tasks/PrintTemplate",
    "views/map/DigitalGlobeTiledLayer",
    "views/map/DigitalGlobeServiceLayer",
    "views/map/BurnScarTiledLayer",
    "modules/HashController",
    "esri/layers/GraphicsLayer",
    "esri/layers/ImageServiceParameters",
    "dijit/Dialog",
    "utils/Helper"
], function(on, dom, dojoQuery, domConstruct, number, domClass, arrayUtils, Fx, all, Deferred, domStyle, domGeom, Map, esriConfig, HomeButton, Point, BasemapGallery, Basemap, BasemapLayer, Locator,
    Geocoder, Legend, Scalebar, ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, ImageParameters, FeatureLayer, webMercatorUtils, Extent, InfoTemplate, Graphic, urlUtils, SimpleFillSymbol, SimpleLineSymbol, Color,
    registry, MapConfig, MapModel, LayerController, WindyController, Finder, ReportOptionsController, DijitFactory, EventsController, esriRequest, Query, QueryTask, PrintTask, PrintParameters,
    PrintTemplate, DigitalGlobeTiledLayer, DigitalGlobeServiceLayer, BurnScarTiledLayer, HashController, GraphicsLayer, ImageServiceParameters, Dialog, Helper) {

    var o = {},
        initialized = false,
        view = {
            viewId: "mapView",
            viewName: "map"
        },
        featuresImageryFootprints = [],
        highlightGraphic,
        highlightedRow,
        highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color("yellow"), 5), new Color([255, 255, 0, 0])
        );

    o.mapExtentPausable; //pausable

    o.init = function() {
        var that = this;
        if (initialized) {
            //switch to this view
            o.map.resize();
            EventsController.switchToView(view);
            o.checkBubble();
            return;
        }

        initialized = true;
        //debugger;
        Helper.showLoader("app-body", "map-blocker");
        //debugger;

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
                // that.createMap().then(function() {
                //     that.checkBubble();
                // });
                setTimeout(function() {
                    that.checkBubble();
                }, 1000);

            });
        });
    };

    o.centerChange = function() {
        //alert("center change");
        //alert(o.map);
        //compare current center and change if different
        if (!o.map) {
            return; //map not initialized yet
        }
        var currentExtent = webMercatorUtils.webMercatorToGeographic(o.map.extent);
        var x = number.round(currentExtent.getCenter().x, 2);
        var y = number.round(currentExtent.getCenter().y, 2);
        var l = o.map.getLevel();

        var newState = HashController.newState;
        var centerChangeByUrl = ((parseFloat(newState.x) != x) || (parseFloat(newState.y) != y) || (parseInt(newState.l) != l));

        //alert(centerChangeByUrl + " " + newState.y + " " + newState.x);

        if (centerChangeByUrl) {
            o.mapExtentPausable.pause();
            on.once(o.map, "extent-change", function() {
                o.mapExtentPausable.resume();
            });
            var ptWM = webMercatorUtils.geographicToWebMercator(new Point(parseFloat(newState.x), parseFloat(newState.y)));
            o.map.centerAndZoom(ptWM, parseInt(newState.l));
        }



    };

    o.addConfigurations = function() {

        var proxies = MapConfig.proxies;

        var url = document.location.href;
        var proxyUrl = "/proxy/proxy.ashx";


        for (var domain in proxies) {

            if (url.indexOf(domain) === 0) {
                proxyUrl = proxies[domain];

                esriConfig.defaults.io.proxyUrl = proxies[domain];

            }
        }
        // Rule to Test Digital Globe Fires Url
        urlUtils.addProxyRule({
            urlPrefix: 'https://services.digitalglobe.com/',
            proxyUrl: proxyUrl
        });

        urlUtils.addProxyRule({
            urlPrefix: MapConfig.landsat8.prefix,
            proxyUrl: proxyUrl
        });

        esriConfig.defaults.io.corsEnabledServers.push(MapConfig.windData.domain);

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
        DijitFactory.buildDijits(MapConfig.reportOptionsDijits);

        DijitFactory.buildDijits(MapConfig.accordionDijits);
        var hashX = HashController.newState.x;
        var hashY = HashController.newState.y;
        var hashL = HashController.newState.l;

        o.map = new Map("map", {
            center: [hashX, hashY], //MapConfig.mapOptions.center,
            zoom: hashL, //MapConfig.mapOptions.initalZoom,
            basemap: MapConfig.mapOptions.basemap,
            minZoom: MapConfig.mapOptions.minZoom,
            maxZoom: MapConfig.mapOptions.maxZoom,
            sliderPosition: MapConfig.mapOptions.sliderPosition
        });
        window.map = o.map;


        o.map.on("load", function() {
            //$("#firesDateFrom").datepicker("setDate", "+0m -7d");

            $("#firesDateTo").datepicker("option", "minDate", "+0m -7d");
            $("#noaaDateFrom").datepicker("setDate", "10/22/2014");
            $("#indoDateFrom").datepicker("setDate", "1/1/2013");
            // setTimeout(function() {
            //     (dom.byId("#galleryNode_basemap_6")
            //     var basemapArray = registry.byId("basemap-gallery").basemaps;
            //     basemapArray.splice(4, 1);
            // }, 1000);

            //var basemapArray = registry.byId("basemap-gallery").basemaps;
            //basemapArray.splice(6, 1);

            // Clear out default Esri Graphic at 0,0, dont know why its even there
            o.map.graphics.clear();
            MapModel.vm.windPicker();
            // Resize Accordion
            registry.byId("fires-map-accordion").resize();
            WindyController.setMap(o.map);
            LayerController.setMap(o.map);
            Finder.setMap(o.map);
            self.addWidgets();
            self.bindEvents();
            self.addLayers();

            // Hack to get the correct extent set on load, this can be removed
            // when the hash controller workflow is corrected
            on.once(o.map, "update-end", function() {

                o.map.centerAt(new Point(hashX, hashY)).then(function() {
                    setTimeout(function() {
                        o.mapExtentPausable.resume();
                    }, 1000);
                });
            });
            o.map.resize();
        });

        o.mapExtentPausable = on.pausable(o.map, "extent-change", function(e) {

            var delta = e.delta;
            var extent = webMercatorUtils.webMercatorToGeographic(e.extent);
            var levelChange = e.levelChange;
            var lod = e.lod;
            var map = e.target;

            var x = number.round(extent.getCenter().x, 2);
            var y = number.round(extent.getCenter().y, 2);

            HashController.updateHash({
                x: x,
                y: y,
                l: lod.level
            });

            if (dijit.byId("digital-globe-checkbox").getValue() == 'on') {
                o.updateImageryList();
            }

        });

        o.mapExtentPausable.pause();

    };
    o.checkBubble = function() {
        console.log("checking bubble");
        if (MapConfig.digitalGlobe.navigationBool) {
            registry.byId("digital-globe-checkbox").setValue(true);
            registry.byId("fires-map-accordion").selectChild(registry.byId("imagery-panel"));
            MapConfig.digitalGlobe.navigationBool = false;
        }
    };

    o.updateImageryList = function() {

        MapModel.vm.digitalGlobeInView.removeAll();

        var mapExtent = o.map.extent;
        var imageBoxes = o.map.getLayer("Digital_Globe_Bounding_Boxes");
        featuresImageryFootprints = [];
        var thumbs = dijit.byId('timeSliderDG').thumbIndexes;
        var timeStops = dijit.byId('timeSliderDG').timeStops;
        var start = moment(timeStops[thumbs[0]]).tz('Asia/Jakarta');
        var end = moment(timeStops[thumbs[1]]).tz('Asia/Jakarta');
        for (var i = 0; i < imageBoxes.graphics.length; i++) {
            if (mapExtent.intersects(imageBoxes.graphics[i].geometry)) {
                featuresImageryFootprints.push(imageBoxes.graphics[i]);
            }
        }

        arrayUtils.forEach(featuresImageryFootprints, function(f) {
            var date = moment(f.attributes.AcquisitionDate).tz('Asia/Jakarta');
            if (date >= start && date <= end) {
                var date = moment(f.attributes.AcquisitionDate).tz('Asia/Jakarta');
                f.attributes.AcquisitionDate2 = f.attributes.AcquisitionDate;
                f.attributes.AcquisitionDate = date.format("YYYY/MM/DD");
                var dateLink = "<a class='popup-link' data-bucket='" + f.attributes.SensorName + "_id_" + f.attributes.OBJECTID + "'>" + date.format("YYYY/MM/DD") + "</a>";

                var dateLink2 = "<a class='popup-link' data-bucket='" + f.attributes.SensorName + "_id_" + f.attributes.OBJECTID + "'>" + f.attributes.SensorName + "</a>";
                f.attributes.formattedZoomTo = "<a class='popup-link-zoom'>Zoom To</a>";
                f.attributes.formattedDatePrefix1 = dateLink;
                f.attributes.formattedDatePrefix2 = dateLink2;
                MapModel.vm.digitalGlobeInView.push({
                    feature: f,
                    mouseover: false
                });
            }

        });
        $("#imageryWindow > table > tbody > tr").each(function() {
            var selectedRow = this.firstElementChild;
            selectedRow = $(selectedRow).html();
            selectedRow = $(selectedRow).attr("data-bucket");

            if (MapModel.vm.selectedImageryRow) {
                if (MapModel.vm.selectedImageryRow == selectedRow) {
                    $(this).addClass("imageryRowSelected");
                }
            }
        });

        MapModel.vm.digitalGlobeInView.sort(function(left, right) {
            return left.feature.attributes.AcquisitionDate == right.feature.attributes.AcquisitionDate ? 0 : (left.feature.attributes.AcquisitionDate > right.feature.attributes.AcquisitionDate ? -1 : 1);
        });

        var activeFeatureIndex = 0;
        var handles = [];
        dojoQuery(".imageryTable .popup-link").forEach(function(node, index) {
            handles.push(on(node, "click", function(evt) {
                var target = evt.target ? evt.target : evt.srcElement,
                    bucket = target.dataset ? target.dataset.bucket : target.getAttribute("data-bucket");

                $('#imageryWindow > table > tbody > tr').each(function() {
                    $(this).removeClass("imageryRowSelected");
                });
                LayerController.showDigitalGlobeImagery(bucket);
                activeFeatureIndex = index;
                var parent = $(this).parent();
                $(parent).parent().removeClass("imageryRowHover");
                MapModel.vm.selectedImageryRow = this.dataset.bucket;
                $(parent).parent().addClass("imageryRowSelected");

            }));
        });

        //TODO Replace jquery onClicks w/ ko data-bind="attr: { click: someFunction
        $("#imageryWindow > table > tbody > tr").mouseenter(function() {
            var highlightedRow = this.firstElementChild;
            $(this).addClass("imageryRowHover");
            highlightedRow = $(highlightedRow).html();
            highlightedRow = $(highlightedRow).attr("data-bucket");
            for (var i = 0; i < featuresImageryFootprints.length; i++) {
                var check = featuresImageryFootprints[i].attributes.SensorName + "_id_" + featuresImageryFootprints[i].attributes.OBJECTID;
                if (check == highlightedRow) {
                    var highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color("yellow"), 5), new Color([255, 255, 0, 0])
                    );
                    highlightGraphic = new Graphic(featuresImageryFootprints[i].geometry, highlightSymbol);
                    highlightGraphic.id = "highlight";

                    o.map.graphics.add(highlightGraphic);
                }
            }
        });
        $("#imageryWindow > table > tbody > tr").mouseleave(function() {
            $(this).removeClass("imageryRowHover");
            o.map.graphics.remove(o.map.graphics.graphics[o.map.graphics.graphics.length - 1]);
        });

        handles.push(on(dojoQuery(".popup-link-zoom"), "click", function(evt) {
            o.map.graphics.remove(o.map.graphics.graphics[o.map.graphics.graphics.length - 1]);
            var highlightedRow = ($(this).parent())[0];
            var child = highlightedRow.firstElementChild;
            child = child.firstElementChild;
            child = $(child).attr("data-bucket");

            for (var i = 0; i < featuresImageryFootprints.length; i++) {
                var check = featuresImageryFootprints[i].attributes.SensorName + "_id_" + featuresImageryFootprints[i].attributes.OBJECTID;
                if (check == child) {
                    o.map.setExtent((featuresImageryFootprints[i].geometry.getExtent()));
                }
            }
        }));
    };
    var parent = $(this).parent();
    $(parent).parent().removeClass("imageryRowHover");
    $(parent).parent().addClass("imageryRowSelected");

    o.handleImageryOver = function(data, event) {

        console.log("starting function");
        var parent = event.currentTarget;

        //parent = parent[0];
        // if (parent.nodeName == "TD") {
        //     parent = $(parent).parent();
        // }
        //data.feature.geometry
        $(parent).addClass("imageryRowHover");

        //highlightedRow = event.target.firstElementChild;
        //f (event.target != event.currentTarget) {
        // if (highlightedRow == "") {
        //     debugger;
        // }
        // if (parent.nodeName == "TD") {
        //     console.log("td");
        //     var highlightedRow = event.target;
        // }

        //highlightedRow = $(highlightedRow).html();
        //highlightedRow = $(highlightedRow).attr("data-bucket");
        // for (var i = 0; i < featuresImageryFootprints.length; i++) {
        //     var check = featuresImageryFootprints[i].attributes.SensorName + "_id_" + featuresImageryFootprints[i].attributes.OBJECTID;
        //     if (check == highlightedRow) {

        //featuresImageryFootprints[i].setSymbol(highlightSymbol);

        highlightGraphic = new Graphic(data.geometry, highlightSymbol);
        highlightGraphic.id = "highlight";

        o.map.graphics.add(highlightGraphic);
        //         }
        //     }
    };

    o.handleImageryOut = function(data, event) {
        var parent = $(event.target).parent();

        $(parent).removeClass("imageryRowHover");
        o.map.graphics.remove(o.map.graphics.graphics[o.map.graphics.graphics.length - 1]);
    };

    o.resizeMapPanel = function(data) {

        if (data == true) {
            $("#control-panel").css("width", "2px");
            $(".map-container").css("left", "2px");
            ///$("#leftPaneToggle").css("left", "2px");
            $("#leftPaneToggle").html("+");
            $("#latLongHUD").css("left", "100px");
            $("div.scalebar_bottom-left.esriScalebar").css("left", "119px");
            $("#map").css("left", "2px");
            $("#control-panel").css("background-color", "#ecc53d");
            o.map.resize();
            MapModel.vm.toggleMapPane(false);

        } else {
            $("#control-panel").css("width", "320px");
            $(".map-container").css("left", "320px");
            //$("#leftPaneToggle").css("left", "0px");
            $("#leftPaneToggle").html("-");
            $("#map").css("left", "320px");
            $("#latLongHUD").css("left", "0px");
            $("div.scalebar_bottom-left.esriScalebar").css("left", "19px");
            $("#control-panel").css("background-color", "transparent");
            o.map.resize();
            MapModel.vm.toggleMapPane(true);

        }
        $("#leftPaneToggle").hide();
        $("#latLongHUD").hide();
        $("div.scalebar_bottom-left.esriScalebar").hide();
        $("#control-panel > div.report-link-container").hide();
        setTimeout(function() {
            //$("#control-panel").css("background-color", "#ecc53d");
            $("#latLongHUD").show();
            $("#leftPaneToggle").show();
            $("div.scalebar_bottom-left.esriScalebar").show();
            $("#control-panel > div.report-link-container").show();
        }, 1000);

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
                'class': 'home-button'
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
            id: "darkgray",
            title: "Dark Gray Canvas",
            thumbnailUrl: "app/images/darkGreyThumb.jpg"
        });
        //basemaps.push(darkgray);
        console.log(basemaps);

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

        this.initTransparency();
    };


    o.initTransparency = function() {
        ['forest-transparency-slider', 'conservation-transparency-slider',
            'land-cover-transparency-slider'
        ].map(function(id) {
            var slider = dijit.byId(id).set("value", 70);
        })
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
            // Finder.getActiveFiresInfoWindow(evt);
            // Finder.getTomnodInfoWindow(evt);
            Finder.selectTomnodFeatures(evt);
            // Finder.getTomnodInfoWindow(evt);

            // Finder.getDigitalGlobeInfoWindow(evt);
        });

        on(registry.byId("confidence-fires-checkbox"), "change", function(evt) {
            LayerController.updateFiresLayer(true);
            if (evt) {
                self.reportAnalyticsHelper('layer', 'option', 'The user toggled the Active Fires only show high confidence fires option on.');
            }
        });

        on(registry.byId("twitter-conversations-checkbox"), "change", function(evt) {
            var value = registry.byId("twitter-conversations-checkbox").checked;
            LayerController.toggleLayerVisibility(MapConfig.tweetLayer.id, value);
            if (value) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Twitter Conversations layer on.');
            }
        });

        on(registry.byId("fires-checkbox"), "change", function(evt) {
            var value = registry.byId("fires-checkbox").checked;
            LayerController.toggleLayerVisibility(MapConfig.firesLayer.id, value);
            MapModel.vm.showActiveFiresButtons(value);
            if (value) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Active Fires layer on.');
            }
        });

        on(registry.byId("air-quality-checkbox"), "change", function(value) {
            LayerController.toggleLayerVisibility(MapConfig.airQualityLayer.id, value);
            if (value) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Air Quality layer on.');
            }
        });

        on(registry.byId("tomnod-checkbox"), "change", function(value) {
            LayerController.toggleLayerVisibility(MapConfig.tomnodLayer.id, value);
            LayerController.toggleLayerVisibility(MapConfig.tomnodLayer.sel_id, value);
            if (value) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Tomnod layer on.');
            }
        });

        on(registry.byId("indonesia-fires"), "change", function(value) {
            console.log(value);
            if (value == true) {
                $(".confidence-fires-container").css("margin-left", "38px");
            } else {
                $(".confidence-fires-container").css("margin-left", "46px");
            }
            LayerController.toggleMapServiceLayerVisibility(o.map.getLayer(MapConfig.indonesiaLayers.id),
                MapConfig.indonesiaLayers.layerIds['indonesiaFires'], value);
        });



        on(registry.byId("noaa-fires-18"), "change", function(value) {
            LayerController.toggleMapServiceLayerVisibility(o.map.getLayer(MapConfig.indonesiaLayers.id),
                MapConfig.indonesiaLayers.layerIds['noaa18'], value);
        });

        on(registry.byId("burned-scars-checkbox"), "change", function(value) {
            LayerController.toggleLayerVisibility(MapConfig.burnScarLayer.id, value);
            if (value) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Burn Scars layer on.');
            }
        });

        on(registry.byId("landsat-image-checkbox"), "change", function(evt) {
            var value = registry.byId("landsat-image-checkbox").checked;
            LayerController.toggleLayerVisibility(MapConfig.landsat8.id, value);
            if (value) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Latest Landsat 8 Imagery layer on.');
            }
        });

        registry.byId("windy-layer-checkbox").on('change', function(checked) {
            WindyController.toggleWindLayer(checked);
            if (checked) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Wind direction layer on.');
            }
        });

        registry.byId("digital-globe-checkbox").on('change', function(checked) {
            LayerController.toggleDigitalGlobeLayer(checked);
            MapModel.vm.showReportOptionsDigitalGlobe(checked);
            if (checked) {
                setTimeout(function() {
                    dijit.byId("digital-globe-footprints-checkbox").set("value", "true", false);
                    //dijit.byId("digital-globe-footprints-checkbox").setValue(true);
                }, 0);


                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Digital Globe - First Look layer on.');
            }
        });

        registry.byId("digital-globe-footprints-checkbox").on('change', function(checked) {
            LayerController.toggleDigitalGlobeLayer(checked, 'footprints');
            //#digital-globe-footprints-checkbox

        });

        registry.byId("provinces-checkbox").on('change', function(checked) {
            LayerController.adjustOverlaysLayer();
            if (checked) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Provinces overlay layer on.');
            }
        });

        registry.byId("districts-checkbox").on('change', function(checked) {
            LayerController.adjustOverlaysLayer();
            if (checked) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Districts overlay layer on.');
            }
        });

        registry.byId("subdistricts-checkbox").on('change', function(checked) {
            LayerController.adjustOverlaysLayer();
            if (checked) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Subdistricts overlay layer on.');
            }
        });

        registry.byId("villages-checkbox").on('change', function(checked) {
            LayerController.adjustOverlaysLayer();
            if (checked) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Villages overlay layer on.');
            }
        });

        on(dom.byId("search-option-go-button"), "click", function() {
            Finder.searchAreaByCoordinates();
            self.reportAnalyticsHelper('widget', 'search', 'The user searched for location by latitude/longitude or Degrees/Minutes/Seconds.');
        });

        on(dom.byId("print-button"), "click", function() {
            self.printMap();
            self.reportAnalyticsHelper('widget', 'print', 'The user clicked the print widget to print the map.');
        });

        on(dom.byId("report-link"), "click", function() {
            MapModel.vm.showReportOptions(true);
            if (MapModel.vm.reportAOIs().length < 1) {
                ReportOptionsController.populate_select();
            }
            //var win = window.open('./app/js/views/report/report.html', 'Report', '');
            self.reportAnalyticsHelper('widget', 'report', 'The user clicked Get Fires Analysis to generate an report with the latest analysis.');
        });


        on(dom.byId("noaa-fires-18"), "click", function() {
            if (this.getAttribute("aria-checked") == "false") {
                // tell the map this layer is no longer visible!
                var otherCheck = dom.byId("indonesia-fires");

                if (otherCheck.getAttribute("aria-checked") == 'false') {
                    o.map.getLayer("IndonesiaFires").visible = false;
                    console.log("Should disable pop-ups");
                }

                MapModel.vm.showReportOptionsNOAA(false);
                return;
            }
            MapModel.vm.showReportOptionsNOAA(true);
            ReportOptionsController.populate_select();
        });

        on(dom.byId("indonesia-fires"), "click", function() {
            if (this.getAttribute("aria-checked") == "false") {
                var otherCheck = dom.byId("noaa-fires-18");
                if (otherCheck.getAttribute("aria-checked") == 'false') {
                    o.map.getLayer("IndonesiaFires").visible = false;
                    console.log("Should disable pop-ups");
                }
                MapModel.vm.showReportOptionsINDO(false);
                return;
            }
            MapModel.vm.showReportOptionsINDO(true);
            ReportOptionsController.populate_select();
        });

        on(dom.byId("windy-layer-checkbox"), "click", function() {
            if (this.getAttribute("aria-checked") == "false") {
                MapModel.vm.showReportOptionsWIND(false);
                return;
            }
            MapModel.vm.showReportOptionsWIND(true);
            ReportOptionsController.populate_select();
        });


        on(dom.byId('updateNOAA'), 'click', function() {
            var dateFrom = MapModel.vm.noaaObservFrom();
            var dateTo = MapModel.vm.noaaObservTo();
            var currentDate = $("#noaaDateFrom").datepicker("getDate");
            var currentDateTo = $("#noaaDateTo").datepicker("getDate");
            dateTo = moment(currentDateTo).add(1, 'day');

            dateFrom = moment(currentDate).tz('Asia/Jakarta').format("M/D/YYYY");
            dateTo = moment(dateTo._d).tz('Asia/Jakarta').format("M/D/YYYY");

            var reportdateFrom = dateFrom.replace(/\//g, "-");
            var reportdateTo = dateTo.replace(/\//g, "-");


            var sqlQuery = LayerController.getTimeDefinition("Date", reportdateFrom, reportdateTo);

            LayerController.updateDynamicMapServiceLayerDefinition(o.map.getLayer(MapConfig.indonesiaLayers.id), MapConfig.indonesiaLayers.layerIds['noaa18'], sqlQuery);
        });

        on(dom.byId('updateINDO'), 'click', function() {
            var dateFrom = MapModel.vm.indoObservFrom();
            var dateTo = MapModel.vm.indoObservTo();
            var currentDate = $("#indoDateFrom").datepicker("getDate");
            var currentDateTo = $("#indoDateTo").datepicker("getDate");
            dateTo = moment(currentDateTo).add(1, 'day');

            dateFrom = moment(currentDate).tz('Asia/Jakarta').format("M/D/YYYY");
            dateTo = moment(dateTo._d).tz('Asia/Jakarta').format("M/D/YYYY");

            var reportdateFrom = dateFrom.replace(/\//g, "-");
            var reportdateTo = dateTo.replace(/\//g, "-");

            var sqlQuery = LayerController.getTimeDefinition("ACQ_DATE", reportdateFrom, dateTo);
            if (registry.byId('confidence-archive-checkbox').checked) {
                sqlQuery = [sqlQuery, MapConfig.firesLayer.highConfidence].join(' AND ');
            }
            LayerController.updateDynamicMapServiceLayerDefinition(o.map.getLayer(MapConfig.indonesiaLayers.id), MapConfig.indonesiaLayers.layerIds['indonesiaFires'], sqlQuery);

        });

        on(registry.byId("confidence-archive-checkbox"), "change", function(value) {
            console.log("confidence", value);
            var sql = value ? MapConfig.firesLayer.highConfidence : '';
            var indonesiaLayer = o.map.getLayer(MapConfig.indonesiaLayers.id);
            var indonesiaID = MapConfig.indonesiaLayers.layerIds.indonesiaFires;
            var layerDefinitions = indonesiaLayer.layerDefinitions;
            var curLayerDef = layerDefinitions[indonesiaID];
            if (value) {
                var newLayerDef = curLayerDef != undefined ? [curLayerDef, sql].join(' AND ') : sql;
            } else {
                var newLayerDef = curLayerDef.replace(' AND ' + MapConfig.firesLayer.highConfidence, sql).replace(MapConfig.firesLayer.highConfidence, sql);
            }
            LayerController.updateDynamicMapServiceLayerDefinition(o.map.getLayer(MapConfig.indonesiaLayers.id), MapConfig.indonesiaLayers.layerIds['indonesiaFires'], newLayerDef);
        });

        on(dom.byId('updateWIND'), 'click', function() {
            var dates = MapModel.vm.windObserv();
            var currentDate = $("#windDate").datepicker("getDate");
            var dateArray = moment(currentDate).tz('Asia/Jakarta').format("MM/DD/YYYY");

            var time = MapModel.vm.timeOfDay();

            var reportdates = dateArray.split("/");
            var datesFormatted = reportdates[2].toString() + reportdates[0].toString() + reportdates[1].toString();
            console.log(datesFormatted);
            var updatedURL = "http://suitability-mapper.s3.amazonaws.com/wind/archive/wind-surface-level-gfs-" + datesFormatted + time + ".1-0.gz.json";
            WindyController.deactivateWindLayer();
            WindyController.activateWindLayer(updatedURL);

        });

        on(dom.byId("embedShare"), "click", function() {
            self.showEmbedCode();
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

            on(dom.byId('close-icon'), "click", function() {
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
            if (node.name === 'land-cover-radios') {
                domClass.add(node, "land-cover-layers-option");
            }
        });

        dojoQuery("#forest-use-panel div.checkbox-container div input").forEach(function(node) {
            on(node, "change", function(evt) {
                //Params are, class to Query to find which layers are checked on or off, and config object for the layer
                LayerController.updateAdditionalVisibleLayers("forest-use-layers-option", MapConfig.forestUseLayers);
                // Try to parse out some arguments, and use them for Analytics
                var target = evt.target ? evt.target : evt.srcElement;
                if (target.checked) {
                    if (target.labels.length > 0) {
                        var label = target.labels[0].innerHTML;
                        self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the ' + label + ' layer on');
                    }
                }
            });
        });

        dojoQuery(".conservation-layers-option").forEach(function(node) {
            on(node, "change", function(evt) {
                //Params are, class to Query to find which layers are checked on or off, and config object for the layer
                LayerController.updateAdditionalVisibleLayers("conservation-layers-option", MapConfig.conservationLayers);
                // Try to parse out some arguments, and use them for Analytics
                var target = evt.target ? evt.target : evt.srcElement;
                if (target.checked) {
                    if (target.labels.length > 0) {
                        var label = target.labels[0].innerHTML;
                        self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the ' + label + ' layer on');
                    }
                }
            });
        });

        dojoQuery(".land-cover-layers-option").forEach(function(node) {
            on(node, "change", function(evt) {
                LayerController.updateLandCoverLayers(evt);
                // Try to parse out some arguments, and use them for Analytics
                var target = evt.target ? evt.target : evt.srcElement;
                if (target.checked) {
                    if (target.labels.length > 0) {
                        var label = target.labels[0].innerHTML;
                        if (label.search("None") === -1) {
                            self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the ' + label + ' layer on');
                        }
                    }
                }
            });
        });

        dojoQuery("#primary-forests-options input").forEach(function(node) {
            on(node, "change", function(evt) {
                LayerController.updatePrimaryForestsLayer(true); // The True is to keep it visible
                // Try to parse out some arguments, and use them for Analytics
                var target = evt.target ? evt.target : evt.srcElement;
                if (target.checked) {
                    if (target.labels.length > 0) {
                        var label = target.labels[0].innerHTML;
                        if (label.search('Primary') === -1) {
                            label = 'Primary Forests ' + label;
                        }
                        self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the ' + label + ' layer on');
                    }
                }
            });
        });

    };

    o.addLayers = function() {

        var conservationParams,
            conservationLayer,
            // burendAreaParams,
            // burnedScarLayer,
            primaryForestsParams,
            primaryForestsLayer,
            digitalGlobeLayers,
            landCoverParams,
            landCoverLayer,
            airQualityLayer,
            forestUseParams,
            forestUseLayer,
            treeCoverLayer,
            overlaysLayer,
            burnScarLayer,
            tomnodLayer,
            landSatLayer,
            firesParams,
            indonesiaLayers,
            firesLayer,
            dgConf,
            self = this;

        conservationParams = new ImageParameters();
        conservationParams.format = "png32";
        conservationParams.layerIds = MapConfig.conservationLayers.defaultLayers;
        conservationParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        conservationLayer = new ArcGISDynamicMapServiceLayer(MapConfig.conservationLayers.url, {
            imageParameters: conservationParams,
            id: MapConfig.conservationLayers.id,
            visible: false
        });

        // burendAreaParams = new ImageParameters();
        // burendAreaParams.format = "png32";
        // burendAreaParams.layerIds = MapConfig.burnedAreaLayers.defaultLayers;
        // burendAreaParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        // burnedScarLayer = new ArcGISDynamicMapServiceLayer(MapConfig.burnedAreaLayers.url, {
        //     imageParameters: burendAreaParams,
        //     id: MapConfig.burnedAreaLayers.id,
        //     visible: false
        // });

        indonesiaParams = new ImageParameters();
        indonesiaParams.format = "png32";
        indonesiaParams.layerIds = MapConfig.indonesiaLayers.defaultLayers;
        indonesiaParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        indonesiaLayer = new ArcGISDynamicMapServiceLayer(MapConfig.indonesiaLayers.url, {
            imageParameters: indonesiaParams,
            id: MapConfig.indonesiaLayers.id,
            visible: false
        });

        landCoverParams = new ImageParameters();
        landCoverParams.format = "png32";
        landCoverParams.layerIds = MapConfig.landCoverLayers.defaultLayers;
        landCoverParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        landCoverLayer = new ArcGISDynamicMapServiceLayer(MapConfig.landCoverLayers.url, {
            imageParameters: landCoverParams,
            id: MapConfig.landCoverLayers.id,
            visible: false
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

        primaryForestsParams = new ImageParameters();
        primaryForestsParams.format = "png32";
        primaryForestsParams.layerIds = MapConfig.primaryForestsLayer.defaultLayers;
        primaryForestsParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        primaryForestsLayer = new ArcGISDynamicMapServiceLayer(MapConfig.primaryForestsLayer.url, {
            imageParameters: primaryForestsParams,
            id: MapConfig.primaryForestsLayer.id,
            visible: false
        });

        landSatLayer = new ArcGISImageServiceLayer(MapConfig.landsat8.url, {
            id: MapConfig.landsat8.id,
            visible: false
        });

        // var digitalGlobeParams = new ImageServiceParameters();
        // digitalGlobeParams.format = "png8";

        // digitalGlobeLayer = new ArcGISImageServiceLayer(MapConfig.digitalGlobe.tileUrl, {
        //     imageServiceParameters: digitalGlobeParams,
        //     id: MapConfig.digitalGlobe.id,
        //     visible: false
        // });

        //digitalGlobeLayer = new DigitalGlobeTiledLayer(MapConfig.digitalGlobe.tileUrl, MapConfig.digitalGlobe.id);
        dgConf = MapConfig.digitalGlobe;
        // digitalGlobeLayer = new ArcGISImageServiceLayer(dgConf.imagedir + dgConf.mosaics[0] +'/ImageServer', {
        //     id: dgConf.id,
        //     visible: false
        // });
        digitalGlobeLayers = dgConf.mosaics.map(function(i) {
            return (new ArcGISImageServiceLayer(dgConf.imagedir + i + '/ImageServer', {
                id: i,
                visible: false
            }));
        })
        dglyrs = digitalGlobeLayers

        overlaysLayer = new ArcGISDynamicMapServiceLayer(MapConfig.overlaysLayer.url, {
            id: MapConfig.overlaysLayer.id,
            visible: false
        });

        airQualityLayer = new ArcGISDynamicMapServiceLayer(MapConfig.airQualityLayer.url, {
            id: MapConfig.airQualityLayer.id,
            visible: false
        });

        tomnodParams = new ImageParameters();
        tomnodParams.layerIds = MapConfig.tomnodLayer.defaultLayers;
        tomnodParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;
        tomnodLayer = new ArcGISDynamicMapServiceLayer(MapConfig.tomnodLayer.url, {
            imageParameters: tomnodParams,
            id: MapConfig.tomnodLayer.id,
            visible: false
        });
        var tomnodInfoTemplate = new InfoTemplate("${name}", Finder.getTomnodInfoWindow);
        var tomnodSellayer = new FeatureLayer(MapConfig.tomnodLayer.url + "/" + MapConfig.tomnodLayer.defaultLayers[0], {
            mode: FeatureLayer.MODE_SELECTION,
            infoTemplate: tomnodInfoTemplate,
            outFields: ["*"],
            id: MapConfig.tomnodLayer.sel_id
        });

        burnScarLayer = new BurnScarTiledLayer(MapConfig.burnScarLayer.url, MapConfig.burnScarLayer.id);

        firesParams = new ImageParameters();
        firesParams.format = "png32";
        firesParams.layerIds = MapConfig.firesLayer.defaultLayers;
        firesParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        firesLayer = new ArcGISDynamicMapServiceLayer(MapConfig.firesLayer.url, {
            imageParameters: firesParams,
            id: MapConfig.firesLayer.id,
            visible: false
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

        // var digitalGlobeGraphicsLayer = new GraphicsLayer({
        //     id: MapConfig.digitalGlobe.graphicsLayerId,
        //     //infoTemplate: digitalGlobeInfoTemplate,
        //     visible: false
        // });

        var featureCollection = {
            layerDefinition: {
                "geometryType": "esriGeometryPolygon",
                "fields": []
            },
            featureSet: null
        };

        var digitalGlobeGraphicsLayer = new FeatureLayer(featureCollection, {
            id: MapConfig.digitalGlobe.graphicsLayerId,
            //infoTemplate: digitalGlobeInfoTemplate,
            visible: false
        });

        dglyr = digitalGlobeGraphicsLayer;

        // TESTING LAYER
        // var dgGlobeWMSLayer = new DigitalGlobeServiceLayer("https://services.digitalglobe.com/mapservice/wmsaccess", {
        //     id: "DG_WMS",
        //     visible: true
        // });
        var layerlist = [
            landSatLayer,
            treeCoverLayer,
            landCoverLayer,
            primaryForestsLayer,
            digitalGlobeGraphicsLayer
        ].concat(digitalGlobeLayers).concat([ //add all dg image layers here
            conservationLayer,
            burnScarLayer,
            tomnodLayer,
            forestUseLayer,
            overlaysLayer,
            tweetLayer,
            airQualityLayer,
            tomnodSellayer,
            indonesiaLayer,
            firesLayer
        ]);
        // Fires
        // Air Quality
        // Social Media
        // Forest Use
        // Conservation
        // DG Imagery
        // Landcover
        // Basemap
        // Landsat Imagery

        // Update the Legend when all layers are added
        on.once(o.map, 'layers-add-result', function(response) {

            // This turns on all the layers present in the hash,
            // All layers are turned off onload, by default Fires and Land Cover will be turned on from hash
            // Unless hash values are different

            self.enableLayersFromHash();

            var layerInfos = arrayUtils.map(response.layers, function(item) {
                return {
                    layer: item.layer
                };
            });
            layerInfos = arrayUtils.filter(layerInfos, function(item) {
                var url = !item.layer.url ? false : item.layer.url.search('ImageServer') < 0;
                var flyr = !(item.layer.id === tomnodSellayer.id);
                return (url && flyr);
            });
            console.dir(layerInfos);
            //debugger;
            Helper.hideLoader("map-blocker");
            registry.byId("legend").refresh(layerInfos);
        });
        o.map.addLayers(layerlist);

        // Set the default layer ordering for Overlays Layer
        overlaysLayer.on('load', LayerController.setOverlayLayerOrder);
        burnScarLayer.on('error', this.layerAddError);
        landSatLayer.on('error', this.layerAddError);
        treeCoverLayer.on('error', this.layerAddError);
        primaryForestsLayer.on('error', this.layerAddError);
        conservationLayer.on('error', this.layerAddError);
        landCoverLayer.on('error', this.layerAddError);
        overlaysLayer.on('error', this.layerAddError);
        forestUseLayer.on('error', this.layerAddError);
        firesLayer.on('error', this.layerAddError);
        //digitalGlobeLayer.on('error', this.layerAddError);
        airQualityLayer.on('error', this.layerAddError);

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

    o.enableLayersFromHash = function() {

        var hash = HashController.getHash(),
            layers = hash.lyrs,
            layersArray = layers.split(":"),
            layersToWidgets = MapConfig.layersCheckboxes,
            layerComponents,
            widgetId,
            layerObj,
            layerIds;

        function useDefaults() {
            registry.byId('fires-checkbox').set('checked', true);
            LayerController.updateLayersInHash('add', MapConfig.firesLayer.id, MapConfig.firesLayer.id);
        }

        function turnOnLayers(id, layerNums) {

            if (id === undefined || id === '') {
                return;
            }

            if (layerNums === undefined) {
                if (layersToWidgets[id]) {
                    widgetId = layersToWidgets[id].id;
                    if (registry.byId(widgetId)) {
                        registry.byId(widgetId).set('checked', true);
                        on.emit(dom.byId(widgetId), 'change', {});
                    }
                }
            } else {
                layerObj = layersToWidgets[id];
                layerIds = layerNums.split(",");
                for (var i = 0, len = layerIds.length; i < len; i++) {
                    widgetId = layerObj[layerIds[i]].id;
                    if (Object.prototype.toString.call(widgetId) === '[object Array]') {
                        for (var j = 0, jLen = widgetId.length; j < jLen; j++) {
                            if (registry.byId(widgetId[j])) {
                                registry.byId(widgetId[j]).set('checked', true);
                                on.emit(dom.byId(widgetId[j]), 'change', {});
                            }
                        }
                    } else {
                        if (registry.byId(widgetId)) {
                            registry.byId(widgetId).set('checked', true);
                            on.emit(dom.byId(widgetId), 'change', {});
                        }
                    }
                }
            }
        }

        // If nothing is specified, something went wrong, use these defaults
        if (layers === undefined) {
            useDefaults();
            return;
        }

        // If the lyrs hash is empty, something went wrong, use these defaults
        if (layersArray.length === 1 && layersArray[0] === '') {
            useDefaults();
            return;
        }

        for (var index = 0, length = layersArray.length; index < length; index++) {
            layerComponents = layersArray[index].split('/');
            turnOnLayers(layerComponents[0], layerComponents[1]);
        }

    };


    o.clearSearchPins = function() {
        o.map.graphics.clear();
        MapModel.set('showClearPinsOption', false);
    };

    o.toggleLegend = function() {
        var node = dom.byId("legend-widget-container"),
            height = node.offsetHeight - 2 === 280 ? 30 : 280; //added border, has to have - 2 to get correct height

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

    o.printMap = function() {

        var body = document.getElementsByTagName("body")[0];

        domClass.add('print-button', 'loading');
        domClass.add(body, "map-view-print");
        registry.byId("stackContainer").resize();
        registry.byId("mapView").resize();
        o.map.resize();
        on.once(o.map, 'resize', function() {
            // Allow Layers to redraw themselves, wind layer takes 1500ms 
            setTimeout(function() {
                window.print();
                domClass.remove('print-button', 'loading');
                domClass.remove(body, "map-view-print");
                registry.byId("stackContainer").resize();
                o.map.resize();
            }, 2000);
        });

        // var printTask = new PrintTask(MapConfig.printOptions.url),
        //     template = new PrintTemplate(),
        //     params = new PrintParameters(),
        //     popupBlockerMsg = 'You need to disable your pop-up blocker to see the printed map.',
        //     success,
        //     fail;

        // // Configure Print Template
        // template.format = "png32";
        // template.layout = MapConfig.printOptions.template;
        // template.showAttribution = false;
        // template.preserveScale = false;

        // params.map = o.map;
        // params.template = template;

        // success = function(res) {
        //     var redirect = window.open(res.url, '_blank');
        //     domClass.remove('print-button', 'loading');
        //     domClass.remove("map-container", "map-container-print");
        //     if (redirect === null || typeof(redirect) === undefined || redirect === undefined) {
        //         alert(popupBlockerMsg);
        //     }
        // };

        // fail = function(err) {
        //     domClass.remove('print-button', 'loading');
        //     domClass.remove("map-container", "map-container-print");
        //     console.error(err);
        // };

        // // Change Background image of Print Button to be the loading wheel, TEMP, toggle html
        // domClass.add('print-button', 'loading');

        // printTask.execute(params, success, fail);
    };

    o.reportAnalyticsHelper = function(eventType, action, label) {
        ga('A.send', 'event', eventType, action, label);
        ga('B.send', 'event', eventType, action, label);
        ga('C.send', 'event', eventType, action, label);
    };

    o.showEmbedCode = function() {
        if (registry.byId("embedCodeShareDialog")) {
            registry.byId("embedCodeShareDialog").destroy();
        }
        var embedCode = "<iframe src='" + window.location + "' height='600' width='900'></iframe>",
            dialog = new Dialog({
                title: "Embed Code",
                style: "width: 350px",
                id: "embedCodeShareDialog",
                content: "Copy the code below to embed in your site. (Ctrl+C on PC and Cmd+C on Mac)" +
                    "<div class='dijitDialogPaneActionBar'>" +
                    '<input id="embedInput" type="text" value="' + embedCode + '" autofocus /></div>'
            }),
            cleanup;


        cleanup = function() {
            dialog.destroy();
        };

        dialog.show();
        dom.byId("embedInput").select();

        dialog.on('cancel', function() {
            cleanup();
        });
    };

    return o;

});