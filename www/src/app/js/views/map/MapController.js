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
    "dojo/date",
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
    "esri/layers/TiledMapServiceLayer",
    "esri/layers/ImageParameters",
    "esri/layers/FeatureLayer",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Extent",
    "esri/geometry/Polygon",
    "esri/InfoTemplate",
    "esri/dijit/PopupTemplate",
    "esri/graphic",
    "esri/urlUtils",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/renderers/smartMapping",
    "esri/Color",
    "dijit/registry",
    "views/map/MapConfig",
    "views/map/MapModel",
    "views/map/LayerController",
    "views/map/WindyController",
    "views/map/clusterfeaturelayer",
    "views/map/Finder",
    "views/report/ReportOptionsController",
    "utils/DijitFactory",
    "modules/EventsController",
    "esri/request",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/tasks/RelationshipQuery",
    "esri/tasks/PrintTask",
    "esri/tasks/PrintParameters",
    "esri/tasks/PrintTemplate",
    "views/map/DigitalGlobeTiledLayer",
    "views/map/DigitalGlobeServiceLayer",
    "views/map/BurnScarTiledLayer",
    "views/map/Uploader",
    "views/map/DrawTool",
    "modules/HashController",
    "esri/layers/GraphicsLayer",
    "esri/layers/ImageServiceParameters",
    "dijit/Dialog",
    "utils/Helper",
    "dojo/aspect",
    "utils/Analytics"
], function(on, dom, dojoQuery, domConstruct, number, domClass, arrayUtils, Fx, all, Deferred, domStyle, domGeom, dojoDate, Map, esriConfig, HomeButton, Point, BasemapGallery, Basemap, BasemapLayer, Locator,
    Geocoder, Legend, Scalebar, ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, TiledMapServiceLayer, ImageParameters, FeatureLayer, webMercatorUtils, Extent, Polygon, InfoTemplate, PopupTemplate, Graphic, urlUtils, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, SimpleRenderer, ClassBreaksRenderer, SmartMapping, Color,
    registry, MapConfig, MapModel, LayerController, WindyController, ClusterFeatureLayer, Finder, ReportOptionsController, DijitFactory, EventsController, esriRequest, Query, QueryTask, RelationshipQuery, PrintTask, PrintParameters,
    PrintTemplate, DigitalGlobeTiledLayer, DigitalGlobeServiceLayer, BurnScarTiledLayer, Uploader, DrawTool, HashController, GraphicsLayer, ImageServiceParameters, Dialog, Helper, aspect, Analytics) {

    var o = {},
        initialized = false,
        view = {
            viewId: "mapView",
            viewName: "map"
        },
        featuresImageryFootprints = [],
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
            o.fromStories();
            o.checkBubble();
            Analytics.sendPageview("/" + window.location.href.split('#')[1], "map");
            return;
        }

        initialized = true;


        //otherwise load the view
        require(["dojo/text!views/map/map.html", "dojo/ready"], function(html, ready) {
            dom.byId(view.viewId).innerHTML = html;
            // Helper.showLoader("map", "map-blocker");

            EventsController.switchToView(view);

            ready(function() { // Ensure the map loads to correct size by not loading too early

                MapModel.applyBindings("map-view");
                // Initialize addthis since it was loaded asynchronously
                // addthis.init();
                that.addConfigurations();
                $("#footerView").hide();
                that.createMap();


                // that.createMap().then(function() {
                //     that.checkBubble();
                // });
                setTimeout(function() {
                    that.checkBubble();
                    that.fromStories();
                    Helper.showLoader("clusterCircle", "cluster-blocker");
                }, 1000);

            });
        });
        Analytics.sendPageview("/" + window.location.href.split('#')[1], "map");
    };

    o.centerChange = function() {
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
        // var proxyUrl = "/proxy/proxy.ashx";
        var proxyUrl = "/proxy/proxy.php";

        for (var domain in proxies) {

            if (url.indexOf(domain) === 0) {
              console.log(domain)
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
            urlPrefix: 'http://gis-gfw.wri.org',
            proxyUrl: './proxy/proxy.php'//proxyUrl
        });

        // urlUtils.addProxyRule({
        //     urlPrefix: MapConfig.landsat8.prefix,
        //     proxyUrl: proxyUrl
        // });

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
        var basemap = MapConfig.basemapReverseLookup[HashController.newState.b];

        o.map = new Map("map", {
            center: [hashX, hashY], //MapConfig.mapOptions.center,
            zoom: hashL || MapConfig.mapOptions.initalZoom,
            basemap: basemap || MapConfig.mapOptions.basemap,
            minZoom: MapConfig.mapOptions.minZoom,
            maxZoom: MapConfig.mapOptions.maxZoom,
            sliderPosition: MapConfig.mapOptions.sliderPosition,
            force3DTransforms: true,
            navigationMode: "css-transforms"
        });
        window.map = o.map;

        o.map.on("load", function() {
            //$("#firesDateFrom").datepicker("setDate", "+0m -7d");
            //o.map.setBasemap('dark-gray');
            $("#firesDateTo").datepicker("option", "minDate", "+0m -7d");
            $("#noaaDateFrom").datepicker("setDate", "10/22/2014");
            $("#indoDateFrom").datepicker("setDate", "1/1/2013");
            //$("#hiddenFires").css("display", "none");

            // Clear out default Esri Graphic at 0,0, dont know why its even there
            o.map.graphics.clear();
            MapModel.vm.windPicker();

            // Resize Accordion
            registry.byId("fires-map-accordion").resize();
            WindyController.setMap(o.map);
            LayerController.setMap(o.map);
            Finder.setMap(o.map);
            // Set the map for the upload tool so it has access to map properties
            Uploader.setMap(o.map);
            // Init the draw tool with the map so it can bind to and work with the map
            DrawTool.init(map);
            self.addWidgets();
            self.bindEvents();
            self.addLayers();
            Finder.setupInfowindowListeners();

            // Hack to get the correct extent set on load, this can be removed
            // when the hash controller workflow is corrected
            on.once(o.map, "update-end", function() {

                o.map.centerAt(new Point(hashX, hashY)).then(function() {
                    //o.map.centerAt(new Point(-10.24, 9.66)).then(function() {
                    setTimeout(function() {
                        o.mapExtentPausable.resume();

                        //todo: why is this getting set again afterwards?

                        // var $body = $('body'),
                        //     $overlay = $('<div>', {
                        //         css: {
                        //             position: 'absolute',
                        //             width: $body.outerWidth(),
                        //             height: $body.outerHeight(),
                        //             top: $body.position().top,
                        //             left: $body.position().left,
                        //             backgroundColor: 'rgba(255,255,255,0.5)',
                        //             zIndex: 75,
                        //             display: 'none'
                        //         }
                        //     }).appendTo($body);
                        // $overlay.show();
                        // var hideOverlay = function() {
                        //         $overlay.hide();
                        //     }
                        // $("#joyRideTipContent").joyride({
                        //     nextButton: false,
                        //     autoStart: true,
                        //     postRideCallback: hideOverlay
                        // });

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
            // if (MapModel.vm.smartRendererName() == "Hex bin") {
            //     var smartMappingHexagons = o.map.getLayer("smartMappingHexagons");
            //     smartMappingHexagons.clear();
            //     o.setSmartRenderer("Hex bin");
            // }

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

    o.fromStories = function() {
        console.log("Checking out user stories");
        if (MapConfig.storiesBool) {
            registry.byId("fire-stories-checkbox").setValue(true);
            registry.byId("fires-map-accordion").selectChild(registry.byId("social-media-panel"));
            MapConfig.storiesBool = false;
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
        var uniqueId;

        for (var i = 0; i < imageBoxes.graphics.length; i++) {
            if (mapExtent.intersects(imageBoxes.graphics[i].geometry)) {
                featuresImageryFootprints.push(imageBoxes.graphics[i]);
            }
        }

        arrayUtils.forEach(featuresImageryFootprints, function(f) {
            var date = moment(f.attributes.AcquisitionDate).tz('Asia/Jakarta');
            if (date >= start && date <= end) {
                var date = moment(f.attributes.AcquisitionDate).tz('Asia/Jakarta');
                f.attributes.AcquisitionDate = date.format("YYYY/MM/DD");
                var dateLink = "<a class='popup-link' data-bucket='" + f.attributes.SensorName + "_id_" + f.attributes.OBJECTID + "'>" + date.format("YYYY/MM/DD") + "</a>";
                var dateLink2 = "<a class='popup-link' data-bucket='" + f.attributes.SensorName + "_id_" + f.attributes.OBJECTID + "'>" + f.attributes.SensorName + "</a>";
                f.attributes.formattedDatePrefix1 = dateLink;
                f.attributes.formattedDatePrefix2 = dateLink2;

                uniqueId = Helper.getDigitalGlobeUniqueId(f);

                MapModel.vm.digitalGlobeInView.push({
                    feature: f,
                    selected: (uniqueId === MapModel.vm.selectedImageryID())
                });
            }

        });

        MapModel.vm.digitalGlobeInView.sort(function(left, right) {
            return left.feature.attributes.AcquisitionDate == right.feature.attributes.AcquisitionDate ? 0 : (left.feature.attributes.AcquisitionDate > right.feature.attributes.AcquisitionDate ? -1 : 1);
        });

    };

    o.showDigitalGlobe = function(data, event) {
        var digitalGlobeInView = MapModel.vm.digitalGlobeInView();
        MapModel.vm.digitalGlobeInView([]);

        arrayUtils.forEach(digitalGlobeInView, function(f) {
            if (f == data) {
                f.selected = true;
            } else {
                f.selected = false;
            }
            MapModel.vm.digitalGlobeInView.push(f);
        });

        var uniqueId = Helper.getDigitalGlobeUniqueId(data.feature);
        MapModel.vm.selectedImageryID(uniqueId);
        o.map.infoWindow.hide();

        LayerController.showDigitalGlobeImagery(data);
    };

    o.imageryZoom = function(data, event) {
        var imageBoxes = o.map.getLayer("Digital_Globe_Bounding_Boxes_Highlight");
        imageBoxes.clear();
        o.map.setExtent((data.feature.geometry.getExtent()));
    };

    o.handleImageryOver = function(data, event) {

        var highlightGraphic = new Graphic(data.feature.geometry);
        var imageBoxes = o.map.getLayer("Digital_Globe_Bounding_Boxes_Highlight");
        imageBoxes.add(highlightGraphic);
    };

    o.handleImageryOut = function(data, event) {

        var imageBoxes = o.map.getLayer("Digital_Globe_Bounding_Boxes_Highlight");
        imageBoxes.clear();
    };

    o.removeLoaderFromClusters = function(data, event) {

        $("#clusterCircle").addClass("hoverSmart");
        Helper.hideLoader("cluster-blocker");
    };

    o.blockClusters = function(data, event) {

        $("#clusterCircle").removeClass("hoverSmart");
        $("#clusterCircle").css("pointer-events", "none");
        Helper.createBlocker("clusterCircle", "cluster-denier");
    };

    o.getClassJenks = function(nbClass, data) {
        /**
            Function modified from geostats.js lib @ https://github.com/simogeo/geostats
             * Credits : Doug Curl (javascript) and Daniel J Lewis (python implementation)
             * http://www.arcgis.com/home/item.html?id=0b633ff2f40d412995b8be377211c47b
             * http://danieljlewis.org/2010/06/07/jenks-natural-breaks-algorithm-in-python/
             */

        // if (this._nodata())
        //     return;

        var dataList = data.sort(function(a, b) {
            return a - b;
        });
        // now iterate through the datalist:
        // determine mat1 and mat2
        // really not sure how these 2 different arrays are set - the code for
        // each seems the same!
        // but the effect are 2 different arrays: mat1 and mat2
        var mat1 = []
        for (var x = 0, xl = dataList.length + 1; x < xl; x++) {
            var temp = []
            for (var j = 0, jl = nbClass + 1; j < jl; j++) {
                temp.push(0)
            }
            mat1.push(temp)
        }

        var mat2 = []
        for (var i = 0, il = dataList.length + 1; i < il; i++) {
            var temp2 = []
            for (var c = 0, cl = nbClass + 1; c < cl; c++) {
                temp2.push(0)
            }
            mat2.push(temp2)
        }

        // absolutely no idea what this does - best I can tell, it sets the 1st
        // group in the
        // mat1 and mat2 arrays to 1 and 0 respectively
        for (var y = 1, yl = nbClass + 1; y < yl; y++) {
            mat1[0][y] = 1
            mat2[0][y] = 0
            for (var t = 1, tl = dataList.length + 1; t < tl; t++) {
                mat2[t][y] = Infinity
            }
            var v = 0.0
        }

        // and this part - I'm a little clueless on - but it works
        // pretty sure it iterates across the entire dataset and compares each
        // value to
        // one another to and adjust the indices until you meet the rules:
        // minimum deviation
        // within a class and maximum separation between classes
        for (var l = 2, ll = dataList.length + 1; l < ll; l++) {
            var s1 = 0.0
            var s2 = 0.0
            var w = 0.0
            for (var m = 1, ml = l + 1; m < ml; m++) {
                var i3 = l - m + 1
                var val = parseFloat(dataList[i3 - 1])
                s2 += val * val
                s1 += val
                w += 1
                v = s2 - (s1 * s1) / w
                var i4 = i3 - 1
                if (i4 != 0) {
                    for (var p = 2, pl = nbClass + 1; p < pl; p++) {
                        if (mat2[l][p] >= (v + mat2[i4][p - 1])) {
                            mat1[l][p] = i3
                            mat2[l][p] = v + mat2[i4][p - 1]
                        }
                    }
                }
            }
            mat1[l][1] = 1
            mat2[l][1] = v
        }

        var k = dataList.length
        var kclass = []

        // fill the kclass (classification) array with zeros:
        for (i = 0; i <= nbClass; i++) {
            kclass.push(0);
        }

        // this is the last number in the array:
        kclass[nbClass] = parseFloat(dataList[dataList.length - 1])
        // this is the first number - can set to zero, but want to set to lowest
        // to use for legend:
        kclass[0] = parseFloat(dataList[0])
        var countNum = nbClass
        while (countNum >= 2) {
            var id = parseInt((mat1[k][countNum]) - 2)
            kclass[countNum - 1] = dataList[id]
            k = parseInt((mat1[k][countNum] - 1))
            // spits out the rank and value of the break values:
            // console.log("id="+id,"rank = " + String(mat1[k][countNum]),"val =
            // " + String(dataList[id]))
            // count down:
            countNum -= 1
        }
        // check to see if the 0 and 1 in the array are the same - if so, set 0
        // to 0:
        if (kclass[0] == kclass[1]) {
            kclass[0] = 0
        }

        return kclass;
    }

    o.setSmartRenderer = function(newRenderer) {
        //var smartMappingHexagons = o.map.getLayer("smartMappingHexagons");

        switch (newRenderer) {

            case "Heat map":

                var firesClusters, fireHeat, hexFires;
                fireHeat = o.map.getLayer("newFires");

                fireHeat.show();
                firesClusters = o.map.getLayer("firesClusters");

                firesClusters.hide();
                // hexFires = o.map.getLayer("hexFires");
                // hexFires.hide();

                //smartMappingHexagons.clear();
                break;
            case "Proportional symbols":
                firesClusters = o.map.getLayer("firesClusters");
                firesClusters.show();
                var fireHeat, firesClusters, hexFires;
                fireHeat = o.map.getLayer("newFires");
                fireHeat.hide();
                // hexFires = o.map.getLayer("hexFires");
                // hexFires.hide();

                //smartMappingHexagons.clear();
                break;

        }
    }

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

    o.removeAnalysisFromHash = function() {
        LayerController.updateLayersInHash("remove", "Get_Fires_Analysis");
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
        // darkgray = new Basemap({
        //     layers: [
        //         new BasemapLayer({
        //             url: MapConfig.mapOptions.darkGrayCanvas
        //         })
        //     ],
        //     id: "darkgray",
        //     title: "Dark Gray Canvas",
        //     thumbnailUrl: "app/images/darkGreyThumb.jpg"
        // });
        var newBaseMap = new Basemap({
            layers: [
                new BasemapLayer({
                    url: "https://api.tiles.mapbox.com/v4/wri.c974eefc/${level}/${col}/${row}.png?access_token=pk.eyJ1Ijoid3JpIiwiYSI6IjU3NWNiNGI4Njc4ODk4MmIyODFkYmJmM2NhNDgxMWJjIn0.v1tciCeBElMdpnrikGDrPg",
                    type: "WebTiledLayer"
                }),
                new BasemapLayer({
                    url: "https://api.tiles.mapbox.com/v4/wri.acf5a04e/${level}/${col}/${row}.png?access_token=pk.eyJ1Ijoid3JpIiwiYSI6IjU3NWNiNGI4Njc4ODk4MmIyODFkYmJmM2NhNDgxMWJjIn0.v1tciCeBElMdpnrikGDrPg",
                    type: "WebTiledLayer"
                })
            ],
            id: "newBM",
            title: "WRI",
            thumbnailUrl: "app/images/devSeed.png"
        });

        //var newBM = new TiledMapServiceLayer("http://a.tiles.mapbox.com/v4/devseed.3100ad78/{level}/{col}/{row}.png?access_token=pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJnUi1mbkVvIn0.018aLhX0Mb0tdtaT2QNe2Q");
        basemaps.push(newBaseMap);
        //console.log(basemaps);

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

        var showFiresConfidenceInfo = function(evt) {
            evt.preventDefault();
            var _self = this;
            require([
                "dijit/Dialog",
                "dojo/on",
                "dojo/_base/lang"
            ], function(Dialog, on, Lang) {
                var content = "<p>" + MapConfig.text.firesConfidenceDialog.text + "</p>";

                var dialog = new Dialog({
                    title: MapConfig.text.firesConfidenceDialog.title.toUpperCase(),
                    style: "height: 310px; width: 415px;",
                    id: "highConfidenceDialog",
                    draggable: false,
                    hide: function() {
                        dialog.destroy();
                    }
                });
                dialog.setContent(content);
                dialog.show();

                $('body').on('click',function(e){
                    if (e.target.classList.contains('dijitDialogUnderlay')) {
                        dialog.hide();
                        $('body').off('click');
                    }
                });

            });
        };

        var toggleLocatorWidgets = function() {
            // If basemap Gallery is Open, Close it
            if (MapModel.get('showBasemapGallery')) {
                MapModel.set('showBasemapGallery', false);
            }

            if (MapModel.get('showShareContainer')) {
                MapModel.set('showShareContainer', false);
            }

            if (MapModel.get('showAlertContainer')) {
                MapModel.set('showAlertContainer', false);
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

            if (MapModel.get('showAlertContainer')) {
                MapModel.set('showAlertContainer', false);
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

        var toggleAlertsContainer = function() {

            if (MapModel.get('showLocatorWidgets')) {
                MapModel.set('showLocatorWidgets', false);
            }
            if (MapModel.get('showBasemapGallery')) {
                MapModel.set('showBasemapGallery', false);
            }
            if (MapModel.get('showShareContainer')) {
                MapModel.set('showShareContainer', false);
            }

            MapModel.set('showAlertContainer', !MapModel.get('showAlertContainer'));

        };

        var toggleUploadTools = function() {
            MapModel.set('showDrawTools', false);
            $("#drawFeatures").css("background-color", "#444");
            MapModel.set('showUploadTools', !MapModel.get('showUploadTools'));
            if (MapModel.get('showUploadTools')) {
                $("#uploadFeatures").css("background-color", "#e7002f");
            } else {
                $("#uploadFeatures").css("background-color", "#444");
            }
            if (DrawTool.isActive()) {
                DrawTool.deactivateToolbar();
            }
        };
        var toggleDrawTools = function() {
            MapModel.set('showUploadTools', false);
            $("#uploadFeatures").css("background-color", "#444");
            MapModel.set('showDrawTools', !MapModel.get('showDrawTools'));
            if (MapModel.get('showDrawTools')) {
                $("#drawFeatures").css("background-color", "#e7002f");
            } else {
                $("#drawFeatures").css("background-color", "#444");
            }
            // if (DrawTool.isActive()) {
            //     DrawTool.deactivateToolbar();
            // }
        };

        var shareBasemap = function() {
            HashController.updateHash({
                b: bg.getSelected().title
            });
        };


        dojoQuery(".high-confidence-info").forEach(function(node) {
            $(node).on("click", showFiresConfidenceInfo);

        });
        on(dom.byId("locator-widget-button"), "click", toggleLocatorWidgets);
        on(dom.byId("basemap-gallery-button"), "click", toggleBasemapGallery);
        on(dom.byId("share-button"), "click", toggleShareContainer);
        on(dom.byId("alert-button"), "click", toggleAlertsContainer);
        on(dom.byId("uploadFeatures"), "click", toggleUploadTools);
        on(dom.byId("drawFeatures"), "click", toggleDrawTools);
        on(dom.byId("uploadForm"), "change", Uploader.beginUpload.bind(Uploader));
        bg.on('selection-change', shareBasemap);

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
            Finder.identifyInfoWindows(evt);
        });

        on(o.map.graphics, "click", function(evt) {
            console.log(evt);
            if (evt.graphic) {
                Finder.selectUploadOrDrawnGraphics(evt);
            }
        });
        on(registry.byId("confidence-fires-checkbox"), "change", function(evt) {
            LayerController.updateFiresLayer(true);

            var reRun = LayerController.updateOtherFiresLayers();

            if (reRun) {
                o.setSmartRenderer(MapModel.vm.smartRendererName());
            }
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

        on(registry.byId("fire-stories-checkbox"), "change", function(evt) {

            var value = registry.byId("fire-stories-checkbox").checked;

            LayerController.toggleLayerVisibility(MapConfig.fireStories.id, value);
            if (value) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Fire Stories layer on.');
            }
        });

        on(registry.byId("fires-checkbox"), "change", function(evt) {
            var value = registry.byId("fires-checkbox").checked;
            LayerController.toggleLayerVisibility(MapConfig.firesLayer.id, value);
            MapModel.vm.showActiveFiresButtons(value);
            if (value) {
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Active Fires layer on.');

            } else {
                MapModel.vm.smartRendererName("Choose one");
                //var graphicsLayer = o.map.getLayer("smartMappingHexagons");
                //graphicsLayer.clear();
                var firesClusters = o.map.getLayer("firesClusters");
                firesClusters.hide();
                var newFires = o.map.getLayer("newFires");
                newFires.hide();
                $("#heatCircle").css("box-shadow", "0 0 0 3px #ddd");
                $("#clusterCircle").css("box-shadow", "0 0 0 3px #ddd");
                $("#hexCircle").css("box-shadow", "0 0 0 3px #ddd");
            }
        });

        on(registry.byId("air-quality-checkbox"), "change", function(value) {
            LayerController.toggleLayerVisibility(MapConfig.airQualityLayer.id, value);
            if (!value) {
                MapModel.vm.showReportOptionsAIR(false);
                return;
            } else {
                $("#airDate").datepicker("setDate", "+0m +0d");
                o.map.getLayer(MapConfig.airQualityLayer.id).setVisibleLayers([0]);
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Air Quality layer on.');
                MapModel.vm.showReportOptionsAIR(true);
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
            // if (value == true) {
            //     $(".confidence-fires-container").css("margin-left", "38px");
            // } else {
            //     $(".confidence-fires-container").css("margin-left", "46px");
            // }
            LayerController.toggleMapServiceLayerVisibility(o.map.getLayer(MapConfig.indonesiaLayers.id),
                MapConfig.indonesiaLayers.layerIds['indonesiaFires'], value);
        });



        on(registry.byId("noaa-fires-18"), "change", function(value) {
            LayerController.toggleMapServiceLayerVisibility(o.map.getLayer(MapConfig.indonesiaLayers.id),
                MapConfig.indonesiaLayers.layerIds['noaa18'], value);
        });

        // on(registry.byId("burned-scars-checkbox"), "change", function(value) {
        //     LayerController.toggleLayerVisibility(MapConfig.burnScarLayer.id, value);
        //     if (value) {
        //         self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Burn Scars layer on.');
        //     }
        // });



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
            o.updateImageryList();

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

        // $("#uploadCustomGraphic").hover(function() {
        //     debugger;
        //     $("#customGraphicSymbol").css("background-color", "red");
        // });



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
            console.log("In hash");
            var currentHash = HashController.getHash();

            if (currentHash.lyrs.indexOf("Get_Fires_Analysis") === -1) {
                console.log("Changing hash");
                LayerController.updateLayersInHash('add', "lyrs", "Get_Fires_Analysis");
            }
            //check hash when map loads and turn this guy on

        });

        on(registry.byId("fire-risk-checkbox"), "change", function(value) {
            LayerController.toggleLayerVisibility(MapConfig.fireRiskLayer.id, value);
            if (value) {
                MapModel.vm.showReportOptionsRisk(true);
                self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the Fire Risk layer on.');
            } else {
                MapModel.vm.showReportOptionsRisk(false);
            }
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

        on(dom.byId('updateRisk'), 'click', function() {
            self.setFireRiskDefinition();


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

        dojoQuery(".smartRelative").forEach(function(node) {
            on(node, "click", function() {

                var realFires = o.map.getLayer("Active_Fires");
                $("#heatCircle").css("box-shadow", "0 0 0 3px #ddd");
                $("#clusterCircle").css("box-shadow", "0 0 0 3px #ddd");
                $("#hexCircle").css("box-shadow", "0 0 0 3px #ddd");


                if ((this.id == "hexCircle" && MapModel.vm.smartRendererName() == "Hex bin") || (this.id == "clusterCircle" && MapModel.vm.smartRendererName() == "Proportional symbols") || (this.id == "heatCircle" && MapModel.vm.smartRendererName() == "Heat map")) {
                    var fireHeat = o.map.getLayer("newFires");
                    fireHeat.hide();

                    var firesClusters = o.map.getLayer("firesClusters");
                    firesClusters.hide();

                    // var hexFires = o.map.getLayer("firesClusters");
                    // hexFires.hide();

                    realFires.show();
                    MapModel.vm.smartRendererName("Choose one");
                    //var smartMappingHexagons = o.map.getLayer("smartMappingHexagons");
                    //smartMappingHexagons.clear();

                    return;

                }

                if (this.id == "heatCircle") {
                    o.setSmartRenderer("Heat map");
                    MapModel.vm.smartRendererName("Heat map");
                } else if (this.id == "clusterCircle") {
                    o.setSmartRenderer("Proportional symbols");
                    MapModel.vm.smartRendererName("Proportional symbols");
                } else if (this.id == "hexCircle") {
                    o.setSmartRenderer("Hex bin");
                    MapModel.vm.smartRendererName("Hex bin");
                } else {
                    return;
                }
                $(this).css("box-shadow", "0 0 0 3px #e98300");
                realFires.hide();
                // MapModel.vm.smartRendererName();
            });
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

        on(dom.byId('updateAIR'), 'click', function() {

            var currentDate = $("#airDate").datepicker("getDate");

            var today = new Date();
            today.setHours(0, 0, 0, 0);

            if (currentDate.getTime() == today.getTime()) {
                var layer = o.map.getLayer(MapConfig.airQualityLayer.id);
                layer.setVisibleLayers([0]);
                return;
            }

            var dayPicked = moment(currentDate).format("MM/DD/YYYY");


            var start = dayPicked.split('/');
            start[0] = parseInt(start[0]);
            start[1] = parseInt(start[1]);

            dayPicked = start.join('/');

            var sqlQuery = "Date LIKE '" + dayPicked + "%'";

            LayerController.updateDynamicMapServiceLayerDefinition(o.map.getLayer(MapConfig.airQualityLayer.id), 1, sqlQuery);

        });



        on(dom.byId("embedShare"), "click", function() {
            self.showEmbedCode();
        });

        on(dom.byId("clear-search-pins"), "click", this.clearSearchPins);
        on(dom.byId("legend-widget-title"), "click", this.toggleLegend);

        registry.byId("forest-transparency-slider").on('change', function(value) {
            LayerController.setTransparency(MapConfig.forestUseLayers.id, value);
        });

        registry.byId("forest-transparency-slider").on('change', function(value) {
            LayerController.setTransparency(MapConfig.forestUseRSPO.id, value);
        });

        registry.byId("forest-transparency-slider").on('change', function(value) {
            LayerController.setTransparency(MapConfig.landUseLayers.id, value);
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
                if ($('#uploadCustomGraphic').length > 0) {
                    $("#uploadCustomGraphic").remove();
                }
            });
        });

        on(o.map.infoWindow, "hide", function() {
            o.map.infoWindow.clearFeatures();
        });

        dojoQuery("#forest-use-panel div.checkbox-container div input").forEach(function(node) {
            if (node.id == "rspo-oil-palm-checkbox" || node.id == "indicative-moratorium-checkbox") {
                domClass.add(node, "forest-use-layers-option");
            } else {
                domClass.add(node, "land-use-layers-option");
            }

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


                // Try to parse out some arguments, and use them for Analytics
                var target = evt.target ? evt.target : evt.srcElement;


                if (target.classList.contains('forest-use-layers-option')) {
                    console.log("frest")
                    LayerController.updateAdditionalVisibleLayers("forest-use-layers-option", MapConfig.forestUseLayers);
                    LayerController.updateAdditionalVisibleLayers("forest-use-layers-option", MapConfig.forestUseRSPO);
                } else if (target.classList.contains('land-use-layers-option')) {
                    console.log("land")
                    LayerController.updateAdditionalVisibleLayers("land-use-layers-option", MapConfig.landUseLayers);
                    LayerController.updateAdditionalVisibleLayers("forest-use-layers-option", MapConfig.forestUseRSPO);
                }

                // if (target.checked) {
                    //TODO : find better way to get label
                    // var labelNode = dojoQuery("#fires-panel .dijitChecked")[0].parentNode.children[1]; //TODO: WHY IS THIS FAILING???
                    // if (labelNode.innerHTML.length > 0) {
                    //     var label = labelNode.innerHTML;
                    //     if (label.search("None") === -1) {
                    //         self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the ' + label + ' layer on');
                    //     }
                    // }
                // }
            });
        });

        dojoQuery(".conservation-layers-option").forEach(function(node) {
            on(node, "change", function(evt) {
                //Params are, class to Query to find which layers are checked on or off, and config object for the layer
                LayerController.updateAdditionalVisibleLayers("conservation-layers-option", MapConfig.conservationLayers);

                // Try to parse out some arguments, and use them for Analytics
                var target = evt.target ? evt.target : evt.srcElement;
                if (target.checked) {

                    //TODO : find better way to get label
                    // var labelNode = dojoQuery("#conservation-panel .dijitChecked")[0].parentNode.children[1];
                    // if (labelNode.innerHTML.length > 0) {
                    //     var label = labelNode.innerHTML;
                    //     if (label.search("None") === -1) {
                    //         self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the ' + label + ' layer on');
                    //     }
                    // }
                }
            });
        });

        dojoQuery(".land-cover-layers-option").forEach(function(node) {
            on(node, "change", function(evt) {
                LayerController.updateLandCoverLayers(evt);
                //debugger;
                // Try to parse out some arguments, and use them for Analytics
                var target = evt.target ? evt.target : evt.srcElement;
                if (target.checked) {
                    //dojoQuery("land-cover-panel_wrapper .land-cover-layers-option.dijitChecked label")[0];
                    //TODO : find better way to get label
                    var labelNode = dojoQuery("#land-cover-panel .dijitChecked")[0].parentNode.children[1];
                    if (labelNode.innerHTML.length > 0) {
                        var label = labelNode.innerHTML;
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
            primaryForestsParams,
            primaryForestsLayer,
            digitalGlobeLayers,
            landCoverParams,
            landCoverLayer,
            airQualityLayer,
            forestUseParams,
            forestUseLayer,
            forestUseRSPOParams,
            forestUseRSPO,
            landUseParams,
            landUseLayer,
            treeCoverLayer,
            fireRiskLayer,
            overlaysLayer,
            burnScarLayer,
            tomnodLayer,
            tomnodParams,
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

        forestUseRSPOParams = new ImageParameters();
        forestUseRSPOParams.format = "png32";
        forestUseRSPOParams.layerIds = MapConfig.forestUseRSPO.defaultLayers;
        forestUseRSPOParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        forestUseRSPO = new ArcGISDynamicMapServiceLayer(MapConfig.forestUseRSPO.url, {
            imageParameters: forestUseRSPOParams,
            id: MapConfig.forestUseRSPO.id,
            visible: false
        });

        landUseParams = new ImageParameters();
        landUseParams.format = "png32";
        landUseParams.layerIds = MapConfig.landUseLayers.defaultLayers;
        landUseParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

        landUseLayer = new ArcGISDynamicMapServiceLayer(MapConfig.landUseLayers.url, {
            imageParameters: landUseParams,
            id: MapConfig.landUseLayers.id,
            visible: false
        });

        treeCoverLayer = new ArcGISImageServiceLayer(MapConfig.treeCoverLayer.url, {
            id: MapConfig.treeCoverLayer.id,
            visible: false
        });

        fireRiskLayer = new ArcGISImageServiceLayer(MapConfig.fireRiskLayer.url, {
            id: MapConfig.fireRiskLayer.id,
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

        dgConf = MapConfig.digitalGlobe;

        digitalGlobeLayers = dgConf.imageServices.map(function (service) {
          return (new ArcGISImageServiceLayer(service.url, {
            id: service.id,
            visible: false
          }));
        });

        dglyrs = digitalGlobeLayers;

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

        var firesViz = new FeatureLayer(MapConfig.firesLayer.smartURL, {
            mode: FeatureLayer.MODE_ONDEMAND,
            //defaultDefinitionExpression: "ACQ_DATE > date'04-12-2015 00:00:00' AND ACQ_DATE < date'04-12-2015 06:00:00'",
            id: "newFires",
            visible: false,
            // renderer: o.heatMapRenderer,
            outFields: "*"
        });

        var defaultSym = new SimpleMarkerSymbol("circle", 9,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255, 1]), 1),
            new Color([254, 182, 62, 1]));

        var selectedSym = new SimpleMarkerSymbol("circle", 16,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([102, 0, 0, 0.85]), 3),
            new Color([255, 255, 255, 1]));

        var firesVizCluster = new ClusterFeatureLayer({
            "url": MapConfig.firesLayer.smartURL,
            "distance": 95,
            "id": "firesClusters",
            "labelColor": "#fff",
            //"MODE_SNAPSHOT": false,
            "resolution": o.map.extent.getWidth() / o.map.width,
            //"singleColor": "#888",
            "singleSymbol": defaultSym,
            //"singleTemplate": infoTemplate,
            "useDefaultSymbol": false,
            "zoomOnClick": true,
            "showSingles": true,
            "visible": false,
            "objectIdField": "FID",
            outFields: ["ACQ_DATE", "CONFIDENCE", "BRIGHTNESS"]
        });

        firesVizCluster.on("clusters-shown", function() {

            var today = new Date();

            if (!map.clusterDataOnce && this._clusterData.length > 0) {
                var today = new Date();
                var backdate72 = today.setDate(today.getDate() - 3);
                var backdate48 = today.setDate(today.getDate() - 2);
                var backdate24 = today.setDate(today.getDate() - 1);

                map.clusterData = {};
                map.clusterData.fullData = this._clusterData;

                map.clusterData.past72 = this._clusterData.filter(function(g) {
                    return g.attributes.ACQ_DATE < backdate72;
                });
                map.clusterData.past48 = this._clusterData.filter(function(g) {
                    return g.attributes.ACQ_DATE < backdate48;
                });
                map.clusterData.past24 = this._clusterData.filter(function(g) {
                    return g.attributes.ACQ_DATE < backdate24;
                });

                map.clusterData.highConfidence = this._clusterData.filter(function(g) {
                    return g.attributes.CONFIDENCE >= 30 && g.attributes.BRIGHTNESS >= 330;
                });

                map.clusterData.highConfidencepast72 = this._clusterData.filter(function(g) {
                    return g.attributes.ACQ_DATE < backdate72 && g.attributes.CONFIDENCE >= 30 && g.attributes.BRIGHTNESS >= 330;
                });
                map.clusterData.highConfidencepast48 = this._clusterData.filter(function(g) {
                    return g.attributes.ACQ_DATE < backdate48 && g.attributes.CONFIDENCE >= 30 && g.attributes.BRIGHTNESS >= 330;
                });
                map.clusterData.highConfidencepast24 = this._clusterData.filter(function(g) {
                    return g.attributes.ACQ_DATE < backdate24 && g.attributes.CONFIDENCE >= 30 && g.attributes.BRIGHTNESS >= 330;
                });

                map.clusterDataOnce = true;

            }

        });

        var cRenderer = new ClassBreaksRenderer(defaultSym, "clusterCount");

        var small = new SimpleMarkerSymbol("circle", 10,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([212, 116, 60, 0.5]), 15),
            new Color([212, 116, 60, 0.75]));
        var medium = new SimpleMarkerSymbol("circle", 25,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([178, 70, 37, 0.5]), 15),
            new Color([178, 70, 37, 0.75]));
        var large = new SimpleMarkerSymbol("circle", 35,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([144, 24, 13, 0.5]), 15),
            new Color([144, 24, 13, 0.75]));
        var xlarge = new SimpleMarkerSymbol("circle", 55,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([102, 0, 0, 0.5]), 15),
            new Color([102, 0, 0, 0.75]));

        // Break values - can adjust easily
        cRenderer.addBreak(2, 50, small);
        cRenderer.addBreak(50, 250, medium);
        cRenderer.addBreak(250, 1000, large);
        cRenderer.addBreak(1000, 50000, xlarge);

        // // Providing a ClassBreakRenderer is also optional
        firesVizCluster.setRenderer(cRenderer);

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

        tweetLayer = new FeatureLayer(MapConfig.tweetLayer.url, {
            mode: FeatureLayer.MODE_ONDEMAND,
            id: MapConfig.tweetLayer.id,
            visible: false,
            outFields: ["*"] //,
            //infoTemplate: tweet_infotemplate
        });

        //var htmlContent = Finder.getFireStoriesInfoWindow;

        var fireStory_popupTemplate = new PopupTemplate({
            title: "{Title}",
            //"content": htmlContent,
            fieldInfos: [{
                fieldName: "Date",
                label: "Date",
                format: {
                    dateFormat: 'shortDate'
                },
                visible: true
            }, {
                fieldName: "Details",
                label: "Details",
                visible: true
            }, {
                fieldName: "Video",
                label: "Video",
                visible: true
            }, {
                fieldName: "Name",
                label: "Name",
                visible: true
                // }, {
                //     fieldName: "Email",
                //     label: "Email",
                //     visible: true
            }],
            "showAttachments": true

        }); //TODO: Find a way to filter out attributes w/o values from the popu


        fireStories = new FeatureLayer(MapConfig.fireStories.url, {
            mode: FeatureLayer.MODE_ONDEMAND,
            id: MapConfig.fireStories.id,
            visible: false,
            outFields: ["*"],
            hasAttachments: true,
            definitionExpression: "Publish = 'Y'" //,
            // infoTemplate: fireStory_popupTemplate
        });

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

        var digitalGlobeGraphicsHighlight = new GraphicsLayer(featureCollection, {
            id: MapConfig.digitalGlobe.graphicsLayerHighlight,
            visible: true
        });

        var highlightRenderer = new SimpleRenderer(highlightSymbol);
        digitalGlobeGraphicsHighlight.setRenderer(highlightRenderer);

        SmartMapping.createHeatmapRenderer({
            layer: firesViz,
            //field: field,
            blurRadius: 5,
            basemap: o.map.getBasemap()

        }).then(function(response) {
            //o.heatMapRenderer = response.renderer;
            var fires = o.map.getLayer("newFires");
            fires.setRenderer(response.renderer);
            //newFires.redraw();

        });


        dglyr = digitalGlobeGraphicsLayer;

        // TESTING LAYER
        // var dgGlobeWMSLayer = new DigitalGlobeServiceLayer("https://services.digitalglobe.com/mapservice/wmsaccess", {
        //     id: "DG_WMS",
        //     visible: true
        // });
        var layerlist = [
            //landSatLayer,
            treeCoverLayer,
            fireRiskLayer,
            landCoverLayer,
            primaryForestsLayer,
            digitalGlobeGraphicsLayer,
            digitalGlobeGraphicsHighlight
            //smartMappingHexagons
        ].concat(digitalGlobeLayers).concat([ //add all dg image layers here
            conservationLayer,
            burnScarLayer,
            tomnodLayer,
            forestUseLayer,
            forestUseRSPO,
            landUseLayer,
            overlaysLayer,
            tweetLayer,
            fireStories,
            airQualityLayer,
            tomnodSellayer,
            firesViz,
            firesVizCluster,
            //hexFires,
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

            self.setFireRiskDefinition();
            self.enableLayersFromHash();


            var layerInfos = arrayUtils.map(response.layers, function(item) {
                return {
                    layer: item.layer
                };
            });
            layerInfos = arrayUtils.filter(layerInfos, function(item) {
                if (item.layer.id === "firesClusters") {

                    item.title = "Heat Map";
                }
                var url = !item.layer.url ? false : item.layer.url.search('ImageServer') < 0;
                var flyr = !(item.layer.id === tomnodSellayer.id);
                return (url && flyr);
            });

            // Helper.hideLoader("map-blocker");
            registry.byId("legend").refresh(layerInfos);

        });

        o.map.addLayers(layerlist);
        o.map.addLayer(landSatLayer); //TODO: Add the Landsat layer back in with the others and add in some kind of error catching with its load and its checkbox toggle (if, in the LayerController, its not actually turning a layer on)

        // Set the default layer ordering for Overlays Layer
        overlaysLayer.on('load', LayerController.setOverlayLayerOrder);
        // burnScarLayer.on('error', this.layerAddError);
        // landSatLayer.on('error', this.layerAddError);
        // treeCoverLayer.on('error', this.layerAddError);
        // fireRiskLayer.on('error', this.layerAddError);
        // primaryForestsLayer.on('error', this.layerAddError);
        // conservationLayer.on('error', this.layerAddError);
        // landCoverLayer.on('error', this.layerAddError);
        // overlaysLayer.on('error', this.layerAddError);
        // forestUseLayer.on('error', this.layerAddError);
        // forestUseRSPO.on('error', this.layerAddError);
        // landUseLayer.on('error', this.layerAddError);
        // firesLayer.on('error', this.layerAddError);
        // firesVizCluster.on('error', this.layerAddError);
        // fireStories.on('error', this.layerAddError);
        //
        // //digitalGlobeLayer.on('error', this.layerAddError);
        // airQualityLayer.on('error', this.layerAddError);

        // Change the Land Sat layer order to be right above the basemap but below everything else
        landSatLayer.on('load', function() {
            o.map.reorderLayer(landSatLayer, 1);
        });

    };

    o.removeCustomFeatures = function() {

        o.map.graphics.clear();
        MapModel.vm.customFeaturesArray([]);
        MapModel.vm.customFeaturesPresence(false);
    };

    o.toggleFireOption = function(evt) {
        var node = evt.target ? evt.target : evt.srcElement;
        dojoQuery(".selected-fire-option").forEach(function(el) {
            domClass.remove(el, "selected-fire-option");
        });

        domClass.add(node, "selected-fire-option");
        LayerController.updateFiresLayer();

        var reRun = LayerController.updateOtherFiresLayers();
        if (reRun) {
            o.setSmartRenderer(MapModel.vm.smartRendererName());
        }
        MapModel.vm.currentFireTime(node.id);
        Finder.updateFirePopSelection(dom.byId(node.id+"-pop"));
    };

    o.setFireRiskDefinition = function() {

      var date = MapModel.vm.fireRiskObserv();
      var currentDate = $("#fireRiskDate").datepicker("getDate");

      date = moment(currentDate).tz('Asia/Jakarta').format("M/D/YYYY");

      var year = currentDate.getFullYear();
      var janOne = new Date(year + ' 01 01');
      var origDate = moment(janOne).tz('Asia/Jakarta').format("M/D/YYYY");


      function parseDate(str) {
          var mdy = str.split('/');

          return new Date(mdy[2], mdy[0]-1, mdy[1]);
      }

      function daydiff(first, second) {
          return Math.round((second-first)/(1000*60*60*24)) + 1;
      }

      function isLeapYear(year) {
          if((year & 3) != 0) {
              return false;
          }
          return ((year % 100) != 0 || (year % 400) == 0);
      };

      var julian = daydiff(parseDate(origDate), parseDate(date));
      var month = currentDate.getMonth();
      if (month > 1 && isLeapYear(year)) {
        julian++;
      }

      if (julian.toString().length === 1) {
        julian = "00" + julian.toString();
      } else if (julian.toString().length === 2) {
        julian = "0" + julian.toString();
      } else {
        julian = julian.toString();
      }
      console.log(julian);
      var defQuery = year.toString() + julian + "_IDN_FireRisk";

      console.log("Name = '" + defQuery + "'");
      var riskLayer = o.map.getLayer(MapConfig.fireRiskLayer.id);
      riskLayer.setDefinitionExpression("Name = '" + defQuery + "'");
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
        //setTimeout(function() {
        var currentHash = HashController.getHash();
        if (currentHash.lyrs.indexOf("Get_Fires_Analysis") > -1) {
            console.log("Updating from hash");
            $("#report-link").click();

        }
        //}, 500);


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

                o.map.resize();
                setTimeout(function() {

                    registry.byId("stackContainer").resize();
                }, 1000);

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

        Analytics.sendPageview("/" + window.location.href.split('#')[1], "map");
    };

    return o;

});
