/* eslint-disable */
define([
    "dojo/dom",
    "dojo/ready",
    "dojo/on",
    "dojo/Deferred",
    "dojo/dom-style",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/promise/all",
    "dojo/_base/array",
    "dojo/io-query",
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
    "esri/request",
    "js/config",
    "vendors/geostats/lib/geostats.min"
], function(dom, ready, on, Deferred, domStyle, domClass, registry, all, arrayUtils, ioQuery, Map, Color, esriConfig, ImageParameters, ArcGISDynamicLayer,
    SimpleFillSymbol, AlgorithmicColorRamp, ClassBreaksDefinition, GenerateRendererParameters, UniqueValueRenderer, LayerDrawingOptions, GenerateRendererTask,
    Query, QueryTask, StatisticDefinition, graphicsUtils, esriDate, esriRequest, ReportConfig, geostats) {

    var PRINT_CONFIG = {
        zoom: 4,
        basemap: 'dark-gray',
        slider: false,
        mapcenter: [120, -1.2],
        colorramp: [
            [253, 240, 0],
            [255, 218, 0],
            [248, 137, 0],
            [225, 63, 0],
            [229, 0, 2]
        ],
        colorRampFireHistory: [
            '#FDF000',
            '#F88900',
            '#DE2400',
            '#D40000',
            '#920000'
        ],
        query_results: {},
        regionmap: {},
        maps: {},
        noFeatures: {
            pulpwoodQuery: "There are no fire alerts in pulpwood concessions in the AOI and time range.",
            palmoilQuery: "There are no fire alerts in palm oil concessions in the AOI and time range.",
            loggingQuery: "There are no fire alerts in logging concessions in the AOI and time range.",
            adminQuery: "There are no fire alerts in the AOI and time range.",
            subDistrictQuery: "There are no fire alerts for this AOI and time range.",
            greenpeace: "There are no fire alerts in Greenpeace concessions in the AOI and time range.",
        },
        firesLayer: {
            url: "http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer",
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
            url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
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
            legendId: "districtLegend",
            queryKey: 'adminQuery',
            loaderId: 'distmapload',
            relatedTableId: "district-fires-table",
        },
        subdistrictBoundary: {
            mapDiv: "subdistrict-fires-map",
            url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
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
            queryKey: 'subDistrictQuery',
            loaderId: 'subdistmapload',
            relatedTableId: "subdistrict-fires-table",
        },
        adminQuery: {
            outFields: ['DISTRICT', 'fire_count'],
            tableId: "district-fires-table",
            headerField: ['DISTRICT'],
            UniqueValueField: 'DISTRICT',
            layerId: 6,
            fire_stats: {
                id: 0,
                outField: 'fire_count',
                onField: 'DISTRICT'
            }
        },
        subDistrictQuery: {
            outFields: ['SUBDISTRIC', 'DISTRICT', 'fire_count'],
            tableId: "subdistrict-fires-table",
            UniqueValueField: 'SUBDISTRIC',
            regionField: 'DISTRICT',
            headerField: ['SUBDISTRICT', 'DISTRICT'],
            fire_stats: {
                id: 0,
                outField: 'fire_count',
                onField: 'SUBDISTRIC'
            },
            layerId: 5
        },
        pulpwoodQuery: {
            outFields: ['pulpwoodt', 'fire_count'],
            tableId: "pulpwood-fires-table",
            headerField: ['NAME'],
            fire_stats: {
                id: 0,
                outField: 'fire_count',
                onField: 'pulpwoodt'
            },
            layerId: 5
        },
        palmoilQuery: {
            outFields: ['palm_oilt', 'fire_count'],
            tableId: "palmoil-fires-table",
            headerField: ['NAME'],
            fire_stats: {
                id: 0,
                outField: 'fire_count',
                onField: 'palm_oilt'
            },
            layerId: 5
        },
        loggingQuery: {
            outFields: ['loggingt', 'fire_count'],
            tableId: "logging-fires-table",
            headerField: ['NAME'],
            fire_stats: {
                id: 0,
                outField: 'fire_count',
                onField: 'loggingt'
            },
            layerId: 5
        },
        rspoQuery: {
            outFields: ['palm_oil', 'fire_count'],
            tableId: "rspo-cert-table",
            headerField: ['NAME'],
            groupByFieldsForStatistics: ['CERT_SCHEM', 'palm_oil'],
            fire_stats: {
                id: 0,
                outField: 'fire_count',
                onField: 'palm_oil'
            },
            layerId: 5
        },
        concessionsQuery: {
            outFields: ['concessionname', 'groupname', 'concession', 'totalfires'],
            tableId: 'all-concessions-fires-table',
            headerField: ['CONCESSION NAME', 'GROUP', 'CONCESSION TYPE'],
            UniqueValueField: 'groupname',
            regionField: 'concession',
            layerId: 6,
            chartId: 'concession'
        },

        queryUrl: "http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer",
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
            var proxies = ReportConfig.proxies;

            var url = document.location.href;
            var proxyUrl = "/proxy/proxy.ashx";
            //var proxyUrl = "/proxy/proxy.php";

            for (var domain in proxies) {
                if (url.indexOf(domain) === 0) {
                    proxyUrl = proxies[domain];
                }
            }

            self.init_report_options();
            // Set up some configurations
            esriConfig.defaults.io.proxyUrl = proxyUrl;

            // #gfw-concessions, #all-concessions-fires-table
            console.log(this.dataSource)
            if (this.dataSource === 'greenpeace') {
              $('#gfw-concessions').hide();
              $('#all-concessions-fires-table').show();
              $('#breakdown-fires-chart-container').show();
              $('#land-use-fires-chart-container').hide();

            } else if (this.dataSource === 'gfw') {
              $('#gfw-concessions').show();
              $('#all-concessions-fires-table').hide();
              $('#breakdown-fires-chart-container').hide();
              $('#land-use-fires-chart-container').show();
            }

            all([
                self.buildFiresMap(),
                // self.buildOtherFiresMap("adminBoundary"),
                // self.buildOtherFiresMap("subdistrictBoundary"),
                self.queryDistrictsFireCount("adminQuery").then(function() {
                    self.buildFireCountMap('adminBoundary', 'adminQuery')
                }),
                self.queryDistrictsFireCount("subDistrictQuery").then(function() {
                    self.buildFireCountMap('subdistrictBoundary', 'subDistrictQuery')
                }),
                self.queryDistrictsFireCount("pulpwoodQuery"),
                self.queryDistrictsFireCount("palmoilQuery"),
                self.queryDistrictsFireCount("loggingQuery"),
                self.queryDistrictsFireCount("rspoQuery"),

                self.queryFiresBreakdown(),
                self.queryFireCount('concessionsQuery'),
                // self.queryDistrictsForFires('adminQuery'),
                // self.queryDistrictsForFires('subDistrictQuery'),
                // self.queryCompanyConcessions()
                self.queryForPeatFires(),
                self.queryForSumatraFires(),
                self.queryForMoratoriumFires(),
                self.queryForDailyFireData(),
                self.getIndonesiaFireCounts(),
                self.getFireHistoryCounts('Indonesia')
            ]).then(function(res) {
                self.get_extent();
                self.printReport();
            });
        },

        init_report_options: function() {
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            var self = this;
            if (!window.reportOptions) {
                self.read_hash();
            }
            var dateobj = window.reportOptions.dates;
            this.startdate = self.date_obj_to_string({
                year: dateobj.fYear,
                month: monthNames[dateobj.fMonth - 1].substring(0,3),
                day: dateobj.fDay
            });
            this.enddate = self.date_obj_to_string({
                year: dateobj.tYear,
                month: monthNames[dateobj.tMonth - 1].substring(0,3),
                day: dateobj.tDay
            });
            this.aoilist = window.reportOptions.aois.join(', ');
            this.aoitype = window.reportOptions.aoitype;
            this.dataSource = window.reportOptions.dataSource;
            dom.byId('fromDate').innerHTML = self.startdate;
            dom.byId('toDate').innerHTML = " - " + self.enddate;
            dom.byId('aoiList').innerHTML = 'ON ' + self.aoitype + 'S: ' + self.aoilist;
            window['concessionFiresCounts'] = [];
        },

        read_hash: function() {
            var _initialState;
            var url = window.location.href;

            var hasHash = (url.split("#").length == 2 && url.split("#")[1].length > 1);

            if (hasHash) {
                _initialState = ioQuery.queryToObject(url.split("#")[1]);
            } else {
                _initialState = ReportConfig.defaultState;
                //state with
            }

            //is _initialState valid?
            // if (hasHash) {
            //     var isValidState = (_initialState.v && (arrayUtil.indexOf(Config.validViews, _initialState.v) > -1));
            //     if (!isValidState) {
            //         _initialState = Config.defaultState;
            //     } else {
            //         //if valid then make it dirty so that it pushes a change
            //         !_initialState.dirty ? _initialState.dirty = "true" : delete _initialState.dirty;
            //     }
            // }
            var dateObj = {};
            _initialState.dates.split('!').map(function(date) {
                var datearr = date.split('-');
                dateObj[datearr[0]] = datearr[1];
            })

            window.reportOptions = {
                aoitype: _initialState.aoitype
            }
            window.reportOptions['aois'] = _initialState.aois.split('!');
            window.reportOptions['dates'] = dateObj;
            window.reportOptions.dataSource = _initialState.dataSource;
        },

        date_obj_to_string: function(dateobj) {
            //var dtstr = "date'";
            var dtstr = '';
            dtstr += dateobj.day + ' ';
            dtstr += dateobj.month + ' ';
            dtstr += dateobj.year;
            return dtstr;
        },

        get_layer_definition: function() {
            var aois = window.reportOptions.aois;
            var startdate = "ACQ_DATE >= date'" + this.startdate + "'";
            var enddate = "ACQ_DATE <= date'" + this.enddate + "'";
            var aoi = window.reportOptions.aoitype + " in ('";
            aoi += aois.join("','");
            aoi += "')"
            // var sql = [aoi, startdate, enddate, "BRIGHTNESS >= 330", "CONFIDENCE >= 30"].join(' AND ')
            var sql = [aoi, startdate, enddate].join(' AND ')
            return sql;
        },

        get_aoi_definition: function() {
            var aois = window.reportOptions.aois;
            var aoi = window.reportOptions.aoitype + " in ('";
            aoi += aois.join("','");
            aoi += "')"
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

            map.on("update-start", function() {
                esri.show(dom.byId("firesmapload"));
            });
            map.on("update-end", function() {
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

            if (feat_stats.length == 0) {
                return;
            }

            // if (feat_stats.length >= 1){
            //     deferred.resolve(false);
            //     return;
            // }nb
            var arr = feat_stats.map(function(item) {
                return item.attributes['fire_count']
            }).sort(function(a, b) {
                return a - b
            });
            sar = arr;
            var dist_names = feat_stats.map(function(item) {
                if (item.attributes[boundaryConfig.UniqueValueField] != null) {

                    return item.attributes[boundaryConfig.UniqueValueField].replace("'", "''");
                }
            }).filter(function(item) {
                if (item != null) {
                    return item;
                }
            });

            var natural_breaks_renderer = function(feat_stats, dist_names, method) {
                var nbks;
                geostats();
                setSerie(arr);

                if (arr.length < boundaryConfig.breakCount) {
                    boundaryConfig.breakCount = arr.length - 1;
                }
                var brkCount = boundaryConfig.breakCount;
                switch (method) {
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
                for (var i = 0; i < brkCount; i += 1) {
                    var symbol = new SimpleFillSymbol();
                    var color = PRINT_CONFIG.colorramp[i];
                    symbol.setColor({
                        a: 255,
                        r: color[0],
                        g: color[1],
                        b: color[2]
                    });
                    // symbols[i] = {symbol:symbol,max:nbks[i+1],min:arr[i]};
                    symbols[i] = symbol;
                }
                var defaultSymbol = new SimpleFillSymbol();
                defaultSymbol.setColor({
                    a: 255,
                    r: 255,
                    g: 255,
                    b: 255
                });

                var renderer = new UniqueValueRenderer(defaultSymbol, boundaryConfig.UniqueValueField);
                arrayUtils.forEach(feat_stats, function(feat) {
                    var count = feat.attributes['fire_count'];
                    var sym;
                    for (var i = 0; i < nbks.length; i++) {
                        if (count <= nbks[i + 1]) {
                            sym = symbols[i];
                            break;
                        }
                    }
                    if (sym == undefined) {
                        console.log("UNDEFINED", feat);
                    }

                    renderer.addValue({
                        value: feat.attributes[boundaryConfig.UniqueValueField],
                        symbol: sym
                    });

                });
                return {
                    r: renderer,
                    s: symbols,
                    b: nbks
                };

            }

            // var obj = quantile_renderer(feat_stats,dist_names);
            // var renderer = obj.r;
            // var symbols = obj.s;
            // var quantiles = obj.q;

            var obj = natural_breaks_renderer(feat_stats, dist_names, 'natural');

            var renderer = obj.r;
            var symbols = obj.s;
            var breaks = obj.b;
            //var quantiles = obj.q;

            var relatedTableId = PRINT_CONFIG[configKey].relatedTableId + '-colorRange';
            window[relatedTableId] = breaks;

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
                var rows = [];
                var curbreak = 0;
                // var relatedTableId = PRINT_CONFIG[configKey].relatedTableId + '-colorRange';
                // console.log(relatedTableId);
                // window[relatedTableId] = [];

                for (var i = 0; i < PRINT_CONFIG[configKey].breakCount; i++) {
                    var item = symbols[i];
                    var row;

                    if (item) {
                        var low = i < 1 ? breaks[i] : breaks[i] + 1;
                        row = "<tr><td class='legend-swatch' style='background-color: rgb(" + item.color.r +
                            "," + item.color.g + "," + item.color.b + ");'" + "></td>";
                        row += "<td class='legend-label'>" + low + " - " + breaks[i + 1] + "</td></tr>";
                        rows.push(row);
                        // window[relatedTableId].push(breaks[i + 1]);
                    }
                }

                rows.reverse().forEach(function (row) {
                    html += row;
                });
                html += "</table>";
                dom.byId(boundaryConfig.legendId).innerHTML = html;
            }

            function generateRenderer() {
                buildLegend();
                ldos = new LayerDrawingOptions();
                ldos.renderer = renderer;
                options[boundaryConfig.layerId] = ldos;
                var layerdefs = [];
                layerdefs[boundaryConfig.layerId] = boundaryConfig.UniqueValueField + " in ('" + dist_names.join("','") + "')";
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
            map.on("update-start", function() {
                esri.show(dom.byId(boundaryConfig['loaderId']));
            });
            map.on("update-end", function() {
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

        getRegion: function(configKey) {
            var queryConfig = PRINT_CONFIG[configKey],
                queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + queryConfig.layerId),
                regionField = window.reportOptions.aoitype,
                deferred = new Deferred(),
                query = new Query(),
                regions = {},
                self = this;
            query.where = self.get_aoi_definition();
            query.returnGeometry = false;
            query.outFields = [regionField, queryConfig.UniqueValueField];


            queryTask.execute(query, function(res) {
                if (res.features.length > 0) {
                    arrayUtils.forEach(res.features, function(feat) {
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

        queryFiresBreakdown: function() {
            var deferred = new Deferred(),
                totalData = [],
                self = this,
                outside,
                palmOil = 0,
                pulpwood = 0,
                mining = 0,
                logging = 0,
                total = 0;

            let aoiType = reportOptions.aoitype.toLowerCase();

            for (var key in reportOptions.dates) {
              if (parseInt(reportOptions.dates[key]) < 10) {
                reportOptions.dates[key] = '0' + reportOptions.dates[key];
              }
            }

            var aoiString = reportOptions.aois.toString();

            var startDates = reportOptions.dates.fYear + reportOptions.dates.fMonth + reportOptions.dates.fDay;
            var endDates = reportOptions.dates.tYear + reportOptions.dates.tMonth + reportOptions.dates.tDay;

            var baseUrl = 'https://b10fk4n1u3.execute-api.us-east-1.amazonaws.com/stage/firms/';

            console.log(baseUrl + aoiType + '?chart=breakdown&start=' + startDates + '&stop=' + endDates + '&aoi=' + aoiString);

            $.get(baseUrl + aoiType + '?chart=breakdown&start=' + startDates + '&stop=' + endDates + '&aoi=' + aoiString, function (data) {
              arrayUtils.forEach(data, function(feature) {
                var type = 'totalfires';

                total += parseInt(feature[type]);

                if (!feature.concession) {
                  feature.concession = 'outside';
                }

                switch (feature.concession) {
                  case 'outside':
                    outside = parseInt(feature[type]);
                    break;
                  case 'Palm Oil':
                    palmOil = parseInt(feature[type]);
                    break;
                  case 'Pulpwood':
                    pulpwood = parseInt(feature[type]);
                    break;
                  case 'Mining':
                    mining = parseInt(feature[type]);
                    break;
                  case 'Logging':
                    logging = parseInt(feature[type]);
                    break;
                  default:
                    break
                }

              });

              if (outside > 0) {
                var outsideLabel = 'Outside Concessions';

                totalData.push({
                    color: "#888888",
                    name: outsideLabel,
                    visible: true,
                    y: outside
                });
              }
              if (palmOil > 0) {
                var palmLabel = 'Palm Oil';

                totalData.push({
                  color: "#0a50a5",
                  name: palmLabel,
                  visible: true,
                  y: palmOil
                });
              }
              if (pulpwood > 0) {
                var pulpwoodLabel = 'Wood fibre';

                totalData.push({
                    color: "#333",
                    name: pulpwoodLabel,
                    visible: true,
                    y: pulpwood
                });
              }
              if (mining > 0) {
                var miningLabel = 'Mining';

                totalData.push({
                    color: "#8416a6",
                    name: miningLabel,
                    visible: true,
                    y: mining
                });
              }
              if (logging > 0) {
                var loggingLabel = 'Logging';
                if (reportOptions.language === 'bahasa') {
                  loggingLabel = 'Penebangan';
                }
                totalData.push({
                    color: "#a6050e",
                    name: loggingLabel,
                    visible: true,
                    y: logging
                });
              }
              console.log(total);
              if (total === 0) {
                var parent = dom.byId('breakdown-fires-chart-container').parentElement;
                domClass.add(parent, 'hidden');
                deferred.resolve(false);
              } else {
                // dom.byId('totalHotSpots').innerHTML = self.numberWithCommas(total) + ' ';

                console.log(totalData);

                self.buildPieChart("breakdown-fires-chart", {
                    data: totalData,
                    name: 'Peat Fires',
                    labelDistance: 5,
                    total: total
                });
                deferred.resolve(true);
              }

            });


            var failure = function() {
                deferred.resolve(false);
            };

            return deferred.promise;
        },

        buildFiresTable: function(features, queryConfig, configKey) {
            var table = "<table class='fires-table'><tr><th>" + queryConfig.headerField[0] + "</th>";
            table += "<th>" + queryConfig.headerField[1] + "</th>";
            table += "<th>" + queryConfig.headerField[2] + "</th>";

            var filtered = arrayUtils.filter(features, function(feature) {
                return feature.totalfires !== 0;
            });

            table += "<th>NUMBER OF FIRE ALERTS</th></tr>";

            outFields = queryConfig.outFields;

            table += this.generateGPTableRows(filtered, outFields);

            table += "</table>";
            // console.log(PRINT_CONFIG.noFeatures);
            var finaltable = (filtered.length > 0) ? table : '<div class="noFiresTable">' + PRINT_CONFIG.noFeatures['greenpeace'] + '</div>';
            return finaltable;
        },

      getIndonesiaFireCounts: function () {

        var queryTask = new QueryTask("http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_Global/MapServer/3"),
          deferred = new Deferred(),
          query = new Query(),
          series = [],
          index = 0,
          yearObject = {
            data: [],
            color: '#ccc'
          };

        query.where = "1=1";
        query.returnGeometry = false;
        query.outFields = ['*'];

        queryTask.execute(query, function (res) {
          var allFeatures = res.features;
          if (allFeatures.length > 0) {
            allFeatures.forEach(function (item) {
              var countryName = item.attributes.NAME_ENGLISH;
              if (countryName === 'Indonesia') {
                var obj = item.attributes;
                Object.keys(obj).forEach(function(key) {
                  if (key.substring(0, 3) === 'cf_') {
                    index = index + 1;
                    yearObject['name'] = '20' + key.substring(3, 5);
                    yearObject['data'].push(obj[key]);
                    if(index % 12 === 0){
                      series.push(yearObject);
                      yearObject = {
                        data: [],
                        color: '#ccc'
                      };
                    }
                  }
                });

                series.push(yearObject);
                yearObject.color = '#D40000';

                window['firesCountRegionSeries'] = series;
                window['firesCountRegionCurrentYear'] = yearObject;

                function add(a, b) {
                  return a + b;
                }

                // Adding sum for year to window
                window['firesCountRegionCurrentYearSum'] = yearObject.data.reduce(add, 0);

                $('#firesCountTitle').html(window['firesCountRegionCurrentYear'].name + ' Fires, Year to Date <span class="total_firecounts">' + window['firesCountRegionCurrentYearSum'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>');

                // var firesCountChart = $('#firesCountChart').highcharts({
                var firesCountChart = Highcharts.chart('firesCountChart', {
                  title: {
                    text: ''
                  },

                  yAxis: {
                    title: {
                      text: ''
                    }
                  },

                  credits: {
                    enabled: false
                  },

                  legend: {
                    enabled: false,
                  },

                  xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  },

                  series: series

                });

                getIndonesiaIslandsFireCounts(firesCountChart);

                function getIndonesiaIslandsFireCounts(firesCountChart) {
                  var queryTask = new QueryTask("http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_Global/MapServer/4"),
                    deferred = new Deferred(),
                    query = new Query(),
                    series = [],
                    index = 0,
                    yearObject = {
                      data: [],
                      color: '#ccc'
                    };

                  query.where = "1=1";
                  query.returnGeometry = false;
                  query.outFields = ['*'];

                  queryTask.execute(query, function (res) {
                    var islandFeatures = res.features;
                    window['islandsData'] = islandFeatures;
                    islandFeatures.forEach(function (item) {
                      var island = item.attributes.ISLAND;
                      $('#firesCountIslandsListContainer h3').html('Region: <strong>Indonesia</strong>');
                      $('#firesCountIslandsList').append(`<li>${island}</li>`);
                    });

                    $('#firesCountIslandsListContainer h3').click(function () {
                      $(this).addClass('selected');
                      $('#firesCountTitle').html(window['firesCountRegionCurrentYear'].name + ' Fires, Year to Date <span class="total_firecounts">' + window['firesCountRegionCurrentYearSum'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>');
                      $('#firesCountIslandsList li').removeClass('selected');
                      firesCountChart.update({
                        series: window.firesCountRegionSeries
                      });
                    });

                    $('#firesCountIslandsList li').click(function () {
                      $('#firesCountIslandsListContainer h3').removeClass('selected');
                      $('#firesCountIslandsList li').removeClass('selected');
                      $(this).addClass('selected');
                      var selectedIsland = this.outerText,
                        index = 0,
                        series = [],
                        yearObject = {
                          data: [],
                          color: '#ccc'
                        };

                      window['islandsData'].forEach(function (item) {
                        if(item.attributes.ISLAND === selectedIsland){
                          var obj = item.attributes;
                          Object.keys(obj).forEach(function(key) {
                            if (key.substring(0, 3) === 'cf_') {
                              index = index + 1;
                              yearObject['name'] = '20' + key.substring(3, 5);
                              yearObject['data'].push(obj[key]);
                              if(index % 12 === 0){
                                series.push(yearObject);
                                yearObject = {
                                  data: [],
                                  color: '#ccc'
                                };
                              }
                            }
                          });

                          yearObject.color = '#D40000';
                          series.push(yearObject);

                          window['firesCountCurrentIslandYearSum'] = yearObject.data.reduce(add, 0);
                          $('#firesCountTitle').html(window['firesCountRegionCurrentYear'].name + ' Fires, Year to Date <span class="total_firecounts">' + window['firesCountCurrentIslandYearSum'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>');
                          firesCountChart.update({
                            series: series
                          });
                        }

                      })
                    });
                  }, function (err) {
                    deferred.resolve(false);
                  });

                  return deferred.promise;

                };
              }
            })
          }
        }, function (err) {
          deferred.resolve(false);
        });

        return deferred.promise;
      },

      getFireHistoryCounts: function (country) {
        var queryTask = new QueryTask("http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_Global/MapServer/2"),
          deferred = new Deferred(),
          query = new Query(),
          series = {},
          index = 0,
          allValues = [],
          yearObject = {
            data: []
          };

        query.where = "1=1";
        query.returnGeometry = false;
        query.outFields = ['*'];

        queryTask.execute(query, function (res) {
          var allFeatures = res.features;
          if (allFeatures.length > 0) {
            allFeatures.forEach(function (item) {
              var countryName = item.attributes.NAME_ENGLISH;
              if (countryName === country) {
                var obj = item.attributes;
                Object.keys(obj).forEach(function(key) {
                  if (key.substring(0, 5) === 'Fire_') {
                    index = index + 1;
                    allValues.push(obj[key]);
                    yearObject['data'].push({
                      x: parseInt(key.substring(5, 9)),
                      y: 0,
                      z: obj[key]
                    });
                  }
                });

                series['data'] = yearObject['data'];
                var maxValue =  Math.max.apply(null, allValues);
                var numberOfBins = PRINT_CONFIG.colorRampFireHistory.length;
                var binsArray = [0];
                PRINT_CONFIG.colorRampFireHistory.forEach(function (item, index) {
                  binsArray.push(parseInt((maxValue / numberOfBins) * (index + 1)));
                });

                series.data.map(function (item) {
                  var dataValue = item.z;
                  binsArray.forEach(function (binItem, index) {
                    if (dataValue >= binsArray[index] && dataValue <= binsArray[index + 1]) {
                      var color = PRINT_CONFIG.colorRampFireHistory[index];
                      item.color = color;
                    }
                  })
                });

                $('.fire-history__chart').highcharts({
                  chart: {
                    type: 'bubble'
                  },

                  title: {
                    text: ''
                  },

                  legend: {
                    enabled: false
                  },

                  credits: {
                    enabled: false
                  },

                  yAxis: {
                    visible: false
                  },

                  plotOptions: {
                    bubble:{
                      minSize:'2.5%',
                      maxSize:'60%'
                    }
                  },

                  tooltip: {
                    useHTML: true,
                    backgroundColor: '#FFB600',
                    borderWidth: 0,
                    thousandsSep: ',',
                    headerFormat: '<div class="history-chart-tooltip__container">',
                    pointFormat:
                    '<h3 class="history-chart-tooltip__content">{point.z} <span>Fires per SQ 1,000 Kilometers</span></h3>' +
                    '<p class="history-chart-tooltip__year">{point.x}</p>',
                    footerFormat: '</div>',
                    // followPointer: true
                  },

                  series: [{
                    data: series['data'],
                    marker: {
                      fillOpacity: .85
                    },
                  }]

                });
              }
            })
          }
        }, function (err) {
          deferred.resolve(false);
        });

        return deferred.promise;
      },

        queryFireCount: function(configKey) {
            var deferred = new Deferred(),
              self = this,
              queryConfig = PRINT_CONFIG[configKey];

            var aoiType = reportOptions.aoitype.toLowerCase();

            for (var key in reportOptions.dates) {
              if (parseInt(reportOptions.dates[key]) < 10 && reportOptions.dates[key].length === 1) {
                reportOptions.dates[key] = '0' + reportOptions.dates[key];
              }
            }

            var aoiString = reportOptions.aois.toString();


            var startDates = reportOptions.dates.fYear.toString() + reportOptions.dates.fMonth.toString() + reportOptions.dates.fDay.toString();
            var endDates = reportOptions.dates.tYear.toString() + reportOptions.dates.tMonth.toString() + reportOptions.dates.tDay.toString();

            console.log(window.reportOptions);
            var baseUrl = 'https://b10fk4n1u3.execute-api.us-east-1.amazonaws.com/stage/firms/';
            console.log(baseUrl + aoiType + '?chart=' + queryConfig.chartId + '&start=' + startDates + '&stop=' + endDates + '&aoi=' + aoiString);

            $.get(baseUrl + aoiType + '?chart=' + queryConfig.chartId + '&start=' + startDates + '&stop=' + endDates + '&aoi=' + aoiString, function (data) {
              var table = dom.byId(queryConfig.tableId);
              if (table) {
                  table.innerHTML = self.buildFiresTable(data, queryConfig, configKey);
              }
            });

            return deferred.promise;
        },

        queryDistrictsFireCount: function(configKey) {
            var queryConfig = PRINT_CONFIG[configKey],
                queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + queryConfig.fire_stats.id),
                fields = [queryConfig.fire_stats.onField, window.reportOptions.aoitype, queryConfig.fire_stats.outField],
                deferred = new Deferred(),
                query = new Query(),
                statdef = new StatisticDefinition(),
                self = this;


            query.where = self.get_layer_definition();
            query.returnGeometry = false;
            query.outFields = [queryConfig.fire_stats.onField];
            query.orderByFields = ["fire_count DESC"];
            query.groupByFieldsForStatistics = [query.outFields[0]];
            if (queryConfig.groupByFieldsForStatistics) {
                query.groupByFieldsForStatistics = queryConfig.groupByFieldsForStatistics;
            }

            statdef.onStatisticField = queryConfig.fire_stats.onField;
            statdef.outStatisticFieldName = queryConfig.fire_stats.outField;
            statdef.statisticType = "count";
            query.outStatistics = [statdef];

            function buildRSPOTable(features) {

                var table = "<table class='fires-table'><tr>"
                table += "<th>CONCESSION TYPE</th>";
                table += "<th>#</th>";
                table += "<th></th></tr>";

                var po_cons = {};

                var rspo_count = 0;
                var palm_oil_count = 0;
                arrayUtils.map(features, function(item, index, arr) {
                    if (item.attributes.palm_oil === '1') {
                        palm_oil_count += item.attributes.fire_count;
                        if (item.attributes.CERT_SCHEM === 'RSPO') {
                            rspo_count += item.attributes.fire_count;
                        }
                    }

                });

                var filtered = [{
                  attributes: {
                    'type': "RSPO CERTIFIED PALM OIL CONCESSIONS",
                    'fire_count': rspo_count
                  }
                }, {
                  attributes: {
                    'type': "ALL PALM OIL CONCESSIONS",
                    'fire_count': palm_oil_count
                  }
                }];

                // debugger
                    // table += self.generateTableRows(features, fields);
                table += self.generateTableRows(filtered, ['type', 'fire_count'], 'rspo-cert-table');
                table += "</table>";

                var finaltable = (filtered.length > 0) ? table : '<div class="noFiresTable">' + PRINT_CONFIG.noFeatures[configKey] + '</div>';

                return finaltable;
            }

            function buildTable(features) {
                var table;
                var districtFireTable = queryConfig.headerField.length >= 1 && queryConfig.tableId === 'district-fires-table';
                var subdistrictFireTable = queryConfig.headerField.length >= 1 && queryConfig.tableId === 'subdistrict-fires-table';

                // if (queryConfig.headerField.length > 1) {
                  if(subdistrictFireTable){
                    table = "<table class='fires-table'><tr><th>Regency/City</th>";
                    table += "<th class='align-left'>Province</th>";
                  // }
                } else if (districtFireTable) {
                  table = "<table class='fires-table'><tr><th>Jurisdiction</th>";
                } else {
                  table = "<table class='fires-table'><tr><th>" + queryConfig.headerField[0] + "</th>";
                  fields = [fields[0], fields[2]];
                }

                var filtered = arrayUtils.filter(features, function(feature) {
                    return feature.attributes.fire_count !== 0;
                });

                if (districtFireTable || subdistrictFireTable) {
                  table += "<th class='number-column'>#</th><th class='switch-color-column'></th></tr>";
                } else {
                  table += "<th class='number-column'>#</th></tr>";
                }

                if (
                  queryConfig.tableId === 'pulpwood-fires-table' ||
                  queryConfig.tableId === 'palmoil-fires-table' ||
                  queryConfig.tableId === 'logging-fires-table'
                ) {
                  var concessionFiresCounts = window['concessionFiresCounts'];
                  filtered = filtered.filter(function(item){
                    item['name'] = item.attributes[fields[0]];
                    item['type'] = queryConfig.tableId === 'pulpwood-fires-table' ? 'Wood':
                                   queryConfig.tableId === 'palmoil-fires-table'? 'Palm Oil':'Logging';
                    return item.attributes[fields[0]] !== " ";
                  });

                  concessionFiresCounts.push(filtered);

                  if(concessionFiresCounts.length === 3){
                    concessionTable = "<table class='concession-fires-counts__table'><thead><tr><th class='consession__name'>Name</th><th class='consession__type'>Concession</th><th class='consession__number'>#</th><th class='consession__bar'></th></tr></thead>";
                    var combineConcessionsArray = concessionFiresCounts[0].concat(concessionFiresCounts[1], concessionFiresCounts[2]);

                    combineConcessionsArray.sort(function (a, b) {
                      return a.attributes.fire_count - b.attributes.fire_count;
                    });

                    var concessionsFinalArray = [];
                    combineConcessionsArray.map(function (item, index) {
                      if (index > combineConcessionsArray.length - 10) {
                        concessionsFinalArray.push(item);
                      }
                    });

                    concessionsFinalArray = concessionsFinalArray.reverse();
                    var maxValue = concessionsFinalArray[0].attributes.fire_count;

                    concessionsFinalArray.forEach(function (item) {
                      var barSize = ((100 / maxValue) * item.attributes.fire_count).toString() + '%';
                      concessionTable += "<tr><td class='concession__name'>" + item.name + "</td><td class='concession__type'>" + item.type + "</td><td class='concession__count'>" + item.attributes.fire_count + "</td><td class='table-cell-bar__container'><span class='table-cell-bar__item' style='width: " + barSize + "'></span></td></tr>";
                    });

                    concessionTable += "</table>";
                    dom.byId("finalConcessionsTable").innerHTML = (concessionsFinalArray.length > 0) ? concessionTable : '<div class="noFiresTable">no Concession Features</div>';
                  }
                }

                table += self.generateTableRows(filtered, fields, queryConfig.tableId);

                table += "</table>";
                var finaltable = (filtered.length > 0) ? table : '<div class="noFiresTable">' + PRINT_CONFIG.noFeatures[configKey] + '</div>';
                return finaltable;
            }

            queryTask.execute(query, function(res) {
                PRINT_CONFIG.query_results[configKey] = res.features;
                if (res.features.length > 0) {
                    if (queryConfig['UniqueValueField']) {
                        self.getRegion(configKey).then(function() {
                            var regmap = PRINT_CONFIG.regionmap[configKey]
                            arrayUtils.forEach(res.features, function(feat) {
                                feat.attributes[window.reportOptions.aoitype] = regmap[feat.attributes[queryConfig.UniqueValueField]];
                            })
                            dom.byId(queryConfig.tableId).innerHTML = buildTable(res.features.slice(0, 10));
                        });
                    } else {
                        if (configKey == 'rspoQuery') {
                            dom.byId(queryConfig.tableId).innerHTML = buildRSPOTable(res.features);
                        } else {
                            dom.byId(queryConfig.tableId).innerHTML = buildTable(res.features.slice(0, 10));
                        }


                    }
                    deferred.resolve(true);

                } else {
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
                console.log(woodFiber, oilPalm, logging);
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

                // -------------
                // Portion of fires occurring on peatland
                // -------------
                peatData.push({
                    color: "rgba(184,0,18,1)",
                    name: "Peat",
                    visible: true,
                    y: peat
                });
                peatData.push({
                    color: "rgba(216, 212, 212, 1)",
                    name: "Non-peat",
                    visible: true,
                    y: nonpeat
                });

                self.buildPieChart("peat-fires-chart", {
                    data: peatData,
                    name: 'Peat Fires',
                    labelDistance: 5,
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

        queryForMoratoriumFires: function() {
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
                arrayUtils.forEach(res.features, function(feature) {
                    if (feature.attributes.moratorium === 1) {
                        inside++;
                    } else {
                        outside++;
                    }
                });

              // -------------
                // Portion of fires occurring in an indicative moratorium area
              // -------------
                chartData.push({
                    color: "rgba(229, 0, 23, 1)",
                    name: "In Indicative Moratorium Areas",
                    visible: true,
                    y: inside
                });
                chartData.push({
                  color: "rgba(216, 212, 212, 1)",
                    name: "Not in Indicative Moratorium Areas",
                    visible: true,
                    y: outside
                });
                self.buildPieChart("moratorium-fires-chart", {
                    data: chartData,
                    name: 'Moratorium Fires',
                    labelDistance: 5,
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

                // -------------
                // Protected Areas
                // -------------
                protectedAreaData.push({
                    color: "rgba(248, 137, 0, 1)",
                    name: "In Protected Areas",
                    visible: true,
                    y: protectedarea
                });
                protectedAreaData.push({
                    color: "rgba(216, 212, 212, 1)",
                    name: "Outside Protected Areas",
                    visible: true,
                    y: unprotected
                });
                self.buildPieChart("protected-areas-fires-chart", {
                    data: protectedAreaData,
                    name: 'Protected Area Fires',
                    labelDistance: 5,
                    total: total
                });

                // -------------
                // LAND USE AREA
                // -------------
                concessionData.push({
                    color: "rgba(253, 240, 0, 1)",
                    name: "Pulpwood Plantations",
                    visible: true,
                    y: pulpwood
                });
                concessionData.push({
                    color: "rgba(255, 218, 0, 1)",
                    name: "Palm Oil Concessions",
                    visible: true,
                    y: palmoil
                });
                concessionData.push({
                    color: "rgba(255, 188, 0, 1)",
                    name: "Logging Concessions",
                    visible: true,
                    y: logging
                });
                concessionData.push({
                    color: "rgba(216, 212, 212, 1)",
                    name: "Outside Concessions",
                    visible: true,
                    y: total - (logging + palmoil + pulpwood)
                });
                self.buildPieChart("land-use-fires-chart", {
                    data: concessionData,
                    name: 'Fires in Concessions',
                    labelDistance: 5,
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
                queryAll = new Query(),
                // queryHigh = new Query(),
                fireDataLabels = [],
                fireData = [],
                self = this,
                statdef = new StatisticDefinition(),
                success,
                failure;



            // query.where = [self.get_aoi_definition(), "BRIGHTNESS >= 330", "CONFIDENCE >= 30"].join(' AND ');
            query.where = self.get_aoi_definition();
            console.log(query.where);
            query.returnGeometry = false;
            query.groupByFieldsForStatistics = [PRINT_CONFIG.dailyFiresField];
            query.orderByFields = ['ACQ_DATE ASC'];

            statdef.onStatisticField = PRINT_CONFIG.dailyFiresField;
            statdef.outStatisticFieldName = 'Count';
            statdef.statisticType = "count";
            query.outStatistics = [statdef];


            // var highConfidenceDefinition = self.get_layer_definition();
            // queryAll.where = highConfidenceDefinition.split(" AND BRIGHTNESS")[0];
            // queryHigh.where = highConfidenceDefinition;
            queryAll.where = self.get_layer_definition();

            queryTask.executeForCount(queryAll,function(count){
                $("#totalFireAlerts").html(count + ' ');
                console.log("Total Fires: ", count);
            },function(error){
                console.log(error);
            });
            // queryTask.executeForCount(queryHigh,function(count){
            //     $("#highConfidenceFireAlerts").html(count + ' ');
            //     console.log("High Confidence Fires: ", count);
            // },function(error){
            //     console.log(error);
            // });


            success = function(res) {
                var count = 0;
                arrayUtils.forEach(res.features, function(feature) {
                  fireDataLabels.push(moment(feature.attributes[PRINT_CONFIG.dailyFiresField]).utcOffset('Asia/Jakarta').format("M/D/YYYY"));
                  fireData.push(feature.attributes.Count);
                  count += feature.attributes.Count;
                });

                $("#totalFiresLabel").show()

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
                        min: 0,
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
                        borderWidth: 0,
                        dataLabels: {
                          useHTML: true,
                          format: ' <div class="chart-data-label__container">{point.percentage:.0f}% <span class="chart-data-label__name">{point.name}</span>',
                          //connectorColor: 'transparent',
                          //connectorWidth: 0,
                        },
                        style: {
                          fontSize: '.8em'
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
                    enabled: false
                },
                series: [{
                    name: config.name,
                    data: config.data,
                    size: '70%',
                    innerSize: '55%',
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

            mapkeys = ['fires', 'adminBoundary', 'subdistrictBoundary'];
            query.where = self.get_aoi_definition();

            query.returnGeometry = true;
            query.outFields = ["DISTRICT"];
            callback = function(results) {
                var extent = graphicsUtils.graphicsExtent(results.features);
                // extent.xmax *= 1.2;
                // extent.ymax*=1.2;
                // extent.ymin*=1.2;
                // extent.xmin*=1.2;
                arrayUtils.forEach(mapkeys, function(key) {
                    var map = PRINT_CONFIG.maps[key];
                    map.setExtent(extent, true);
                    //map.setExtent(extent);
                })
                deferred.resolve(true);
            }

            errback = function(err) {
                console.log(err);
            };
            queryTask.execute(query, callback, errback);
            return deferred.promise;
        },

        generateRSPOtableRows: function(features, fieldNames) {

        },

        generateTableRows: function(features, fieldNames, queryConfigTableId) {
            var rows = "";
            var whitespace = /^\s+$/;

            function isValid(item) {
                return item !== null && item !== undefined && !whitespace.test(item);
            }

            if(queryConfigTableId === 'rspo-cert-table'){
              var maxRspoFire;
              var rspoFiresCountArray = [];

              arrayUtils.map(features, function (field, index) {
                rspoFiresCountArray.push(field.attributes.fire_count);
              });
              maxRspoFire = Math.max.apply(null, rspoFiresCountArray);
            }

            arrayUtils.forEach(features, function(feature) {
                var valid = true;
                var cols = '';

                arrayUtils.forEach(fieldNames, function(field, index) {
                    var numberOfElements = fieldNames.length - 1;
                    if (queryConfigTableId === 'district-fires-table' && numberOfElements === index) {
                      var colorValue = feature.attributes[field];
                      var tableColorRange = window[queryConfigTableId + '-colorRange'];

                      tableColorRange.forEach(function (binItem, index) {
                        if (colorValue > tableColorRange[index] && colorValue <= tableColorRange[index + 1]) {
                          var color = PRINT_CONFIG.colorramp[index];

                          cols += "<td class='table-cell'>" + colorValue + "</td><td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgb(" + color.toString() + ")'></span></td>";
                        }
                      })
                    } else if (queryConfigTableId === 'subdistrict-fires-table' && numberOfElements === index) {
                      var colorValue = feature.attributes[field];
                      var tableColorRange = window[queryConfigTableId + '-colorRange'];

                      tableColorRange.forEach(function (binItem, index) {
                        if (colorValue > tableColorRange[index] && colorValue <= tableColorRange[index + 1]) {
                          var color = PRINT_CONFIG.colorramp[index];

                          cols += "<td class='table-cell'>" + colorValue + "</td><td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgb(" + color.toString() + ")'></span></td>";
                        }
                      })
                    } else if (queryConfigTableId === 'district-fires-table' && isValid(feature.attributes[field])) {
                      if (field === "DISTRICT") {
                        cols += "<td class='table-cell 111'>" + (isValid(feature.attributes["DISTRICT"]) ? feature.attributes["DISTRICT"] : ' - ') + "</td>";
                      }
                    } else if (isValid(feature.attributes[field]) && queryConfigTableId === 'rspo-cert-table') {
                      if(field == 'fire_count'){
                        var barSize = ((100 / maxRspoFire) * feature.attributes[field]).toString() + '%';
                        cols += "<td class='table-cell 222'>" + (isValid(feature.attributes[field]) ? feature.attributes[field] : ' - ') + " </td><td class='table-cell-bar__container'><span class='table-cell-bar__item' style='width: " + barSize + "'></span></td>";
                      } else {
                        cols += "<td class='table-cell 222'>" + (isValid(feature.attributes[field]) ? feature.attributes[field] : ' - ') + "</td>";
                      }
                    } else if (isValid(feature.attributes[field])) {
                      cols += "<td class='table-cell regular'>" + (isValid(feature.attributes[field]) ? feature.attributes[field] : ' - ') + "</td>";
                    } else {
                      valid = false
                    }
                });
              if (valid) {
                    rows += "<tr>";
                    rows += cols;
                    rows += "</tr>";
                }

            });
            return rows;
        },

        generateGPTableRows: function(features, fieldNames) {
            var self = this;
            var rows = "";
            var whitespace = /^\s+$/;

            function isValid(item) {
                return item !== null && item !== undefined && !whitespace.test(item);
            }
            arrayUtils.forEach(features, function(feature) {
                var valid = true;
                var cols = '';
                arrayUtils.forEach(fieldNames, function(field) {
                    if (isValid(feature[field])) {

                      if (field === 'totalfires' || field === 'totalglad') {
                        var integer = parseInt(feature[field]);
                        feature[field] = self.numberWithCommas(feature[field]);
                        //todo: translate things like 'Palm Oil' that come back from the API here

                        cols += "<td>" + (isValid(feature[field]) ? feature[field] : ' - ') + "</td>";
                      } else {
                        cols += "<td>" + (isValid(feature[field]) ? feature[field] : ' - ') + "</td>";
                      }

                    } else {
                        valid = false
                    }
                });
                if (valid) {
                    rows += "<tr>";
                    rows += cols;
                    rows += "</tr>";
                }

            });
            return rows;
        },

        numberWithCommas: function(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
