/* global define, window, document, highcharts, $, Highcharts */
define([
    "dojo/dom",
    "dojo/ready",
    "dojo/Deferred",
    "dojo/dom-style",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/promise/all",
    "dojo/_base/array",
    "esri/map",
    "esri/Color",
    "esri/config",
    "esri/layers/ImageParameters",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/symbols/SimpleFillSymbol",
    "esri/tasks/AlgorithmicColorRamp",
    "esri/tasks/ClassBreaksDefinition",
    "esri/tasks/GenerateRendererParameters",
    "esri/layers/LayerDrawingOptions",
    "esri/tasks/GenerateRendererTask",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "views/map/MapConfig",
    "libs/highcharts"
], function(dom, ready, Deferred, domStyle, domClass, registry, all, arrayUtils, Map, Color, esriConfig, ImageParameters, ArcGISDynamicLayer,
    SimpleFillSymbol, AlgorithmicColorRamp, ClassBreaksDefinition, GenerateRendererParameters, LayerDrawingOptions, GenerateRendererTask,
    Query, QueryTask, MapConfig) {

    var PRINT_CONFIG = {
        zoom: 5,
        basemap: 'gray',
        slider: false,
        mapcenter: [100, -1.2],
        adminBoundary: {
            url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
            id: 'district-bounds',
            defaultLayers: [2],
            layerId: 2,
            where: "fire_count > 0",
            classBreaksField: 'fire_count',
            classBreaksMethod: 'natural-breaks',
            breakCount: 5,
            fromHex: "#fcddd1",
            toHex: "#930016"
        },
        queryUrl: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
        companyConcessionsId: 1,
        confidenceFireId: 0
    };

    return {

        init: function() {
            var self = this;

            // Set up some configurations
            esriConfig.defaults.io.proxyUrl = MapConfig.proxyUrl;
            Highcharts.setOptions({
                chart: {
                    style: {
                        fontFamily: 'Arial MT Condensed Light'
                    }
                }
            });


            ready(function() {
                all([
                    self.buildFiresMap(),
                    self.buildDistrictFiresMap(),
                    self.queryDistrictsForFires(),
                    self.queryCompanyConcessions(),
                    self.queryForPeatFires()
                ]).then(function(res) {
                    self.showReport();
                });
            });
        },

        buildFiresMap: function() {
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

            map.on('load', function() {
                map.disableMapNavigation();
            });

            fireLayer.on('load', function() {
                deferred.resolve(true);
            });

            return deferred.promise;
        },

        buildDistrictFiresMap: function() {
            var deferred = new Deferred(),
                boundaryConfig = PRINT_CONFIG.adminBoundary,
                options = [],
                districtFiresParams,
                districtFiresLayer,
                generateParams,
                generateTask,
                colorRamp,
                classDef,
                renderer,
                legend,
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
            districtFiresParams.layerIds = boundaryConfig.defaultLayers;
            districtFiresParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

            districtFiresLayer = new ArcGISDynamicLayer(boundaryConfig.url, {
                imageParameters: districtFiresParams,
                id: boundaryConfig.id,
                visible: true
            });

            classDef = new ClassBreaksDefinition();
            classDef.classificationField = boundaryConfig.classBreaksField;
            classDef.classificationMethod = boundaryConfig.classBreaksMethod;
            classDef.breakCount = boundaryConfig.breakCount;
            classDef.baseSymbol = new SimpleFillSymbol();

            colorRamp = new AlgorithmicColorRamp();
            colorRamp.fromColor = Color.fromHex(boundaryConfig.fromHex);
            colorRamp.toColor = Color.fromHex(boundaryConfig.toHex);
            colorRamp.algorithm = "cie-lab";
            classDef.colorRamp = colorRamp;

            generateParams = new GenerateRendererParameters();
            generateParams.classificationDefinition = classDef;
            generateParams.where = boundaryConfig.where;

            function buildLegend(rendererInfo) {
                var html = "<table>";
                arrayUtils.forEach(rendererInfo, function(item) {
                    html += "<tr><td class='legend-swatch' style='background-color: rgb(" + item.symbol.color.r +
                        "," + item.symbol.color.g + "," + item.symbol.color.b + ");'" + "></td>";
                    html += "<td class='legend-label'>" + item.minValue + " - " + item.maxValue + "</td></tr>";
                });
                html += "</table>";
                dom.byId("legend").innerHTML = html;
            }

            renderer = new GenerateRendererTask(boundaryConfig.url + "/" + boundaryConfig.layerId);
            renderer.execute(generateParams, function(customRenderer) {
                buildLegend(customRenderer.infos);
                ldos = new LayerDrawingOptions();
                ldos.renderer = customRenderer;
                options[boundaryConfig.layerId] = ldos;
                districtFiresLayer.setLayerDrawingOptions(options);
                map.addLayer(districtFiresLayer);
                districtFiresLayer.on('update-end', function() {
                    deferred.resolve(true);
                });
            }, function() {
                deferred.resolve(false);
            });

            map.on('load', function() {
                map.disableMapNavigation();
            });

            return deferred.promise;
        },

        queryDistrictsForFires: function() {
            var queryTask = new QueryTask(PRINT_CONFIG.adminBoundary.url + "/" + PRINT_CONFIG.adminBoundary.layerId),
                fields = ['NAME_2', 'NAME_1', 'fire_count'],
                deferred = new Deferred(),
                query = new Query(),
                self = this;

            query.where = "1 = 1";
            query.returnGeometry = false;
            query.outFields = fields;
            query.orderByFields = ["fire_count DESC"];

            function buildTable(features) {
                var table = "<table class='fires-table'><tr><th>DISTRICT</th><th>PROVINCE</th><th>NUMBER OF FIRE ALERTS</th></tr>";
                table += self.generateTableRows(features, fields);
                table += "</table>";
                return table;
            }

            queryTask.execute(query, function(res) {
                if (res.features.length > 0) {
                    dom.byId("district-fires-table").innerHTML = buildTable(res.features.slice(0, 10));
                    deferred.resolve(true);
                }
            }, function(err) {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        queryCompanyConcessions: function() {
            var queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + PRINT_CONFIG.companyConcessionsId),
                fields = ["Name", "GROUP_NAME", "fire_count", "TYPE"],
                deferred = new Deferred(),
                query = new Query(),
                woodFiber = [],
                logging = [],
                oilPalm = [],
                self = this,
                type;

            query.where = "fire_count IS NOT NULL";
            query.returnGeometry = false;
            query.outFields = fields;
            query.orderByFields = ["fire_count DESC"];

            function buildTables(woodFiberFeatures, palmOilFeatures, loggingFeatures) {
                var tableHeader = "<table class='fires-table'><tr><th>NAME</th><th>GROUP, AFFILIATE, OR MAIN BUYER</th><th>NUMBER OF FIRE ALERTS</th></tr>",
                    woodTable = tableHeader + self.generateTableRows(woodFiberFeatures, fields.slice(0, 3)) + "</table>",
                    palmTable = tableHeader + self.generateTableRows(palmOilFeatures, fields.slice(0, 3)) + "</table>",
                    logTable = tableHeader + self.generateTableRows(loggingFeatures, fields.slice(0, 3)) + "</table>";
                dom.byId("pulpwood-fires-table").innerHTML = woodTable;
                dom.byId("palmoil-fires-table").innerHTML = palmTable;
                dom.byId("logging-fires-table").innerHTML = logTable;
            }

            queryTask.execute(query, function(res) {
                // Sort the response by TYPE
                arrayUtils.every(res.features, function(feature) {
                    type = feature.attributes.TYPE;
                    if (type === 'Oil palm concession' && oilPalm.length < 10) {
                        oilPalm.push(feature);
                    } else if (type === 'Wood fiber plantation' && woodFiber.length < 10) {
                        woodFiber.push(feature);
                    } else if (type === 'Logging concession' && logging.length < 10) {
                        logging.push(feature);
                    }
                    return !(oilPalm.length > 9 && woodFiber.length > 9 && logging.length > 9);
                });
                // Filter out all features with a fire_count of 0
                oilPalm = arrayUtils.filter(oilPalm, function(feature) {
                    return feature.attributes.fire_count !== 0;
                });
                woodFiber = arrayUtils.filter(woodFiber, function(feature) {
                    return feature.attributes.fire_count !== 0;
                });
                logging = arrayUtils.filter(logging, function(feature) {
                    return feature.attributes.fire_count !== 0;
                });
                // render the tables
                buildTables(woodFiber, oilPalm, logging);
                deferred.resolve(true);
            }, function(err) {
                deferred.resolve(false);
            });
            return deferred.promise;
        },

        queryForPeatFires: function() {
            var queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + PRINT_CONFIG.confidenceFireId),
                deferred = new Deferred(),
                query = new Query(),
                time = new Date(),
                self = this,
                dateString,
                nonpeat,
                total,
                peat;

            dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate() - 7) + " " +
                time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

            query.where = "ACQ_DATE > date '" + dateString + "'";
            query.returnGeometry = false;
            query.outFields = ["peat"];

            function buildPieChart(totalValue, peatValue, nonpeatValue) {
                var peatData = [];
                peatData.push({
                    color: "rgba(184,0,18,1)",
                    name: "Peat",
                    visible: true,
                    y: peatValue
                });
                peatData.push({
                    color: "rgba(17,139,187,1)",
                    name: "Non-peat",
                    visible: true,
                    y: nonpeatValue
                });

                $('#peat-fires-chart').highcharts({
                    chart: {
                        type: 'pie'
                    },
                    title: {
                        text: null
                    },
                    yAxis: {
                        title: {
                            text: null
                        }
                    },
                    plotOptions: {
                        pie: {
                            shadow: false,
                            center: ['50%', '50%'],
                            showInLegend: true,
                            dataLabels: {
                                fontSize: '22px'
                            }
                        }
                    },
                    tooltip: {
                        formatter: function() {
                            return Math.round((this.y / totalValue) * 100) + "% (" + this.y + " fires)";
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: true,
                        align: 'right',
                        layout: 'vertical',
                        verticalAlign: 'middle'
                    },
                    series: [{
                        name: 'Peat Fires',
                        data: peatData,
                        size: '80%',
                        innerSize: '50%',
                        dataLabels: {
                            distance: -30,
                            color: 'black',
                            formatter: function() {
                                return Math.round((this.y / totalValue) * 100) + "%";
                            }
                        }
                    }]
                });
            }

            queryTask.execute(query, function(res) {
                total = res.features.length;
                nonpeat = 0;
                peat = 0;
                arrayUtils.forEach(res.features, function(feature) {
                    if (feature.attributes.peat === 1) {
                        peat++;
                    } else {
                        nonpeat++;
                    }
                });
                buildPieChart(total, peat, nonpeat);
                deferred.resolve(true);
            }, function(err) {
                deferred.resolve(false);
            });


            return deferred.promise;
        },

        generateTableRows: function(features, fieldNames) {
            var rows = "";

            function isValid(item) {
                return item !== null && item !== undefined;
            }
            arrayUtils.forEach(features, function(feature) {
                rows += "<tr>";
                arrayUtils.forEach(fieldNames, function(field) {
                    rows += "<td>" + (isValid(feature.attributes[field]) ? feature.attributes[field] : ' - ') + "</td>";
                });
                rows += "</tr>";
            });
            return rows;
        },

        showReport: function() {
            domStyle.set("loading-screen", "display", "none");
            document.getElementsByTagName('body')[0].style.overflow = 'auto';
        }

    };

});