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
            Helper.showLoader("map", "map-blocker");

            EventsController.switchToView(view);

            ready(function() { // Ensure the map loads to correct size by not loading too early

                MapModel.applyBindings("map-view");
                // Initialize addthis since it was loaded asynchronously
                //addthis.init();
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
        // var proxyUrl = "/proxy/proxy.ashx";
        var proxyUrl = "/proxy/proxy.php";



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

                MapModel.vm.digitalGlobeInView.push({
                    feature: f,
                    selected: (f.attributes.OBJECTID == MapModel.vm.selectedImageryID())
                });
            }

        });

        MapModel.vm.digitalGlobeInView.sort(function(left, right) {
            return left.feature.attributes.AcquisitionDate == right.feature.attributes.AcquisitionDate ? 0 : (left.feature.attributes.AcquisitionDate > right.feature.attributes.AcquisitionDate ? -1 : 1);
        });

    };

    o.showDigitalGlobe = function(data, event) {

        // var tableRows = $(event.target).parent().parent().parent()[0];
        // $(tableRows).find('tr').each(function() {
        //     $(this).removeClass("imageryRowSelected");
        // });
        // if (event.target.nodeName == "TD") {
        //     var rowToHighlight = $(event.target).parent();
        // } else {
        //     var rowToHighlight = $(event.target).parent().parent();
        // }
        // $(rowToHighlight).addClass("imageryRowSelected");

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
        MapModel.vm.selectedImageryID(data.feature.attributes.OBJECTID);
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

            // case "Choose one":

            //     var firesClusters, fireHeat, hexFires;

            //     firesClusters = o.map.getLayer("firesClusters");
            //     firesClusters.hide();

            //     hexFires = o.map.getLayer("hexFires");
            //     hexFires.hide();

            //     fireHeat = o.map.getLayer("newFires");
            //     fireHeat.hide();
            //     break;

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
                // case "Hex bin":
                //     smartMappingHexagons.clear();
                //     o.setHexBinRender();

                //     break;
        }
    }

    // o.setHexBinRender = function() {

    //     var firesClusters, newFires;
    //     //var graphicsLayer = o.map.getLayer("smartMappingHexagons");
    //     firesClusters = o.map.getLayer("firesClusters");

    //     firesClusters.hide();
    //     newFires = o.map.getLayer("newFires");
    //     newFires.hide();

    //     o.tessellationInfo = {};
    //     o.tessellationInfo.origin = {};
    //     o.tessellationInfo.hexagonOrientation = "NS";
    //     o.tessellationInfo.hexagonRadius = 1000;
    //     o.tessellationInfo.type = "hexagon";

    //     function createQuery() {
    //         console.log("createQuery!");

    //         var extent = o.map.extent;

    //         var json = {
    //             "rings": [
    //                 [

    //                     [extent.xmin, extent.ymax],
    //                     [extent.xmax, extent.ymax],
    //                     [extent.xmax, extent.ymin],
    //                     [extent.xmin, extent.ymin],
    //                     [extent.xmin, extent.ymax]

    //                 ]
    //             ],
    //             "spatialReference": extent.spatialReference
    //         };

    //         var selPolygon = new Polygon(json);

    //         var query = new Query();
    //         query.returnGeometry = true;
    //         query.where = "1=1";
    //         query.outSpatialReference = o.map.spatialReference;
    //         query.geometry = selPolygon;
    //         query.outFields = ["*"];
    //         return query;
    //     }

    //     var tessellationInfo, cellSymbol;

    //     var zoomLevel = o.map.getZoom();
    //     console.log(zoomLevel); // max (closest is 18)

    //     var radius = 25 * Math.pow(2, (18 - zoomLevel));

    //     console.log("radius: " + radius);

    //     cellSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
    //         new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
    //             new Color([255, 0, 0, 0.75]), 1), new Color([255, 255, 0, 0.0])
    //     );

    //     var extent = o.map.extent;
    //     var halfEdgeLength = radius * 0.5;
    //     var halfHexagonHeight = radius * Math.cos(Math.PI * (30.0 / 180));
    //     var hexagonHeight = halfHexagonHeight * 2;

    //     o.tessellationInfo.origin.x = extent.xmin;
    //     o.tessellationInfo.origin.y = extent.ymin;

    //     var numRows = parseInt((extent.ymax - extent.ymin) / hexagonHeight + 0.5) + 1;
    //     var numCols = parseInt((extent.xmax - extent.xmin) / (radius + halfEdgeLength) + 0.5) + 1;

    //     //var startTime = (new Date().getTime());
    //     var count1 = 0;
    //     var count2 = 0;


    //     for (var c = 0; c < numCols; c++) {
    //         for (var r = 0; r < numRows; r++) {
    //             var evenCol = c % 2;
    //             var centerX, centerY;

    //             if (evenCol == 0) {
    //                 centerX = c * (radius + halfEdgeLength) + extent.xmin;
    //                 centerY = r * hexagonHeight + extent.ymin;
    //             } else {
    //                 centerX = c * (radius + halfEdgeLength) + extent.xmin;
    //                 centerY = r * hexagonHeight + halfHexagonHeight + extent.ymin;
    //             }

    //             var x1 = centerX + radius;
    //             var y1 = centerY;
    //             var x2 = centerX + halfEdgeLength;
    //             var y2 = centerY + halfHexagonHeight;
    //             var x3 = centerX - halfEdgeLength;
    //             var y3 = centerY + halfHexagonHeight;
    //             var x4 = centerX - radius;
    //             var y4 = centerY;
    //             var x5 = centerX - halfEdgeLength;
    //             var y5 = centerY - halfHexagonHeight;
    //             var x6 = centerX + halfEdgeLength;
    //             var y6 = centerY - halfHexagonHeight;

    //             var hexagon = new Polygon(o.map.spatialReference);
    //             hexagon.addRing([
    //                 [x1, y1],
    //                 [x2, y2],
    //                 [x3, y3],
    //                 [x4, y4],
    //                 [x5, y5],
    //                 [x6, y6],
    //                 [x1, y1]
    //             ]);

    //             var center = new Point(centerX, centerY, o.map.spatialReference);

    //             var id = "ID-" + c + "-" + r;
    //             var attr = {
    //                 "count": 0,
    //                 id: id
    //             };

    //             var graphic = new Graphic(hexagon, null, attr);

    //             graphicsLayer.add(graphic);
    //             //o.map.graphics.add(graphic);
    //         }
    //     }

    //     var relatedQ = new RelationshipQuery();

    //     var fires = o.map.getLayer("hexFires");
    //     Helper.showLoader("map", "map-blocker");

    //     fires.queryFeatures(createQuery(), function(results) {

    //         Helper.hideLoader("map-blocker");
    //         // console.log("# of features: " + results.features.length);

    //         var aggregateArray = [];
    //         var col, row, point, id;
    //         var feature;

    //         var halfEdgeLength = o.tessellationInfo.hexagonRadius * 0.5;
    //         var halfHexagonHeight = o.tessellationInfo.hexagonRadius * Math.cos(Math.PI * (30.0 / 180));
    //         var hexagonHeight = halfHexagonHeight * 2;

    //         var colWidth = o.tessellationInfo.hexagonRadius + halfEdgeLength;
    //         //var needProcessAttributes = (summaryFieldAndTypeData && summaryFieldAndTypeData.length > 0);
    //         //var needProcessAttributes = false;

    //         for (var i = 0; i < results.features.length; i++) {
    //             feature = results.features[i];
    //             point = feature.geometry;
    //             col = parseInt((point.x - o.tessellationInfo.origin.x) / colWidth);
    //             row = parseInt((point.y - o.tessellationInfo.origin.y) / hexagonHeight);


    //             var center1, center2, center3;
    //             var evenCol = col % 2;
    //             if (evenCol === 0) {
    //                 center1 = {
    //                     x: col * colWidth + o.tessellationInfo.origin.x,
    //                     y: row * hexagonHeight + o.tessellationInfo.origin.y
    //                 };
    //                 center2 = {
    //                     x: col * colWidth + o.tessellationInfo.origin.x,
    //                     y: (row + 1) * hexagonHeight + o.tessellationInfo.origin.y
    //                 };
    //                 center3 = {
    //                     x: (col + 1) * colWidth + o.tessellationInfo.origin.x,
    //                     y: (row + 0.5) * hexagonHeight + o.tessellationInfo.origin.y
    //                 };
    //             } else {
    //                 center1 = {
    //                     x: col * colWidth + o.tessellationInfo.origin.x,
    //                     y: (row + 0.5) * hexagonHeight + o.tessellationInfo.origin.y
    //                 };
    //                 center2 = {
    //                     x: (col + 1) * colWidth + o.tessellationInfo.origin.x,
    //                     y: row * hexagonHeight + o.tessellationInfo.origin.y
    //                 };
    //                 center3 = {
    //                     x: (col + 1) * colWidth + o.tessellationInfo.origin.x,
    //                     y: (row + 1) * hexagonHeight + o.tessellationInfo.origin.y
    //                 };
    //             }

    //             var d1 = (point.x - center1.x) * (point.x - center1.x) + (point.y - center1.y) * (point.y - center1.y);
    //             var d2 = (point.x - center2.x) * (point.x - center2.x) + (point.y - center2.y) * (point.y - center2.y);
    //             var d3 = (point.x - center3.x) * (point.x - center3.x) + (point.y - center3.y) * (point.y - center3.y);

    //             if (evenCol === 0) {
    //                 if (d1 <= d2 && d1 <= d3) {
    //                     id = "ID-" + col + "-" + row;
    //                 } else if (d2 <= d1 && d2 <= d3) {
    //                     id = "ID-" + col + "-" + (row + 1);
    //                 } else {
    //                     id = "ID-" + (col + 1) + "-" + row;
    //                 }
    //             } else {
    //                 if (d1 <= d2 && d1 <= d3) {
    //                     id = "ID-" + col + "-" + row;
    //                 } else if (d2 <= d1 && d2 <= d3) {
    //                     id = "ID-" + (col + 1) + "-" + row;
    //                 } else {
    //                     id = "ID-" + (col + 1) + "-" + (row + 1);
    //                 }
    //             }

    //             var record = undefined;
    //             for (var j = 0; j < aggregateArray.length; j++) {
    //                 if (aggregateArray[j].id === id) {
    //                     aggregateArray[j].attributes["count"] = aggregateArray[j].attributes["count"] + 1;
    //                     record = aggregateArray[j];
    //                     break;
    //                 }
    //             }

    //             var attrs = {};
    //             if (!record) {
    //                 attrs["count"] = 1;

    //                 record = {
    //                     id: id,
    //                     attributes: attrs
    //                 };
    //                 aggregateArray.push(record);
    //             }

    //         }

    //         //updateTessellationLayer(aggregateArray);
    //         updateTessellationLayer(aggregateArray, results.features);


    //         // var endTime = (new Date().getTime());
    //         // console.log("# of grids: " + aggregateArray.length + " elapsed time: " + (endTime - startTime) / 1000 + " s");

    //         function updateTessellationLayer(aggregateArray, fires) {
    //             var graphicsLayer = o.map.getLayer("smartMappingHexagons");
    //             console.log(aggregateArray.length + " features");
    //             var maxWeight = 0;

    //             // var len = o.map.graphics.graphics.length;
    //             var len = graphicsLayer.graphics.length;
    //             var graphicsArray = graphicsLayer.graphics;
    //             var countsArr = [];

    //             for (var k = 0; k < len; k++) {


    //                 for (var kk = 0; kk < fires.length; kk++) {

    //                     if (graphicsArray[k].geometry.contains(fires[kk].geometry)) {

    //                         graphicsArray[k].attributes["count"]++;



    //                     }
    //                 }
    //                 countsArr.push(graphicsArray[k].attributes["count"]);


    //                 maxWeight = maxWeight > graphicsArray[k].attributes["count"] ? maxWeight : graphicsArray[k].attributes["count"];



    //             }
    //             var arrOfBreaks = o.getClassJenks(10, countsArr);

    //             var Renderer = o.getRenderer(arrOfBreaks);

    //             graphicsLayer.setRenderer(Renderer);
    //             graphicsLayer.redraw();


    //         }

    //     });
    // };

    // o.getRenderer = function(breaksArr) {
    //     var zero = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, 0]));
    //     var one = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, .1]));
    //     var two = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, .2]));
    //     var three = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, .3]));
    //     var four = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, .4]));
    //     var five = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, .5]));
    //     var six = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, .6]));
    //     var seven = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, .7]));
    //     var eight = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, .8]));
    //     var nine = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, .9]));
    //     var ten = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, null, new Color([255, 0, 0, 1]));

    //     var cRenderer = new ClassBreaksRenderer(zero, "count");

    //     cRenderer.addBreak((breaksArr[0] + 1), breaksArr[1], one);
    //     cRenderer.addBreak(breaksArr[1], breaksArr[2], two);
    //     cRenderer.addBreak(breaksArr[2], breaksArr[3], three);
    //     cRenderer.addBreak(breaksArr[3], breaksArr[4], four);
    //     cRenderer.addBreak(breaksArr[4], breaksArr[5], five);
    //     cRenderer.addBreak(breaksArr[5], breaksArr[6], six);
    //     cRenderer.addBreak(breaksArr[6], breaksArr[7], seven);
    //     cRenderer.addBreak(breaksArr[7], breaksArr[8], eight);
    //     cRenderer.addBreak(breaksArr[8], breaksArr[9], nine);
    //     cRenderer.addBreak(breaksArr[9], breaksArr[10], ten);
    //     return cRenderer;

    // };

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
                    url: "http://a.tiles.mapbox.com/v4/devseed.3100ad78/{level}/{col}/{row}.png?access_token=pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJnUi1mbkVvIn0.018aLhX0Mb0tdtaT2QNe2Q",
                    type: "WebTiledLayer"
                }),
                new BasemapLayer({
                    url: "http://a.tiles.mapbox.com/v4/devseed.841fc333/{level}/{col}/{row}.png?access_token=pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJnUi1mbkVvIn0.018aLhX0Mb0tdtaT2QNe2Q",
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
            Finder.selectTomnodFeatures(evt);
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

            var dayPicked = moment(currentDate).format("YYYY/MM/DD");
            var tomorrow = moment(currentDate).add('days', 1).format("YYYY/MM/DD");

            var sqlQuery = LayerController.getTimeDefinition("dateUpdated", dayPicked, tomorrow);

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
                    //TODO : find better way to get label
                    // var labelNode = dojoQuery("#fires-panel .dijitChecked")[0].parentNode.children[1]; //TODO: WHY IS THIS FAILING???
                    // if (labelNode.innerHTML.length > 0) {
                    //     var label = labelNode.innerHTML;
                    //     if (label.search("None") === -1) {
                    //         self.reportAnalyticsHelper('layer', 'toggle', 'The user toggled the ' + label + ' layer on');
                    //     }
                    // }
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
        // var hexFires = new FeatureLayer("http://gis-potico.wri.org/arcgis/rest/services/Fires/Global_Fires/MapServer/4", {
        //     mode: FeatureLayer.MODE_ONDEMAND,
        //     //defaultDefinitionExpression: "ACQ_DATE > date'04-12-2015 00:00:00' AND ACQ_DATE < date'04-12-2015 06:00:00'",
        //     id: "hexFires",
        //     visible: false,
        //     outFields: "*"
        // });

        // var defaultSym = new SimpleMarkerSymbol("circle", 16,
        //     new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([102, 0, 0, 0.55]), 3),
        //     new Color([255, 255, 255, 1]));
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


        //firesViz.setDefinitionExpression("ACQ_DATE > date'04-12-2015 00:00:00' AND ACQ_DATE < date'04-12-2015 06:00:00'");

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



        //firesLayer.setDPI(72);

        // var tweet_infotemplate = new InfoTemplate();
        // tweet_infotemplate.setContent(Finder.getFireTweetsInfoWindow);
        // tweet_infotemplate.setTitle(null);

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

        }); //TODO: Find a way to filter out attributes w/o values from the popup


        // var fireStory_popupTemplate = new InfoTemplate();
        // fireStory_popupTemplate.setTitle("${Title}");
        // fireStory_popupTemplate.setContent("<b style='color:black;text-align:center;'>${Title}</b><br/><br/>" +
        //     "<b>Details: </b>${Details}<br/>" +
        //     "<b>Video: </b>${Video}<br/><br/>" +
        //     "<b>Name: </b>${Name}<br/>" +
        //     "<b>Email: </b>${Email:NumberFormat}<br/>" +
        //     "${ATTACHMENTS:attachmemtsFormatter}");

        // window.attachmemtsFormatter = function(value, key, data) {
        //     if (!value || value.length == 0) {
        //         return;
        //     }
        //     var str = '';
        //     for (var i = 0; i < value.length; i++) {
        //         str += "<img src='" +
        //             value[i].url +
        //             "'/><br/>";
        //     }
        //     return str;
        // }


        fireStories = new FeatureLayer(MapConfig.fireStories.url, {
            mode: FeatureLayer.MODE_ONDEMAND,
            id: MapConfig.fireStories.id,
            visible: false,
            outFields: ["*"],
            hasAttachments: true,
            definitionExpression: "Publish = 'Y'" //,
            // infoTemplate: fireStory_popupTemplate
        });

        // aspect.after(o.map.infoWindow, "show", function() {

        //     var selectedFeature = o.map.infoWindow.features[0];
        //     if (selectedFeature._graphicsLayer.id !== "Fire_Stories" || selectedFeature.attributes.ATTACHMENTS) {
        //         return;
        //     }
        //     fireStories.queryAttachmentInfos(selectedFeature.attributes.OBJECTID, function(infos) {
        //         var originalContent = fireStory_popupTemplate.toJson();

        //         selectedFeature.attributes.ATTACHMENTS = infos;
        //         //o.map.infoWindow.hide();
        //         var newSetOfFeatures = o.map.infoWindow.features;
        //         newSetOfFeatures[0] = selectedFeature;
        //         setTimeout(function() {
        //             o.map.infoWindow.setFeatures(newSetOfFeatures);
        //         }, 0);
        //     })
        // });




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
            landCoverLayer,
            primaryForestsLayer,
            digitalGlobeGraphicsLayer,
            digitalGlobeGraphicsHighlight,
            //smartMappingHexagons
        ].concat(digitalGlobeLayers).concat([ //add all dg image layers here
            conservationLayer,
            burnScarLayer,
            tomnodLayer,
            forestUseLayer,
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


        // layerlist.forEach(function(layer) {
        //     on(layer, "load", function() {
        //         dojoQuery('#map_layers > div').forEach(function(div) {
        //             console.log('layer div', div)
        //             if (!div.id) {
        //                 debugger;
        //             }
        //         })
        //     });


        // });

        // on(map, "layer-add-result", function(result) {
        //     console.log(result.layer.id);
        //     dojoQuery('#map_layers > div').forEach(function(div) {
        //         console.log('layer div', div)
        //         if (!div.id) {
        //             debugger;
        //         }
        //     })
        //     //debugger;
        // });

        // $("#map_layers")



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
                if (item.layer.id === "firesClusters") {

                    item.title = "Heat Map";
                }
                var url = !item.layer.url ? false : item.layer.url.search('ImageServer') < 0;
                var flyr = !(item.layer.id === tomnodSellayer.id);
                return (url && flyr);
            });

            Helper.hideLoader("map-blocker");
            registry.byId("legend").refresh(layerInfos);


            // dojoQuery('#map_layers > div').forEach(function(div) {
            //     console.log('layer div', div)
            //     if (!div.id) {
            //         var svgNode = dojoQuery('#map_layers > svg')[0];
            //         var mapNode = dom.byId("map_layers");
            //         domConstruct.place(svgNode, mapNode, "last");
            //     }
            // });




        });

        o.map.addLayers(layerlist);
        o.map.addLayer(landSatLayer); //TODO: Add the Landsat layer back in with the others and add in some kind of error catching with its load and its checkbox toggle (if, in the LayerController, its not actually turning a layer on)

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
        firesVizCluster.on('error', this.layerAddError);
        fireStories.on('error', this.layerAddError);

        //digitalGlobeLayer.on('error', this.layerAddError);
        airQualityLayer.on('error', this.layerAddError);

        // Change the Land Sat layer order to be right above the basemap but below everything else
        landSatLayer.on('load', function() {
            o.map.reorderLayer(landSatLayer, 1);
        });

    };

    o.layerAddError = function(evt) {
        require(["modules/ErrorController"], function(ErrorController) {
            ErrorController.show(10, "Error adding Layer : <br> " + evt.target.url);
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
