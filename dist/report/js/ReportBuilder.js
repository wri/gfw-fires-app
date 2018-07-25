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
    "dojo/request",
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
    "esri/SpatialReference",
    "vendors/geostats/lib/geostats.min",
    "./ReportConfig"
], function(dom, ready, on, Deferred, domStyle, domClass, registry, all, arrayUtils, ioQuery, request, Map, Color, esriConfig, ImageParameters, ArcGISDynamicLayer,
    SimpleFillSymbol, AlgorithmicColorRamp, ClassBreaksDefinition, GenerateRendererParameters, UniqueValueRenderer, LayerDrawingOptions, GenerateRendererTask,
    Query, QueryTask, StatisticDefinition, graphicsUtils, esriDate, esriRequest, ReportConfig, Extent, SpatialReference, geostats, Config) {

    return {

        init: function() {
            var self = this;
            self.init_report_options();

            // self.getCountryAdminTypes(selectedCountry);

            // Set up some configurations
            // esriConfig.defaults.io.proxyUrl = proxyUrl;

            var areaOfInterestType = window.reportOptions['aoitype'];
            var selectedCountry = window.reportOptions['country'] ? window.reportOptions['country'] : 'Indonesia';
            $('.selected-country').text(selectedCountry);
            $('.country-name').text(selectedCountry);

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
            var districtModisLayerId;
            var subDistrictViirsLayerId;
            var subDistrictModisLayerId;
            var deferred = new Deferred();

            if (window.reportOptions.aoitype === 'GLOBAL' || window.reportOptions.aoitype === 'ALL') {
              districtViirsLayerId = Config.adminQuery.fire_stats_global.id_viirs;
              districtModisLayerId = Config.adminQuery.fire_stats_global.id_modis;
              subDistrictViirsLayerId = Config.subDistrictQuery.fire_stats_global.id_viirs;
              subDistrictModisLayerId = Config.subDistrictQuery.fire_stats_global.id_modis;
            } else if (window.reportOptions.aoitype === 'ISLAND') {
              districtViirsLayerId = Config.adminQuery.fire_stats.id_viirs;
              districtModisLayerId = Config.adminQuery.fire_stats.id_modis;
              subDistrictViirsLayerId = Config.subDistrictQuery.fire_stats.id_viirs;
              subDistrictModisLayerId = Config.subDistrictQuery.fire_stats.id_modis;
            }
            var districtLayerIdsViirsModis = [districtViirsLayerId, districtModisLayerId];
            var subDistrictLayerIdsViirsModis = [subDistrictViirsLayerId, subDistrictModisLayerId];

            // Creates the first map
            self.queryForDailyFireData(areaOfInterestType);

            // Create the Distribution of Fire Alerts Map
            // self.buildDistributionOfFireAlertsMap().then(function () {
            //   if (window.reportOptions.aoitype !== 'ALL') self.get_extent('fires');
            // });

            // Creates the second map starting from the top
            // districtLayerIdsViirsModis.forEach(function (districtLayerId) {
            //   self.queryDistrictsFireCount("adminQuery", areaOfInterestType, districtLayerId).then(function () {
            //     self.buildFireCountMap('adminBoundary', 'adminQuery');
            //     // if (window.reportOptions.aoitype !== 'ALL') self.get_extent('adminBoundary');
            //   });
            // });

            self.timQueryFireCount(areaOfInterestType, 'adminBoundary');

            // // Creates the third map starting from the top
            // subDistrictLayerIdsViirsModis.forEach(function (subDistrictLayerId) {
            //   self.queryDistrictsFireCount("subDistrictQuery", areaOfInterestType, subDistrictLayerId).then(function (result) {
            //     self.buildFireCountMap('subdistrictBoundary', 'subDistrictQuery');
            //     if (window.reportOptions.aoitype !== 'ALL') self.get_extent('subdistrictBoundary');
            //   });
            // });

            // Creates the Annual Fire History graph
            // self.getFireCounts(selectedCountry);
            // Creates the Fire History: Fire Season Progression graph
            self.getFireHistoryCounts()


            document.querySelector('.report-section__charts-container_countries').style.display = '';
            document.querySelector('#ConcessionRspoContainer').style.display = 'none';

            const queryFor = self.currentISO ? self.currentISO : 'global';

            request.get(Config.pieChartDataEndpoint + 'admin/' + queryFor + '?period=' + this.startDateRaw + ',' + this.endDateRaw, {
              handleAs: 'json'
            }).then(function(response) {
              Promise.all(Config.countryPieCharts.map(function(chartConfig) {
                return self.createPieChart(response.data.attributes.value[0].alerts, chartConfig);
              })).then(() => {
                $(".chart-container-countries:odd").addClass('pull-right');
                $(".chart-container-countries:even").addClass('pull-left');
              }).catch(e => {
                console.log(e);
              });
            });

            if (window.reportOptions.aois) {
              all([
                self.getCountryAdminTypes(selectedCountry)
              ]).then(function(res) {
                self.printReport();
              });
            }
        },

        timQueryFireCount: function(areaOfInterestType, configKey) {
          var deferred = new Deferred(),
            boundaryConfig = Config[configKey],
            options = [],
            otherFiresParams,
            otherFiresLayer,
            renderer,
            legend,
            keyRegion,
            ldos,
            map,
            uniqueValueField,
            queryUrl;

          const queryFor = this.currentISO ? `${this.currentISO}?&aggregate_values=True&aggregate_by=adm1&` : 'global?&aggregate_values=True&aggregate_by=iso&';

          if (areaOfInterestType === "GLOBAL") {
            keyRegion = configKey === "adminBoundary" ? 'NAME_1' : 'NAME_2';
          } else if (areaOfInterestType === 'ALL') {
            keyRegion = configKey === 'adminBoundary' ? 'NAME_0' : 'NAME_1';
          } else {
            keyRegion = configKey === "adminBoundary" ? 'DISTRICT' : 'SUBDISTRIC';
          }
  
          request.get(Config.pieChartDataEndpoint + 'admin/' + queryFor + 'period=' + this.startDateRaw + ',' + this.endDateRaw, {
            handleAs: 'json'
          }).then((response) => {
            let feat_stats = [];
            response.data.attributes.value.forEach((res) => {
              const attributes = { fire_count: res.alerts };
              attributes[keyRegion] = res.iso;
              feat_stats.push({ attributes });
            });

            // Config.query_results['adminQuery'] = feat_stats;

            // var feat_stats = Config.query_results[queryKey];
            if (!feat_stats || feat_stats.length == 0) {
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
            } else if (window.reportOptions.aoitype === 'ALL') {
              // TODO Move URL to config
              uniqueValueField = boundaryConfig.UniqueValueFieldAlliso;
              queryUrl = 'https://gis-gfw.wri.org/arcgis/rest/services/admin/MapServer';
            } else {
              // TODO Move URL to config
              uniqueValueField = boundaryConfig.UniqueValueFieldGlobal;
              queryUrl = 'https://gis-gfw.wri.org/arcgis/rest/services/admin/MapServer';
            }

            if (window.reportOptions.aoitype === 'ALL') {
              var dist_names = feat_stats.map(function(item) {
                if (item.attributes[boundaryConfig.UniqueValueFieldAll] != null) {
                  return item.attributes[boundaryConfig.UniqueValueFieldAll].replace("'", "''");
                }
              }).filter(function(item) {
                if (item != null) {
                  return item;
                }
              });
            } else {
              var dist_names = feat_stats.map(function(item) {
                if (item.attributes[uniqueValueField] != null) {
                  return item.attributes[uniqueValueField].replace("'", "''");
                }
              }).filter(function(item) {
                if (item != null) {
                  return item;
                }
              });
            }


            var natural_breaks_renderer = function(feat_stats, dist_names, method) {
              var nbks = [0, 10, 50, 100, 250, 5000];

              if (geostats) {
                geostats();
                setSerie(arr);
              }

              if (arr.length < boundaryConfig.breakCount) {
                  boundaryConfig.breakCount = arr.length - 1;
              }
              var brkCount = boundaryConfig.breakCount;
              if (getClassJenks) {
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
                }
              }

              var symbols = {};
              for (var i = 0; i < brkCount; i += 1) {
                var symbol = new SimpleFillSymbol();
                var color = Config.colorramp[i];
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

              var renderer = new UniqueValueRenderer(defaultSymbol, window.reportOptions.aoitype === 'ALL' ? boundaryConfig.UniqueValueFieldAlliso : uniqueValueField);
              arrayUtils.forEach(feat_stats, function(feat) {
                var count = feat.attributes['fire_count'];
                var sym;

                for (var i = 0; i < nbks.length; i++) {
                  if (count <= nbks[i + 1]) {
                    sym = symbols[i];
                    break;
                  }
                }

                // Checks for an undefined symbol AND if only 1 natural break,
                // Catches error of single admin unit being unsymbolized
                if (typeof sym === 'undefined' && nbks.length === 1) {
                  const singleSymbol = new SimpleFillSymbol();
                  singleSymbol.setColor({
                    a: 1,
                    r: 253,
                    g: 237,
                    b: 7
                  });
                  sym = singleSymbol;
                }

                renderer.addValue({
                  value: feat.attributes[window.reportOptions.aoitype === 'ALL' ? boundaryConfig.UniqueValueFieldAll : uniqueValueField],
                  symbol: sym
                });
              });
              return {
                r: renderer,
                s: symbols,
                b: nbks
              };
            };

            var obj = natural_breaks_renderer(feat_stats, dist_names, 'natural');

            var renderer = obj.r;
            var symbols = obj.s;
            var breaks = obj.b;

            var relatedTableId = Config[configKey].relatedTableId + '-colorRange';
            Config[relatedTableId] = breaks;

            map = new Map(boundaryConfig.mapDiv, {
              basemap: Config.basemap,
              zoom: Config.zoom,
              center: Config.mapcenter,
              slider: Config.slider
            });

            Config.maps[configKey] = map;

            otherFiresParams = new ImageParameters();
            otherFiresParams.format = "png32";
            otherFiresParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

            if (window.reportOptions.aoitype === 'ISLAND') {
              otherFiresParams.layerIds = boundaryConfig.defaultLayers;
            } else if (window.reportOptions.aoitype === 'ALL') { 
              otherFiresParams.layerIds = boundaryConfig.defaultLayersAll;
            }else {
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
              for (var i = 0; i < Config[configKey].breakCount; i++) {
                var item = symbols[i];
                var row;
                if (item) {
                  var low = i < 1 ? breaks[i] : breaks[i] + 1;
                  row = "<tr><td class='legend-swatch' style='background-color: rgb(" + item.color.r +
                      "," + item.color.g + "," + item.color.b + ");'" + "></td>";
                  row += "<td class='legend-label'>" + low + " - " + breaks[i + 1] + "</td></tr>";
                  rows.push(row);
                }
              }
              rows.reverse().forEach(function (row) {
                  html += row;
              });
              html += "</table>";
              dom.byId(boundaryConfig.legendId).innerHTML = html;
            }

            function buildRegionsTables() {
              var tableResults = feat_stats;

              let sortCombinedResults = _.sortByOrder(tableResults, function (element) {
                return element.attributes.fire_count;
              }, 'desc');

              var firstTenTableResults = sortCombinedResults.slice(0, 10);
              var tableColorBreakPoints = Config[relatedTableId];

              if (configKey === "adminBoundary") {
                $('#district-fires-table tbody').html(buildDistrictSubDistrictTables(firstTenTableResults, 'district-fires-table', tableColorBreakPoints));
              } else {
                $('#subdistrict-fires-table tbody').html(buildDistrictSubDistrictTables(firstTenTableResults, 'subdistrict-fires-table', tableColorBreakPoints));
              }

              function buildDistrictSubDistrictTables(sortCombinedResults, queryConfigTableId, tableColorBreakPoints) {
                var aoitype = window.reportOptions.aoitype.toLowerCase();
                var tableRows;

                if (queryConfigTableId === 'district-fires-table') {
                  tableRows =
                    '<tr><th class="admin-type-1">' + (Config.reportOptions.countryAdminTypes ? Config.reportOptions.countryAdminTypes.ENGTYPE_1 : 'Jurisdiction') + '</th>' +
                    '<th class="number-column">#</th>' +
                    '<th class="switch-color-column"></th></tr>';
                } else {
                  tableRows =
                    '<tr><th class="admin-type-2">' + (Config.reportOptions.countryAdminTypes ? Config.reportOptions.countryAdminTypes.ENGTYPE_2 : 'Regency/City') + '</th>' +
                    ('<th class="align-left admin-type-1">' + (Config.reportOptions.countryAdminTypes ? Config.reportOptions.countryAdminTypes.ENGTYPE_1 : 'Province') + '</th>') +
                    '<th class="number-column">#</th>' +
                    '<th class="switch-color-column"></th></tr>';
                }

                tableRows += sortCombinedResults.map(function (feature) {
                  var colorValue = feature.attributes.fire_count;
                  var admin1 = feature.attributes.NAME_1 ? feature.attributes.NAME_1 : feature.attributes.NAME_0;
                  var subDistrict1 = feature.attributes.NAME_1 ? feature.attributes.NAME_1 : feature.attributes.ISLAND;
                  var subDistrict2 = feature.attributes.NAME_2 ? feature.attributes.NAME_2 : feature.attributes.SUBDISTRIC;
                  var color;

                  if (tableColorBreakPoints) {
                    tableColorBreakPoints.forEach(function (binItem, colorIndex) {
                      if (colorValue > tableColorBreakPoints[colorIndex] && colorValue <= tableColorBreakPoints[colorIndex + 1]){
                        color = Config.colorramp[colorIndex];
                      }
                    });
                  }

                  if (queryConfigTableId === 'district-fires-table') {
                    return(
                      "<tr><td class=\"table-cell " + aoitype + "\">" + admin1 + "</td>" +
                      ("<td class='table-cell table-cell__value'>" + colorValue + "</td>") +
                      ("<td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(" + (color ? color.toString() : Config.colorramp[0]) + ")'></span></td></tr>")
                    )
                  } else {
                    return(
                      "<tr><td class=\"table-cell " + aoitype + "\">" + subDistrict2 + "</td>" +
                      ("<td class=\"table-cell " + aoitype + "\">" + subDistrict1 + "</td>") +
                      ("<td class='table-cell table-cell__value'>" + colorValue + "</td>") +
                      ("<td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(" + (color ? color.toString() : Config.colorramp[0]) + ")'></span></td></tr>")
                    )
                  }
                });
                return tableRows;
              }
            };

            function generateRenderer() {
              buildLegend();
              buildRegionsTables();
              ldos = new LayerDrawingOptions();
              ldos.renderer = renderer;
              var layerdefs = [];
              var aois = window.reportOptions.aois;

              if (window.reportOptions.aoitype === 'ISLAND') {
                options[boundaryConfig.layerId] = ldos;
                layerdefs[boundaryConfig.layerId] = uniqueValueField + " in ('" + dist_names.join("','") + "')";
              } else if (window.reportOptions.aoitype === 'ALL') {
                options[boundaryConfig.layerIdAll] = ldos;
                layerdefs[boundaryConfig.layerIdAll] = boundaryConfig.UniqueValueFieldAlliso + " in ('" + dist_names.join("','") + "')";
              } else if (configKey === "subdistrictBoundary"){
                dist_names = dist_names.map(function (aoisItem) {
                  var fixingApostrophe = aoisItem.replace(/'/g, "");
                  return fixingApostrophe;
                });
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

            return deferred.promise;
          });
        }, // END //

        createPieChart: function(firesCount, chartConfig) {
          return new Promise((resolve, reject) => {
            var self = this;
            // var side = false; // 0 = right, 1 = left
            var data = [];

            const queryFor = self.currentISO ? self.currentISO : 'global';
  
            request.get(Config.pieChartDataEndpoint + chartConfig.type + '/' + queryFor + '?period=' + this.startDateRaw + ',' + this.endDateRaw, {
              handleAs: 'json'
            }).then((response) => {
              if (response.data.attributes.value !== null) {
                document.querySelector('#' + chartConfig.domElement + '-container').style.display = 'inherit';
                // $('#' + chartConfig.domElement + '-container').addClass(side ? 'pull-right' : 'pull-left');
                // side = !side;
              } else {
                $('#' + chartConfig.domElement + '-container').remove();
                resolve();
                return;
              }
  
              var alerts = response.data.attributes.value[0].alerts;
  
              data.push({
                color: chartConfig.colors[0],
                name: chartConfig.name1,
                visible: true,
                y: alerts
              });
  
              data.push({
                color: chartConfig.colors[1],
                name: chartConfig.name2,
                visible: true,
                y: firesCount - alerts
              });
  
              self.buildPieChart(chartConfig.domElement, {
                data: data,
                name: chartConfig.name3,
                labelDistance: 5,
                total: firesCount
              });
              resolve();
            });
          });
        },

        getCountryAdminTypes: function (selectedCountry) {
          // Get admin type 1 and admin type 2 for country
            var queryTask;
            var queryConfig;
            var aois = window.reportOptions.aois;
            if (aois) var aoiData = aois.join('\',\'');

            // TODO move this to config
            queryTask = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer/10'),
              deferred = new Deferred(),
              query = new Query();

              query.where = "ID_0 = " + this.countryObjId + " AND Name_1 in ('" + aoiData + "')";
              query.returnGeometry = false;
              query.outFields = ['ENGTYPE_1, ENGTYPE_2'];
              query.returnDistinctValues = true;
              queryConfig = query;

            queryTask.execute(queryConfig, function (response) {
              if (response.features.length > 0) {
                var countryAdminTypes = response.features["0"].attributes;
                $('.admin-type-1').text(countryAdminTypes.ENGTYPE_1);
                $('.admin-type-2').text(countryAdminTypes.ENGTYPE_2);
                Config.reportOptions.countryAdminTypes = countryAdminTypes;
              }
            }, function (err) {
              console.log('Country Admin Types error: ', err);
              deferred.resolve(false);
            });

            return deferred.promise;
        },

        init_report_options: function() {
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            var self = this;

            var fullURI = window.location.href;
            var fullURIArray = fullURI.split("#");
            var baseURI = fullURIArray[0];
            var hashString = encodeURIComponent('#' + fullURIArray[1]);
            var longURIParsed = baseURI + hashString;
            $.getJSON("http://api.bit.ly/v3/shorten?login=gfwfires&apiKey=R_d64306e31d1c4ae489441b715ced7848&longUrl=" + longURIParsed, function (response) {
              var bitlyShortLink = response.data.url;
              $('.share-link')
                .on('click', function () {
                  document.querySelector('.share-link-input__container').classList.toggle("hidden");
                  $('.share-link-input').val(bitlyShortLink);
                });
            });

            self.read_hash();

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

            var startMonth = parseInt(dateobj.fMonth) < 10 ? '0' + dateobj.fMonth : dateobj.fMonth;
            var endMonth = parseInt(dateobj.tMonth) < 10 ? '0' + dateobj.tMonth : dateobj.tMonth;
            var startDay = parseInt(dateobj.fDay) < 10 ? '0' + dateobj.fDay : dateobj.fDay;
            var endDay = parseInt(dateobj.tDay) < 10 ? '0' + dateobj.tDay : dateobj.tDay;


            this.startDateRaw = dateobj.fYear + '-' + startMonth + '-' + startDay;
            this.endDateRaw = dateobj.tYear + '-' + endMonth + '-' + endDay;

            this.aoitype = window.reportOptions.aoitype;
            this.dataSource = window.reportOptions.dataSource;
            this.currentCountry = window.reportOptions.country;
            this.countryObjId = Config.countryObjId[this.currentCountry];

            if (window.reportOptions.aois) {
              this.aoilist = window.reportOptions.aois.join(', ');
              this.currentISO = Config.countryFeatures[Config.countryFeatures.findIndex(function(feature) { return feature.gcr ? feature.gcr === self.currentCountry : feature['English short name'] === self.currentCountry })]['Alpha-3 code'];
              document.querySelector('#aoiList').innerHTML = self.aoilist.replace(/''/g, "'");
            }

            $('.fromDate').text(' ' + self.startdate);
            $('.toDate').text(' - ' + self.enddate);
            $('.interaction-type').text(document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in');

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

            if (_initialState.aoitype === 'PROVINCE') {
              _initialState.aoitype = 'GLOBAL';
              _initialState.reporttype = 'globalcountryreport';
              _initialState.country= 'Indonesia';
              delete (_initialState.dataSource);
            }

            window.reportOptions = {
                aoitype: _initialState.aoitype
            }

            if (_initialState.aoitype === "ISLAND") {
              window.reportOptions['country'] = 'Indonesia';
            } else if (_initialState.aoitype === "ALL") {
              window.reportOptions['country'] = 'ALL';
            } else {
              window.reportOptions['country'] = _initialState.country;
            }

            if (_initialState.aois) {
              window.reportOptions['aois'] = _initialState.aois.split('!').sort();
              window.reportOptions['aois'] = window.reportOptions['aois'].map(function (aoisItem) {
                var fixingApostrophe = aoisItem.replace(/'/g, "''");
                return fixingApostrophe;
              });
            }

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

        get_global_layer_definition: function (queryType) {
          var aois = window.reportOptions.aois;
          var aoiType = window.reportOptions.aoitype;
          var aoiData = aois.join('\',\'');
          var country = window.reportOptions.country;
          var countryQueryGlobal;
          var aoiQueryGlobal;

          if (aoiType === 'ISLAND') {
            aoi = aoiType + " in ('" + aoiData + "')";
          } else if (
            queryType === 'queryFireData' ||
            queryType === 'rspoQuery' ||
            queryType === 'loggingQuery' ||
            queryType === 'palmoilQuery' ||
            queryType === 'pulpwoodQuery'
          ) {
            aoiQueryGlobal = "PROVINCE in ('" + aoiData + "')";
            aoi = aoiQueryGlobal;
          } else {
            countryQueryGlobal = "ID_0 = " + this.countryObjId;
            aoiQueryGlobal = "NAME_1 in ('" + aoiData + "')";
            aoi = [countryQueryGlobal, aoiQueryGlobal].join(' AND ');
          }
          // NEW - manipulate date here
          // ex. 24 Oct 2017
          var momentStart = moment(this.startdate, 'D MMM YYYY');
          var momentEnd = moment(this.enddate, 'D MMM YYYY');
          var startDateQuery = `Date > date'${momentStart.format('YYYY-MM-DD HH:mm:ss')}'`;
          var endDateQuery = `Date < date'${momentEnd.format('YYYY-MM-DD HH:mm:ss')}'`;

          var sql = [startDateQuery, endDateQuery, aoi].join(' AND ');
          return sql;
        },

        get_all_layer_definition: function() {
          var momentStart = moment(this.startdate, 'D MMM YYYY');
          var momentEnd = moment(this.enddate, 'D MMM YYYY');
          var startDateQuery = `Date > date'${momentStart.format('YYYY-MM-DD HH:mm:ss')}'`;
          var endDateQuery = `Date < date'${momentEnd.format('YYYY-MM-DD HH:mm:ss')}'`;
          var limit = 'LIMIT 100'
          var sql = [startDateQuery, endDateQuery].join(' AND ');
          return sql;
        },

        get_layer_definition: function(queryType) {
          var aois = window.reportOptions.aois;
          var aoiType = window.reportOptions.aoitype;
          var aoiData = aois ? aois.join('\',\'') : '';
          var country = window.reportOptions.country;
          var startdate = "ACQ_DATE >= date'" + this.startdate + "'";
          var enddate = "ACQ_DATE <= date'" + this.enddate + "'";
          var countryQueryGlobal;
          var aoiQueryGlobal;

          if (aoiType === 'ISLAND') {
            aoi = aoiType + " in ('" + aoiData + "')";
          } else if (aoiType === 'ALL') {
            aoi = "";
          } else if (
            queryType === 'queryFireData' ||
            queryType === 'rspoQuery' ||
            queryType === 'loggingQuery' ||
            queryType === 'palmoilQuery' ||
            queryType === 'pulpwoodQuery'
          ) {
            aoiQueryGlobal = "PROVINCE in ('" + aoiData + "')";
            aoi = aoiQueryGlobal;
          } else {
            countryQueryGlobal = "ID_0 = " + this.countryObjId;
            aoiQueryGlobal = "NAME_1 in ('" + aoiData + "')";
            aoi = [countryQueryGlobal, aoiQueryGlobal].join(' AND ');
          }

          var sql;
          if(aois) sql = [startdate, enddate, aoi].join(' AND ');
          else sql = [startdate, enddate].join(' AND ');
          
          return sql;
        },

        get_aoi_definition: function(queryType) {
          var aois = window.reportOptions.aois;
          var aoi;

          if (window.reportOptions.aoitype === 'GLOBAL' && queryType === 'REGION') {
            aoi = "NAME_0 = '" + window.reportOptions.country + "' AND NAME_1 in ('" + aois.join("','") + "')";
          } else if (window.reportOptions.aoitype === 'GLOBAL') {
            aoi = "ID_0 = " + this.countryObjId + " AND NAME_1 in ('" + aois.join("','") + "')";
          } else if (window.reportOptions.aoitype === 'ALL') {
            aoi = "";
          } else {
            aoi = window.reportOptions.aoitype + " in ('" + aois.join("','") + "')";
          }

          return aoi;
        },

        /**
         * Initializes the Distribution of Fire Alerts map (FIRT MAP)
         */
        buildDistributionOfFireAlertsMap: function() {
          var self = this;
          var deferred = new Deferred(),
              fireParams,
              fireLayer,
              map,
              queryUrl;

          map = new Map("DistributionOfFireAlertsMap", {
              basemap: Config.basemap,
              zoom: Config.zoom,
              center: Config.mapcenter,
              slider: Config.slider
          });

          map.on("update-start", function() {
            esri.show(dom.byId("firesmapload"));
          });

          map.on("update-end", function() {
            esri.hide(dom.byId("firesmapload"));
          });

          Config.maps['fires'] = map;

          if (window.reportOptions.aoitype === 'GLOBAL' || window.reportOptions.aoitype === 'ALL') {
            queryUrl = Config.firesLayer.urlGlobal;
          } else {
            queryUrl = Config.firesLayer.urlIsland
          }

          if (window.reportOptions.aoitype === 'GLOBAL'){
            addFirePoints(Config.firesLayer.defaultLayers, 'globalFires');
          } else if (window.reportOptions.aoitype === 'ALL') {
            addFirePoints(Config.firesLayer.defaultLayers, 'allFires');
          } else {
            addFirePoints(Config.firesLayer.defaultLayersIsland, 'indonesianFires');
          }

          function addFirePoints(ids, layerId) {
            // Need to handle global reports differently than before
            if (window.reportOptions.aoitype === 'GLOBAL') {
              var viirs = 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS/MapServer';
              var modis = 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer';
              // Set Image Parameters
              var viirsParams = new ImageParameters();
              viirsParams.format = 'png32';
              viirsParams.layerIds = [8];
              viirsParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;
              var viirsLayerDefs = [];
              viirsLayerDefs[8] = self.get_global_layer_definition();
              var modisParams = new ImageParameters();
              modisParams.format = 'png32';
              modisParams.layerIds = [9];
              modisParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;
              var modisLayerDefs = [];
              modisLayerDefs[9] = self.get_global_layer_definition();
              // Create Layer
              var viirsLayer = new ArcGISDynamicLayer(viirs, {
                imageParameters: viirsParams,
                id: 'viirs',
                visible: true
              });
              var modisLayer = new ArcGISDynamicLayer(modis, {
                imageParameters: modisParams,
                id: 'modis',
                visible: true
              });
              // Set layer definitions
              viirsLayer.setLayerDefinitions(viirsLayerDefs);
              modisLayer.setLayerDefinitions(modisLayerDefs);
              // Add layers to map
              map.addLayers([viirsLayer, modisLayer]);
              modisLayer.on('load', function() {
                deferred.resolve(true);
              });
            } else if(window.reportOptions.aoitype === 'ALL') {
              var viirsLayerDefs = [];
              var modisLayerDefs = [];
              var viirs = 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS/MapServer';
              var modis = 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer';
              viirsLayerDefs[8] = self.get_all_layer_definition();
              modisLayerDefs[9] = self.get_all_layer_definition();

              var viirsParams = new ImageParameters();
              viirsParams.format = 'png32';
              viirsParams.layerIds = [8];
              viirsParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

              var modisParams = new ImageParameters();
              modisParams.format = 'png32';
              modisParams.layerIds = [9];
              modisParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

              // Create Layers
              var viirsLayer = new ArcGISDynamicLayer(viirs, {
                imageParameters: viirsParams,
                id: 'viirs',
                visible: true
              });

              var modisLayer = new ArcGISDynamicLayer(modis, {
                imageParameters: modisParams,
                id: 'modis',
                visible: true
              });
              
              // Set layer definitions
              viirsLayer.setLayerDefinitions(viirsLayerDefs);
              modisLayer.setLayerDefinitions(modisLayerDefs);

              // Add layers to map
              map.addLayers([viirsLayer, modisLayer]);
              modisLayer.on('load', function() {
                deferred.resolve(true);
              });
            } else {
              var layerDefs = [];
              fireParams = new ImageParameters();
              fireParams.format = "png32";
              fireParams.layerIds = [];
              fireParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;
              ids.forEach(function(id) {
                fireParams.layerIds.push(id);
                layerDefs[id] = self.get_layer_definition();
              });
              fireLayer = new ArcGISDynamicLayer(queryUrl, {
                imageParameters: fireParams,
                id: layerId,
                visible: true
              });
              fireLayer.setLayerDefinitions(layerDefs);
              map.addLayer(fireLayer);
              fireLayer.on('load', function() {
                  deferred.resolve(true);
              });
            }
          }
          return deferred.promise;
        },

        buildFireCountMap: function(configKey, queryKey) {
          var deferred = new Deferred(),
            boundaryConfig = Config[configKey],
            options = [],
            otherFiresParams,
            otherFiresLayer,
            renderer,
            legend,
            ldos,
            map,
            uniqueValueField,
            queryUrl;

          var feat_stats = Config.query_results[queryKey];
          if (!feat_stats || feat_stats.length == 0) {
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
          } else if (window.reportOptions.aoitype === 'ALL') {
            // TODO Move URL to config
            uniqueValueField = boundaryConfig.UniqueValueFieldAll;
            if (uniqueValueField === 'NAME_0') {
              queryUrl = 'https://gis-gfw.wri.org/arcgis/rest/services/admin/MapServer';
            }
            if (uniqueValueField === 'NAME_1') {
              queryUrl = 'https://gis-gfw.wri.org/arcgis/rest/services/admin/MapServer'
            }
          } else {
            // TODO Move URL to config
            uniqueValueField = boundaryConfig.UniqueValueFieldGlobal;
            if (uniqueValueField === 'NAME_1') {
              queryUrl = 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS/MapServer';
            }
            if (uniqueValueField === 'NAME_2') {
              queryUrl = 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer'
            }
          }

          if (window.reportOptions.aoitype === 'ALL') {
            var dist_names = feat_stats.map(function(item) {
              if (item.attributes[boundaryC] != null) {
                return item.attributes[boundaryConfig.UniqueValueFieldAllEnglish].replace("'", "''");
              }
            }).filter(function(item) {
              if (item != null) {
                return item;
              }
            });
          } else {
            var dist_names = feat_stats.map(function(item) {
              if (item.attributes[uniqueValueField] != null) {
                return item.attributes[uniqueValueField].replace("'", "''");
              }
            }).filter(function(item) {
              if (item != null) {
                return item;
              }
            });
          }


          var natural_breaks_renderer = function(feat_stats, dist_names, method) {
            var nbks = [0, 10, 50, 100, 250, 5000];

            if (geostats) {
              geostats();
              setSerie(arr);
            }

            if (arr.length < boundaryConfig.breakCount) {
                boundaryConfig.breakCount = arr.length - 1;
            }
            var brkCount = boundaryConfig.breakCount;
            if (getClassJenks) {
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
              }
            }

            var symbols = {};
            for (var i = 0; i < brkCount; i += 1) {
              var symbol = new SimpleFillSymbol();
              var color = Config.colorramp[i];
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

            var renderer = new UniqueValueRenderer(defaultSymbol, window.reportOptions.aoitype === 'ALL' ? boundaryConfig.UniqueValueFieldAllEnglish : uniqueValueField);
            arrayUtils.forEach(feat_stats, function(feat) {
              var count = feat.attributes['fire_count'];
              var sym;

              for (var i = 0; i < nbks.length; i++) {
                if (count <= nbks[i + 1]) {
                  sym = symbols[i];
                  break;
                }
              }

              // Checks for an undefined symbol AND if only 1 natural break,
              // Catches error of single admin unit being unsymbolized
              if (typeof sym === 'undefined' && nbks.length === 1) {
                const singleSymbol = new SimpleFillSymbol();
                singleSymbol.setColor({
                  a: 1,
                  r: 253,
                  g: 237,
                  b: 7
                });
                sym = singleSymbol;
              }

              renderer.addValue({
                value: feat.attributes[window.reportOptions.aoitype === 'ALL' ? boundaryConfig.UniqueValueFieldAllEnglish : uniqueValueField],
                symbol: sym
              });
            });
            return {
              r: renderer,
              s: symbols,
              b: nbks
            };
          };

          var obj = natural_breaks_renderer(feat_stats, dist_names, 'natural');

          var renderer = obj.r;
          var symbols = obj.s;
          var breaks = obj.b;

          var relatedTableId = Config[configKey].relatedTableId + '-colorRange';
          Config[relatedTableId] = breaks;

          map = new Map(boundaryConfig.mapDiv, {
            basemap: Config.basemap,
            zoom: Config.zoom,
            center: Config.mapcenter,
            slider: Config.slider
          });

          Config.maps[configKey] = map;

          otherFiresParams = new ImageParameters();
          otherFiresParams.format = "png32";
          otherFiresParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

          if (window.reportOptions.aoitype === 'ISLAND') {
            otherFiresParams.layerIds = boundaryConfig.defaultLayers;
          } else if (window.reportOptions.aoitype === 'ALL') { 
            otherFiresParams.layerIds = boundaryConfig.defaultLayersAll;
          }else {
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
            for (var i = 0; i < Config[configKey].breakCount; i++) {
              var item = symbols[i];
              var row;
              if (item) {
                var low = i < 1 ? breaks[i] : breaks[i] + 1;
                row = "<tr><td class='legend-swatch' style='background-color: rgb(" + item.color.r +
                    "," + item.color.g + "," + item.color.b + ");'" + "></td>";
                row += "<td class='legend-label'>" + low + " - " + breaks[i + 1] + "</td></tr>";
                rows.push(row);
              }
            }
            rows.reverse().forEach(function (row) {
                html += row;
            });
            html += "</table>";
            dom.byId(boundaryConfig.legendId).innerHTML = html;
          }

          function buildRegionsTables() {
            var tableResults = configKey === 'adminBoundary' ? Config.query_results['adminQuery'] : Config.query_results['subDistrictQuery'];
            var firstTenTableResults = tableResults.slice(0, 10);
            var tableColorBreakPoints = Config[relatedTableId];

            if (configKey === "adminBoundary") {
              $('#district-fires-table tbody').html(buildDistrictSubDistrictTables(firstTenTableResults, 'district-fires-table', tableColorBreakPoints));
            } else {
              $('#subdistrict-fires-table tbody').html(buildDistrictSubDistrictTables(firstTenTableResults, 'subdistrict-fires-table', tableColorBreakPoints));
            }

            function buildDistrictSubDistrictTables(sortCombinedResults, queryConfigTableId, tableColorBreakPoints) {
              var aoitype = window.reportOptions.aoitype === 'GLOBAL' ? 'global' : 'island';
              var tableRows;

              if (queryConfigTableId === 'district-fires-table') {
                tableRows =
                  '<tr><th class="admin-type-1">' + (Config.reportOptions.countryAdminTypes ? Config.reportOptions.countryAdminTypes.ENGTYPE_1 : 'Jurisdiction') + '</th>' +
                  '<th class="number-column">#</th>' +
                  '<th class="switch-color-column"></th></tr>';
              } else {
                tableRows =
                  '<tr><th class="admin-type-2">' + (Config.reportOptions.countryAdminTypes ? Config.reportOptions.countryAdminTypes.ENGTYPE_2 : 'Regency/City') + '</th>' +
                  ('<th class="align-left admin-type-1">' + (Config.reportOptions.countryAdminTypes ? Config.reportOptions.countryAdminTypes.ENGTYPE_1 : 'Province') + '</th>') +
                  '<th class="number-column">#</th>' +
                  '<th class="switch-color-column"></th></tr>';
              }

              tableRows += sortCombinedResults.map(function (feature) {
                var colorValue = feature.attributes.fire_count;
                var admin1 = feature.attributes.NAME_1 ? feature.attributes.NAME_1 : feature.attributes.DISTRICT;
                var subDistrict1 = feature.attributes.NAME_1 ? feature.attributes.NAME_1 : feature.attributes.ISLAND;
                var subDistrict2 = feature.attributes.NAME_2 ? feature.attributes.NAME_2 : feature.attributes.SUBDISTRIC;
                var color;

                if (tableColorBreakPoints) {
                  tableColorBreakPoints.forEach(function (binItem, colorIndex) {
                    if (colorValue > tableColorBreakPoints[colorIndex] && colorValue <= tableColorBreakPoints[colorIndex + 1]){
                      color = Config.colorramp[colorIndex];
                    }
                  });
                }

                if (queryConfigTableId === 'district-fires-table') {
                  return(
                    "<tr><td class=\"table-cell " + aoitype + "\">" + admin1 + "</td>" +
                    ("<td class='table-cell table-cell__value'>" + colorValue + "</td>") +
                    ("<td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(" + (color ? color.toString() : Config.colorramp[0]) + ")'></span></td></tr>")
                  )
                } else {
                  return(
                    "<tr><td class=\"table-cell " + aoitype + "\">" + subDistrict2 + "</td>" +
                    ("<td class=\"table-cell " + aoitype + "\">" + subDistrict1 + "</td>") +
                    ("<td class='table-cell table-cell__value'>" + colorValue + "</td>") +
                    ("<td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(" + (color ? color.toString() : Config.colorramp[0]) + ")'></span></td></tr>")
                  )
                }
              });
              return tableRows;
            }
          };

          function generateRenderer() {
            buildLegend();
            buildRegionsTables();
            ldos = new LayerDrawingOptions();
            ldos.renderer = renderer;
            var layerdefs = [];
            var aois = window.reportOptions.aois;

            if (window.reportOptions.aoitype === 'ISLAND') {
              options[boundaryConfig.layerId] = ldos;
              layerdefs[boundaryConfig.layerId] = uniqueValueField + " in ('" + dist_names.join("','") + "')";
            } else if (window.reportOptions.aoitype === 'ALL') {
              options[boundaryConfig.layerIdAll] = ldos;
              layerdefs[boundaryConfig.layerIdAll] = boundaryConfig.UniqueValueFieldAllEnglish + " in ('" + dist_names.join("','") + "')";
            } else if (configKey === "subdistrictBoundary"){
              dist_names = dist_names.map(function (aoisItem) {
                var fixingApostrophe = aoisItem.replace(/'/g, "");
                return fixingApostrophe;
              });
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

          return deferred.promise;
        }, //END

        getRegion: function(configKey) {
          var queryConfig = Config[configKey],
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
            queryTask = new QueryTask(Config.queryUrl + "/" + queryConfig.layerId);
          } else if (window.reportOptions.aoitype === 'ALL') {
            regionField = 'NAME_0';
            uniqueValueField = queryConfig.UniqueValueFieldAll;
            queryTask = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer/4');
            query.returnDistinctValues = true;
          } else {
            regionField = 'NAME_0';
            uniqueValueField = queryConfig.UniqueValueFieldGlobal;
            queryTask = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer/4');
          }

          query.where = self.get_aoi_definition('REGION') === '' ? '1=1' : self.get_aoi_definition('REGION');
          query.returnGeometry = false;
          query.outFields = [regionField, uniqueValueField];
          

          queryTask.execute(query, function(res) {
            if (res.features.length > 0) {
              arrayUtils.forEach(res.features, function (feat) {
                regions[feat.attributes[uniqueValueField]] = feat.attributes[regionField];
              });
              Config.regionmap[configKey] = regions;
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

            var aoiType = reportOptions.aoitype.toLowerCase();

            for (var key in reportOptions.dates) {
              if (parseInt(reportOptions.dates[key]) < 10) {
                reportOptions.dates[key] = '0' + reportOptions.dates[key];
              }
            }

            var aoiString = reportOptions.aois.toString();

            var startDates = reportOptions.dates.fYear + reportOptions.dates.fMonth + reportOptions.dates.fDay;
            var endDates = reportOptions.dates.tYear + reportOptions.dates.tMonth + reportOptions.dates.tDay;

            var baseUrl = 'https://b10fk4n1u3.execute-api.us-east-1.amazonaws.com/stage/firms/';

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

            var finaltable = (filtered.length > 0) ? table : '<div class="noFiresTable">' + Config.noFeatures['greenpeace'] + '</div>';
            return finaltable;
        },

      getFireCounts: function (selectedCountry) {

        const deferred = new Deferred();

        request.get(Config.pieChartDataEndpoint + 'admin/global?aggregate_values=True&aggregate_by=month', {
          handleAs: 'json'
        }).then((response) => {
          let series = [];
          let seriesTemp = { data: [], name: '' };
          let index = 0;
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          let indexColor = 0;
          const colorStep = 15;
          const baseColor = '#777777';
          var dataLabelsFormat = {
            enabled: true,
            align: 'left',
            x: 0,
            verticalAlign: 'middle',
            overflow: true,
            crop: false,
            format: '{series.name}'
          };
          const values = response.data.attributes.value;

          function shadeColor(color, percent) {
            var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
            return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
          }

          const reducer = (accumulator, currentValue) => accumulator + currentValue;

          const dataLabelsFormatAction = function (yearObject, hexColor) {
            if (yearObject.data.length !== 12) {
              var yearObjectKeepValuesUpToCurrentMonth = yearObject.data.splice(currentMonth + 1, 12);
            }
            var twelveMonthsData = yearObject['data'];
            var lastMonthData = twelveMonthsData.pop();
            yearObject['data'] = [].concat(twelveMonthsData, [{
              dataLabels: dataLabelsFormat,
              y: lastMonthData
            }]);

            yearObject['color'] = hexColor;
          }

          values.forEach((value, i) => {
            if (i % 12 === 0 && i !== 0) {
              seriesTemp.name = value.year;

              var hexColor = shadeColor(baseColor, (indexColor / 100));
              indexColor = indexColor + colorStep;
              dataLabelsFormatAction(seriesTemp, hexColor);

              series.push(seriesTemp);
              seriesTemp = { data: [], name: '' };
              seriesTemp.data.push(value.alerts);
              index++;
            } else {
              // array1.reduce(reducer) ///////////
              seriesTemp.data.push(value.alerts);
            }

          });

          window['firesCountRegionSeries'] = series;
          window['firesCountRegionCurrentYear'] = currentYear;
          // window['firesCountRegionCurrentYearSum'] = console.log();
          debugger;

          var firesCountChart = Highcharts.chart('firesCountChart', {
            title: {
              text: ''
            },
            xAxis: {
              labels: {
                style: {
                  color: '#000',
                  fontSize: '16px',
                  fontFamily: "'Fira Sans', Georgia, serif"
                }
              }
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
            exporting:{
              scale: 4,
              chartOptions:{
                chart:{
                  marginTop: 75,
                  marginRight: 20,
                  events:{
                    load:function(){
                      this.renderer.rect(0, 0, this.chartWidth, 35).attr({
                        fill: '#555'
                      }).add();
                      this.renderer.image('https://fires.globalforestwatch.org/images/gfwFires-logo-new.png', 10, 10, 38, 38).add();
                      this.renderer.text(`<span style="color: white; font-weight: 300; font-size: 1.2rem; font-family: 'Fira Sans', Georgia, serif;">Fire Report for ${ self.currentCountry }</span>`, 55, 28, true).add();
                      // this.renderer.text(`<span style="color: black; font-size: 0.8em; -webkit-font-smoothing: antialiased; font-family: 'Fira Sans', Georgia, serif;">${ title }</span>`, 55, 46, true).add();
                    }
                  }
                }
              }
            },
            tooltip: {
              useHTML: true,
              backgroundColor: '#ffbb07',
              borderWidth: 0,
              formatter: function () {
                return '<p class="firesCountChart__popup"> ' + this.x + ' ' + this.series.name + ': ' + Highcharts.numberFormat(this.y, 0, '.', ',') + '</p>';
              }
            },
            xAxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            series: series
          });

          deferred.resolve(false);

        });


        // TODO URL move this to config
        // var queryTask = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer/2'),
        //   deferred = new Deferred(),
        //   query = new Query(),
        //   series = [],
        //   index = 0,
        //   self = this,
        //   title = '',
        //   yearObject = {
        //     data: [],
        //   };

        // query.where = this.countryObjId ? "ID_0=" + this.countryObjId + ' AND 1=1' : '1=1';
        // query.returnGeometry = false;
        // query.outFields = ['*'];

        // queryTask.execute(query, function (res) {
        //   var currentYear = new Date().getFullYear();
        //   var currentMonth = new Date().getMonth();
        //   var dataLabelsFormat = {
        //     enabled: true,
        //     align: 'left',
        //     x: 0,
        //     verticalAlign: 'middle',
        //     overflow: true,
        //     crop: false,
        //     format: '{series.name}'
        //   };
        //   var allFeatures = res.features;

        //   var indexColor = 0;
        //   var colorStep = 15;
        //   var baseColor = '#777777';
        //   function shadeColor(color, percent) {
        //     var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        //     return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
        //   }

        //   var dataLabelsFormatAction = function (yearObject, hexColor) {
        //     if (yearObject.data.length !== 12) {
        //       var yearObjectKeepValuesUpToCurrentMonth = yearObject.data.splice(currentMonth + 1, 12);
        //     }
        //     var twelveMonthsData = yearObject['data'];
        //     var lastMonthData = twelveMonthsData.pop();
        //     yearObject['data'] = [].concat(twelveMonthsData, [{
        //       dataLabels: dataLabelsFormat,
        //       y: lastMonthData
        //     }]);

        //     yearObject['color'] = hexColor;
        //   };

        //   // Remove current month data
        //   var month = moment().format('MM');
        //   var year = moment().format('YY');
        //   var thisMonth = 'cf_' + year + '_' + month;
        //   if (month !== '01') {
        //     allFeatures["0"].attributes[thisMonth] = null;
        //   }

        //   if (allFeatures.length > 0) {
        //     allFeatures.forEach(function (item) {
        //       var obj = item.attributes;
        //       Object.keys(obj).forEach(function(key) {
        //         if (key.substring(0, 3) === 'cf_' && obj[key] !== null) {
        //           index = index + 1;
        //           var yearFromData = '20' + key.substring(3, 5);
        //           if (currentYear >= yearFromData) {
        //             yearObject['name'] = yearFromData;
        //             yearObject['data'].push(obj[key]);
        //             if(index % 12 === 0){
        //               var hexColor = shadeColor(baseColor, (indexColor / 100));
        //               indexColor = indexColor + colorStep;
        //               dataLabelsFormatAction(yearObject, hexColor);
        //               series.push(yearObject);
        //               yearObject = {
        //                 data: []
        //               };
        //             }
        //           }
        //         }
        //       });

        //       indexColor = 10;
        //       dataLabelsFormatAction(yearObject);
        //       yearObject.color = '#D40000';
        //       series.push(yearObject);

        //       window['firesCountRegionSeries'] = series;
        //       window['firesCountRegionCurrentYear'] = yearObject;

        //       // Adding sum for year to window
        //       window['firesCountRegionCurrentYearSum'] = yearObject.data[yearObject.data.length - 1].y;

        //       // title = window['firesCountRegionCurrentYear'].name + ' MODIS Fire Alerts, Year to Date <span class="total_firecounts">' + window['firesCountRegionCurrentYearSum'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>';

        //       // $('#firesCountTitle').html(title);

        //       var firesCountChart = Highcharts.chart('firesCountChart', {
        //         title: {
        //           text: ''
        //         },
        //         xAxis: {
        //           labels: {
        //             style: {
        //               color: '#000',
        //               fontSize: '16px',
        //               fontFamily: "'Fira Sans', Georgia, serif"
        //             }
        //           }
        //         },
        //         yAxis: {
        //           title: {
        //             text: ''
        //           }
        //         },
        //         plotOptions: {
        //           series: {
        //             color: '#ccc',
        //           },
        //           line: {
        //             marker: {
        //               enabled: false
        //             }
        //           }
        //         },
        //         credits: {
        //           enabled: false
        //         },
        //         exporting:{
        //           scale: 4,
        //           chartOptions:{
        //             chart:{
        //               marginTop: 75,
        //               marginRight: 20,
        //               events:{
        //                 load:function(){
        //                   this.renderer.rect(0, 0, this.chartWidth, 35).attr({
        //                     fill: '#555'
        //                   }).add();
        //                   this.renderer.image('https://fires.globalforestwatch.org/images/gfwFires-logo-new.png', 10, 10, 38, 38).add();
        //                   this.renderer.text(`<span style="color: white; font-weight: 300; font-size: 1.2rem; font-family: 'Fira Sans', Georgia, serif;">Fire Report for ${ self.currentCountry }</span>`, 55, 28, true).add();
        //                   // this.renderer.text(`<span style="color: black; font-size: 0.8em; -webkit-font-smoothing: antialiased; font-family: 'Fira Sans', Georgia, serif;">${ title }</span>`, 55, 46, true).add();
        //                 }
        //               }
        //             }
        //           }
        //         },
        //         tooltip: {
        //           useHTML: true,
        //           backgroundColor: '#ffbb07',
        //           borderWidth: 0,
        //           formatter: function () {
        //             return '<p class="firesCountChart__popup"> ' + this.x + ' ' + this.series.name + ': ' + Highcharts.numberFormat(this.y, 0, '.', ',') + '</p>';
        //           }
        //         },
        //         xAxis: {
        //           categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        //         },
        //         series: series
        //       });

              // This create the clickable legend to the right side of the fire history: fire season progression figure
              // getFireCountsChartAction(firesCountChart, selectedCountry);

        //       function getFireCountsChartAction(firesCountChart, selectedCountry) {
        //         var queryTask,
        //           queryOptions;
        //           deferred = new Deferred(),
        //           query = new Query(),
        //           series = [],
        //           index = 0,
        //           yearObject = {
        //             data: [],
        //           };

        //         if (window.reportOptions.aoitype !== 'GLOBAL') {
        //           queryTask = new QueryTask("https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/12"),
        //           query.where = "1=1";
        //           query.returnGeometry = false;
        //           query.outFields = ['*'];
        //           queryOptions = query;
        //         } else {
        //           // TODO Move URL to config
        //           queryTask = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer/3'),
        //           query.where = 'NAME_0=\'' + selectedCountry + '\'';
        //           query.returnGeometry = false;
        //           query.outFields = ['*'];
        //           queryOptions = query;
        //         }

        //         queryTask.execute(queryOptions, function (respons) {
        //           var islandOrRegionFeatures = respons.features;

        //           // Create list of regions
        //           $('#firesCountIslandsListContainer h3').html("<p class=\"fires-count__label\">Region:</p> <strong> " + selectedCountry + " </strong>");
        //           window.reportOptions['aois'].forEach(function (item) {
        //             $('#firesCountIslandsList').append("<li>" + item.split("''").join("'") + "</li>");
        //           });

        //           $('#firesCountIslandsListContainer h3').click(function () {
        //             $(this).addClass('selected');
        //             $('#firesCountTitle').html(window['firesCountRegionCurrentYear'] + ' MODIS Fire Alerts, Year to Date <span class="total_firecounts">' + window['firesCountRegionCurrentYearSum'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>');
        //             $('#firesCountIslandsList li').removeClass('selected');

        //             if (firesCountChart.series) {
        //               firesCountChart.update({
        //                 series: window.firesCountRegionSeries
        //               });
        //             } else {
        //               firesCountChart.addSeries(window.firesCountRegionSeries);
        //             }
        //           });

        //           $('#firesCountIslandsList li').click(function () {
        //             $('#firesCountIslandsListContainer h3').removeClass('selected');
        //             $('#firesCountIslandsList li').removeClass('selected');
        //             $(this).addClass('selected');
        //             var selectedIslandOrRegion = $(this).text(),
        //               index = 0,
        //               series = [],
        //               yearObject = {
        //                 data: [],
        //               };
        //             // Get the current year + month attribute
        //             var month = moment().format('MM');
        //             var year = moment().format('YY');
        //             var thisMonth = 'cf_' + year + '_' + month;
        //             islandOrRegionFeatures.forEach(function (item) {
        //               // Set the current month to null - we only want the last completed month

        //               if (month !== '01') {
        //                 item.attributes[thisMonth] = null;
        //               }
        //               if (item.attributes.ISLAND === selectedIslandOrRegion || item.attributes.NAME_1 === selectedIslandOrRegion) {
        //                 var obj = item.attributes;
        //                 Object.keys(obj).forEach(function(key) {
        //                   if (key.substring(0, 3) === 'cf_' && obj[key] !== null) {
        //                     index = index + 1;
        //                     yearObject['name'] = '20' + key.substring(3, 5);
        //                     yearObject['data'].push(obj[key]);
        //                     if(index % 12 === 0){

        //                       var hexColor = shadeColor(baseColor, (indexColor / 100));
        //                       indexColor = indexColor + colorStep;
        //                       dataLabelsFormatAction(yearObject, hexColor);
        //                       series.push(yearObject);
        //                       yearObject = {
        //                         data: [],
        //                       };
        //                     }
        //                   }
        //                 });

        //                 indexColor = 10;
        //                 dataLabelsFormatAction(yearObject);
        //                 yearObject.color = '#D40000';
        //                 series.push(yearObject);

        //                 window['firesCountCurrentIslandYearSum'] = yearObject.data[yearObject.data.length - 1].y;
        //                 $('#firesCountTitle').html(window['firesCountRegionCurrentYear'].name + ' MODIS Fire Alerts, Year to Date <span class="total_firecounts">' + window['firesCountCurrentIslandYearSum'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>');
        //                 firesCountChart.update({
        //                   series: series
        //                 });
        //               }

        //             });
        //           });
        //         }, function (err) {
        //           deferred.resolve(false);
        //         });

        //         return deferred.promise;
        //       }
        //     })
        //   }
        // }, function (err) {
        //   deferred.resolve(false);
        // });

        return deferred.promise;
      },

      getFireHistoryCounts: function() {

        const queryFor = this.currentISO ? this.currentISO : 'global';
        const numberOfBins = Config.colorRampFireHistory.length
        let data = [];
        const deferred = new Deferred();

        request.get(Config.pieChartDataEndpoint + 'admin/' + queryFor + '?aggregate_values=True&aggregate_by=year&fire_type=modis', {
          handleAs: 'json'
        }).then((response) => {
          
          let min, max;
          for (var i = 0; i < response.data.attributes.value.length; i++) {
            const { year: x, alerts: z } = response.data.attributes.value[i];
            data.push({ x, z, y: 0 });
            if (!min && !max) min = max = z;

            if (z < min) min = z;
            if (z > max) max = z;

            let binsArray = [min];

            Config.colorRampFireHistory.forEach(function (item, index) {
              binsArray.push(parseInt(((max - min) / numberOfBins) * (index + 1)) + min);
            });

            data.forEach(function (item) {
              const dataValue = item.z;
              binsArray.forEach(function (binItem, index) {
                if (dataValue >= binsArray[index] && dataValue <= binsArray[index + 1]) {
                  var color = Config.colorRampFireHistory[index];
                  item.color = color;
                }
              });
            });
          }

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

            xAxis: {
              labels: {
                style: {
                  color: '#000',
                  fontSize: '16px',
                  fontFamily: "'Fira Sans', Georgia, serif"
                }
              }
            },

            yAxis: {
              visible: false
            },

            plotOptions: {
              bubble:{
                minSize:'30%',
                maxSize:'60%'
              }
            },

            exporting:{
              scale: 4,
              chartOptions:{
                chart:{
                  events:{
                    load:function(){
                      this.renderer.rect(0, 0, this.chartWidth, 35).attr({
                        fill: '#555'
                      }).add();
                      this.renderer.image('https://fires.globalforestwatch.org/images/gfwFires-logo-new.png', 10, 10, 38, 38).add();
                      this.renderer.text(`<span style="color: white; font-weight: 300; font-size: 1.2rem; font-family: 'Fira Sans', Georgia, serif;">Fire Report for ${ self.currentCountry }</span>`, 55, 28, true).add();
                      this.renderer.text(`<span style="color: black; font-size: 0.8em; -webkit-font-smoothing: antialiased; font-family: 'Fira Sans', Georgia, serif;">Total MODIS fire alerts</span>`, 55, 46, true).add();
                    }
                  }
                }
              }
            },

            tooltip: {
              useHTML: true,
              backgroundColor: '#ffbb07',
              borderWidth: 0,
              formatter: function () {
                return (
                  '<div class="history-chart-tooltip__container">' +
                  '<h3 class="history-chart-tooltip__content">' + Highcharts.numberFormat(this.point.z, 0, '.', ',') + '<span class="firesCountChart__text"> Fires</span></h3>' +
                  '<p class="firesCountChart__popup">' + this.point.x + '</p>' +
                  '</div>'
                )
              }
            },

            series: [{
              data: data,
              marker: {
                fillOpacity: .85
              },
            }]
          });
          deferred.resolve(false);
        });
        return deferred.promise;
      },
      queryFireCount: function(configKey) {
          var deferred = new Deferred(),
            self = this,
            queryConfig = Config[configKey];

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

        queryDistrictsFireCount: function(configKey, areaOfInterestType, districtLayerId) {
          var queryConfig = Config[configKey],
              deferred = new Deferred(),
              query = new Query(),
              statdef = new StatisticDefinition(),
              queryTask,
              fields,
              self = this;

          // Global Report
          if (areaOfInterestType === 'GLOBAL') {
            // Assign correct query url
            var url;
            if (districtLayerId === 8) {
              url = Config.firesLayer.global_viirs;
            }
            if (districtLayerId === 9) {
              url = Config.firesLayer.global_modis;
            }
            queryTask = new QueryTask(url);
            // NAME_1 - STATES/PROVINCES
            // NAME_2 - DISTRICTS
            fields = [Config[configKey].fire_stats_global.onField, window.reportOptions.aoitype, Config[configKey].fire_stats_global.outField];
            query.outFields = [Config[configKey].fire_stats_global.onField];
            statdef.onStatisticField = Config[configKey].fire_stats_global.onField;
            statdef.outStatisticFieldName = Config[configKey].fire_stats_global.outField;
          } else if (areaOfInterestType === 'ALL') {
            // Assign correct query url
            var url;
            if (districtLayerId === 8) {
              url = Config.firesLayer.global_viirs;
            }
            if (districtLayerId === 9) {
              url = Config.firesLayer.global_modis;
            }
            queryTask = new QueryTask(url);
            // NAME_ENGLISH - COUNTRIES
            // NAME_1 - STATES/PROVINCES
            fields = [Config[configKey].fire_stats_all.onField, window.reportOptions.aoitype, Config[configKey].fire_stats_all.outField];
            query.outFields = [Config[configKey].fire_stats_all.onField];
            statdef.onStatisticField = Config[configKey].fire_stats_all.onField;
            statdef.outStatisticFieldName = Config[configKey].fire_stats_all.outField;
          } else { // Indonesia Report
            queryTask = new QueryTask(Config.queryUrl + "/" + districtLayerId);
            fields = [queryConfig.fire_stats.onField, window.reportOptions.aoitype, queryConfig.fire_stats.outField];
            query.outFields = [queryConfig.fire_stats.onField];
            statdef.onStatisticField = queryConfig.fire_stats.onField;
            statdef.outStatisticFieldName = queryConfig.fire_stats.outField;
          }

            query.where = self.get_layer_definition(configKey);
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
                var finaltable = (filtered.length > 0) ? table : '<div class="noFiresTable">' + Config.noFeatures[configKey] + '</div>';

                return finaltable;
            }

            function buildTable(features) {
                var aoiType = window.reportOptions.aoitype
                var table;
                var districtFireTable = queryConfig.headerField.length >= 1 && queryConfig.tableId === 'district-fires-table';
                var subdistrictFireTable = queryConfig.headerField.length >= 1 && queryConfig.tableId === 'subdistrict-fires-table';
                var districtLabel = Config.reportOptions.countryAdminTypes && Config.reportOptions.countryAdminTypes.hasOwnProperty('ENGTYPE_1') && Config.reportOptions.countryAdminTypes.ENGTYPE_1 !== null ? Config.reportOptions.countryAdminTypes.ENGTYPE_1 : 'Jurisdiction';
                var subdistrictLabel = Config.reportOptions.countryAdminTypes && Config.reportOptions.countryAdminTypes.hasOwnProperty('ENGTYPE_1') && Config.reportOptions.countryAdminTypes.ENGTYPE_1 !== null ? Config.reportOptions.countryAdminTypes.ENGTYPE_1 : 'Province';
                if (districtFireTable) {
                  table = '<table class="fires-table"><tr><th class="admin-type-1">' + districtLabel + '</th>';
                } else if (subdistrictFireTable) {
                  table = '<table class="fires-table"><tr><th class="admin-type-2">' + (Config.reportOptions.countryAdminTypes ? Config.reportOptions.countryAdminTypes.ENGTYPE_2 : 'Regency/City') + '</th>';
                  table += '<th class="align-left admin-type-1">' + subdistrictLabel + '</th>';
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
                    concessionTable = "<table class='concession-fires-counts__table'><thead><tr><th class='consession__name'>Name</th><th class='consession__type'>Type</th><th class='consession__number'>#</th><th class='consession__bar'></th></tr></thead>";
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

                    if (concessionsFinalArray.length > 0) {
                      concessionsFinalArray = concessionsFinalArray.reverse();
                      var maxValue = concessionsFinalArray[0].attributes.fire_count;
                    }

                    concessionsFinalArray.forEach(function (item) {
                      var barSize = ((100 / maxValue) * item.attributes.fire_count).toString() + '%';
                      var concessionType = item.type;
                      if(concessionType === "Wood"){
                        concessionType = concessionType.replace(/Wood/gi, 'Wood fiber');
                      }
                      concessionTable += "<tr><td class='concession__name'>" + item.name + "</td><td class='concession__type'>" + concessionType + "</td><td class='concession__count'>" + item.attributes.fire_count + "</td><td class='table-cell-bar__container'><span class='table-cell-bar__item' style='width: " + barSize + "'></span></td></tr>";
                    });

                    concessionTable += "</table>";
                    dom.byId("finalConcessionsTable").innerHTML = (concessionsFinalArray.length > 0) ? concessionTable : '<div class="noFiresTable">no Concession Features</div>';
                  }
                }

                table += self.generateTableRows(filtered, fields, queryConfig.tableId);

                table += "</table>";
                var finaltable = (filtered.length > 0) ? table : '<div class="noFiresTable">' + Config.noFeatures[configKey] + '</div>';
                return finaltable;
            }

            if (configKey === "subDistrictQuery" && areaOfInterestType === "GLOBAL") {
              query.groupByFieldsForStatistics.push("NAME_1");
            } else if(configKey === 'subDistrictQuery' && areaOfInterestType === 'ALL') {
              query.groupByFieldsForStatistics.push("NAME_ENGLISH");
            } else if (configKey === "subDistrictQuery" && areaOfInterestType !== "GLOBAL" && areaOfInterestType !== 'ALL'){
              query.groupByFieldsForStatistics.push("ISLAND");
            }

            queryTask.execute(query, function(res) {
              if (Config.query_results[configKey] !== undefined) {
                var queryResultFirst = Config.query_results[configKey].slice(0); // Deep clone of first object
                var queryResultSecond = res.features;
                var queryResultKeys = [];
                var combinedResults = [];
                var adminLevelOneTwoArray = {};
                var keyRegion;

                if (areaOfInterestType === "GLOBAL") {
                  keyRegion = configKey === "adminQuery" ? 'NAME_1' : 'NAME_2';
                } else if (areaOfInterestType === 'ALL') {
                  keyRegion = configKey === 'adminQuery' ? 'NAME_ENGLISH' : 'NAME_1';
                } else {
                  keyRegion = configKey === "adminQuery" ? 'DISTRICT' : 'SUBDISTRIC';
                }

                [queryResultFirst, queryResultSecond].forEach(function (resultItem) {
                  resultItem.forEach(function (item) {
                    queryResultKeys.push(item.attributes[keyRegion]);
                    if (areaOfInterestType === "GLOBAL") {
                      adminLevelOneTwoArray[item.attributes.NAME_2] = item.attributes.NAME_1;
                    } else if (areaOfInterestType === 'ALL') {
                      adminLevelOneTwoArray[item.attributes.NAME_1] = item.attributes.NAME_ENGLISH;
                    } else {
                      adminLevelOneTwoArray[item.attributes.SUBDISTRIC] = item.attributes.ISLAND;
                    }
                  })
                });

                var uniqAreas = _.uniq(queryResultKeys);
                uniqAreas.forEach(function (key) {
                  var fireCount = 0;
                  [queryResultFirst, queryResultSecond].forEach(function (queryResultItem) {
                    queryResultItem.forEach(function (item) {
                      if(item.attributes[keyRegion] === key){
                        fireCount = fireCount + item.attributes.fire_count;
                      }
                    })
                  });

                  if (areaOfInterestType === "GLOBAL") {
                    combinedResults.push(keyRegion === 'NAME_1' ?
                      {attributes: {NAME_1: key, fire_count: fireCount}} :
                      {attributes: {NAME_1: adminLevelOneTwoArray[key], NAME_2: key, fire_count: fireCount}});
                  } else if (areaOfInterestType === "ALL") { 
                    combinedResults.push(keyRegion === 'NAME_ENGLISH' ?
                    {attributes: {NAME_ENGLISH: key, fire_count: fireCount}} :
                    {attributes: {NAME_ENGLISH: adminLevelOneTwoArray[key], NAME_1: key, fire_count: fireCount}});
                  } else if (areaOfInterestType === "ISLAND") {
                    combinedResults.push(keyRegion === 'DISTRICT' ?
                      {attributes: {DISTRICT: key, fire_count: fireCount}} :
                      {attributes: {ISLAND: adminLevelOneTwoArray[key], SUBDISTRIC: key, fire_count: fireCount}});
                  }
                });

                sortCombinedResults = _.sortByOrder(combinedResults, function (element) {
                  return element.attributes.fire_count;
                }, 'desc');

                // Remove in case of nonexistent sub-district
                var sortCombinedResults = $.grep(sortCombinedResults, function(item){
                  return item.attributes.SUBDISTRIC != " ";
                });

                Config.query_results[configKey] = sortCombinedResults;
                if (sortCombinedResults.length > 0) {
                  var queryConfigField;
                  if(window.reportOptions.aoitype === 'ISLAND') {
                    queryConfigField = queryConfig['UniqueValueField'];
                  } else if(window.reportOptions.aoitype === 'ALL') { 
                    queryConfigField = queryConfig['UniqueValueFieldAll'];
                  } else {
                    queryConfigField = queryConfig['UniqueValueFieldGlobal'];
                  } 
                  if (queryConfigField) {
                    self.getRegion(configKey).then(function() {
                      var regmap = Config.regionmap[configKey];
                      arrayUtils.forEach(sortCombinedResults, function(feat) {
                        feat.attributes[window.reportOptions.aoitype] = regmap[feat.attributes[queryConfigField]];
                      });
                      dom.byId(queryConfig.tableId).innerHTML = buildTable(sortCombinedResults.slice(0, 10));
                    });
                  }
                  deferred.resolve(true);

                } else {
                  deferred.resolve(false);
                  dom.byId('noFiresMsg').innerHTML = "No Fire Alerts for this AOI and time frame."
                }
              } else {
                Config.query_results[configKey] = res.features;
                if (configKey == 'rspoQuery') {
                  dom.byId(queryConfig.tableId).innerHTML = buildRSPOTable(res.features);
                } else if (configKey !== "subDistrictQuery") {
                  dom.byId(queryConfig.tableId).innerHTML = buildTable(res.features.slice(0, 10));
                }
              }
            }, function(err) {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        queryDistrictsForFires: function(configKey) { // Remove this code
            var queryConfig = Config[configKey],
                queryTask = new QueryTask(Config.queryUrl + "/" + queryConfig.layerId),
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
                    $('$' + queryConfig.tableId).html(buildTable(res.features.slice(0, 10)));
                    deferred.resolve(true);
                }
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
                    name: "In indicative moratorium areas",
                    visible: true,
                    y: inside
                });
                chartData.push({
                  color: "rgba(216, 212, 212, 1)",
                    name: "Not in indicative moratorium areas",
                    visible: true,
                    y: outside
                });
                self.buildPieChart("moratorium-fires-chart", {
                    data: chartData,
                    name: 'Moratorium fires',
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
                    name: "In protected areas",
                    visible: true,
                    y: protectedarea
                });
                protectedAreaData.push({
                    color: "rgba(216, 212, 212, 1)",
                    name: "Outside protected areas",
                    visible: true,
                    y: unprotected
                });
                self.buildPieChart("protected-areas-fires-chart", {
                    data: protectedAreaData,
                    name: 'Protected area fires',
                    labelDistance: 5,
                    total: total
                });

                // -------------
                // LAND USE AREA
                // -------------
                concessionData.push({
                    color: "rgba(253, 240, 0, 1)",
                    name: "Pulpwood plantations",
                    visible: true,
                    y: pulpwood
                });
                concessionData.push({
                    color: "rgba(255, 218, 0, 1)",
                    name: "Palm oil concessions",
                    visible: true,
                    y: palmoil
                });
                concessionData.push({
                    color: "rgba(255, 188, 0, 1)",
                    name: "Logging concessions",
                    visible: true,
                    y: logging
                });
                concessionData.push({
                    color: "rgba(216, 212, 212, 1)",
                    name: "Outside concessions",
                    visible: true,
                    y: total - (logging + palmoil + pulpwood)
                });
                self.buildPieChart("land-use-fires-chart", {
                    data: concessionData,
                    name: 'Fires in concessions',
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

            if (areaOfInterestType === 'GLOBAL' || areaOfInterestType === 'ALL') {
                queryForFiresCount();
            } else {
              var queryEndpointsIds = ['fire_id_island_viirs', 'fire_id_island_modis'];
              $('.fire-alert-count__year').text('2013');
              queryEndpointsIds.forEach(function (fireCountLayer) {
                queryTask = new QueryTask(queryURL = Config.queryUrl + "/" + Config.firesLayer[fireCountLayer]);
                queryForFiresCount(fireCountLayer);
              });
            }

            function queryForFiresCount(fireCountLayer) {

              const queryFor = self.currentISO ? self.currentISO : 'global';

              // Get total fires count
              request.get(Config.pieChartDataEndpoint + 'admin/' + queryFor + '?period=' + self.startDateRaw + ',' + self.endDateRaw  + '&fire_type=modis', {
                handleAs: 'json'
              }).then((response) => {

                function numberWithCommas(globalFiresTotalCount) {
                  return globalFiresTotalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }

                $("#totalFireAlerts").html(numberWithCommas(response.data.attributes.value[0].alerts));
              });

              // Get total fires count aggregated by day
              request.get(Config.pieChartDataEndpoint + 'admin/' + queryFor + '?aggregate_values=True&aggregate_by=day', {
                handleAs: 'json'
              }).then((response) => {

                const values = response.data.attributes.value;
    
                values.forEach(value => {
                  fireDataLabels.push(moment(value.day).utcOffset('Asia/Jakarta').format("D-MMM-YYYY"));
                  fireData.push(value.alerts);
                });

                $("#totalFiresLabel").show()

                $('#fire-line-chart').highcharts({
                    chart: {
                      zoomType: 'x'
                    },
                    title: {
                      text: null
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
                      // type: 'datetime',
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
                    exporting:{
                      scale: 4,
                      chartOptions:{
                        chart:{
                          marginTop: 60,
                          events:{
                            load:function(){
                              this.renderer.rect(0, 0, this.chartWidth, 35).attr({
                                fill: '#555'
                              }).add();
                              this.renderer.image('https://fires.globalforestwatch.org/images/gfwFires-logo-new.png', 10, 10, 38, 38).add();
                              this.renderer.text(`<span style="color: white; font-weight: 300; font-size: 1.2rem; font-family: 'Fira Sans', Georgia, serif;">Fire Report for ${ self.currentCountry }</span>`, 55, 28, true).add();
                              this.renderer.text(`<span style="color: black; font-size: 0.8em; -webkit-font-smoothing: antialiased; font-family: 'Fira Sans', Georgia, serif;">Fire Alert Count Jan 1, 2012 - Present</span>`, 55, 46, true).add();
                            }
                          }
                        }
                      }
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
    
              });
            }

            deferred.resolve(true);
            return deferred.promise;
        },

        queryFireData: function(config, callback, errback) {
            var queryTask = new QueryTask(Config.queryUrl + "/" + Config.confidenceFireId),
                deferred = new Deferred(),
                query = new Query(),
                time = new Date(),
                self = this,
                dateString;

            // Make Time Relative to Last Week
            time = new Date(time.getFullYear(), time.getMonth(), time.getDate() - 8);

            dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate()) + " " +
                time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
            var layerdef = self.get_layer_definition('queryFireData');
            query.where = (config.where === undefined) ? layerdef : layerdef + " AND " + config.where;

            query.returnGeometry = config.returnGeometry || false;
            query.outFields = config.outFields || ["*"];
            queryTask.execute(query, callback, errback);
        },

        buildPieChart: function(id, config) {
          var self = this;
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
              exporting:{
                scale: 4,
                chartOptions:{
                  chart:{
                    marginTop: 50,
                    // marginRight: 20,
                    events:{
                      load:function(){
                        this.renderer.rect(0, 0, this.chartWidth, 35).attr({
                          fill: '#555'
                        }).add();
                        this.renderer.image('https://fires.globalforestwatch.org/images/gfwFires-logo-new.png', 10, 10, 38, 38).add();
                        this.renderer.text(`<span style="color: white; font-weight: 300; font-size: 1.2rem; font-family: 'Fira Sans', Georgia, serif;">Fire Report for ${ self.currentCountry }</span>`, 55, 28, true).add();
                        this.renderer.text(`<span style="color: black; font-size: 0.8em; -webkit-font-smoothing: antialiased; font-family: 'Fira Sans', Georgia, serif;">${ config.name }</span>`, 56, 46, true).add();
                      }
                    }
                  }
                }
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

        get_extent: function(mapkeysItem) {
            var queryTask,
                deferred = new Deferred(),
                query = new Query(),
                time = new Date(),
                self = this,
                mapkeys;

            mapkeys = [mapkeysItem];
            query.where = self.get_aoi_definition('REGION') === "" ? '1=1' : self.get_aoi_definition('REGION') ;
            query.maxAllowableOffset = 10000;
            query.returnGeometry = true;

            if (window.reportOptions.aoitype === 'ISLAND') {
              query.outFields = ["DISTRICT"];
              queryTask = new QueryTask(Config.queryUrl + "/" + Config.adminQuery.layerId);
            } else {
              query.outFields = ["NAME_1"];
              queryTask = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer/4');
            }
            
            callback = function(results) {
                var extent = graphicsUtils.graphicsExtent(results.features);

                arrayUtils.forEach(mapkeys, function(key) {
                  for (map in Config.maps) {
                    if (extent) {
                      if (query.where.includes("NAME_0 = 'United States'")) {
                        const unitedStatesExtent = new Extent();
                        unitedStatesExtent.xmin = -24322950.66;
                        unitedStatesExtent.ymin = 392274.67;
                        unitedStatesExtent.xmax = -2191679.23;
                        unitedStatesExtent.ymax = 12133002.21;
                        unitedStatesExtent.spatialReference = new SpatialReference({wkid: 102100});
                        Config.maps[map].setExtent(unitedStatesExtent, false);
                      } else {
                        Config.maps[map].setExtent(extent, true);
                      }
                    }
                  }

                })
                deferred.resolve(true);
            }

            errback = function() {
                console.log('Cannot get the extent');
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
                        tableColorRange.forEach(function (binItem, colorIndex) {
                          var color = colorIndex >= 5 ? Config.colorramp[colorIndex - 1] : Config.colorramp[colorIndex];
                          if (window.reportOptions.aoitype === 'ISLAND') {
                            if (colorValue > tableColorRange[colorIndex] && colorValue <= tableColorRange[colorIndex + 1]) {
                              cols += '<td class="table-cell table-cell__value">' + colorValue + '</td><td class="table-color-switch_cell"><span class="table-color-switch" style=\'background-color: rgba(' + (color ? color.toString() : '') + ')\'></span></td>';
                            }
                          } else {
                            if (colorValue >= tableColorRange[colorIndex] && colorValue <= tableColorRange[colorIndex + 1]) {
                              var includes = _.includes(cols, 'table-cell__value');
                              if (!includes) {
                                cols += '<td class="table-cell table-cell__value">' + colorValue + '</td><td class="table-color-switch_cell"><span class="table-color-switch" style=\'background-color: rgba(' + (color ? color.toString() : '') + ')\'></span></td>';
                              }
                            }
                          }
                        })
                      }
                    } else if (queryConfigTableId === 'subdistrict-fires-table' && numberOfElements === index) {
                      var colorValue = feature.attributes[field];
                      var tableColorRange = window[queryConfigTableId + '-colorRange'];

                      if (tableColorRange) {
                        tableColorRange.forEach(function (binItem, index) {
                          if (colorValue >= tableColorRange[index] && colorValue <= tableColorRange[index + 1]) {
                            var color = Config.colorramp[index];
                            var includes = _.includes(cols, 'table-cell__value');
                            if(!includes){
                              cols += "<td class='table-cell table-cell__value'>" + colorValue + "</td><td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(" + color.toString() + ")'></span></td>";
                            }
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
