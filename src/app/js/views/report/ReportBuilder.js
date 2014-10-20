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
    "esri/renderers/UniqueValueRenderer",
    "esri/layers/LayerDrawingOptions",
    "esri/tasks/GenerateRendererTask",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/tasks/StatisticDefinition",
    "esri/graphicsUtils",
    "esri/tasks/Date",
    "views/map/MapConfig",
    "views/map/MapModel",
    "esri/request",
    "knockout",
    "libs/geostats",
    "libs/highcharts",
    "libs/moment",
    "libs/timezone"
], function(dom, ready, Deferred, domStyle, domClass, registry, all, arrayUtils, Map, Color, esriConfig, ImageParameters, ArcGISDynamicLayer,
    SimpleFillSymbol, AlgorithmicColorRamp, ClassBreaksDefinition, GenerateRendererParameters, UniqueValueRenderer, LayerDrawingOptions, GenerateRendererTask,
    Query, QueryTask, StatisticDefinition, graphicsUtils, esriDate, MapConfig, MapModel, esriRequest, ko,geostats) {

    var PRINT_CONFIG = {
        zoom: 4,
        basemap: 'gray',
        slider: false,
        mapcenter:[120,-1.2],
        colorramp:[[252, 221, 209],[226, 166, 162],[199, 111, 116],[173, 55, 69],[147, 1, 22]],
        query_results:{},
        regionmap :{},
        maps: {},
        noFeatures: {
                    pulpwoodQuery:"There are no fire alerts in pulpwood concessions in the AOI and time range.",
                    palmoilQuery:"There are no fire alerts in palm oil concessions in the AOI and time range.",
                    loggingQuery:"There are no fire alerts in logging concessions in the AOI and time range.",
                    adminQuery:"There are no fire alerts in the AOI and time range.",
                    subDistrictQuery:"There are no fire alerts for this AOI and time range."
                },
        firesLayer: {
            url: "http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN_staging/MapServer",
            id: "Active_Fires",
            fire_id: 0,
            defaultLayers: [0],
            //report_fields:{islands:'ISLAND',provinces:'PROVINCE'},
            query: {
                layerId: 0,
                outfields: ["*"],
                fields: [{
                    'name': 'LATITUDE',
                    'label': 'LATITUDE'
                }, {
                    'name': 'LONGITUDE',
                    'label': 'LONGITDUE'
                }, {
                    'name': 'BRIGHTNESS',
                    'label': 'BRIGHTNESS'
                }, {
                    'name': 'CONFIDENCE',
                    'label': 'CONFIDENCE'
                }, {
                    'name': 'ACQ_DATE',
                    'label': 'ACQUISITION DATE'
                }, {
                    'name': 'ACQ_TIME',
                    'label': 'ACQUISITION TIME'
                }]
            }
        },
        adminBoundary: {
            mapDiv: "district-fires-map",
            url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN_staging/MapServer',
            id: 'district-bounds',
            defaultLayers: [6],
            UniqueValueField: 'DISTRICT',
            regionField: 'PROVINCE',
            layerId: 6,
            where: "fire_count > 0",
            classBreaksField: 'fire_count',
            classBreaksMethod: 'natural-breaks',
            breakCount: 5,
            fromHex: "#fcddd1",
            toHex: "#930016",
            legendId: "legend",
            queryKey:'adminQuery',
            loaderId: 'distmapload'
        },
        subdistrictBoundary: {
            mapDiv: "subdistrict-fires-map",
            url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN_staging/MapServer',
            id: 'subdistrict-bounds',
            defaultLayers: [5],
            UniqueValueField: 'SUBDISTRIC',
            regionField: 'DISTRICT',
            layerId: 5,
            where: "fire_count > 0",
            classBreaksField: 'fire_count',
            classBreaksMethod: 'natural-breaks',
            breakCount: 5,
            fromHex: "#fcddd1",
            toHex: "#930016",
            legendId: "SubDistrict-legend",
            queryKey:'subDistrictQuery',
            loaderId: 'subdistmapload'
        },
        adminQuery: {
            outFields: ['NAME_2', 'NAME_1', 'fire_count'],
            tableId: "district-fires-table",
            headerField: ['DISTRICT','PROVINCE'],
            UniqueValueField: 'DISTRICT',
            regionField: 'PROVINCE',
            layerId: 6,
            fire_stats: {id:0,outField:'fire_count',onField:'DISTRICT'}
        },
        subDistrictQuery: {
            outFields: ['SUBDISTRIC','DISTRICT','fire_count'],
            tableId: "subdistrict-fires-table",
            UniqueValueField: 'SUBDISTRIC',
            regionField: 'DISTRICT',
            headerField: ['SUBDISTRICT','DISTRICT'],
            fire_stats: {id:0,outField:'fire_count',onField:'SUBDISTRIC'},
            layerId: 5
        },
        pulpwoodQuery: {
            outFields: ['pulpwoodt','fire_count'],
            tableId: "pulpwood-fires-table",
            headerField: ['NAME'],
            fire_stats: {id:0,outField:'fire_count',onField:'pulpwoodt'},
            layerId: 5
        },
        palmoilQuery: {
            outFields: ['palm_oilt','fire_count'],
            tableId: "palmoil-fires-table",
            headerField: ['NAME'],
            fire_stats: {id:0,outField:'fire_count',onField:'palm_oilt'},
            layerId: 5
        },
        loggingQuery: {
            outFields: ['loggingt','fire_count'],
            tableId: "logging-fires-table",
            headerField: ['NAME'],
            fire_stats: {id:0,outField:'fire_count',onField:'loggingt'},
            layerId: 5
        },
        
        queryUrl: "http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN_staging/MapServer",
        companyConcessionsId: 1,
        confidenceFireId: 0,
        dailyFiresId: 8,
        dailyFiresField: 'ACQ_DATE'
    };

    // esriRequest.setRequestPreCallback(function(ioArgs) {

    //     // inspect ioArgs
    //     console.log(ioArgs.url, ioArgs.content);

    //     if (ioArgs.content && ioArgs.content.dynamicLayers) {
    //         //  alert(ioArgs.content.dynamicLayers);
    //     }

    //     // don't forget to return ioArgs.
    //     return ioArgs;

    // });

    return {

        init: function() {
            var self = this;

            var proxies = MapConfig.proxies;

            var url = document.location.href;
            var proxyUrl = "/proxy/proxy.ashx";

            for (var domain in proxies) {
                if (url.indexOf(domain) === 0) {
                    proxyUrl = proxies[domain];
                }
            }
            self.init_report_options();
            // Set up some configurations
            esriConfig.defaults.io.proxyUrl = proxyUrl;

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
                    // self.buildOtherFiresMap("adminBoundary"),
                    // self.buildOtherFiresMap("subdistrictBoundary"),
                    self.queryDistrictsFireCount("adminQuery").then(function(){
                        self.buildFireCountMap('adminBoundary','adminQuery')
                    }),
                    self.queryDistrictsFireCount("subDistrictQuery").then(function(){
                        self.buildFireCountMap('subdistrictBoundary','subDistrictQuery')
                    }),
                    self.queryDistrictsFireCount("pulpwoodQuery"),
                    self.queryDistrictsFireCount("palmoilQuery"),
                    self.queryDistrictsFireCount("loggingQuery"),
                    // self.queryDistrictsForFires('adminQuery'),
                    // self.queryDistrictsForFires('subDistrictQuery'),
                    //self.queryCompanyConcessions()
                    self.queryForPeatFires(),
                    self.queryForSumatraFires(),
                    self.queryForMoratoriumFires(),
                    self.queryForDailyFireData()
                ]).then(function(res) {
                    self.get_extent();
                    self.printReport();
                });
            });
        },

        init_report_options: function(){
            var self = this;
            var dateobj = window.reportOptions.dates;
            this.startdate = self.date_obj_to_string({
                year:dateobj.fYear,
                month:dateobj.fMonth,
                day:dateobj.fDay
            });
            this.enddate = self.date_obj_to_string({
                year:dateobj.tYear,
                month:dateobj.tMonth,
                day:dateobj.tDay
            });
            this.aoilist = window.reportOptions.aois.join(', ');
            this.aoitype = window.reportOptions.aoitype;
            dom.byId('fromDate').innerHTML = "From: "+self.startdate;
            dom.byId('toDate').innerHTML = "To: "+self.enddate;
            dom.byId('aoiList').innerHTML = 'ON ' + self.aoitype.toUpperCase() + 'S: ' + self.aoilist;
        },

        date_obj_to_string: function(dateobj){
            //var dtstr = "date'";
            var dtstr ='';
            dtstr+= dateobj.year + '-';
            dtstr+= dateobj.month + '-';
            dtstr+= dateobj.day ;
            return dtstr;
        },

        get_layer_definition: function(){
            var aois = window.reportOptions.aois;
            var startdate = "ACQ_DATE >= date'" + this.startdate + "'";
            var enddate = "ACQ_DATE <= date'" + this.enddate + "'";
            var aoi = window.reportOptions.aoitype + " in ('";
            aoi+= aois.join("','");
            aoi+= "')"
            var sql = [aoi,startdate,enddate,"BRIGHTNESS >= 330","CONFIDENCE >= 30"].join(' AND ')
            return sql;
        },

        get_aoi_definition: function(){
            var aois = window.reportOptions.aois;
            var aoi = window.reportOptions.aoitype + " in ('";
            aoi+= aois.join("','");
            aoi+= "')"
            return aoi;
        },

        buildFiresMap: function() {

            var self = this;
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

            map.on("update-start",function(){
                esri.show(dom.byId("firesmapload"));
            });
            map.on("update-end",function(){
                esri.hide(dom.byId("firesmapload"));
            });

            PRINT_CONFIG.maps['fires'] = map;

            fireParams = new ImageParameters();
            fireParams.format = "png32";
            fireParams.layerIds = PRINT_CONFIG.firesLayer.defaultLayers;
            fireParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

            fireLayer = new ArcGISDynamicLayer(PRINT_CONFIG.firesLayer.url, {
                imageParameters: fireParams,
                id: PRINT_CONFIG.firesLayer.id,
                visible: true
            });

            fireLayer.setLayerDefinitions([self.get_layer_definition()]);

            map.addLayer(fireLayer);

            // map.on('load', function() {
            //     map.disableMapNavigation();
            // });

            fireLayer.on('load', function() {
                deferred.resolve(true);
            });
            mp = map;

            return deferred.promise;
        },

        buildFireCountMap: function(configKey, queryKey) {
            var deferred = new Deferred(),
                boundaryConfig = PRINT_CONFIG[configKey],
                options = [],
                otherFiresParams,
                otherFiresLayer,
                generateParams,
                generateTask,
                colorRamp,
                classDef,
                renderer,
                legend,
                ldos,
                map;
            var feat_stats = PRINT_CONFIG.query_results[queryKey];
            // if (feat_stats.length >= 1){
            //     deferred.resolve(false); 
            //     return;
            // }
            var arr = feat_stats.map(function(item){return item.attributes['fire_count']}).sort(function(a, b){return a-b});
            sar = arr;
            var dist_names = feat_stats.map(function(item){
                    if (item.attributes[boundaryConfig.UniqueValueField]!=null){

                        return item.attributes[boundaryConfig.UniqueValueField].replace("'","''");
                    }
                    }).filter(function(item){
                        if (item!=null){
                                return item;
                        }
                    }); 

            var natural_breaks_renderer = function(feat_stats,dist_names,method){
                var nbks;
                geostats();
                setSerie(arr);

                if(arr.length<boundaryConfig.breakCount){
                    boundaryConfig.breakCount = arr.length-1;
                }
                var brkCount = boundaryConfig.breakCount;
                switch (method){
                    case 'natural':
                        nbks = getClassJenks(boundaryConfig.breakCount);
                        break;
                    case 'equal':
                        nbks = getClassEqInterval(boundaryConfig.breakCount);
                        break;

                    case 'quantile':
                        nbks = getClassQuantile(boundaryConfig.breakCount);
                        break;

                    case 'stddev':
                        nbks = getClassStdDeviation(nbClass);
                        break;

                    case 'arithmetic':
                        nbks = getClassArithmeticProgression(nbClass);
                        break;

                    case 'geometric':
                        nbks = getClassGeometricProgression(nbClass);
                        break;

                    default:
                        nbks = getClassJenks(boundaryConfig.breakCount);
                        break;
                }

                var symbols = {};
                for (var i = 0;i<brkCount;i+=1){
                    var symbol = new SimpleFillSymbol();
                    var color = PRINT_CONFIG.colorramp[i];
                    symbol.setColor({ a:255, r:color[0], g:color[1], b:color[2] });
                    // symbols[i] = {symbol:symbol,max:nbks[i+1],min:arr[i]};
                    symbols[i] = symbol;
                }
                var defaultSymbol = new SimpleFillSymbol();
                defaultSymbol.setColor({ a:255, r:255, g:255, b:255 });

                var renderer = new UniqueValueRenderer(defaultSymbol, boundaryConfig.UniqueValueField);
                arrayUtils.forEach(feat_stats,function(feat){
                        var count = feat.attributes['fire_count'];
                        var sym;
                        for (var i = 0; i<nbks.length;i++){
                            if (count<nbks[i+1]){
                                sym = symbols[i];
                                break;
                            }
                        }
                        renderer.addValue({
                            value: feat.attributes[boundaryConfig.UniqueValueField],
                            symbol: sym
                        });

                });
                return {r: renderer, s:symbols, b:nbks};
                
            }

            // var obj = quantile_renderer(feat_stats,dist_names);
            // var renderer = obj.r;
            // var symbols = obj.s;
            // var quantiles = obj.q;

            var obj = natural_breaks_renderer(feat_stats,dist_names,'natural');

            var renderer = obj.r;
            var symbols = obj.s;
            var breaks = obj.b;
            //var quantiles = obj.q;

            map = new Map(boundaryConfig.mapDiv, {
                basemap: PRINT_CONFIG.basemap,
                zoom: PRINT_CONFIG.zoom,
                center: PRINT_CONFIG.mapcenter,
                slider: PRINT_CONFIG.slider
            });

            PRINT_CONFIG.maps[configKey] = map;

            otherFiresParams = new ImageParameters();
            otherFiresParams.format = "png32";
            otherFiresParams.layerIds = boundaryConfig.defaultLayers;
            otherFiresParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

            otherFiresLayer = new ArcGISDynamicLayer(boundaryConfig.url, {
                imageParameters: otherFiresParams,
                id: boundaryConfig.id,
                visible: true
            });

            function buildLegend(rendererInfo) {
                var html = "<table>";
                var curbreak = 0;
                for (var i = 0;i<PRINT_CONFIG[configKey].breakCount;i++){
                //arrayUtils.forEach(rendererInfo, function(item) {
                    // if (!min){
                    //     min = breaks[i];
                    // }
                    var item = symbols[i];
                    if (item){
                        html += "<tr><td class='legend-swatch' style='background-color: rgb(" + item.color.r +
                        "," + item.color.g + "," + item.color.b + ");'" + "></td>";
                        html += "<td class='legend-label'>" + breaks[i] + " - " + breaks[i+1] + "</td></tr>";
                    }
                    
                //});
                }
                html += "</table>";
                dom.byId(boundaryConfig.legendId).innerHTML = html;
            }

            function generateRenderer() {
                    buildLegend();
                    ldos = new LayerDrawingOptions();
                    ldos.renderer = renderer;
                    options[boundaryConfig.layerId] = ldos;
                    var layerdefs = [];
                    layerdefs[boundaryConfig.layerId] = boundaryConfig.UniqueValueField +" in ('" + dist_names.join("','") + "')";
                    otherFiresLayer.setLayerDefinitions(layerdefs);
                    otherFiresLayer.setLayerDrawingOptions(options);

                    otherFiresLayer.on('update-end', function() {
                        deferred.resolve(true);
                    });
            }

            otherFiresLayer.on('load', generateRenderer);

            map.addLayer(otherFiresLayer);

            // map.on('load', function() {
            //     map.disableMapNavigation();
            // });
            map.on("update-start",function(){
                esri.show(dom.byId(boundaryConfig['loaderId']));
            });
            map.on("update-end",function(){
                esri.hide(dom.byId(boundaryConfig['loaderId']));
            });
            // map.on('update',function(){
            //     esri.show(dom.byId())
            // })


            return deferred.promise;
        },

        buildOtherFiresMap: function(configKey) {
            var deferred = new Deferred(),
                boundaryConfig = PRINT_CONFIG[configKey],
                options = [],
                otherFiresParams,
                otherFiresLayer,
                generateParams,
                generateTask,
                colorRamp,
                classDef,
                renderer,
                legend,
                ldos,
                map;

            map = new Map(boundaryConfig.mapDiv, {
                basemap: PRINT_CONFIG.basemap,
                zoom: PRINT_CONFIG.zoom,
                center: PRINT_CONFIG.mapcenter,
                slider: PRINT_CONFIG.slider
            });

            otherFiresParams = new ImageParameters();
            otherFiresParams.format = "png32";
            otherFiresParams.layerIds = boundaryConfig.defaultLayers;
            otherFiresParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

            otherFiresLayer = new ArcGISDynamicLayer(boundaryConfig.url, {
                imageParameters: otherFiresParams,
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
                dom.byId(boundaryConfig.legendId).innerHTML = html;
            }

            function generateRenderer() {
                renderer = new GenerateRendererTask(boundaryConfig.url + "/" + boundaryConfig.layerId);
                renderer.execute(generateParams, function(customRenderer) {
                    buildLegend(customRenderer.infos);
                    ldos = new LayerDrawingOptions();
                    ldos.renderer = customRenderer;
                    options[boundaryConfig.layerId] = ldos;
                    otherFiresLayer.setLayerDrawingOptions(options);
                    otherFiresLayer.on('update-end', function() {
                        deferred.resolve(true);
                    });
                }, function() {
                    deferred.resolve(false);
                });
            }

            otherFiresLayer.on('load', generateRenderer);

            map.addLayer(otherFiresLayer);

            map.on('load', function() {
                map.disableMapNavigation();
            });

            return deferred.promise;
        },

        getRegion: function(configKey){
                var queryConfig = PRINT_CONFIG[configKey],
                queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + queryConfig.layerId),
                regionField = window.reportOptions.aoitype,
                deferred = new Deferred(),
                query = new Query(),
                regions = {},
                self = this;
            query.where = self.get_aoi_definition();
            query.returnGeometry = false;
            query.outFields = [regionField,queryConfig.UniqueValueField];


            queryTask.execute(query, function(res) {
                if (res.features.length > 0) {
                    arrayUtils.forEach(res.features,function(feat){
                        regions[feat.attributes[queryConfig.UniqueValueField]] = feat.attributes[regionField];
                    })
                    PRINT_CONFIG.regionmap[configKey] = regions;
                    deferred.resolve(true);
                }
            }, function(err) {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        queryDistrictsFireCount: function(configKey) {
            var queryConfig = PRINT_CONFIG[configKey],
                queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + queryConfig.fire_stats.id),
                fields = [queryConfig.fire_stats.onField, window.reportOptions.aoitype, queryConfig.fire_stats.outField ],
                deferred = new Deferred(),
                query = new Query(),
                statdef = new StatisticDefinition(),
                self = this;

            
            query.where = self.get_layer_definition();
            query.returnGeometry = false;
            query.outFields = [queryConfig.fire_stats.onField];
            query.orderByFields = ["fire_count DESC"];
            query.groupByFieldsForStatistics = [query.outFields[0]];

            statdef.onStatisticField = queryConfig.fire_stats.onField;
            statdef.outStatisticFieldName = queryConfig.fire_stats.outField;
            statdef.statisticType = "count";
            query.outStatistics = [statdef];


            function buildTable(features) {
                var table = "<table class='fires-table'><tr><th>" + queryConfig.headerField[0] + "</th>"
                if(queryConfig.headerField.length>1){
                          table+=  "<th>" + window.reportOptions.aoitype.toUpperCase() + "</th>";
                    }
                else{
                    fields = [fields[0],fields[2]];
                }
                var filtered =  arrayUtils.filter(features, function(feature) {
                    return feature.attributes.fire_count !== 0;
                });
                table+= "<th>NUMBER OF FIRE ALERTS</th></tr>";
                // table += self.generateTableRows(features, fields);
                table += self.generateTableRows(filtered, fields);

                table += "</table>";
                
                var finaltable = (filtered.length > 0) ? table: '<div class="noFiresTable">' + PRINT_CONFIG.noFeatures[configKey] + '</div>';
                return finaltable;
            }

            queryTask.execute(query, function(res) {
                    PRINT_CONFIG.query_results[configKey] = res.features;
                if (res.features.length > 0) {
                    if (queryConfig['UniqueValueField']){
                        self.getRegion(configKey).then(function(){
                            var regmap = PRINT_CONFIG.regionmap[configKey]
                            arrayUtils.forEach(res.features,function(feat){
                                feat.attributes[window.reportOptions.aoitype] = regmap[feat.attributes[queryConfig.UniqueValueField]];
                            })
                            dom.byId(queryConfig.tableId).innerHTML = buildTable(res.features.slice(0, 10));
                        });
                    }
                    else {
                        dom.byId(queryConfig.tableId).innerHTML = buildTable(res.features.slice(0, 10));

                    }
                    deferred.resolve(true);

                }
                else{
                    deferred.resolve(false);
                    dom.byId('noFiresMsg').innerHTML = "No Fire Alerts for this AOI and time frame."

                }

            }, function(err) {
                deferred.resolve(false);
            });
            
            return deferred.promise;
        },

        queryDistrictsForFires: function(configKey) {
            var queryConfig = PRINT_CONFIG[configKey],
                queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + queryConfig.layerId),
                fields = queryConfig.outFields,
                deferred = new Deferred(),
                query = new Query(),
                self = this;

            query.where = self.get_layer_definition();
            query.returnGeometry = false;
            query.outFields = fields;
            query.orderByFields = ["fire_count DESC"];

            function buildTable(features) {
                var table = "<table class='fires-table'><tr><th>" + queryConfig.headerField[0] + 
                            "</th><th>" + queryConfig.headerField[1] + "</th><th>NUMBER OF FIRE ALERTS</th></tr>";
                table += self.generateTableRows(features, fields);
                table += "</table>";
                return table;
            }

            queryTask.execute(query, function(res) {
                if (res.features.length > 0) {
                    dom.byId(queryConfig.tableId).innerHTML = buildTable(res.features.slice(0, 10));
                    deferred.resolve(true);
                }
            }, function(err) {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        queryCompanyConcessions: function() {
            var queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + PRINT_CONFIG.companyConcessionsId),
                fields = ["Name", "fire_count", "TYPE"], //"GROUP_NAME"
                deferred = new Deferred(),
                query = new Query(),
                time = new Date(),
                woodFiber = [],
                logging = [],
                oilPalm = [],
                self = this,
                type;


            // Make Time Relative to Last Week
            time = new Date(time.getFullYear(), time.getMonth(), time.getDate() - 7);

            dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate() - 7) + " " +
                time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();



            query.where = "fire_count IS NOT NULL";
            query.returnGeometry = false;
            query.outFields = fields;
            query.orderByFields = ["fire_count DESC"];

            function buildTables(woodFiberFeatures, palmOilFeatures, loggingFeatures) {
                var tableHeader = "<table class='fires-table'><tr><th>NAME</th><th>NUMBER OF FIRE ALERTS</th></tr>", //<th>GROUP, AFFILIATE, OR MAIN BUYER</th>
                    woodTable = tableHeader + self.generateTableRows(woodFiberFeatures, fields.slice(0, 2)) + "</table>",
                    palmTable = tableHeader + self.generateTableRows(palmOilFeatures, fields.slice(0, 2)) + "</table>",
                    logTable = tableHeader + self.generateTableRows(loggingFeatures, fields.slice(0, 2)) + "</table>",
                    noWoodFeatures = "There are no fire alerts in pulpwood concessions in the last 7 days.",
                    noPalmFeatures = "There are no fire alerts in palm oil concessions in the last 7 days.",
                    noLogFeatures = "There are no fire alerts in logging concessions in the last 7 days.";

                dom.byId("pulpwood-fires-table").innerHTML = (woodFiberFeatures.length > 0) ? woodTable : '<div class="noFiresTable">' + noWoodFeatures + '</div>';
                dom.byId("palmoil-fires-table").innerHTML = (palmOilFeatures.length > 0) ? palmTable : '<div class="noFiresTable">' + noPalmFeatures + '</div>';
                dom.byId("logging-fires-table").innerHTML = (loggingFeatures.length > 0) ? logTable : '<div class="noFiresTable">' + noLogFeatures + '</div>';
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
            var deferred = new Deferred(),
                peatData = [],
                self = this,
                nonpeat,
                total,
                peat;

            var success = function(res) {
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
                peatData.push({
                    color: "rgba(184,0,18,1)",
                    name: "Peat",
                    visible: true,
                    y: peat
                });
                peatData.push({
                    color: "rgba(17,139,187,1)",
                    name: "Non-peat",
                    visible: true,
                    y: nonpeat
                });

                self.buildPieChart("peat-fires-chart", {
                    data: peatData,
                    name: 'Peat Fires',
                    labelDistance: -25,
                    total: total
                });
                deferred.resolve(true);
            };

            var failure = function() {
                deferred.resolve(false);
            };

            self.queryFireData({
                outFields: ["peat"]
            }, success, failure);


            return deferred.promise;
        },

        queryForMoratoriumFires: function () {
            var deferred = new Deferred(),
            chartData = [],
            self = this,
            outside,
            inside,
            total;

            function success(res) {
                total = res.features.length;
                inside = 0;
                outside = 0;
                arrayUtils.forEach(res.features, function (feature) {
                    if (feature.attributes.moratorium === 1) {
                        inside++;
                    } else {
                        outside++;
                    }
                });
                chartData.push({
                    color: "rgba(184,0,18,1)",
                    name: "In Indicative Moratorium Areas",
                    visible: true,
                    y: inside
                });
                chartData.push({
                    color: "rgba(17,139,187,1)",
                    name: "Not in Indicative Moratorium Areas",
                    visible: true,
                    y: outside
                });
                self.buildPieChart("moratorium-fires-chart", {
                    data: chartData,
                    name: 'Moratorium Fires',
                    labelDistance: -25,
                    total: total
                });
                deferred.resolve(true);
            }

            function failure(err) {
                deferred.resolve(false);
                console.error(err);
            }

            self.queryFireData({
                outFields: ["moratorium"]
            }, success, failure);

            return deferred.promise;
        },

        queryForSumatraFires: function() {
            var deferred = new Deferred(),
                protectedAreaData = [],
                concessionData = [],
                self = this,
                protectedarea,
                unprotected,
                pulpwood,
                palmoil,
                logging,
                success,
                failure,
                total;

            success = function(res) {
                total = res.features.length;
                protectedarea = 0;
                unprotected = 0;
                pulpwood = 0;
                palmoil = 0;
                logging = 0;
                arrayUtils.forEach(res.features, function(feature) {
                    if (feature.attributes.wdpa === 1) {
                        protectedarea++;
                    } else {
                        unprotected++;
                    }

                    if (feature.attributes.logging === '1') {
                        logging++;
                    }

                    if (feature.attributes.palm_oil === '1') {
                        palmoil++;
                    }

                    if (feature.attributes.pulpwood === '1') {
                        pulpwood++;
                    }

                });
                protectedAreaData.push({
                    color: "rgba(184,0,18,1)",
                    name: "In Protected Areas",
                    visible: true,
                    y: protectedarea
                });
                protectedAreaData.push({
                    color: "rgba(17,139,187,1)",
                    name: "Outside Protected Areas",
                    visible: true,
                    y: unprotected
                });
                self.buildPieChart("protected-areas-fires-chart", {
                    data: protectedAreaData,
                    name: 'Protected Area Fires',
                    labelDistance: -30,
                    total: total
                });

                concessionData.push({
                    color: "rgba(17,139,187,1)",
                    name: "Pulpwood Plantations",
                    visible: true,
                    y: pulpwood
                });
                concessionData.push({
                    color: "rgba(184,0,18,1)",
                    name: "Palm Oil Concessions",
                    visible: true,
                    y: palmoil
                });
                concessionData.push({
                    color: "rgba(106,0,78,1)",
                    name: "Logging Concessions",
                    visible: true,
                    y: logging
                });
                concessionData.push({
                    color: "rgba(233,153,39,1)",
                    name: "Outside Concessions",
                    visible: true,
                    y: total - (logging + palmoil + pulpwood)
                });
                self.buildPieChart("land-use-fires-chart", {
                    data: concessionData,
                    name: 'Fires in Concessions',
                    labelDistance: 30,
                    total: total
                });
                deferred.resolve(true);
            };

            failure = function(err) {
                deferred.resolve(false);
            };

            self.queryFireData({
                outFields: ["wdpa", "pulpwood", "palm_oil", "logging"],
                //where: ''//"sumatra = 1"
            }, success, failure);

            return deferred.promise;
        },

        queryForDailyFireData: function() {
            var queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + PRINT_CONFIG.firesLayer.fire_id),
                deferred = new Deferred(),
                query = new Query(),
                fireDataLabels = [],
                fireData = [],
                self = this,
                statdef = new StatisticDefinition(),
                success,
                failure;


            
            query.where = [self.get_aoi_definition(),"BRIGHTNESS >= 330","CONFIDENCE >= 30"].join(' AND ');
            query.returnGeometry = false;
            query.groupByFieldsForStatistics = [PRINT_CONFIG.dailyFiresField];
            query.orderByFields=['ACQ_DATE ASC'];

            statdef.onStatisticField = PRINT_CONFIG.dailyFiresField;
            statdef.outStatisticFieldName = 'Count';
            statdef.statisticType = "count";
            query.outStatistics = [statdef];

            success = function(res) {
                arrayUtils.forEach(res.features, function(feature) {
                    fireDataLabels.push(moment(feature.attributes[PRINT_CONFIG.dailyFiresField]).tz('Asia/Jakarta').format("M/D/YYYY"));
                    fireData.push(feature.attributes.Count);
                });

                $('#fire-line-chart').highcharts({
                    chart: {
                        zoomType: 'x'
                    },
                    title: {
                        text: null
                    },
                    subtitle: {
                        text: document.ontouchstart === undefined ?
                            'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                    },
                    plotOptions: {
                        line: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    xAxis: {
                        categories: fireDataLabels,
                        type: 'datetime',
                        minTickInterval: 20,
                        minRange: 30,
                        labels: {
                            rotation: -45
                        }
                    },
                    yAxis: {
                        title: {
                            text: null
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#a90016'
                        }]
                    },
                    tooltip: {
                        valueSuffix: ''
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    series: [{
                        name: 'Daily Fires',
                        data: fireData,
                        color: '#f49f2d'
                    }]
                });

            };

            failure = function(err) {
                console.dir(err);
            };

            queryTask.execute(query, success, failure);
            deferred.resolve(true);
            return deferred.promise;
        },

        queryFireData: function(config, callback, errback) {
            var queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + PRINT_CONFIG.confidenceFireId),
                deferred = new Deferred(),
                query = new Query(),
                time = new Date(),
                self = this,
                dateString;

            // Make Time Relative to Last Week
            time = new Date(time.getFullYear(), time.getMonth(), time.getDate() - 8);


            dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate()) + " " +
                time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
            var layerdef = self.get_layer_definition()
            query.where = (config.where === undefined) ? layerdef : layerdef + " AND " + config.where;
           
            query.returnGeometry = config.returnGeometry || false;
            query.outFields = config.outFields || ["*"];
            queryTask.execute(query, callback, errback);
        },

        buildPieChart: function(id, config) {
            // Config object needs the following
            //  - data: array of data objects with color, name, visible, and y 
            //  - label distance
            //  - series name
            //  - total to be used for calculating %
            // Example
            // "peat-fires-chart", {
            //   'name': 'Peat Fires', data: [], labelDistance: -30
            // }
            $('#' + id).highcharts({
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
                        return Math.round((this.y / config.total) * 100) + "% (" + this.y + " fires)";
                    }
                },
                credits: {
                    enabled: false
                },
                legend: {
                    layout: 'vertical',
                },
                series: [{
                    name: config.name,
                    data: config.data,
                    size: '80%',
                    innerSize: '50%',
                    dataLabels: {
                        distance: config.labelDistance,
                        color: 'black',
                        formatter: function() {
                            return Math.round((this.y / config.total) * 100) + "%";
                        }
                    }
                }]
            });

        },

        get_extent: function() {
                var queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + PRINT_CONFIG.adminQuery.layerId),
                deferred = new Deferred(),
                query = new Query(),
                time = new Date(),
                self = this,
                mapkeys;

                mapkeys = ['fires','adminBoundary','subdistrictBoundary'];
                query.where = self.get_aoi_definition();
               
                query.returnGeometry = true;
                query.outFields = ["DISTRICT"];
                callback = function(results){
                    var extent = graphicsUtils.graphicsExtent(results.features);
                    // extent.xmax *= 1.2;
                    // extent.ymax*=1.2;
                    // extent.ymin*=1.2;
                    // extent.xmin*=1.2;
                    arrayUtils.forEach(mapkeys,function(key){
                        var map = PRINT_CONFIG.maps[key];
                        map.setExtent(extent, true);
                        //map.setExtent(extent);
                    })
                    deferred.resolve(true);
                }

                errback = function(err){
                    console.log(err);
                };
                queryTask.execute(query, callback, errback);
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

        printReport: function() {
            // We need to wait for the chart animation to complete, animation duration 
            // setTimeout(function () {
            //    if (window.print) {
            //         window.print();
            //     } 
            // }, 500);
        }

    };

});