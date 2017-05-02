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
    "esri/geometry/Extent",
    "vendors/geostats/lib/geostats.min",
], function(dom, ready, on, Deferred, domStyle, domClass, registry, all, arrayUtils, ioQuery, Map, Color, esriConfig, ImageParameters, ArcGISDynamicLayer,
    SimpleFillSymbol, AlgorithmicColorRamp, ClassBreaksDefinition, GenerateRendererParameters, UniqueValueRenderer, LayerDrawingOptions, GenerateRendererTask,
    Query, QueryTask, StatisticDefinition, graphicsUtils, esriDate, esriRequest, ReportConfig, Extent, geostats) {

    var PRINT_CONFIG = {
        zoom: 4,
        basemap: 'dark-gray',
        slider: true,
        mapcenter: [120, -1.2],
        colorramp: [
            [253, 240, 0, 1],
            [255, 218, 0, 1],
            [248, 137, 0, 1],
            [225, 63, 0, 1],
            [229, 0, 2, 1]
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
            urlIsland: "http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer",
            urlGlobal: "http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_Global/MapServer/",
            id: "Active_Fires",
            fire_id: 0,
            fire_id_global_viirs: 8,
            fire_id_global_modis: 9,
            fire_id_island_viirs: 0,
            fire_id_island_modis: 11,
            defaultLayers: [8],
            defaultLayersModis: [9],
            defaultLayersIslandViirs: [0],
            defaultLayersIslandModis: [11],
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
            urlIsland: "http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer",
            urlGlobal: "http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_Global/MapServer/",
            id: 'district-bounds',
            defaultLayers: [6],
            defaultLayersGlobal: [6],
            UniqueValueField: 'DISTRICT',
            UniqueValueFieldGlobal: 'NAME_1',
            regionField: 'PROVINCE',
            regionFieldGlobal: 'NAME_1',
            layerId: 6,
            layerIdGlobal: 6,
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
            urlIsland: 'http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
            urlGlobal: 'http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_Global/MapServer/',
            id: 'subdistrict-bounds',
            defaultLayers: [5],
            defaultLayersGlobal: [4],
            UniqueValueField: 'SUBDISTRIC',
            UniqueValueFieldGlobal: 'NAME_2',
            regionField: 'DISTRICT',
            layerId: 5,
            layerIdGlobal: 4,
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
            outFieldsGlobal: ['NAME_1', 'fire_count'],
            tableId: "district-fires-table",
            headerField: ['DISTRICT'],
            headerFieldGlobal: ['NAME_1'],
            UniqueValueField: 'DISTRICT',
            UniqueValueFieldGlobal: 'NAME_1',
            layerId: 6,
            layerIdGlobal: 4,
            fire_stats: {
                id: 0,
                id_viirs: 0,
                id_modis: 11,
                outField: 'fire_count',
                onField: 'DISTRICT'
            },
            fire_stats_global: {
                id: 0,
                id_viirs: 0,
                id_modis: 1,
                outField: 'fire_count',
                onField: 'NAME_1'
            }
        },
        subDistrictQuery: {
            outFields: ['SUBDISTRIC', 'DISTRICT', 'fire_count'],
            outFieldsGlobal: ['NAME_2', 'NAME_1', 'fire_count'],
            tableId: "subdistrict-fires-table",
            UniqueValueField: 'SUBDISTRIC',
            UniqueValueFieldGlobal: 'NAME_2',
            regionField: 'DISTRICT',
            regionFieldGlobal: 'NAME_1',
            headerField: ['SUBDISTRICT', 'DISTRICT'],
            headerFieldGlobal: ['NAME_2', 'NAME_1'],
            fire_stats: {
                id: 0,
                id_viirs: 0,
                id_modis: 11,
                outField: 'fire_count',
                onField: 'SUBDISTRIC'
            },
            fire_stats_global: {
                id: 0,
                id_viirs: 0,
                id_modis: 1,
                outField: 'fire_count',
                onField: 'NAME_2'
            },
            layerId: 5,
            layerIdGlobal: 4
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

        queryUrl: "http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer",
        queryUrlGlobal: "http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_Global/MapServer",
        companyConcessionsId: 1,
        confidenceFireId: 0,
        dailyFiresId: 8,
        dailyFiresField: 'ACQ_DATE',
        reportOptions: {},
        firesCountViirs: null,
        firesCountModis: null
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

            var urlHash = window.location.href.split('#')[1].split('&');
            var urlHashObject = {};
            urlHash.forEach(function (item) {
              var itemArray = item.split('=');
              urlHashObject[itemArray[0]] = itemArray[1];
            });

            var areaOfInterestType = urlHashObject.aoitype;
            var selectedCountry = urlHashObject.country ? urlHashObject.country : 'Indonesia';
            $('.selected-country').text(selectedCountry);
            var TypeIsland = 'ISLAND';
            $('.country-name').text(selectedCountry);

            self.init_report_options();
            // self.getCountryAdminTypes(selectedCountry);

            // Set up some configurations
            esriConfig.defaults.io.proxyUrl = proxyUrl;

            // #gfw-concessions, #all-concessions-fires-table
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

            var districtViirsLayerId;
            var districtMiirsLayerId;
            var subDistrictViirsLayerId;
            var subDistrictModisLayerId;
            if (window.reportOptions.aoitype === 'GLOBAL') {
              districtViirsLayerId = PRINT_CONFIG.adminQuery.fire_stats_global.id_viirs;
              districtMiirsLayerId = PRINT_CONFIG.adminQuery.fire_stats_global.id_modis;
              subDistrictViirsLayerId = PRINT_CONFIG.subDistrictQuery.fire_stats_global.id_viirs;
              subDistrictModisLayerId = PRINT_CONFIG.subDistrictQuery.fire_stats_global.id_modis;
            } else if (window.reportOptions.aoitype === 'ISLAND') {
              districtViirsLayerId = PRINT_CONFIG.adminQuery.fire_stats.id_viirs;
              districtMiirsLayerId = PRINT_CONFIG.adminQuery.fire_stats.id_modis;
              subDistrictViirsLayerId = PRINT_CONFIG.subDistrictQuery.fire_stats.id_viirs;
              subDistrictModisLayerId = PRINT_CONFIG.subDistrictQuery.fire_stats.id_modis;
            }
            var districtLayerIdsViirsModis = [districtViirsLayerId, districtMiirsLayerId];
            var subDistrictLayerIdsViirsModis = [subDistrictViirsLayerId, subDistrictModisLayerId];

            all([
              self.queryForDailyFireData(areaOfInterestType),
              self.buildDistributionOfFireAlertsMap(),
              districtLayerIdsViirsModis.forEach(function (districtLayerId) {
                self.queryDistrictsFireCount("adminQuery", districtLayerId, areaOfInterestType).then(function () {
                  self.buildFireCountMap('adminBoundary', 'adminQuery');
                });
              }),
              subDistrictLayerIdsViirsModis.forEach(function (subDistrictLayerId) {
                self.queryDistrictsFireCount("subDistrictQuery", subDistrictLayerId, areaOfInterestType).then(function (result) {
                  self.buildFireCountMap('subdistrictBoundary', 'subDistrictQuery');
                });
              })
            ]);

            self.get_extent();
            self.getFireCounts(selectedCountry);
            self.getFireHistoryCounts(selectedCountry);

            if (areaOfInterestType === TypeIsland) {
              all([
                // Indonesia tables query --- START
                self.queryDistrictsFireCount("rspoQuery", PRINT_CONFIG.rspoQuery.fire_stats.id),
                self.queryDistrictsFireCount("loggingQuery", PRINT_CONFIG.loggingQuery.fire_stats.id),
                self.queryDistrictsFireCount("palmoilQuery", PRINT_CONFIG.palmoilQuery.fire_stats.id),
                self.queryDistrictsFireCount("pulpwoodQuery", PRINT_CONFIG.pulpwoodQuery.fire_stats.id),
                // Indonesia tables query --- END

                self.queryFiresBreakdown(),
                self.queryFireCount('concessionsQuery'),

                // Indonesia charts query --- START
                self.queryForPeatFires(areaOfInterestType),
                self.queryForSumatraFires(areaOfInterestType),
                self.queryForMoratoriumFires(areaOfInterestType),
                // Indonesia charts query --- END

                self.getFireCounts(selectedCountry),
                self.getFireHistoryCounts(selectedCountry)
              ]).then(function(res) {
                self.printReport();
              });
            } else {
              document.querySelector('.report-section__charts-container').style.display = 'none';
              document.querySelector('#ConcessionRspoContainer').style.display = 'none';

              all([
                self.getCountryAdminTypes(selectedCountry)
              ]).then(function(res) {
                self.printReport();
              });

            }
        },

        getCountryAdminTypes: function (selectedCountry) {
          // Get admin type 1 and admin type 2 for country
            var queryTask;
            var queryConfig;
            var aois = window.reportOptions.aois;
            var aoiData = aois.join('\',\'');

            queryTask = new QueryTask("http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_Global/MapServer/10"),
              deferred = new Deferred(),
              query = new Query();

              query.where = `NAME_ENGLISH = '${selectedCountry}' AND Name_1 in ('${aoiData}')`;
              query.returnGeometry = false;
              query.outFields = ['Type_1, Type_2'];
              query.returnDistinctValues = true;
              queryConfig = query;

            queryTask.execute(queryConfig, function (respons) {
              var countryAdminTypes = respons.features["0"].attributes;
              $('.admin-type-1').text(countryAdminTypes.TYPE_1);
              $('.admin-type-2').text(countryAdminTypes.TYPE_2);
              PRINT_CONFIG.reportOptions.countryAdminTypes = countryAdminTypes;
            }, function (err) {
              console.log('Country Admin Types error: ', err);
              deferred.resolve(false);
            });

            return deferred.promise;
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
            document.querySelector('#fromDate').innerHTML = self.startdate;
            document.querySelector('#toDate').innerHTML = " - " + self.enddate;
            document.querySelector('#aoiList').innerHTML = 'ON ' + self.aoitype + 'S: ' + self.aoilist;
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
            }

            var dateObj = {};
            _initialState.dates.split('!').map(function(date) {
                var datearr = date.split('-');
                dateObj[datearr[0]] = datearr[1];
            })

            window.reportOptions = {
                aoitype: _initialState.aoitype
            }

            if (_initialState.aoitype === "ISLAND") {
              window.reportOptions['country'] = 'Indonesia';
            } else {
              window.reportOptions['country'] = _initialState.country;
            }

            window.reportOptions['aois'] = _initialState.aois.split('!');
            window.reportOptions['dates'] = dateObj;
            window.reportOptions['type'] = _initialState.aoitype;
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
            var aoiType = window.reportOptions.aoitype;
            var aoiData = aois.join('\',\'');
            var country = window.reportOptions.country;
            var startdate = "ACQ_DATE >= date'" + this.startdate + "'";
            var enddate = "ACQ_DATE <= date'" + this.enddate + "'";
            var countryQueryGlobal;
            var aoiQueryGlobal;

            if (aoiType === 'ISLAND') {
                aoi = aoiType + " in ('" + aoiData + "')";
              } else {
                countryQueryGlobal = "NAME_ENGLISH = \'" + country + "'";
                aoiQueryGlobal = "NAME_1 in ('" + aoiData + "')";
                aoi = [countryQueryGlobal, aoiQueryGlobal].join(' AND ');
              }

            var sql = [aoi, startdate, enddate].join(' AND ');
                return sql;
        },

        get_aoi_definition: function(queryType) {
            var aois = window.reportOptions.aois;
            var aoi;

            if (window.reportOptions.aoitype === 'GLOBAL' && queryType === 'REGION') {
              aoi = "NAME_0 = '" + window.reportOptions.country + "' AND NAME_1 in ('" + aois.join("','") + "')";
            } else if (window.reportOptions.aoitype === 'GLOBAL') {
              aoi = "NAME_ENGLISH = '" + window.reportOptions.country + "' AND NAME_1 in ('" + aois.join("','") + "')";
            } else {
              aoi = window.reportOptions.aoitype + " in ('" + aois.join("','") + "')";
            }

            return aoi;
        },

        buildDistributionOfFireAlertsMap: function() {

            var self = this;
            var deferred = new Deferred(),
                fireParams,
                fireLayer,
                map,
                queryUrl;

            map = new Map("DistributionOfFireAlertsMap", {
                basemap: PRINT_CONFIG.basemap,
                zoom: PRINT_CONFIG.zoom,
                center: PRINT_CONFIG.mapcenter,
                slider: PRINT_CONFIG.slider
            });

            // TODO: At cleanup stage
            window.map1 = map;

    map.on("update-start", function() {
    esri.show(dom.byId("firesmapload"));
  });
    map.on("update-end", function() {
    esri.hide(dom.byId("firesmapload"));
            });

            PRINT_CONFIG.maps['fires'] = map;


            if (window.reportOptions.aoitype === 'GLOBAL') {
              queryUrl = PRINT_CONFIG.firesLayer.urlGlobal;
            } else {
              queryUrl = PRINT_CONFIG.firesLayer.urlIsland
            }

            if(window.reportOptions.aoitype === 'GLOBAL'){
              [PRINT_CONFIG.firesLayer.defaultLayers, PRINT_CONFIG.firesLayer.defaultLayersModis].forEach(function (id) {
                addFirePoints(id);
              });
            } else {
              [PRINT_CONFIG.firesLayer.defaultLayersIslandViirs, PRINT_CONFIG.firesLayer.defaultLayersIslandModis].forEach(function (id) {
                addFirePoints(id);
              });
            }

            function addFirePoints(id) {
              fireParams = new ImageParameters();
              fireParams.format = "png32";
              fireParams.layerIds = id;
              fireParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

              fireLayer = new ArcGISDynamicLayer(queryUrl, {
                imageParameters: fireParams,
                id: PRINT_CONFIG.firesLayer.id + id[0],
                visible: true
              });
              let layerDefs = [];

              if(window.reportOptions.aoitype === 'GLOBAL'){
                layerDefs[PRINT_CONFIG.firesLayer.fire_id_global_viirs] = self.get_layer_definition();
                layerDefs[PRINT_CONFIG.firesLayer.fire_id_global_modis] = self.get_layer_definition();
              } else {
                layerDefs[PRINT_CONFIG.firesLayer.defaultLayersIslandViirs] = self.get_layer_definition();
                layerDefs[PRINT_CONFIG.firesLayer.defaultLayersIslandModis] = self.get_layer_definition();
              }

              fireLayer.setLayerDefinitions(layerDefs);

              map.addLayer(fireLayer);
            }

            fireLayer.on('load', function() {
                deferred.resolve(true);
            });

            return deferred.promise;
        },

        buildFireCountMap: function(configKey, queryKey) {
            var deferred = new Deferred(),
                boundaryConfig = PRINT_CONFIG[configKey],
                options = [],
                otherFiresParams,
                otherFiresLayer,
                renderer,
                legend,
                ldos,
                map,
                uniqueValueField,
                queryUrl;

            var feat_stats = PRINT_CONFIG.query_results[queryKey];

            if (feat_stats.length == 0) {
                return;
            }

            var arr = feat_stats.map(function(item) {
                return item.attributes['fire_count']
            }).sort(function(a, b) {
                return a - b
            });
            sar = arr;

            if (window.reportOptions.aoitype === 'ISLAND') {
              queryUrl = boundaryConfig.urlIsland;
              uniqueValueField = boundaryConfig.UniqueValueField;
            } else {
              queryUrl = boundaryConfig.urlGlobal;
              uniqueValueField = boundaryConfig.UniqueValueFieldGlobal;
            }

            var dist_names = feat_stats.map(function(item) {
                if (item.attributes[uniqueValueField] != null) {

                    return item.attributes[uniqueValueField].replace("'", "''");
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

                var renderer = new UniqueValueRenderer(defaultSymbol, uniqueValueField);
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
                        value: feat.attributes[uniqueValueField],
                        symbol: sym
                    });

                });
                return {
                    r: renderer,
                    s: symbols,
                    b: nbks
                };

            }
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

            if (window.reportOptions.aoitype === 'ISLAND') {
              otherFiresParams.layerIds = boundaryConfig.defaultLayers;
            } else {
              otherFiresParams.layerIds = boundaryConfig.defaultLayersGlobal;
            }

            otherFiresLayer = new ArcGISDynamicLayer(queryUrl, {
                imageParameters: otherFiresParams,
                id: boundaryConfig.id,
                visible: true
            });

            function buildLegend(rendererInfo) {
                var html = "<table>";
                var rows = [];
                var curbreak = 0;

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
                var layerdefs = [];

                var aois = window.reportOptions.aois;
                if (window.reportOptions.aoitype === 'ISLAND') {
                  options[boundaryConfig.layerId] = ldos;
                  layerdefs[boundaryConfig.layerId] = uniqueValueField + " in ('" + dist_names.join("','") + "')";
                } else if ( configKey == "subdistrictBoundary"){
                  options[boundaryConfig.layerIdGlobal] = ldos;
                  layerdefs[boundaryConfig.layerIdGlobal] = "NAME_1 in ('" + aois.join("','") + "') AND " + uniqueValueField + " in ('" + dist_names.join("','") + "')";
                } else {
                  options[boundaryConfig.layerIdGlobal] = ldos;
                  layerdefs[boundaryConfig.layerIdGlobal] = uniqueValueField + " in ('" + dist_names.join("','") + "')";
                }

                otherFiresLayer.setLayerDefinitions(layerdefs);
                otherFiresLayer.setLayerDrawingOptions(options);

                otherFiresLayer.on('update-end', function() {
                    deferred.resolve(true);
                });
            }

            otherFiresLayer.on('load', generateRenderer);

            map.addLayer(otherFiresLayer);

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


        getRegion: function(configKey) {
            var queryConfig = PRINT_CONFIG[configKey],
                queryTask,
                regionField,
                deferred = new Deferred(),
                query = new Query(),
                regions = {},
                self = this,
                uniqueValueField;

            if (window.reportOptions.aoitype === 'ISLAND') {
              regionField = window.reportOptions.aoitype;
              uniqueValueField = queryConfig.UniqueValueField;
              queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + queryConfig.layerId);
            } else {
              regionField = 'NAME_0';
              uniqueValueField = queryConfig.UniqueValueFieldGlobal;
              queryTask = new QueryTask(PRINT_CONFIG.queryUrlGlobal + "/" + queryConfig.layerIdGlobal);
            }

            query.where = self.get_aoi_definition('REGION');
            query.returnGeometry = false;
            query.outFields = [regionField, uniqueValueField];

            queryTask.execute(query, function(res) {
                if (res.features.length > 0) {
                    arrayUtils.forEach(res.features, function (feat) {
                      regions[feat.attributes[uniqueValueField]] = feat.attributes[regionField];
                    });
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

            // console.log(baseUrl + aoiType + '?chart=breakdown&start=' + startDates + '&stop=' + endDates + '&aoi=' + aoiString);

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

              if (total === 0) {
                var parent = dom.byId('breakdown-fires-chart-container').parentElement;
                domClass.add(parent, 'hidden');
                deferred.resolve(false);
              } else {
                // dom.byId('totalHotSpots').innerHTML = self.numberWithCommas(total) + ' ';

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

            var finaltable = (filtered.length > 0) ? table : '<div class="noFiresTable">' + PRINT_CONFIG.noFeatures['greenpeace'] + '</div>';
            return finaltable;
        },

      getFireCounts: function (selectedCountry) {
        var queryTask = new QueryTask("http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_Global/MapServer/2"),
          deferred = new Deferred(),
          query = new Query(),
          series = [],
          index = 0,
          yearObject = {
            data: [],
          };

        query.where = "NAME_ENGLISH='" + selectedCountry + "'";
        query.returnGeometry = false;
        query.outFields = ['*'];

        queryTask.execute(query, function (res) {
          var currentYear = new Date().getFullYear();
          var currentMonth = new Date().getMonth();
          var dataLabelsFormat = {
            enabled: true,
            align: 'left',
            x: 0,
            verticalAlign: 'middle',
            overflow: true,
            crop: false,
            format: '{series.name}'
          };
          var allFeatures = res.features;

          var indexColor = 0;
          var colorStep = 15;
          var baseColor = '#777777';
          function shadeColor(color, percent) {
            var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
            return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
          }

          let dataLabelsFormatAction = function (yearObject, hexColor) {
            if (yearObject.data.length !== 12) {
              var yearObjectKeepValuesUpToCurrentMonth = yearObject.data.splice(currentMonth + 1, 12);
            }
            var twelveMonthsData = yearObject['data'];
            var lastMonthData = twelveMonthsData.pop();
            yearObject['data'] = [...twelveMonthsData, {
              dataLabels: dataLabelsFormat,
              y: lastMonthData
            }];
            yearObject['color'] = hexColor;
          };

          if (allFeatures.length > 0) {
            allFeatures.forEach(function (item) {
              var countryName = item.attributes.NAME_ENGLISH;
              var obj = item.attributes;
              Object.keys(obj).forEach(function(key) {
                if (key.substring(0, 3) === 'cf_' && obj[key] !== null) {
                  index = index + 1;
                  var yearFromData = '20' + key.substring(3, 5);
                  if (currentYear >= yearFromData) {
                    yearObject['name'] = yearFromData;
                    yearObject['data'].push(obj[key]);
                    if(index % 12 === 0){
                      var hexColor = shadeColor(baseColor, (indexColor / 100));
                      indexColor = indexColor + colorStep;
                      dataLabelsFormatAction(yearObject, hexColor);
                      series.push(yearObject);
                      yearObject = {
                        data: []
                      };
                    }
                  }
                }
              });

              indexColor = 10;
              dataLabelsFormatAction(yearObject);
              yearObject.color = '#D40000';
              series.push(yearObject);

              window['firesCountRegionSeries'] = series;
              window['firesCountRegionCurrentYear'] = yearObject;

              // Adding sum for year to window
              window['firesCountRegionCurrentYearSum'] = yearObject.data[yearObject.data.length - 1].y;

              $('#firesCountTitle').html(window['firesCountRegionCurrentYear'].name + ' MODIS Fire Alerts, Year to Date <span class="total_firecounts">' + window['firesCountRegionCurrentYearSum'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>');

              var firesCountChart = Highcharts.chart('firesCountChart', {
                title: {
                  text: ''
                },

                yAxis: {
                  title: {
                    text: ''
                  }
                },

                plotOptions: {
                  series: {
                    color: '#ccc',
                  },
                  line: {
                    marker: {
                      enabled: false
                    }
                  }
                },

                credits: {
                  enabled: false
                },

              tooltip: {
                useHTML: true,
                backgroundColor: '#ffbb07',
                formatter: function() {
                  return '<p class="firesCountChart__popup"> ' + this.x + ' ' + this.series.name + ': ' + Highcharts.numberFormat(this.y, 0, '.', ',') + '</p>';
                }

                },

                xAxis: {
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },

                series: series

              });

              getFireCountsChartAction(firesCountChart, selectedCountry);

              function getFireCountsChartAction(firesCountChart, selectedCountry) {
                var queryTask,
                  queryOptions;
                  deferred = new Deferred(),
                  query = new Query(),
                  series = [],
                  index = 0,
                  yearObject = {
                    data: [],
                  };

                if (window.reportOptions['country'] === 'Indonesia') {
                  queryTask = new QueryTask("http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/12"),

                  query.where = "1=1";
                  query.returnGeometry = false;
                  query.outFields = ['*'];
                  queryOptions = query;
                } else {
                  queryTask = new QueryTask("http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_Global/MapServer/3"),

                  query.where = 'NAME_0=\'' + selectedCountry + '\'';
                  query.returnGeometry = false;
                  query.outFields = ['*'];
                  queryOptions = query;
                }

                queryTask.execute(queryOptions, function (respons) {
                  var islandOrRegionFeatures = respons.features;
                  window['islandsOrRegionData'] = islandOrRegionFeatures;

                  // Create list of regions
                  $('#firesCountIslandsListContainer h3').html("<p class=\"fires-count__label\">Region:</p> <strong> " + selectedCountry + " </strong>");
                  $('#firesCountIslandsList').html('');
                  window.reportOptions['aois'].forEach(function (item) {
                    $('#firesCountIslandsList').append("<li>" + item + "</li>");
                  });

                  $('#firesCountIslandsListContainer h3').click(function () {
                    $(this).addClass('selected');
                    $('#firesCountTitle').html(window['firesCountRegionCurrentYear'].name + ' MODIS Fire Alerts, Year to Date <span class="total_firecounts">' + window['firesCountRegionCurrentYearSum'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>');
                    $('#firesCountIslandsList li').removeClass('selected');

                    if (firesCountChart.series) {
                      firesCountChart.update({
                        series: window.firesCountRegionSeries
                      });
                    } else {
                      firesCountChart.addSeries(window.firesCountRegionSeries);
                    }
                  });

                  $('#firesCountIslandsList li').click(function () {
                    $('#firesCountIslandsListContainer h3').removeClass('selected');
                    $('#firesCountIslandsList li').removeClass('selected');
                    $(this).addClass('selected');
                    var selectedIslandOrRegion = this.outerText,
                      index = 0,
                      series = [],
                      yearObject = {
                        data: [],
                      };

                    window['islandsOrRegionData'].forEach(function (item) {
                      if(item.attributes.ISLAND === selectedIslandOrRegion || item.attributes.NAME_1 === selectedIslandOrRegion){
                        var obj = item.attributes;
                        Object.keys(obj).forEach(function(key) {
                          if (key.substring(0, 3) === 'cf_' && obj[key] !== null) {
                            index = index + 1;
                            yearObject['name'] = '20' + key.substring(3, 5);
                            yearObject['data'].push(obj[key]);
                            if(index % 12 === 0){

                              var hexColor = shadeColor(baseColor, (indexColor / 100));
                              indexColor = indexColor + colorStep;
                              dataLabelsFormatAction(yearObject, hexColor);
                              series.push(yearObject);
                              yearObject = {
                                data: [],
                              };
                            }
                          }
                        });

                        indexColor = 10;
                        dataLabelsFormatAction(yearObject);
                        yearObject.color = '#D40000';
                        series.push(yearObject);

                        window['firesCountCurrentIslandYearSum'] = yearObject.data[yearObject.data.length - 1].y;
                        $('#firesCountTitle').html(window['firesCountRegionCurrentYear'].name + ' MODIS Fire Alerts, Year to Date <span class="total_firecounts">' + window['firesCountCurrentIslandYearSum'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>');
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
              }
            })
          }
        }, function (err) {
          deferred.resolve(false);
        });

        return deferred.promise;
      },

      getFireHistoryCounts: function (selectedCountry) {
        var queryTask = new QueryTask("http://gfw-staging.blueraster.io/arcgis/rest/services/Fires/FIRMS_Global/MapServer/2"),
          deferred = new Deferred(),
          query = new Query(),
          series = {},
          index = 0,
          allValues = [],
          yearObject = {
            data: []
          };

        query.where = "NAME_ENGLISH='" + selectedCountry + "'";
        query.returnGeometry = false;
        query.outFields = ['*'];

        queryTask.execute(query, function (res) {
          var currentYear = new Date().getFullYear();
          var allFeatures = res.features;
          if (allFeatures.length > 0) {
            allFeatures.forEach(function (item) {
              var countryName = item.attributes.NAME_ENGLISH;
              var obj = item.attributes;
              Object.keys(obj).forEach(function(key) {
                if (key.substring(0, 5) === 'Fire_') {
                  index = index + 1;
                  var yearFromData = parseInt(key.substring(5, 9));
                  if (currentYear >= yearFromData) {
                    allValues.push(obj[key]);
                    yearObject['data'].push({
                      x: yearFromData,
                      y: 0,
                      z: obj[key]
                    });
                  }
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

          var baseUrl = 'https://b10fk4n1u3.execute-api.us-east-1.amazonaws.com/stage/firms/';

          $.get(baseUrl + aoiType + '?chart=' + queryConfig.chartId + '&start=' + startDates + '&stop=' + endDates + '&aoi=' + aoiString, function (data) {
            var table = dom.byId(queryConfig.tableId);
            if (table) {
                table.innerHTML = self.buildFiresTable(data, queryConfig, configKey);
            }
          });

          return deferred.promise;
        },

        queryDistrictsFireCount: function(configKey, districtLayerId, areaOfInterestType) {
            var queryConfig = PRINT_CONFIG[configKey],
                deferred = new Deferred(),
                query = new Query(),
                statdef = new StatisticDefinition(),
                queryTask,
                fields,
                self = this;

            if (areaOfInterestType === 'GLOBAL') {
              queryTask = new QueryTask(PRINT_CONFIG.queryUrlGlobal + "/" + districtLayerId);
              fields = [PRINT_CONFIG[configKey].fire_stats_global.onField, window.reportOptions.aoitype, PRINT_CONFIG[configKey].fire_stats_global.outField];
              query.outFields = [PRINT_CONFIG[configKey].fire_stats_global.onField];
              statdef.onStatisticField = PRINT_CONFIG[configKey].fire_stats_global.onField;
              statdef.outStatisticFieldName = PRINT_CONFIG[configKey].fire_stats_global.outField;
            } else {
              queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + districtLayerId);
              fields = [queryConfig.fire_stats.onField, window.reportOptions.aoitype, queryConfig.fire_stats.outField];
              query.outFields = [queryConfig.fire_stats.onField];
              statdef.onStatisticField = queryConfig.fire_stats.onField;
              statdef.outStatisticFieldName = queryConfig.fire_stats.outField;
            }

            query.where = self.get_layer_definition();
            query.returnGeometry = false;
            query.orderByFields = ["fire_count DESC"];
            query.groupByFieldsForStatistics = [query.outFields[0]];

            if (queryConfig.groupByFieldsForStatistics) {
                query.groupByFieldsForStatistics = queryConfig.groupByFieldsForStatistics;
            }

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

                    // table += self.generateTableRows(features, fields);
                table += self.generateTableRows(filtered, ['type', 'fire_count'], 'rspo-cert-table');
                table += "</table>";

                var finaltable = (filtered.length > 0) ? table : '<div class="noFiresTable">' + PRINT_CONFIG.noFeatures[configKey] + '</div>';

                return finaltable;
            }

            function buildTable(features) {
                var aoiType = window.reportOptions.aoitype
                var table;
                var districtFireTable = queryConfig.headerField.length >= 1 && queryConfig.tableId === 'district-fires-table';
                var subdistrictFireTable = queryConfig.headerField.length >= 1 && queryConfig.tableId === 'subdistrict-fires-table';

                if(districtFireTable){
                  table = `<table class='fires-table'><tr><th>${PRINT_CONFIG.reportOptions.countryAdminTypes ? PRINT_CONFIG.reportOptions.countryAdminTypes.TYPE_1 : 'Jurisdiction'}</th>`;
                } else if (subdistrictFireTable) {
                  table = `<table class='fires-table'><tr><th class='admin-type-2'>${PRINT_CONFIG.reportOptions.countryAdminTypes ? PRINT_CONFIG.reportOptions.countryAdminTypes.TYPE_2 : 'Regency/City'}</th>`;
                  table += `<th class='align-left admin-type-1'>${PRINT_CONFIG.reportOptions.countryAdminTypes ? PRINT_CONFIG.reportOptions.countryAdminTypes.TYPE_1 : 'Province'}</th>`;
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

            if (configKey === "subDistrictQuery" && areaOfInterestType === "GLOBAL") {
              query.groupByFieldsForStatistics.push("NAME_1");
            }

            queryTask.execute(query, function(res) {
              var queryResultFirst = PRINT_CONFIG.query_results[configKey];
              if (queryResultFirst !== undefined) {
                let combinedResults = {};
                console.log(PRINT_CONFIG.query_results[configKey], res.features);
                var queryResultSecond = res.features;
                if(queryResultFirst.length > queryResultSecond.length){
                  queryResultSecond = [queryResultFirst, queryResultFirst = queryResultSecond][0];
                }

                if (areaOfInterestType === "GLOBAL") {
                  combinedResults = queryResultSecond.map(function (result) {
                    queryResultFirst.forEach(function (firstResult) {
                      if (firstResult.attributes.NAME_1 === result.attributes.NAME_1 && configKey === "adminQuery") {
                        result.attributes.fire_count = result.attributes.fire_count + firstResult.attributes.fire_count;
                      } else if (firstResult.attributes.NAME_2 === result.attributes.NAME_2 && configKey === "subDistrictQuery") {
                        result.attributes.fire_count = result.attributes.fire_count + firstResult.attributes.fire_count;
                      }
                    });
                    return result;
                  });
                } else {
                  combinedResults = queryResultSecond.map(function (result) {
                    queryResultFirst.forEach(function (firstResult) {
                      if (firstResult.attributes.DISTRICT === result.attributes.DISTRICT && configKey === "adminQuery") {
                        // console.log(firstResult.attributes.DISTRICT);
                        // console.log(firstResult.attributes.fire_count);
                        // console.log(result.attributes.fire_count);
                        result.attributes.fire_count = result.attributes.fire_count + firstResult.attributes.fire_count;
                      } else if (firstResult.attributes.NAME_2 === result.attributes.NAME_2 && configKey === "subDistrictQuery") {
                        result.attributes.fire_count = result.attributes.fire_count + firstResult.attributes.fire_count;
                      }
                    });
                    return result;
                  });
                }

                PRINT_CONFIG.query_results[configKey] = combinedResults;

                if (combinedResults.length > 0) {
                  var queryConfigField = window.reportOptions.aoitype === 'ISLAND' ? queryConfig['UniqueValueField'] : queryConfig['UniqueValueFieldGlobal'];
                  if (queryConfigField) {
                    self.getRegion(configKey).then(function() {
                      var regmap = PRINT_CONFIG.regionmap[configKey];
                      arrayUtils.forEach(combinedResults, function(feat) {
                        feat.attributes[window.reportOptions.aoitype] = regmap[feat.attributes[queryConfigField]];
                      })
                      dom.byId(queryConfig.tableId).innerHTML = buildTable(combinedResults.slice(0, 10));
                    });
                  }
                  deferred.resolve(true);

                } else {
                  deferred.resolve(false);
                  dom.byId('noFiresMsg').innerHTML = "No Fire Alerts for this AOI and time frame."
                }
              } else {
                PRINT_CONFIG.query_results[configKey] = res.features;
                if (configKey == 'rspoQuery') {
                  dom.byId(queryConfig.tableId).innerHTML = buildRSPOTable(res.features);
                } else {
                  dom.byId(queryConfig.tableId).innerHTML = buildTable(res.features.slice(0, 10));
                }
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

                // -------------
                // Portion of fires occurring on peatland
                // -------------
                peatData.push({
                    color: "rgba(184,0,18,1)",
                    name: "peatland",
                    visible: true,
                    y: peat
                });
                peatData.push({
                    color: "rgba(216, 212, 212, 1)",
                    name: "non-peatland",
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

        queryForDailyFireData: function(areaOfInterestType) {
            var queryTask,
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

            if (areaOfInterestType === 'GLOBAL') {
              var queryEndpointsIds = ['fire_id_global_viirs', 'fire_id_global_modis'];
              queryEndpointsIds.forEach(function (fireCountLayer) {
                queryTask = new QueryTask(queryURL = PRINT_CONFIG.queryUrlGlobal + "/" + PRINT_CONFIG.firesLayer[fireCountLayer]);
                queryForFiresCount(fireCountLayer);
              })
            } else {
              var queryEndpointsIds = ['fire_id_island_viirs', 'fire_id_island_modis'];
              queryEndpointsIds.forEach(function (fireCountLayer) {
                queryTask = new QueryTask(queryURL = PRINT_CONFIG.queryUrl + "/" + PRINT_CONFIG.firesLayer[fireCountLayer]);
                queryForFiresCount(fireCountLayer);
              });
            }

            function queryForFiresCount(fireCountLayer) {
              // query.where = [self.get_aoi_definition(), "BRIGHTNESS >= 330", "CONFIDENCE >= 30"].join(' AND ');
              query.where = self.get_aoi_definition();
              query.returnGeometry = false;
              query.groupByFieldsForStatistics = [PRINT_CONFIG.dailyFiresField];
              query.orderByFields = ['ACQ_DATE ASC'];

              statdef.onStatisticField = PRINT_CONFIG.dailyFiresField;
              statdef.outStatisticFieldName = 'Count';
              statdef.statisticType = "count";
              query.outStatistics = [statdef];
              queryAll.where = self.get_layer_definition();

              queryTask.executeForCount(queryAll, function (count) {
                PRINT_CONFIG[fireCountLayer] = count;

                if (PRINT_CONFIG['fire_id_global_viirs'] && PRINT_CONFIG['fire_id_global_modis']){
                  var globalFiresTotalCount = PRINT_CONFIG['fire_id_global_viirs'] + PRINT_CONFIG['fire_id_global_modis'];
                  $("#totalFireAlerts").html(globalFiresTotalCount);
                } else if (PRINT_CONFIG['fire_id_island_viirs'] && PRINT_CONFIG['fire_id_island_modis']) {
                  var globalFiresTotalCount = PRINT_CONFIG['fire_id_island_viirs'] + PRINT_CONFIG['fire_id_island_modis'];
                  $("#totalFireAlerts").html(globalFiresTotalCount);
                }

              }, function (error) {
                console.log(error);
              });
            }

            success = function(res) {
                var count = 0;
                arrayUtils.forEach(res.features, function(feature) {
                  fireDataLabels.push(moment(feature.attributes[PRINT_CONFIG.dailyFiresField]).utcOffset('Asia/Jakarta').format("M/D/YYYY"));
                  fireData.push(feature.attributes.Count);
                  count += feature.attributes.Count;
                });

                console.log('fireData',fireData);

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
            var queryTask,
                deferred = new Deferred(),
                query = new Query(),
                time = new Date(),
                self = this,
                mapkeys;

            mapkeys = ['fires', 'adminBoundary', 'subdistrictBoundary'];
            query.where = self.get_aoi_definition('REGION');

            query.returnGeometry = true;
            if (window.reportOptions.aoitype === 'ISLAND') {
              query.outFields = ["DISTRICT"];
              queryTask = new QueryTask(PRINT_CONFIG.queryUrl + "/" + PRINT_CONFIG.adminQuery.layerId)
            } else {
              query.outFields = ["NAME_1"];
              queryTask = new QueryTask(PRINT_CONFIG.queryUrlGlobal + "/" + PRINT_CONFIG.adminQuery.layerIdGlobal)
            }
            callback = function(results) {
                var extent = graphicsUtils.graphicsExtent(results.features);

                arrayUtils.forEach(mapkeys, function(key) {
                    var map = PRINT_CONFIG.maps[key];
                    if (map) {
                      map.setExtent(extent, true);
                    }

                })
                deferred.resolve(true);
            }

            errback = function(err) {
                console.log(err);
            };
            queryTask.execute(query, callback, errback);
            return deferred.promise;
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

                      if (tableColorRange) {
                        tableColorRange.forEach(function (binItem, index) {
                          var color = PRINT_CONFIG.colorramp[index];
                          if (window.reportOptions.aoitype === 'ISLAND'){
                            if (colorValue > tableColorRange[index] && colorValue <= tableColorRange[index + 1]){
                              cols += "<td class='table-cell'>" + colorValue + "</td><td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(" + color.toString() + ")'></span></td>";
                            }
                          } else {
                            if (colorValue === tableColorRange[index]){
                              cols += "<td class='table-cell'>" + colorValue + "</td><td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(" + color.toString() + ")'></span></td>";
                            }
                          }
                        })
                      }
                    } else if (queryConfigTableId === 'subdistrict-fires-table' && numberOfElements === index) {
                      var colorValue = feature.attributes[field];
                      var tableColorRange = window[queryConfigTableId + '-colorRange'];

                      if (tableColorRange) {
                        tableColorRange.forEach(function (binItem, index) {
                          if (colorValue > tableColorRange[index] && colorValue <= tableColorRange[index + 1]) {
                            var color = PRINT_CONFIG.colorramp[index];
                            cols += "<td class='table-cell'>" + colorValue + "</td><td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(" + color.toString() + ")'></span></td>";
                          }
                        })
                      }
                    } else if (queryConfigTableId === 'district-fires-table' && isValid(feature.attributes[field])) {
                      if (field === "DISTRICT") {
                        cols += "<td class='table-cell island'>" + (isValid(feature.attributes["DISTRICT"]) ? feature.attributes["DISTRICT"] : ' - ') + "</td>";
                      } else if (field === "NAME_1"){
                        cols += "<td class='table-cell global'>" + (isValid(feature.attributes["NAME_1"]) ? feature.attributes["NAME_1"] : ' - ') + "</td>";
                      }
                    } else if (isValid(feature.attributes[field]) && queryConfigTableId === 'rspo-cert-table') {
                      if(field == 'fire_count'){
                        var barSize = ((100 / maxRspoFire) * feature.attributes[field]).toString() + '%';
                        cols += "<td class='table-cell 222'>" + (isValid(feature.attributes[field]) ? feature.attributes[field] : ' - ') + " </td><td class='table-cell-bar__container'><span class='table-cell-bar__item' style='width: " + barSize + "'></span></td>";
                      } else {
                        cols += "<td class='table-cell 222'>" + (isValid(feature.attributes[field]) ? feature.attributes[field] : ' - ') + "</td>";
                      }
                    } else if (isValid(feature.attributes[field])) {
                      if (field === "GLOBAL" && queryConfigTableId === "subdistrict-fires-table") {
                        field = 'NAME_1';
                        cols += "<td class='table-cell subdistrict-admin-level-1'>" + (isValid(feature.attributes[field]) ? feature.attributes[field] : ' - ') + "</td>";
                      } else {
                        cols += "<td class='table-cell regular'>" + (isValid(feature.attributes[field]) ? feature.attributes[field] : ' - ') + "</td>";
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
