/* eslint-disable */
define([
    "dojo/dom",
    "dojo/Deferred",
    "dojo/_base/array",
    "dojo/io-query",
    "dojo/request",
    "esri/map",
    "esri/Color",
    "esri/layers/ImageParameters",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/layers/LayerDrawingOptions",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/tasks/StatisticDefinition",
    "esri/graphicsUtils",
    "esri/geometry/Extent",
    "esri/SpatialReference",
    "vendors/geostats/lib/geostats.min",
    "./ReportConfig",
], function(dom, Deferred, arrayUtils, ioQuery, request, Map, Color, ImageParameters, ArcGISDynamicLayer, ClassBreaksRenderer, FeatureLayer,
    SimpleFillSymbol, SimpleLineSymbol, UniqueValueRenderer, LayerDrawingOptions, Query, QueryTask, StatisticDefinition, graphicsUtils, Extent, SpatialReference, geostats, Config) {

      // Global Report Object
      let globalReportObjectForProgressionChart = {};

      // All Subregions for a country objects
      let countryTotalWithAllSubregions = {}; // total per subregion
      let countryTotal = {}; // countryTotal
      // clicking a region pulls the item based on the window.reportOptions

      // 1 Subregion for a country object
      let countryTotalWith1Subregion = {}; // should contain aggregated data for the country for load and on h3 click
      let subregionTotal = {}; // clicking a subregion has its total

      // global fires count object
      let firesCount = 0;
      let newSeriesDataObj = {};
      let historicalDataByRegion = {};
      let specificSubRegionData = {};
      let specificCountryData = {};
      let subregionDataINeed = {};
      let aoiDataSpecificRegion = {};

    return {

      init: function() {
          var self = this;
          self.init_report_options();

          this.getIdOne().then(() => {
            // in getFireCounts, in queryForFiresCount, right before self.createPieChart

            if (window.reportOptions.aois) {
              this.aoilist = window.reportOptions.aois;
              document.querySelector('#aoiList').innerHTML = self.aoilist.replace(/''/g, "'");
            } else if (window.reportOptions.stateObjects) {
              document.querySelector('#aoiList').innerHTML = window.reportOptions.stateObjects.map(adm1 => {
                return adm1.name_1;
              }).join(', ');
            }


            var areaOfInterestType = window.reportOptions['aoitype'];

            var selectedCountry = window.reportOptions['country'] ? window.reportOptions['country'] : 'Indonesia';
            // Getting basic administrative area info
            if (areaOfInterestType !== 'ALL') {
              self.getCountryAdminTypes(selectedCountry);
            }

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

            var subDistrictViirsLayerId;
            var subDistrictModisLayerId;

            if (areaOfInterestType === 'GLOBAL') {
              districtViirsLayerId = Config.adminQuery.fire_stats_global.id_viirs;
              districtModisLayerId = Config.adminQuery.fire_stats_global.id_modis;
              subDistrictViirsLayerId = Config.subDistrictQuery.fire_stats_global.id_viirs;
              subDistrictModisLayerId = Config.subDistrictQuery.fire_stats_global.id_modis;
            } else if (areaOfInterestType === 'ALL') {
              districtViirsLayerId = Config.adminQuery.fire_stats_all.id_viirs;
              districtModisLayerId = Config.adminQuery.fire_stats_all.id_modis;
              subDistrictViirsLayerId = Config.subDistrictQuery.fire_stats_all.id_viirs;
              subDistrictModisLayerId = Config.subDistrictQuery.fire_stats_all.id_modis;
            }
            var subDistrictLayerIdsViirsModis = [subDistrictViirsLayerId, subDistrictModisLayerId];

            // Fire Alert Count Jan 1, 2001 figure
            self.queryForDailyFireData(areaOfInterestType);

            // Create the Distribution of Fire Alerts Map
            self.buildDistributionOfFireAlertsMap().then(function () {
              if (window.reportOptions.aoitype !== 'ALL') self.get_extent('fires');
            });

            // 2nd map logic
            self.querySecondMap(areaOfInterestType, 'adminBoundary');

            // 3rd map logic
            if (areaOfInterestType === 'ALL') {
              subDistrictLayerIdsViirsModis.forEach(function (subDistrictLayerId) {
                self.queryDistrictsFireCount("subDistrictQuery", areaOfInterestType, subDistrictLayerId).then(function (result) {
                  self.buildFireCountMap('subdistrictBoundary', 'subDistrictQuery');
                });
              });
            } else {
              self.querySecondMap(areaOfInterestType, 'subdistrictBoundary');
            }

            if (selectedCountry === 'Indonesia') {
              document.querySelector('#land-use-fires-container').style.display = 'inherit';
              self.queryForSumatraFires(areaOfInterestType);
              self.queryDistrictsFireCount("rspoQuery", null, Config.rspoQuery.fire_stats.id).then(() => {
                self.queryDistrictsFireCount("loggingQuery", null, Config.loggingQuery.fire_stats.id).then(() => {
                  self.queryDistrictsFireCount("palmoilQuery", null, Config.palmoilQuery.fire_stats.id).then(() => {
                    self.queryDistrictsFireCount("pulpwoodQuery", null, Config.pulpwoodQuery.fire_stats.id);
                  })
                });
              });
            }

            // Creates the Fire History: Fire Season Progression graph
            self.getFireCounts();
            
            // Creates the Fire History: Fire Season Progression graph
            self.buildUnusualFireCountsChart();
            // Creates the Annual Fire History graph
            self.getFireHistoryCounts()

            document.querySelector('.report-section__charts-container_countries').style.display = '';
            document.querySelector('#ConcessionRspoContainer').style.display = 'none';

            if (areaOfInterestType !== 'ALL') {
              // Donut charts figures
              const queryFor = self.currentISO ? self.currentISO : 'global';

              let url;

              if (window.reportOptions.aoiId) {
                url = Config.fires_api_endpoint + 'admin/' + queryFor + '/' + window.reportOptions.aoiId + '?period=' + self.startDateRaw + ',' + self.endDateRaw;
              } else {
                url = Config.fires_api_endpoint + 'admin/' + queryFor + '/' + '?period=' + self.startDateRaw + ',' + self.endDateRaw;
              }

              request.get(url, {
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
            }
          });

        },

        getIdOne: function() {

          const deferred = new Deferred();
          const queryTask = new QueryTask(queryURL = `${Config.firesLayer.admin_service}/5`);
          const query = new Query();
          query.returnGeometry = false;

          if (window.reportOptions.aois) {
            query.where = `NAME_1 = '${window.reportOptions.aois}'`;
            query.returnGeometry = false;
            query.outFields = ['id_1'];

            queryTask.execute(query, (response) => {
              if (response.features.length > 0) {
                window.reportOptions.aoiId = response.features[0].attributes.id_1;
                deferred.resolve(true);
              }
            }, (err) => {
              deferred.resolve(false);
            });
          } else if (window.reportOptions.aoitype === 'ALL') {
            deferred.resolve(true);
          } else {
            query.where = `NAME_0 = '${window.reportOptions.country}'`;
            query.outFields = ['id_1', 'name_1'];

            queryTask.execute(query, (response) => {
              if (response.features.length > 0) {
                const stateObjects = response.features.map(feat => {
                  return {
                    id_1: feat.attributes.id_1,
                    name_1: feat.attributes.name_1
                  }
                });
                window.reportOptions.stateObjects = stateObjects;
                deferred.resolve(true);
              }
            }, (err) => {
              deferred.resolve(false);
            });
          }
          return deferred.promise;

        },

        querySecondMap: function(areaOfInterestType, configKey) {
          var deferred = new Deferred(),
              self = this,
              boundaryConfig = Config[configKey],
              options = [],
              keyRegion,
              ldos,
              map,
              uniqueValueField,
              queryUrl;

          if (areaOfInterestType === "GLOBAL") {
            keyRegion = configKey === "adminBoundary" ? 'NAME_1' : 'NAME_2';
            const subregion = window.reportOptions.aoiId ? `/${window.reportOptions.aoiId}` : '';
            queryFor = configKey === "adminBoundary" ? `${this.currentISO}?aggregate_values=True&aggregate_by=adm1&` : `${this.currentISO}${subregion}?aggregate_values=True&aggregate_by=adm2&`;
          } else if (areaOfInterestType === 'ALL') {
            keyRegion = configKey === 'adminBoundary' ? 'NAME_0' : 'NAME_1';
            queryFor = configKey === "adminBoundary" ? 'global?aggregate_values=True&aggregate_by=iso&' : 'global?aggregate_values=True&aggregate_by=adm1&';
          }

          let adminCountUrl = '';

          if (window.reportOptions.aoiId && keyRegion === 'NAME_2') {
            adminCountUrl = Config.fires_api_endpoint + 'admin/' + queryFor + 'period=' + this.startDateRaw + ',' + this.endDateRaw;
          } else {
            adminCountUrl = Config.fires_api_endpoint + 'admin/' + queryFor + 'period=' + this.startDateRaw + ',' + this.endDateRaw;
          }

          request.get(adminCountUrl, {
            handleAs: 'json'
          }).then((response) => {
            //TODO: We have all the values we need here!
            let feat_stats = [];
            let feature_id, dist_names;
            const regency = 'Regency/City';

            let adminLevel;

            if (areaOfInterestType === 'GLOBAL') {
              adminLevel = configKey === 'adminBoundary' ? 'adm1' : 'adm2';
            } else if (areaOfInterestType === 'ALL') {
              adminLevel = configKey === 'adminBoundary' ? 'iso' : 'adm1';
            }

            switch (adminLevel) {
              case 'adm1':
                feature_id = 'id_1';
                admin_text = 'Jurisdiction';
                break;
              case 'adm2':
                feature_id = 'id_2';
                admin_text = 'Province';
                break;
              case 'iso':
                feature_id = 'iso';
                admin_text = 'Country';
                break;
            }

            response.data.attributes.value.forEach((res) => {
              const attributes = { fire_count: res.alerts };
              attributes[feature_id] = res[adminLevel];
              if (adminLevel === 'iso') {
                attributes[keyRegion] = res.iso;
              }
              if (res['adm1']) {
                attributes['adm1'] = res['adm1'];
              }
              if (res['adm2']) {
                attributes['adm2'] = res['adm2'];
              }
              feat_stats.push({ attributes });
            });

            if (!feat_stats || feat_stats.length == 0) {
              return;
            }

            if (window.reportOptions.aoitype === 'GLOBAL' && adminLevel === 'adm1' && window.reportOptions.aoiId) {
              feat_stats = feat_stats.filter(function(item) {
                return item.attributes.adm1 === window.reportOptions.aoiId;
              });
            }

            const arr = feat_stats.map(function(item) {
              return item.attributes['fire_count']
            }).sort(function(a, b) {
              return a - b
            });

            if (window.reportOptions.aoitype === 'ALL') {
              uniqueValueField = boundaryConfig.UniqueValueFieldAlliso;
              queryUrl = Config.firesLayer.admin_service;

              dist_names = feat_stats.map(function(item) {
                if (item.attributes[feature_id] != null && item.attributes[feature_id] !== -9999) {
                  return item.attributes[feature_id];
                }
              }).filter(function(item) {
                if (item != null) {
                  return item;
                }
              });
            } else {
              uniqueValueField = feature_id;
              queryUrl = Config.firesLayer.admin_service;

              dist_names = feat_stats.map(function(item) {
                if (item.attributes[uniqueValueField] != null) {
                  return item.attributes[uniqueValueField];
                }
              }).filter(function(item) {
                if (item != null) {
                  return item;
                }
              });
            }

            var natural_breaks_renderer = function(feat_stats, dist_names, method) {
              let breaks = [0, 10, 50, 100, 250, 5000];

              if (geostats) {
                geostats();
                setSerie(arr);
              }

              if (arr.length <= boundaryConfig.breakCount) {
                boundaryConfig.breakCount = arr.length > 1 ? arr.length - 1 : 1;
              }

              const brkCount = boundaryConfig.breakCount;

              if (getClassJenks) {
                switch (method) {
                  case 'natural':
                    try {
                      breaks = getClassJenks(brkCount);
                    } catch (error) {
                      breaks = arr;
                    }
                    break;
                  case 'equal':
                    breaks = getClassEqInterval(brkCount);
                    break;
                  case 'quantile':
                    breaks = getClassQuantile(brkCount);
                    break;
                  case 'stddev':
                    breaks = getClassStdDeviation(nbClass);
                    break;
                  case 'arithmetic':
                    breaks = getClassArithmeticProgression(nbClass);
                    break;
                  case 'geometric':
                    breaks = getClassGeometricProgression(nbClass);
                    break;
                  default:
                    breaks = getClassJenks(brkCount);
                }
              }

              var sls = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0]), 1);

              const symbols = {};
              for (let i = 0; i < brkCount; i += 1) {
                const symbol = new SimpleFillSymbol();
                const color = Config.colorramp[i];
                symbol.setColor({
                  a: 255,
                  r: color[0],
                  g: color[1],
                  b: color[2]
                });
                symbol.setOutline(sls)
                symbols[i] = symbol;
              }

              const defaultSymbol = new SimpleFillSymbol();
              defaultSymbol.setColor({
                a: 255,
                r: 255,
                g: 255,
                b: 255
              });


              const symbol = new SimpleFillSymbol();
              symbol.setColor(new Color([150, 150, 150, 0.5]));

              const renderer = new ClassBreaksRenderer(symbol, (graphic) => {
                for(var i = 0; i < feat_stats.length; i++) {
                  const attributes = feat_stats[i].attributes;
                  if(attributes[feature_id] === graphic.attributes[feature_id]) {
                    return attributes.fire_count;
                  }
                };
              });

              arrayUtils.forEach(feat_stats, (feat) => {
                const count = feat.attributes['fire_count'];
                let sym;

                for (var i = 0; i < breaks.length; i++) {
                  if (count <= breaks[i + 1]) {
                    sym = symbols[i];
                    break;
                  }
                }

                // Checks for an undefined symbol AND if only 1 natural break,
                // Catches error of single admin unit being unsymbolized
                if (typeof sym === 'undefined' && breaks.length === 1) {
                  const singleSymbol = new SimpleFillSymbol();
                  singleSymbol.setColor({
                    a: 1,
                    r: 253,
                    g: 237,
                    b: 7
                  });
                  sym = singleSymbol;
                }
                renderer.addBreak(breaks[i], breaks[i+1], sym);
              });

              return {
                renderer,
                symbols,
                breaks
              };
            };

            const obj = natural_breaks_renderer(feat_stats, dist_names, 'natural');

            const { renderer, symbols, breaks } = obj;

            const relatedTableId = Config[configKey].relatedTableId + '-colorRange';
            Config[relatedTableId] = breaks;

            const { basemap, zoom, mapcenter, slider } = Config;

            map = new Map(boundaryConfig.mapDiv, {
              center: mapcenter,
              basemap: basemap,
              zoom: zoom,
              slider: slider,
            });

            Config.maps[configKey] = map;

            let layerId;

            switch (feature_id) {
              case 'id_1':
                layerId = 5;
                break;
              case 'id_2':
                layerId = 4;
                break;
              case 'iso':
                layerId = 6;
                break;
            }

            const featureLayer = new FeatureLayer(`${queryUrl}/${layerId}`, {
              mode: FeatureLayer.MODE_SNAPSHOT,
              outFields: ['*'],
              maxAllowableOffset: window.reportOptions.aoitype === 'ALL' ? 10000 : 1000,
              defaultDefinitionExpression: '1 = 2'
            });

            featureLayer.setDefinitionExpression("OBJECTID < 10");


            function buildLegend() {
              let html = '<table>';
              const rows = [];
              for (let i = 0; i < Config[configKey].breakCount; i++) {
                const item = symbols[i];
                let row;

                if (item) {
                  const low = i < 1 ? breaks[i] : breaks[i] + 1;
                  row = `<tr><td class='legend-swatch' style='background-color: rgb( ${item.color.r}, ${item.color.g}, ${item.color.b} );'></td>`;
                  row += `<td class='legend-label'>${low} - ${ breaks[i + 1] }</td></tr>`;
                  rows.push(row);
                }
              }
              rows.reverse().forEach(function (row) {
                  html += row;
              });
              html.concat('</table>');
              dom.byId(boundaryConfig.legendId).innerHTML = html;
            }

            function buildRegionsTables() {
              let tableResults = feat_stats;

              featureLayer.graphics.forEach((graphic) => {
                feat_stats.forEach((feature) => {
                  if (feature.attributes[feature_id] === graphic.attributes[feature_id]) {
                    if (keyRegion === 'NAME_2') {
                      feature.attributes.NAME_1 = graphic.attributes.name_1;
                    }
                    feature.attributes[keyRegion] = graphic.attributes[keyRegion.toLowerCase()];
                  }
                });
              });

              const sortCombinedResults = _.sortByOrder(tableResults, function (element) {
                return element.attributes.fire_count;
              }, 'desc');

              let firstTenTableResults = sortCombinedResults.slice(0, 10);
              const tableColorBreakPoints = Config[relatedTableId];


              if (configKey === "adminBoundary") {
                $('#district-fires-table tbody').html(buildDistrictSubDistrictTables(firstTenTableResults, 'district-fires-table', tableColorBreakPoints));
              } else {
                $('#subdistrict-fires-table tbody').html(buildDistrictSubDistrictTables(firstTenTableResults, 'subdistrict-fires-table', tableColorBreakPoints));
              }

              function buildDistrictSubDistrictTables(sortCombinedResults, queryConfigTableId, tableColorBreakPoints) {
                const aoitype = window.reportOptions.aoitype.toLowerCase();
                let tableRows;

                if (queryConfigTableId === 'district-fires-table') {
                  tableRows =
                    `<tr><th class="admin-type-1">${window.reportOptions.aoitype === 'GLOBAL' ? 'Province' : 'Country'}</th>
                    <th class="number-column">#</th>
                    <th class="switch-color-column"></th></tr>`;
                } else {
                  tableRows =
                    `<tr><th class="admin-type-2">${window.reportOptions.aoitype === 'GLOBAL' ? 'Subregion' : 'Province'}</th>
                    <th class="align-left admin-type-1">${window.reportOptions.aoitype === 'GLOBAL' ? 'Province' : 'Country'}</th>
                    <th class="number-column">#</th>
                    <th class="switch-color-column"></th></tr>`;
                }

                tableRows += sortCombinedResults.map(function (feature) {
                  // const { fire_count, NAME_0, NAME_1, NAME_2, ISLAND, SUBDISTRIC } = feature.attributes;
                  const { fire_count, id_0, id_1, id_2, NAME_0, NAME_1, NAME_2, ISLAND, SUBDISTRIC } = feature.attributes;
                  const colorValue = fire_count;
                  const admin1 = NAME_1 ? NAME_1 : NAME_0;
                  const subDistrict1 = id_1 ? id_1 : ISLAND;
                  const subDistrict2 = id_2 ? id_2 : SUBDISTRIC;
                  let color;

                  if (tableColorBreakPoints) {
                    tableColorBreakPoints.forEach(function (binItem, colorIndex) {
                      if (colorValue > tableColorBreakPoints[colorIndex] && colorValue <= tableColorBreakPoints[colorIndex + 1]){
                        color = Config.colorramp[colorIndex];
                      }
                    });
                  }

                  if (queryConfigTableId === 'district-fires-table') {
                    if(!admin1) return;
                    return(
                      `<tr><td class="table-cell ${aoitype}">${admin1}</td>
                      <td class='table-cell table-cell__value'>${colorValue}</td>")
                      <td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(${ color ? color.toString() : Config.colorramp[0] });'></span></td></tr>`
                    );
                  } else {
                    if((!subDistrict2 && !subDistrict1)) return;
                    return(
                      `<tr><td class="table-cell ${aoitype}">${NAME_2}</td>
                      <td class="table-cell ${aoitype}">${NAME_1}</td>
                      <td class='table-cell table-cell__value'>${colorValue}</td>
                      <td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(${ color ? color.toString() : Config.colorramp[0] });'></span></td></tr>`
                    );
                  }
                });
                return tableRows;
              }
            };

            function generateRenderer() {

              buildLegend();
              ldos = new LayerDrawingOptions();
              ldos.renderer = renderer;
              const layerdefs = [];
              let defExp;
              const aoitype = window.reportOptions.aoitype;

              if (aoitype === 'ISLAND') {
                options[boundaryConfig.layerId] = ldos;
                layerdefs[boundaryConfig.layerId] = uniqueValueField + " in ('" + dist_names.join("','") + "')";
              } else if (aoitype === 'ALL' && configKey === "subdistrictBoundary"){
                options[boundaryConfig.layerIdGlobal] = ldos;
                defExp = feature_id + " in (" + dist_names.join(",") + ") AND iso = '" + currentISO + "'";
              } else if (aoitype === 'ALL') {
                options[boundaryConfig.layerIdAll] = ldos;
                defExp = '1=1';
              } else if (feature_id === 'id_2' || window.reportOptions.aoiId) { // if they chose a country and a subregion from fires ui
                options[boundaryConfig.layerIdGlobal] = ldos;
                defExp = feature_id + " in (" + dist_names.join(",") + ") AND iso = '" + currentISO + "'";
                // defExp = feature_id + " in (" + dist_names.join(",") + ") AND NAME_1 in ('" + window.reportOptions.aois + "') AND iso = '" + currentISO + "'";
              } else { // if only country selected without subregion
                options[boundaryConfig.layerIdGlobal] = ldos;
                const ids = window.reportOptions.stateObjects.map((adm) => {
                  return adm.id_1;
                });
                defExp = feature_id + " in (" + ids.join(",") + ") AND iso = '" + currentISO + "'";
              }


              featureLayer.setDefinitionExpression(defExp);
              featureLayer.setRenderer(renderer);
            }

            const currentISO = this.currentISO;

            featureLayer.on('load', generateRenderer);

            featureLayer.on('update-end', function() {
              buildRegionsTables();
              if (window.reportOptions.aoitype !== 'ALL') self.get_extent('fires');
              deferred.resolve(true);
            });

            map.addLayer(featureLayer);

            map.on("update-start", function() {
                esri.show(dom.byId(boundaryConfig['loaderId']));
            });
            map.on("update-end", function() {
                esri.hide(dom.byId(boundaryConfig['loaderId']));
            });

            return deferred.promise;
          });
        }, // END

        createPieChart: function(firesCount, chartConfig) {
          return new Promise(resolve => {
            const data = [];

            let url;

            if (window.reportOptions.aoiId) {
              url = `${Config.fires_api_endpoint}${chartConfig.type}/${this.currentISO}/${window.reportOptions.aoiId}?period=${this.startDateRaw},${this.endDateRaw}`;
            } else {
              url = `${Config.fires_api_endpoint}${chartConfig.type}/${this.currentISO}?period=${this.startDateRaw},${this.endDateRaw}`;
            }

            request.get(url, {
              handleAs: 'json'
            }).then((res) => {
              const allData = res.data.attributes.value;

              if (allData !== null) {
                document.querySelector('#' + chartConfig.domElement + '-container').style.display = 'inherit';
              } else {
                $('#' + chartConfig.domElement + '-container').remove();
                resolve();
                return;
              }

              const alerts = allData[0].alerts;

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

              this.buildPieChart(chartConfig.domElement, {
                data: data,
                name: chartConfig.name3,
                labelDistance: 5,
                total: firesCount
              });
              resolve();
            });
          });
        },

        getCountryAdminTypes: function () {
          // Get admin type 1 and admin type 2 for country
          let queryTask, queryConfig;
          const aois = window.reportOptions.aois;

          // TODO move this to config
          queryTask = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer/10'),
            deferred = new Deferred(),
            query = new Query();

            query.where = "ID_0 = " + this.countryObjId + " AND Name_1 in ('" + aois + "')";
            query.returnGeometry = false;
            query.outFields = ['ENGTYPE_1, ENGTYPE_2'];
            query.returnDistinctValues = true;
            queryConfig = query;

          queryTask.execute(queryConfig, (response) => {
            if (response.features.length > 0) {
              const countryAdminTypes = response.features["0"].attributes;
              $('.admin-type-1').text(countryAdminTypes.ENGTYPE_1);
              $('.admin-type-2').text(countryAdminTypes.ENGTYPE_2);
              Config.reportOptions.countryAdminTypes = countryAdminTypes;
            }
          }, (err) => {
            console.error('Country Admin Types error: ', err);
            deferred.resolve(false);
          });

          return deferred.promise;
        },

        init_report_options: function() {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            const self = this;

            const fullURI = window.location.href;
            const fullURIArray = fullURI.split("#");
            const baseURI = fullURIArray[0];
            const hashString = encodeURIComponent('#' + fullURIArray[1]);
            const longURIParsed = baseURI + hashString;

            $.getJSON("https://api-ssl.bit.ly/v3/shorten?login=gfwfires&apiKey=R_d64306e31d1c4ae489441b715ced7848&longUrl=" + longURIParsed, function (response) {
              let bitlyShortLink = response.data.url;
              if (bitlyShortLink && bitlyShortLink[4] !== 's') {
                bitlyShortLink = bitlyShortLink.slice(0,4) + 's' + bitlyShortLink.slice(4);
              }
              $('.share-link')
              .on('click', function () {
                document.querySelector('.share-link-input__container').classList.toggle("hidden");
                $('.share-link-input').val(bitlyShortLink);
              });
            });

            self.read_hash();

            const { aoitype, dataSource, country, aois, dates} = window.reportOptions;
            const { fYear, tYear, fDay, tDay, tMonth, fMonth } = dates;

            this.startdate = self.date_obj_to_string({
              year: fYear,
              month: monthNames[fMonth - 1].substring(0,3),
              day: fDay
            });

            this.enddate = self.date_obj_to_string({
              year: tYear,
              month: monthNames[tMonth - 1].substring(0,3),
              day: tDay
            });

            const startMonth = parseInt(fMonth) < 10 ? '0' + fMonth : fMonth;
            const endMonth = parseInt(tMonth) < 10 ? '0' + tMonth : tMonth;
            const startDay = parseInt(fDay) < 10 ? '0' + fDay : fDay;
            const endDay = parseInt(tDay) < 10 ? '0' + tDay : tDay;

            this.startDateRaw = fYear + '-' + startMonth + '-' + startDay;
            this.endDateRaw = tYear + '-' + endMonth + '-' + endDay;

            this.aoitype = aoitype;
            this.dataSource = dataSource;
            this.currentCountry = country;
            this.countryObjId = Config.countryObjId[this.currentCountry];

            if (this.currentCountry && this.currentCountry !== 'ALL') {
              this.currentISO = Config.countryFeatures[Config.countryFeatures.findIndex(function(feature) { return feature.gcr ? feature.gcr === self.currentCountry : feature['English short name'] === self.currentCountry })]['Alpha-3 code'];
            }

            $('.fromDate').text(' ' + self.startdate);
            $('.toDate').text(' - ' + self.enddate);
            $('.interaction-type').text(document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in');

            window['concessionFiresCounts'] = [];
        },

        read_hash: function() {
            let _initialState;
            const url = window.location.href;

            const hasHash = (url.split("#").length == 2 && url.split("#")[1].length > 1);

            if (hasHash) {
                _initialState = ioQuery.queryToObject(url.split("#")[1]);
            } else {
                // _initialState = ReportConfig.defaultState;
                _initialState = {};
            }

            const dateObj = {};
            _initialState.dates.split('!').map(function(date) {
                const datearr = date.split('-');
                dateObj[datearr[0]] = datearr[1];
            })

            if (_initialState.aoitype === 'PROVINCE') {
              _initialState.aoitype = 'GLOBAL';
              _initialState.reporttype = 'globalcountryreport';
              _initialState.country = 'Indonesia';
              delete (_initialState.dataSource);
            }

            window.reportOptions = {
                aoitype: _initialState.aoitype
            }

            if (_initialState.aoitype === "ISLAND") {
              window.reportOptions.country = 'Indonesia';
            } else if (_initialState.aoitype === "ALL") {
              window.reportOptions.country = 'ALL';
            } else {
              window.reportOptions.country = _initialState.country;
            }

            if (_initialState.aois) {
              window.reportOptions.aois = _initialState.aois.replace(/'/g, "''");
            }

            window.reportOptions.dates = dateObj;
            window.reportOptions.type = _initialState.aoitype;
            window.reportOptions.dataSource = _initialState.dataSource;
        },

        date_obj_to_string: function(dateobj) {
          let dtstr = '';
          dtstr += dateobj.day + ' ';
          dtstr += dateobj.month + ' ';
          dtstr += dateobj.year;
          return dtstr;
        },

        get_global_layer_definition: function () {
          let countryQueryGlobal;
          let aoiQueryGlobal;
          let adm1Names;

          if (window.reportOptions.aois) {
            adm1Names = window.reportOptions.aois;
          } else {
            adm1Names = window.reportOptions.stateObjects.map(adm1 => {
              return adm1.name_1;
            }).join("','");
          }

          countryQueryGlobal = "ID_0 = " + this.countryObjId;
          aoiQueryGlobal = "NAME_1 in ('" + adm1Names + "')";
          aoi = [countryQueryGlobal, aoiQueryGlobal].join(' AND ');

          // NEW - manipulate date here
          // ex. 24 Oct 2017
          const momentStart = moment(this.startdate, 'D MMM YYYY');
          const momentEnd = moment(this.enddate, 'D MMM YYYY');
          const startDateQuery = `Date > date'${momentStart.format('YYYY-MM-DD HH:mm:ss')}'`;
          const endDateQuery = `Date < date'${momentEnd.format('YYYY-MM-DD HH:mm:ss')}'`;

          const sql = [startDateQuery, endDateQuery, aoi].join(' AND ');
          return sql;
        },

        get_all_layer_definition: function() {
          const momentStart = moment(this.startdate, 'D MMM YYYY');
          const momentEnd = moment(this.enddate, 'D MMM YYYY');
          const startDateQuery = `Date > date'${momentStart.format('YYYY-MM-DD HH:mm:ss')}'`;
          const endDateQuery = `Date < date'${momentEnd.format('YYYY-MM-DD HH:mm:ss')}'`;
          const sql = [startDateQuery, endDateQuery].join(' AND ');
          return sql;
        },

        get_layer_definition: function(queryType) {
          const aoiType = window.reportOptions.aoitype;
          const aoiData = window.reportOptions.aois;
          const startdate = "ACQ_DATE >= date'" + this.startdate + "'";
          const enddate = "ACQ_DATE <= date'" + this.enddate + "'";
          let countryQueryGlobal;
          let aoiQueryGlobal;
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
            if (window.reportOptions.stateObjects) {
              aoiQueryGlobal = "PROVINCE in ('" + window.reportOptions.stateObjects.map(adm1 => { return adm1.name_1; }).join("','") + "')";
              aoi = aoiQueryGlobal;
            } else {
              aoi = `PROVINCE in ('${window.reportOptions.aois}')`;
            }
          } else {
            countryQueryGlobal = "ID_0 = " + this.countryObjId;
            aoiQueryGlobal = "NAME_1 in ('" + aoiData + "')";
            aoi = [countryQueryGlobal, aoiQueryGlobal].join(' AND ');
          }

          let sql;
          if (window.reportOptions.aois || window.reportOptions.stateObjects) {
            sql = [startdate, enddate, aoi].join(' AND ');
          } else {
            sql = [startdate, enddate].join(' AND ');
          }
          return sql;
        },

        get_aoi_definition: function(queryType) {
          let aoi;

          if (window.reportOptions.aoitype === 'GLOBAL' && queryType === 'REGION') {
            if (window.reportOptions.aois) {
              aoi = "NAME_0 = '" + window.reportOptions.country + "' AND NAME_1 in ('" + window.reportOptions.aois + "')";
            } else {
              aoi = "NAME_0 = '" + window.reportOptions.country + "'";
            }
          } else if (window.reportOptions.aoitype === 'GLOBAL') {
            if (window.reportOptions.aois) {
              aoi = "ID_0 = " + this.countryObjId + " AND NAME_1 in ('" + window.reportOptions.aois + "')";
            } else {
              aoi = "ID_0 = " + this.countryObjId;
            }
          } else if (window.reportOptions.aoitype === 'ALL') {
            aoi = "";
          } else {
            aoi = `${window.reportOptions.aoitype} in (' ${window.reportOptions.aois} ')`;
          }

          return aoi;
        },

        /**
         * Initializes the Distribution of Fire Alerts map (FIRST MAP)
         */
        buildDistributionOfFireAlertsMap: function() {
          const self = this;
          const deferred = new Deferred();
          let queryUrl, map, fireLayer, fireParams;

          const aoitype = window.reportOptions.aoitype;
          const { defaultLayers, urlGlobal, urlIsland, defaultLayersIsland } = Config.firesLayer;

          map = new Map("DistributionOfFireAlertsMap", {
              basemap: Config.basemap,
              zoom: Config.zoom,
              center: Config.mapcenter,
              slider: Config.slider
          });

          map.on("update-start", () => {
            esri.show(dom.byId("firesmapload"));
          });

          map.on("update-end", () => {
            esri.hide(dom.byId("firesmapload"));
          });

          Config.maps['fires'] = map;

          if (aoitype === 'GLOBAL' || aoitype === 'ALL') {
            queryUrl = urlGlobal;
          } else {
            queryUrl = urlIsland
          }

          if (aoitype === 'GLOBAL'){
            addFirePoints(defaultLayers, 'globalFires');
          } else if (aoitype === 'ALL') {
            addFirePoints(defaultLayers, 'allFires');
          }

          function addFirePoints(ids, layerId) {
            const { fire_id_global_modis, fire_id_global_viirs, fire_id_all_viirs, fire_id_all_modis, modis, viirs } = Config.firesLayer;

            const viirsLayerDefs = [];
            const modisLayerDefs = [];
            const layerDefs = [];

            // Need to handle global reports differently than before
            if (aoitype === 'GLOBAL') {
              // Set Image Parameters
              const viirsParams = new ImageParameters();
              viirsParams.format = 'png32';
              viirsParams.layerIds = [fire_id_global_viirs];
              viirsParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;
              viirsLayerDefs[fire_id_global_viirs] = self.get_global_layer_definition();

              const modisParams = new ImageParameters();
              modisParams.format = 'png32';
              modisParams.layerIds = [fire_id_global_modis];
              modisParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;
              modisLayerDefs[fire_id_global_modis] = self.get_global_layer_definition();

              // Create Layer
              const viirsLayer = new ArcGISDynamicLayer(viirs, {
                imageParameters: viirsParams,
                id: 'viirs',
                visible: true
              });
              const modisLayer = new ArcGISDynamicLayer(modis, {
                imageParameters: modisParams,
                id: 'modis',
                visible: true
              });

              // Set layer definitions
              viirsLayer.setLayerDefinitions(viirsLayerDefs);
              modisLayer.setLayerDefinitions(modisLayerDefs);

              // Add layers to map
              map.addLayers([viirsLayer, modisLayer]);
              modisLayer.on('load', () => {
                deferred.resolve(true);
              });
            } else if (aoitype === 'ALL') {
              viirsLayerDefs[fire_id_all_viirs] = self.get_all_layer_definition();
              modisLayerDefs[fire_id_all_modis] = self.get_all_layer_definition();

              var viirsParams = new ImageParameters();
              viirsParams.format = 'png32';
              viirsParams.layerIds = [fire_id_all_viirs];
              viirsParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

              var modisParams = new ImageParameters();
              modisParams.format = 'png32';
              modisParams.layerIds = [fire_id_all_modis];
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
              modisLayer.on('load', () => {
                deferred.resolve(true);
              });
            } else {
              fireParams = new ImageParameters();
              fireParams.format = "png32";
              fireParams.layerIds = [];
              fireParams.layerOption = ImageParameters.LAYER_OPTION_SHOW;

              ids.forEach((id) => {
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
              fireLayer.on('load', () => {
                  deferred.resolve(true);
              });
            }
          }
          return deferred.promise;
        },

        buildFireCountMap: function(configKey, queryKey) {
          var deferred = new Deferred(),
            aoitype = window.reportOptions.aoitype,
            boundaryConfig = Config[configKey],
            options = [],
            otherFiresParams,
            otherFiresLayer,
            renderer,
            ldos,
            map,
            uniqueValueField,
            queryUrl;

          const { viirs, modis, admin_service } = Config.firesLayer;

          const feat_stats = Config.query_results[queryKey];
          if (!feat_stats || feat_stats.length == 0) {
            return;
          }

          const arr = feat_stats.map((item) => {
            return item.attributes['fire_count']
          }).sort((a, b) => {
            return a - b
          });

          if (aoitype === 'ISLAND') {
            queryUrl = boundaryConfig.urlIsland;
            uniqueValueField = boundaryConfig.UniqueValueField;
          } else if (aoitype === 'ALL') {
            uniqueValueField = boundaryConfig.UniqueValueFieldAll;
            if (uniqueValueField === 'NAME_0') {
              queryUrl = admin_service;
            }
            if (uniqueValueField === 'NAME_1') {
              queryUrl = admin_service;
            }
          } else {
            // TODO Move URL to config
            uniqueValueField = boundaryConfig.UniqueValueFieldGlobal;
            if (uniqueValueField === 'NAME_1') {
              queryUrl = viirs;
            }
            if (uniqueValueField === 'NAME_2') {
              queryUrl = modis;
            }
          }

          if (aoitype === 'ALL') {
            var dist_names = feat_stats.map((item) => {
              if (item.attributes[boundaryConfig.UniqueValueFieldAllEnglish] != null) {
                return item.attributes[boundaryConfig.UniqueValueFieldAllEnglish].replace("'", "''");
              }
            }).filter((item) => {
              if (item != null) {
                return item;
              }
            });
          } else {
            var dist_names = feat_stats.map((item) => {
              if (item.attributes[uniqueValueField] != null) {
                return item.attributes[uniqueValueField].replace("'", "''");
              }
            }).filter((item) => {
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
            otherFiresParams.layerIds = boundaryConfig.defaultLayers;
          } else {
            otherFiresParams.layerIds = boundaryConfig.defaultLayersGlobal;
          }

          otherFiresLayer = new ArcGISDynamicLayer(queryUrl, {
            imageParameters: otherFiresParams,
            id: boundaryConfig.id,
            visible: true
          });

          function buildLegend() {
            let html = "<table>";
            let rows = [];

            for (var i = 0; i < Config[configKey].breakCount; i++) {
              var item = symbols[i];
              var row;
              if (item) {
                var low = i < 1 ? breaks[i] : breaks[i] + 1;
                row = `<tr><td class='legend-swatch' style='background-color: rgb(${item.color.r}, ${item.color.g}, ${item.color.b});'></td>`;
                row += `<td class='legend-label'>${low} - ${breaks[i + 1]}</td></tr>`;
                rows.push(row);
              }
            }

            rows.reverse().forEach((row) => {
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
              var aoitype = window.reportOptions.aoitype.toLowerCase();
              var tableRows;

              if (queryConfigTableId === 'district-fires-table') {
                tableRows =
                  '<tr><th class="admin-type-1">' + (Config.reportOptions.countryAdminTypes ? Config.reportOptions.countryAdminTypes.ENGTYPE_1 : 'Jurisdiction') + '</th>' +
                  '<th class="number-column">#</th>' +
                  '<th class="switch-color-column"></th></tr>';
              } else {
                tableRows =
                  '<tr><th class="admin-type-2">Country</th>' +
                  ('<th class="align-left admin-type-1"> Province </th>') +
                  '<th class="number-column">#</th>' +
                  '<th class="switch-color-column"></th></tr>';
              }

              tableRows += sortCombinedResults.map(function (feature) {
                var colorValue = feature.attributes.fire_count;
                var admin1 = feature.attributes.NAME_1 ? feature.attributes.NAME_1 : feature.attributes.DISTRICT;
                var subDistrict1 = feature.attributes.NAME_1 ? feature.attributes.NAME_1 : feature.attributes.ISLAND;
                var adm0 = feature.attributes.NAME_ENGLISH;
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
                    "<tr><td class=\"table-cell " + aoitype + "\">" + adm0 + "</td>" +
                    ("<td class='table-cell table-cell__value'>" + colorValue + "</td>") +
                    ("<td class='table-color-switch_cell'><span class='table-color-switch' style='background-color: rgba(" + (color ? color.toString() : Config.colorramp[0]) + ")'></span></td></tr>")
                  )
                } else {
                  return(
                    "<tr><td class=\"table-cell " + aoitype + "\">" + adm0 + "</td>" +
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
            const layerdefs = [];
            const aois = window.reportOptions.aois;

            if (window.reportOptions.aoitype === 'ISLAND') {
              options[boundaryConfig.layerId] = ldos;
              layerdefs[boundaryConfig.layerId] = uniqueValueField + " in ('" + dist_names.join("','") + "')";
            } else if (window.reportOptions.aoitype === 'ALL') {
              dist_names = dist_names.map(function (aoisItem) {
                var fixingApostrophe = aoisItem.replace(/'/g, "");
                return fixingApostrophe;
              });
              options[boundaryConfig.layerId] = ldos;
              layerdefs[boundaryConfig.layerId] = "NAME_1 in ('" + dist_names.join("','") + "')";
            } else if (configKey === "subdistrictBoundary"){
              dist_names = dist_names.map(function (aoisItem) {
                var fixingApostrophe = aoisItem.replace(/'/g, "");
                return fixingApostrophe;
              });
              options[boundaryConfig.layerIdGlobal] = ldos;
              layerdefs[boundaryConfig.layerIdGlobal] = "NAME_1 in ('" + aois + "') AND " + uniqueValueField + " in ('" + dist_names.join("','") + "')";
            } else {
              options[boundaryConfig.layerIdGlobal] = ldos;
              layerdefs[boundaryConfig.layerIdGlobal] = uniqueValueField + " in ('" + dist_names.join("','") + "')";
            }

            otherFiresLayer.setLayerDefinitions(layerdefs);
            otherFiresLayer.setLayerDrawingOptions(options);

            otherFiresLayer.on('update-end', function() {
              // if (window.reportOptions.aoitype !== 'ALL') self.get_extent('subdistrictBoundary');
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
        shadeColor: function (color, percent) {
          var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
          return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
        },

        dataLabelsFormatAction: function (yearObject, hexColor) {
          var dataLabelsFormat = {
            enabled: true,
            align: 'left',
            x: 0,
            verticalAlign: 'middle',
            overflow: true,
            crop: false,
            format: '{series.name}'
          };

          const currentMonth = new Date().getMonth(); // getMonth() method returns the month (from 0 to 11) for the specified date

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
        },

        getFireCounts: function () {
          const self = this;
          const queryFor = self.currentISO ? self.currentISO : 'global';
          const handleAs = {handleAs: 'json'};
          const promiseUrls = [];

          if (window.reportOptions.aoiId) {
            const urls = [
              `${Config.fires_api_endpoint}admin/${queryFor}?aggregate_values=True&aggregate_time=month&fire_type=modis&period=2001-01-01,${moment().utcOffset('Asia/Jakarta').format("YYYY-MM-DD")}`,
              `${Config.fires_api_endpoint}admin/${queryFor}/${window.reportOptions.aoiId}?aggregate_values=True&aggregate_time=month&fire_type=modis&period=2001-01-01,${moment().utcOffset('Asia/Jakarta').format("YYYY-MM-DD")}`,
            ];
            promiseUrls.push(...urls);
          }  else if(window.reportOptions.country !== 'ALL') {
            const urls = [
              `${Config.fires_api_endpoint}admin/${queryFor}?aggregate_values=True&aggregate_time=month&fire_type=modis&period=2001-01-01,${moment().format("YYYY-MM-DD")}`, // should have total country data
              `${Config.fires_api_endpoint}admin/${queryFor}?aggregate_values=True&aggregate_time=month&aggregate_admin=adm1&fire_type=modis&period=2001-01-01,${moment().utcOffset('Asia/Jakarta').format("YYYY-MM-DD")}` // should have regional data
            ];
            promiseUrls.push(...urls);
          } else {
            const urls = [
              `${Config.fires_api_endpoint}admin/${queryFor}?aggregate_values=True&aggregate_time=month&fire_type=modis&period=2001-01-01,${moment().format("YYYY-MM-DD")}`, // old query is the same as new
            ];
            promiseUrls.push(...urls);
          }

          Promise.all(promiseUrls.map((promiseUrl) => {
            return request.get(promiseUrl, handleAs);
          })).then(responses => {
            let series = [];
            const colors = {};
            let seriesTemp = { data: [], name: '' };
            let index = 0;
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            let indexColor = 0;
            const colorStep = 5;
            const baseColor = '#777777';
            let values;
            const backupValues = [];
            if (window.reportOptions.aoiId && responses.length > 0) {
              values = responses[1].data.attributes.value;
              backupValues.push(responses[0].data.attributes.value);
            } else {
              values = responses[0].data.attributes.value;
              responses.forEach((result, i) => {
                if (i > 0) {
                  backupValues.push(result.data.attributes.value);
                }
              });
            }
            const reducer = (accumulator, currentValue) => accumulator + currentValue;

            for (var i = 2001; i <= currentYear; i++) {
              colors[i] = self.shadeColor(baseColor, (indexColor / 100));
              indexColor = indexColor + colorStep;
            }

            if (window.reportOptions.aoiId) { // aoiIds are only when viewing a country report with a single subregion selected.
                countryTotalWith1Subregion;
                specificCountryData = backupValues[0];
                specificSubregionData = values; // place the specific subregion's historical data in a global object.

                let regionDataByYear = []; // This array will contain 1 index for each subregion in the country. Each of these arrays will contain all historical fires data grouped by year.
                const yearsToAdd = currentYear - 2001;
                for (let i = 0; i <= yearsToAdd; i++) {
                  const currentYearColor = i === yearsToAdd ? '#d40000' : '#e0e0df';
                  const regionYearObject = {};
                  regionYearObject['color'] = currentYearColor;
                  regionYearObject['data'] = [];
                  regionYearObject['lineWidth'] = 1;
                  regionYearObject['year'] = 2001 + i;
                  regionYearObject['name'] = 2001 + i;
                  regionDataByYear.push(regionYearObject)
                }
                let runningTotal3 = 0;
                values.forEach((monthOfData) => {
                  for (let x = 0; x < regionDataByYear.length; x++) {
                    if (regionDataByYear[x].year === monthOfData.year) {
                      if (monthOfData.month === 12) {
                        regionDataByYear[x].data.push({'y': (runningTotal3 + monthOfData.alerts), 'dataLabels': { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } });
                      } else if (monthOfData.year === currentYear && monthOfData.month === currentMonth) {
                        regionDataByYear[x].data.push({'y': (runningTotal3 + monthOfData.alerts), 'dataLabels': { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } });
                      } else {
                        regionDataByYear[x].data.push((runningTotal3 + monthOfData.alerts));
                      }
                    }
                  }
                  runningTotal3 += monthOfData.alerts;
                  if (monthOfData.month === 12) {
                    runningTotal3 = 0;
                  }
                })
                subregionTotal = regionDataByYear; // assign specific subregion data to a global object
                subregionDataINeed = regionDataByYear;

                let historicalDataForSelectedRegion = []; // This array will contain 1 index for each subregion in the country. Each of these arrays will contain all historical fires data grouped by year.
                backupValues[0].forEach((monthOfData, i) => {
                  const currentYearColor = monthOfData.year === currentYear ? '#d40000' : '#e0e0df';
                  if (i % 12 === 0) {
                    const regionYearObject = {};
                    regionYearObject['color'] = currentYearColor;
                    regionYearObject['data'] = [];
                    regionYearObject['lineWidth'] = 1;
                    regionYearObject['year'] = monthOfData.year;
                    regionYearObject['name'] = monthOfData.year;
                    historicalDataForSelectedRegion.push(regionYearObject);
                  }
                })

                let runningTotal = 0;
                backupValues[0].forEach(monthOfData => {
                  let itemToPush;
                  if (monthOfData.year === currentYear && monthOfData.month === currentMonth) { // if it's the last month of the current year...
                    itemToPush = { y: (monthOfData.alerts + runningTotal), dataLabels: { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } }
                  } else {
                    itemToPush = monthOfData.month === 12 ? // The last index of each data array needs to be an object containing the alerts and a dataLabels object for Highcharts.
                    {y: (monthOfData.alerts + runningTotal), dataLabels: { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } } :
                    (monthOfData.alerts + runningTotal);
                  }

                  const yearIndex = monthOfData.year - 2001;
                  // const countryIndex = historicalDataForSelectedRegion.filter(x => x.year === monthOfData.year);
                  const countryIndex = historicalDataForSelectedRegion.map(x => x.year).indexOf(monthOfData.year);

                  if (countryIndex !== undefined) {
                    historicalDataForSelectedRegion[countryIndex].data.push(itemToPush);
                  } else { // This serves as a check to ensure that all current year data is included in our historicalData array.
                    historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex] = {
                      color: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].color,
                      lineWidth: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].lineWidth,
                      year: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].year + 1,
                      name: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].year + 1,
                      data: [monthOfData.alerts]
                    };
                  }
                  runningTotal += monthOfData.alerts;
                  if (monthOfData.month === 12) {
                    runningTotal = 0;
                  }
                })
                historicalDataForSelectedRegion[historicalDataForSelectedRegion.length - 1].color = '#d40000';
                countryTotalWith1Subregion = historicalDataForSelectedRegion; // assign country data to a global object
                aoiDataSpecificRegion = historicalDataForSelectedRegion;

                series = regionDataByYear; // assign specific region data on load.

                firesCount = regionDataByYear[regionDataByYear.length - 1].data[regionDataByYear[regionDataByYear.length - 1].data.length - 1].y;




              } else if (window.reportOptions.country === 'ALL') { // , or a Global Report
                let historicalDataForSelectedRegion = []; // This array will contain 1 index for each subregion in the country. Each of these arrays will contain all historical fires data grouped by year.

                /********************** NOTE **********************
                 * backupValues[0] contains 1 index per month, for each year since 2001, for each subregion in the selected country.
                 * Each backupValue contains an adm1 number which corresponds with a subregion Id. We iterate over each backupValue and update our historicalData array with each subregion's information.
                 * Because each subregion contains 12 months of data, we only need to make 1 placeholder object on every 12th iteration.
                **************************************************/
                values.forEach((monthOfData, i) => {
                  const currentYearColor = monthOfData.year === currentYear ? '#d40000' : '#e0e0df';
                  if (i % 12 === 0) {
                    const regionYearObject = {};
                    regionYearObject['color'] = currentYearColor;
                    regionYearObject['data'] = [];
                    regionYearObject['lineWidth'] = 1;
                    regionYearObject['year'] = monthOfData.year;
                    regionYearObject['name'] = monthOfData.year;
                    historicalDataForSelectedRegion.push(regionYearObject);
                  }
                })

                let runningTotal = 0;
                values.forEach(monthOfData => {
                  const itemToPush = monthOfData.month === 12 ? // The last index of each data array needs to be an object containing the alerts and a dataLabels object for Highcharts.
                  {'y': (monthOfData.alerts + runningTotal), 'dataLabels': { align: "left", crop: false, enabled: true, format: "{'series.name'}", overflow: true, verticalAlign: "middle", x: 0 } } : (monthOfData.alerts + runningTotal);
                  const yearIndex = monthOfData.year - 2001;
                  const countryIndex = historicalDataForSelectedRegion.map(x => x.year).indexOf(monthOfData.year);
                  if (countryIndex !== -1) {
                    historicalDataForSelectedRegion[countryIndex].data.push(itemToPush)
                  } else { // This serves as a check to ensure that all current year data is included in our historicalData array.
                    historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex] = {
                      color: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].color,
                      lineWidth: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].lineWidth,
                      year: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].year + 1,
                      name: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].year + 1,
                      data: [monthOfData.alerts]
                    };
                  }
                  runningTotal += monthOfData.alerts;
                  if (monthOfData.month === 12) {
                    runningTotal = 0;
                  };
                })

                // assign series on load
                series = historicalDataForSelectedRegion;

                // firesCount total on load
                firesCount = historicalDataForSelectedRegion[historicalDataForSelectedRegion.length - 1].data[historicalDataForSelectedRegion[historicalDataForSelectedRegion.length - 1].data.length - 1];
              } else { // Otherwise, we are dealing with a single country with all of its subregions
                /********************** NOTE **********************
                 * values contains 1 point for each month of the country's history since 2001.
                 * backupValues[0] contains 1 index per month, for each year since 2001, for each subregion in the selected country.
                 * Each backupValue contains an adm1 number which corresponds with a subregion Id. We iterate over each backupValue and update our historicalData array with each subregion's information.
                 * Because each subregion contains 12 months of data, we only need to make 1 placeholder object on every 12th iteration.
                **************************************************/

                let statesArray = []; // This array will contain 1 index for each subregion in the country. Each of these indexes will be an array containining all historical fires data grouped by year.

                window.reportOptions.stateObjects.forEach(state => { // A listing of substatess is available on the window object. We iterate over this and create a placerholder object for each substates.
                  const object = {};
                  object[state.name_1] = [];
                  statesArray.push(object);
                });

                const stateNames = window.reportOptions.stateObjects.map(x => x.name_1);
                statesArray.sort((a, b) => {
                  return Object.keys(a)[0].localeCompare(Object.keys(b)[0]);
                });

                stateNames.sort((a, b) => {
                  return a.localeCompare(b);
                });
                let yearCounter = 2001;
                let currentState = 0;
                backupValues[0].forEach((monthData, i) => {
                    if (monthData.year === currentYear && monthData.month === currentMonth) {
                      const yearObject = {
                        year: yearCounter,
                        name: yearCounter,
                        data: [],
                        lineWidth: 1
                      };
                      statesArray[monthData.adm1 - 1][stateNames[monthData.adm1 - 1]].push(yearObject); // works!
                    } else if (monthData.month === 12) {
                        const yearObject = {
                          year: yearCounter,
                          name: yearCounter,
                          data: [],
                          lineWidth: 1
                        };
                        statesArray[monthData.adm1 - 1][stateNames[monthData.adm1 - 1]].push(yearObject); // works!
                        yearCounter++;
                    } else if(currentState !== monthData.adm1) {
                      yearCounter = 2001;
                    }
                    currentState = monthData.adm1;

                });

                let runningTotal = 0;
                backupValues[0].forEach((monthData, i) => {
                  if (monthData.month === 12 || (monthData.month === currentMonth && monthData.year === currentYear)) {
                    const object = {// december OR the last month of the current year has an object.
                      y: (monthData.alerts + runningTotal),
                      dataLabels: {
                        align: "left",
                        crop: false,
                        enabled: true,
                        format: "{series.name}",
                        overflow: true,
                        verticalAlign: "middle",
                        x: 0
                      }
                    }
                    statesArray[monthData.adm1 - 1][stateNames[monthData.adm1 - 1]][monthData.year - 2001].data.push(object);
                  } else {
                    statesArray[monthData.adm1 - 1][stateNames[monthData.adm1 - 1]][monthData.year - 2001].data.push((monthData.alerts + runningTotal));
                  }
                  runningTotal += monthData.alerts;
                  if (monthData.month === 12) {
                    runningTotal = 0;
                  }
                });
                countryTotalWithAllSubregions = statesArray; // store all state data on global variable
                // Massage the data frm values
                const placeHolderCountryTotal = [];

                values.forEach(monthOfData => {
                  if (monthOfData.month === 12) {
                    const yearObject = {
                      year: monthOfData.year,
                      name: monthOfData.year,
                      data: [],
                      color: '#e0e0df', // ??? controls non YTD color
                      lineWidth: 1
                    };
                    placeHolderCountryTotal.push(yearObject);
                  } else if (monthOfData.month === currentMonth && monthOfData.year === currentYear) {
                    const yearObject = {
                      year: monthOfData.year,
                      name: monthOfData.year,
                      data: [],
                      color: '#d40000', // ??? controls YTD color
                      lineWidth: 1
                    };
                    placeHolderCountryTotal.push(yearObject);
                  }
                })

                // populate the data
                let runningTotal2 = 0;
                values.forEach((monthOfData, i) => {
                  if (monthOfData.year === 12 || (monthOfData.year === currentYear && monthOfData.month === currentMonth)) {
                    const object = {// december OR the last month of the current year has an object.
                      y: (monthOfData.alerts + runningTotal2),
                      dataLabels: {
                        align: "left",
                        crop: false,
                        enabled: true,
                        format: "{series.name}",
                        overflow: true,
                        verticalAlign: "middle",
                        x: 0
                      }
                    };
                    placeHolderCountryTotal[monthOfData.year - 2001].data.push(object);
                  } else {
                    placeHolderCountryTotal[monthOfData.year - 2001].data.push((monthOfData.alerts + runningTotal2));
                  }
                  runningTotal2 += monthOfData.alerts;
                  if (monthOfData.month === 12) {
                    runningTotal2 = 0;
                  }
                })
                countryTotal = placeHolderCountryTotal;
                // assign series on load
                series = countryTotal;

                // firesCount total on load
                firesCount = countryTotal[currentYear - 2001].data[countryTotal[currentYear - 2001].data.length - 1].y;
              }


            $('#firesCountTitle').html(
              `${currentYear} MODIS Fire Alerts, Year to Date
              <span class="total_firecounts">${firesCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>`
              );

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
                  connectNulls: true
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
            // Todo: ??? NAME MUST BE A PART OF THE OBJECTS IN ORDER TO SET THE SERIES NAMES
            const selectedCountry = window.reportOptions['country'] ? window.reportOptions['country'] : 'Indonesia';

            // Create list of regions on load
            $('#firesCountIslandsListContainer h3').html("<p class=\"fires-count__label\">Region:</p> <strong> " + selectedCountry + " </strong>");
            if (window.reportOptions.aoiId) {
              $('#firesCountIslandsList').append("<li>" + window.reportOptions.aois.split("''").join("'") + "</li>");
              $('#firesCountIslandsList li').addClass('selected');
              $('#firesCountIslandsListContainer h3').removeClass('selected');
            } else if (window.reportOptions.stateObjects) {
              const allAois = window.reportOptions.stateObjects.map(stateObj => stateObj.name_1);
              allAois.sort((a, b) => a.localeCompare(b)); // sort alphabetically, taking into account accents and other non-english characters.
              allAois.forEach(aoiStr => $('#firesCountIslandsList').append("<li>" + aoiStr + "</li>"));
            }

           $('#firesCountIslandsListContainer h3').click(function () {
             $(this).addClass('selected');
             $('#firesCountIslandsList li').removeClass('selected');
            /**********************COMMENT**********************
              * This function fires off when a user clicks on a specific region within the "FIRE HISTORY: FIRE SEASON PROGRESSION" Chart.
              * This function will update the series data on Highcharts to only display the historical data for a specific region, and update the current year-to-date total in the header
              * In early testing, we noticed a bug where the data would mutate after clicking on a second region, and clicking back to the previous region would cause the chart data to not update.
              * This was a problem with the way highcharts was accessing the reference data of newSeriesData.
              * We reached out to Highcharts support and performed testing to try to resolve the issue, which was unsuccessful.
              * We resolved this by recreating all of the data objects within the scope of this function and passing the objects to Highcharts.
             **************************************************/
             let updatedSeriesTotal = [] // Series of data to be given to Highcharts
             const countryData = newSeriesDataObj[selectedCountry] ? newSeriesDataObj[selectedCountry] : window.firesCountRegionSeries;
             let currentYearMonthlyCounts = []; // Contains monthly data for current year
             let totalRegion = 0; // Year-To-Date Total to be displayed in the subheader of the chart
            if (window.reportOptions.country === 'ALL') { // If we're viewing a global report
              // We don't do anything
            } else if (window.reportOptions.country !== 'ALL' && window.reportOptions.aois) { // If we're viewing a report for a specific subregion in a specific country

              let historicalDataForSelectedRegion = []; // This array will contain 1 index for each subregion in the country. Each of these arrays will contain all historical fires data grouped by year.
                backupValues[0].forEach((monthOfData, i) => {
                  const currentYearColor = monthOfData.year === currentYear ? '#d40000' : '#e0e0df';
                  if (i % 12 === 0) {
                    const regionYearObject = {};
                    regionYearObject['color'] = currentYearColor;
                    regionYearObject['data'] = [];
                    regionYearObject['lineWidth'] = 1;
                    regionYearObject['year'] = monthOfData.year;
                    regionYearObject['name'] = monthOfData.year;
                    historicalDataForSelectedRegion.push(regionYearObject);
                  }
                })

                let runningTotal = 0;
                backupValues[0].forEach(monthOfData => {
                  let itemToPush;
                  if (monthOfData.year === currentYear && monthOfData.month === currentMonth) { // if it's the last month of the current year...
                    itemToPush = { y: (monthOfData.alerts + runningTotal), dataLabels: { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } }
                  } else {
                    itemToPush = (monthOfData.month) === 12 ? // The last index of each data array needs to be an object containing the alerts and a dataLabels object for Highcharts.
                    {y: (monthOfData.alerts + runningTotal), dataLabels: { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } } :
                    (monthOfData.alerts + runningTotal);
                  }
                  runningTotal += monthOfData.alerts;
                  if (monthOfData.month === 12) {
                    runningTotal = 0;
                  }
                  const yearIndex = monthOfData.year - 2001;
                  const countryIndex = historicalDataForSelectedRegion.map(x => x.year).indexOf(monthOfData.year);

                  if (countryIndex !== undefined) {
                    historicalDataForSelectedRegion[countryIndex].data.push(itemToPush);
                  } else { // This serves as a check to ensure that all current year data is included in our historicalData array.
                    historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex] = {
                      color: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].color,
                      lineWidth: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].lineWidth,
                      year: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].year + 1,
                      name: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].year + 1,
                      data: [monthOfData.alerts]
                    };
                  }
                })
                updatedSeriesTotal = historicalDataForSelectedRegion;

               // Updated firesCount total on click
               firesCount = historicalDataForSelectedRegion[historicalDataForSelectedRegion.length - 1].data[historicalDataForSelectedRegion[historicalDataForSelectedRegion.length - 1].data.length - 1].y;
            } else if (window.reportOptions.country !== 'ALL' && window.reportOptions.aois === undefined) { // If we're viewing all subregions in a specific country

              const placeHolderArray = [];

              values.forEach(monthOfData => {
                if (monthOfData.month === 12) {
                  const yearObject = {
                    year: monthOfData.year,
                    name: monthOfData.year,
                    data: [],
                    color: '#e0e0df', // ??? controls non YTD color
                    lineWidth: 1
                  };
                  placeHolderArray.push(yearObject);
                } else if (monthOfData.month === currentMonth && monthOfData.year === currentYear) {
                  const yearObject = {
                    year: monthOfData.year,
                    name: monthOfData.year,
                    data: [],
                    color: '#d40000', // ??? controls YTD color
                    lineWidth: 1
                  };
                  placeHolderArray.push(yearObject);
                }
              })
              // populate the data
              let runningTotal = 0;
              values.forEach((monthOfData, i) => {
                if (monthOfData.year === 12 || (monthOfData.year === currentYear && monthOfData.month === currentMonth)) {
                  const object = {// december OR the last month of the current year has an object.
                    y: (monthOfData.alerts + runningTotal),
                    dataLabels: {
                      align: "left",
                      crop: false,
                      enabled: true,
                      format: "{series.name}",
                      overflow: true,
                      verticalAlign: "middle",
                      x: 0
                    }
                  };
                  placeHolderArray[monthOfData.year - 2001].data.push(object);
                } else {
                  placeHolderArray[monthOfData.year - 2001].data.push((monthOfData.alerts + runningTotal));
                }
                runningTotal += monthOfData.alerts;
                if (monthOfData.month === 12) {
                  runningTotal = 0;
                }
              })

              // update series
              updatedSeriesTotal = placeHolderArray; // there was a bug where the countryTotal global was getting reset when going between regions and country. weird ???
              // Updated firesCount total
              firesCount = placeHolderArray[currentYear - 2001].data[placeHolderArray[currentYear - 2001].data.length - 1].y;
            }

           firesCountChart.update({ // Update highcharts' data and rerender the chart
             series: updatedSeriesTotal
           });

             $('#firesCountTitle').html(
               `${currentYear} MODIS Fire Alerts, Year to Date
               <span class="total_firecounts">${firesCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>`
             );
           });

           $('#firesCountIslandsList li').click(function () {
             $('#firesCountIslandsListContainer h3').removeClass('selected');
             $('#firesCountIslandsList li').removeClass('selected');
             $(this).addClass('selected');
             /**********************COMMENT**********************
              * This function fires off when a user clicks on a specific region within the "FIRE HISTORY: FIRE SEASON PROGRESSION" Chart.
              * This function will update the series data on Highcharts to only display the historical data for a specific region, and update the current year-to-date total in the header
              * In early testing, we noticed a bug where the data would mutate after clicking on a second region, and clicking back to the previous region would cause the chart data to not update.
              * This was a problem with the way highcharts was accessing the reference data of newSeriesData.
              * We reached out to Highcharts support and performed testing to try to resolve the issue, but were unsuccessful.
              * We resolved this by recreating all of the data objects within the scope of this function and passing the objects to Highcharts.
              **************************************************/
            const selectedIslandOrRegion = $(this).text();
            let updatedSeriesTotal = [] // Series of data to be given to Highcharts
            const countryData = historicalDataByRegion;
            let currentYearMonthlyCounts = []; // Contains monthly data for current year
            let totalRegionFiresYTD = 0; // Year-To-Date Total to be displayed in the subheader of the chart
            let updatedSeries = [] // Series of data to be given to Highcharts

            if (window.reportOptions.country === 'ALL') { // If we're viewing a global report
              // we shouldn't have to do anything, because the data is the same for both the region and the aggregate.
            } else if (window.reportOptions.country !== 'ALL' && window.reportOptions.aois) { // If we're viewing a report for a specific subregion in a specific country
            let regionDataByYear = []; // This array will contain 1 index for each subregion in the country. Each of these arrays will contain all historical fires data grouped by year.
            const yearsToAdd = currentYear - 2001;
            for (let i = 0; i <= yearsToAdd; i++) {
              const currentYearColor = i === yearsToAdd ? '#d40000' : '#e0e0df';
              const regionYearObject = {};
              regionYearObject['color'] = currentYearColor;
              regionYearObject['data'] = [];
              regionYearObject['lineWidth'] = 1;
              regionYearObject['year'] = 2001 + i;
              regionYearObject['name'] = 2001 + i;
              regionDataByYear.push(regionYearObject)
            }
            let runningTotal = 0;
            values.forEach((monthOfData) => {
              for (let x = 0; x < regionDataByYear.length; x++) {
                if (regionDataByYear[x].year === monthOfData.year) {
                  if (monthOfData.month === 12) {
                    regionDataByYear[x].data.push({'y': (monthOfData.alerts + runningTotal), 'dataLabels': { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } });
                    runningTotal = 0;
                  } else if (monthOfData.year === currentYear && monthOfData.month === currentMonth) {
                    regionDataByYear[x].data.push({'y': (monthOfData.alerts + runningTotal), 'dataLabels': { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } });
                  } else {
                    regionDataByYear[x].data.push((monthOfData.alerts + runningTotal));
                    runningTotal += monthOfData.alerts;
                  }
                }
              }
            })
              updatedSeries = regionDataByYear; // update Series

              // Updated firesCount total on click
              firesCount = regionDataByYear[regionDataByYear.length - 1].data[regionDataByYear[regionDataByYear.length - 1].data.length - 1].y;
            } else if (window.reportOptions !== 'ALL' && window.reportOptions.aois === undefined) {
              /********************** NOTE **********************
               * If we're viewing ALL subregions in ONE specific country
               * Calculate data and current year total for a report on a specific subregion in a country
               ***************************************************/
              countryTotalWithAllSubregions.sort((a, b) => {
                return Object.keys(a)[0].localeCompare(Object.keys(b)[0]);
              });
              countryTotalWithAllSubregions.forEach(state => {
                if (Object.keys(state).join() === selectedIslandOrRegion) {
                  updatedSeries = state[Object.keys(state)];
                }
              })
              // Update firesCount
              firesCount = updatedSeries[currentYear - 2001].data[updatedSeries[currentYear - 2001].data.length - 1].y;
            }

            firesCountChart.update({
              series: updatedSeries
            }, true);

            $('#firesCountTitle').html(
              `${currentYear} MODIS Fire Alerts, Year to Date
              <span class="total_firecounts">${firesCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>`
            );
           });
          }).catch(err => {
            document.getElementById('firesCountChartLoading').remove();
          });
        },

        buildUnusualFireCountsChart: () => {
          const handleAs = { handleAs: 'json' };
          const promiseUrls = [];

          // Make the query dynamic by pulling in the countryCode using the window options and our config file.
          const currentCountry = window.reportOptions.country;
          let countryCode = ''; // ??? Make this a succint filter function
          Config.countryFeatures.forEach(countryObject => {
            if (countryObject['English short name'].includes(currentCountry)) {
              countryCode = countryObject['Alpha-3 code'];
            };
          });
          
          let sourceOfData = 'MODIS' // modis by default, can change to 'VIIRS'
          const queryPrefix = 'https://production-api.globalforestwatch.org/query';
          const stateQuerySuffix = `9b9e56fc-270e-486d-8db5-e0a839c9a1a9?sql=SELECT%20iso,%20adm1,%20adm2,%20week,%20year,%20alerts%20as%20count,%20area_ha,%20polyname%20FROM%20data%20WHERE%20iso%20=%20%27${countryCode}%27%20AND%20adm1%20=%201%20AND%20polyname%20=%20%27admin%27%20AND%20fire_type%20=%20%27${sourceOfData}%27`;
          const countrySuffix = `ff289906-aa83-4a89-bba0-562edd8c16c6?sql=SELECT%20iso,%20adm1,%20adm2,%20week,%20year,%20alerts%20as%20count,%20area_ha,%20polyname%20FROM%20data%20WHERE%20iso%20=%20%27${countryCode}%27%20AND%20polyname%20=%20%27admin%27%20AND%20fire_type%20=%20%27${sourceOfData}%27`;

          if (window.reportOptions.aois) { // Viewing a Report for a specific subregion in a country (adm0)
            var queryUrl = `${queryPrefix}/${stateQuerySuffix}`;
          } else if (window.reportOptions.country !== 'ALL') { // Viewing all subregions in a country (adm1)
            var queryUrl = `${queryPrefix}/${countrySuffix}`;
          } else { // Viewing a global report
            console.log('x');
          }

          // const queryUrl = `https://production-api.globalforestwatch.org/query/ff289906-aa83-4a89-bba0-562edd8c16c6?sql=SELECT%20iso,%20adm1,%20adm2,%20week,%20year,%20alerts%20as%20count,%20area_ha,%20polyname%20FROM%20data%20WHERE%20iso%20=%20%27${countryCode}%27%20AND%20polyname%20=%20%27admin%27%20AND%20fire_type%20=%20%27VIIRS%27`;
          
          promiseUrls.push(queryUrl);
          let dataFromRequest = {};
          let threeMonthDataObject = {};
          let sixMonthDataObject = {};
          let twelveMonthDataObject = {};
          let categoriesArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          let updatedCategoriesArray = [];
          let rangeOfMonths = 3;
          let currentYearToDate;
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();

          // Calculate the current Week of the current year
          const today = new Date();
          const startDateOfCurrentYear = new Date(today.getFullYear(), 0, 0);
          const diff = today - startDateOfCurrentYear;
          const oneDay = 1000 * 60 * 60 * 24;
          const day = Math.floor(diff / oneDay);
          let currentWeek = 1;
          for (let i = 1; i < day; i++) {
            if (i % 7 === 0) {
              currentWeek += 1;
            }
          }

          // Declarting variables used below
          let unusualFiresCount = 0;
          let earliestYearOfData = currentYear;
          let seriesData, standardDeviationSeries, standardDeviation2Series;

          // determine the type of report, global, state, or regional
          // Run a query
          Promise.all(promiseUrls.map(promiseUrl => {
            return request.get(promiseUrl, handleAs);
          })).then(response => dataFromRequest = response[0].data).then(() => {
            const sortByWeekAndYear = (a, b) => {
              if (a.year > b.year) {
                return 1;
              } else if (a.year < b.year) {
                return -1;
              } else if(a.year === b.year) {
                if (a.week >= b.week) {
                  return 1
                } else {
                  return -1
                }
              }
            }; 
            if (window.reportOptions.aois) { //Viewing a Report for a specific subregion in a country (adm0)
              // The data we get back are objects containing the fire counts for a specific week in a specific year. 
              // if dataFromRequest has no 2019 data, just pass an array of zeros.
              if (dataFromRequest.findIndex(x => x.year === 2019) === -1) {
                // Create an array for the series that's all zero values
                let highchartsSeriesXPosition = -0.75;
                for (let z = 0; z < 52; z++) {
                  highchartsSeriesXPosition += 0.25;
                  twelveMonthData.push([highchartsSeriesXPosition, 0]);
                }
                
                highchartsSeriesXPosition = -0.75;
                for (let z = 0; z < 26; z++) {
                  highchartsSeriesXPosition += 0.25;
                  sixMonthData.push([highchartsSeriesXPosition, 0]);
                }
                
                highchartsSeriesXPosition = -0.75;
                for (let z = 0; z < 13; z++) {
                  highchartsSeriesXPosition += 0.25;
                  threeMonthData.push([highchartsSeriesXPosition, 0]);
                }
                // updatedSeries = threeMonthData;
                console.log('threeMonthData', threeMonthData);
                seriesData = threeMonthData.slice(0); // If we set it equal, the data may mutate later on.

                // Do it for 6
                sixMonthData = twelveMonthData.slice(26);
                highchartsSeriesXPosition = -0.75;
                sixMonthData = sixMonthData.map(weekObject => { // todo: ??? Turn this into a reusable function
                  highchartsSeriesXPosition += 0.25;
                  return [highchartsSeriesXPosition, weekObject[1]];
                });

                console.log('sixmonth', sixMonthData);
                console.log('twelvemonth', twelveMonthData);

                
                // Leaving Off:
                // WE have to make placeholder dummy data for all the subregions that don't have 2019 data - which is most of them. 
                // We ogtta do this for the12, 6, and 3 month data sets
              } else {
                // Do litrally everything below

                /********************** NOTE **********************
                 * On our inital load, we show the previous 3 months of data starting at the current week and going back 12 other weeks
                 * We start by grabbing all of the data from the past 12 months, sorting it, and incrementally slicing off the data we need for the 3 and 6 month windows.
                 * For each week, we check if any weeks are missing. We add placeholder week objects and cut out the weeks we no longer need.
                ***************************************************/

                // /********************** NOTE **********************
                //  * Once we have our data, we need to make a new array of data to pass into highcharts. The data must be an array of arrays, each with an [x, y] value
                //  * Our x axis is an array of months. Since we want 4 weeks of data per month, each week is spaced out by quarter-units. 
                //  * E.G. If our x axis is ['January', 'February', 'March'], the 4 points we want to appear above the February category must be structured as:
                //  * seriesData = [ [.5, week1], [.75, week2], [1, week3], [1.25, week4] ]
                //  * The series needs to begin a half-unit below the first index of 0, so we start the counter at -0.75, increment it by .25, and then pass it, each time incrementing by .25.
                // ***************************************************/
                
                // Below we calculate the standard deviation for each week. 
                // We store 12 months of data in the historicalDataByWeek array, and pull off the indecies we need based on whether it is 12, 6, or 3 months.
                const historicalDataByWeek = [];
                for (let i = 0; i < 53; i++) {
                  const historicalWeekObject = {
                    week: i,
                    historicalAlerts: [],
                    historicalAverage: 0,
                    sd1: 0,
                    sd2: 0,
                    currentYearAlerts: 0,
                  }
                  historicalDataByWeek.push(historicalWeekObject);
                };
                
                // historicalDataByWeek contains 52 objects, each containing an array of all historical alerts from that week in the past.
                dataFromRequest.forEach((weekOfData, i) => {
                  historicalDataByWeek[weekOfData.week - 1].historicalAlerts.push(weekOfData.alerts);
                });
    
                // Now that we have our 52 week objects, we need to calculate the standard deviation for each week. See https://www.wikihow.com/Calculate-Standard-Deviation for our algorithm.
                historicalDataByWeek.forEach(weekObject => {
                  const average = Math.round(weekObject.historicalAlerts.reduce((a, b) => a + b) / weekObject.historicalAlerts.length); // calculate the average for each week
                  const deviations = weekObject.historicalAlerts.map(alert => alert - average); // calculate deviance for each week
                  const squaredDeviations = deviations.map(deviation => deviation * deviation); // square all of deviations
                  const denomenator = squaredDeviations.length > 1 ? squaredDeviations.length - 1 : 1; // check the count of deviations because we shouldn't divide by zero
                  const standardDeviation = Math.round(Math.sqrt(squaredDeviations.reduce((a, b) => a + b) / denomenator)); // Calculate Standard deviation
                    
                  // Assign the values to our week object. If there is no data, plug empty arrays or zeros.
                  const noSquaredDeviations = squaredDeviations.length === 0;
                  weekObject.deviations = noSquaredDeviations ? [] : deviations;
                  weekObject.historicalAverage = noSquaredDeviations ? 0 : average;
                  weekObject.sd1 = noSquaredDeviations ? 0 : standardDeviation;
                  weekObject.sd2 = noSquaredDeviations ? 0 : standardDeviation * 2;
                  const currentWeekData = dataFromRequest.filter(data => data.year === currentYear).filter(data => data.week === weekObject.week);
                  weekObject.currentYearAlerts = currentWeekData.length === 0 ? 0 : currentWeekData[0].alerts;                  
                });

                /********************** NOTE **********************
                 * Per discussion with the client, plotting each week's standard deviation causes immense variances on a weekly basis which is too much noise to analyze.
                 * To resolve this, we are to calculate a "window-average" for a week. A "window" begins 6 weeks prior to a specific week and extends 6 weeks beyond, for a total of 13 weeks.
                 * Once we have an average for a window, we calculate the standard deviation for that week by taking the absolute value of the specific week's fires less the window meanfor that week.
                 * We eventually plot 3 series: A series of the current year fires; a series of 1 standard deviation from each week's mean; and a series of 2 standard deviations from each week's mean.
                ***************************************************/
                
                //Calculate the 'window average' for a specific week:
                  // Take the historical averages from the previous 6 weeks
                  // Take the average for that week
                  // Take the historical averages from the next 6 weeks
                  // Sum them and divide by 13.
                
                historicalDataByWeek.forEach((week, weekIndex) => {
                  let sumOfWindowAverages = 0;
                  if (weekIndex > 5 && weekIndex <= 46) {
                    for (let w = weekIndex - 6; w < weekIndex; w++) {
                      sumOfWindowAverages += historicalDataByWeek[w].historicalAverage;
                    }
                    for (let w = weekIndex; w < weekIndex + 7; w++) {
                      sumOfWindowAverages += historicalDataByWeek[w].historicalAverage;
                    }
                    historicalDataByWeek[weekIndex].windowAverage = Math.round((sumOfWindowAverages / 13));
                  } else if (weekIndex <= 5) {
                    let startingWeek = 52 - 5 + weekIndex;
                    for (let w = startingWeek; w < 53; w++) {
                      sumOfWindowAverages += historicalDataByWeek[w].historicalAverage;
                    }
                    for (let w = 0; w < weekIndex; w++) {
                      sumOfWindowAverages += historicalDataByWeek[w].historicalAverage;
                    }
                    for (let w = weekIndex; w < weekIndex + 7; w++) {
                      sumOfWindowAverages += historicalDataByWeek[w].historicalAverage;
                    }
                    historicalDataByWeek[weekIndex].windowAverage = Math.round((sumOfWindowAverages / 13));
                  } else if (weekIndex > 46) {
                    for (let w = weekIndex - 6; w < 53; w++) {
                      sumOfWindowAverages += historicalDataByWeek[w].historicalAverage;
                    }
                    let endingWeek = weekIndex - 52 + 6;
                    for (let w = 0; w < endingWeek; w++) {
                      sumOfWindowAverages += historicalDataByWeek[w].historicalAverage;
                    }
                    historicalDataByWeek[weekIndex].windowAverage = Math.round((sumOfWindowAverages / 13));
                  }
                })  

                // Window averages have been properly calculated.
                // For each week in our window, subtract the window avg from the current week's window avg, square it, and push it to a temp array.
                historicalDataByWeek.forEach((week, weekIndex) => {
                  const arrayOfWindowVariances = [];
                  if (weekIndex > 5 && weekIndex <= 46) {
                    for (let w = weekIndex - 6; w < weekIndex; w++) {
                      arrayOfWindowVariances.push((historicalDataByWeek[w].historicalAverage - week.windowAverage) ** 2);
                    }
                    for (let w = weekIndex; w < weekIndex + 7; w++) {
                      arrayOfWindowVariances.push((historicalDataByWeek[w].historicalAverage - week.windowAverage) ** 2);
                    }
                    const sumOfSquaredWindowVariances = arrayOfWindowVariances.reduce((a, b) => a + b);
                    historicalDataByWeek[weekIndex].windowStandardDeviation1 = Math.round(Math.sqrt(sumOfSquaredWindowVariances / 13));
                    historicalDataByWeek[weekIndex].windowStandardDeviation2 = historicalDataByWeek[weekIndex].windowStandardDeviation1 * 2;
                  } else if (weekIndex <= 5) {
                    let startingWeek = 52 - 5 + weekIndex;
                    for (let w = startingWeek; w < 53; w++) {
                      arrayOfWindowVariances.push((historicalDataByWeek[w].historicalAverage - week.windowAverage) ** 2);
                    }
                    for (let w = 0; w < weekIndex; w++) {
                      arrayOfWindowVariances.push((historicalDataByWeek[w].historicalAverage - week.windowAverage) ** 2);
                    }
                    for (let w = weekIndex; w < weekIndex + 7; w++) {
                      arrayOfWindowVariances.push((historicalDataByWeek[w].historicalAverage - week.windowAverage) ** 2);
                    }
                    const sumOfSquaredWindowVariances = arrayOfWindowVariances.reduce((a, b) => a + b);
                    historicalDataByWeek[weekIndex].windowStandardDeviation1 = Math.round(Math.sqrt(sumOfSquaredWindowVariances / 13));
                    historicalDataByWeek[weekIndex].windowStandardDeviation2 = historicalDataByWeek[weekIndex].windowStandardDeviation1 * 2;
                  } else if (weekIndex > 46) {
                    for (let w = weekIndex - 6; w < 53; w++) {
                      arrayOfWindowVariances.push((historicalDataByWeek[w].historicalAverage - week.windowAverage) ** 2);
                    }
                    let endingWeek = weekIndex - 52 + 6;
                    for (let w = 0; w < endingWeek; w++) {
                      arrayOfWindowVariances.push((historicalDataByWeek[w].historicalAverage - week.windowAverage) ** 2);
                    }
                    const sumOfSquaredWindowVariances = arrayOfWindowVariances.reduce((a, b) => a + b);
                    historicalDataByWeek[weekIndex].windowStandardDeviation1 = Math.round(Math.sqrt(sumOfSquaredWindowVariances / 13));
                    historicalDataByWeek[weekIndex].windowStandardDeviation2 = historicalDataByWeek[weekIndex].windowStandardDeviation1 * 2;
                  }
                })  
                
                // On load, we isolate 13 weeks of data, ending at the current week, and plot the current alerts, the window SD, and the window SD 2 for each week.
                const isolated13Weeks = [];
                if (currentWeek > 11) {
                  for (let i = currentWeek - 12; i <= currentWeek; i++) {
                    isolated13Weeks.push(historicalDataByWeek[i]);
                  }
                } else {
                  // If the currentweek is less than 12, we need to show the previous year's alerts.
                  let startWeek = 53 + currentWeek - 12;
                  for (let i = startWeek; i < 53; i++) {
                    isolated13Weeks.push(historicalDataByWeek[i]);
                  }
                  if (isolated13Weeks.length < 13) {
                    for (let i = 0; i <= 12 - isolated13Weeks.length; i++) {
                      isolated13Weeks.push(historicalDataByWeek[i]);
                    }
                  }
                }
 
                let isolatedAlerts = isolated13Weeks.map(week => week.currentYearAlerts);
                let currentWindowAvgs = isolated13Weeks.map(week => week.windowAverage);
                let isolatedStandardDeviation1 = isolated13Weeks.map(week => week.windowStandardDeviation1 + week.windowAverage);
                let isolatedStandardDeviation2 = isolated13Weeks.map(week => week.windowStandardDeviation2 + week.windowAverage);
                let isolatedStandardDeviationMinus1 = isolated13Weeks.map(week => week.windowAverage - week.windowStandardDeviation1);
                let isolatedStandardDeviationMinus2 = isolated13Weeks.map(week => week.windowAverage - week.windowStandardDeviation2);
                
                // Add an x value to plot each point in the proper month and send each series of data to highcharts
                let xPosition = -0.75;
                seriesData = isolatedAlerts.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                standardDeviationSeries = isolatedStandardDeviation1.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                standardDeviation2Series = isolatedStandardDeviation2.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                windowAverages = currentWindowAvgs.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                standardDeviationMinus1Series = isolatedStandardDeviationMinus1.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                standardDeviationMinus2Series = isolatedStandardDeviationMinus2.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                // Save data on our global object for future reference.
                threeMonthDataObject.currentYearFires = seriesData.slice(0);
                threeMonthDataObject.windowSD1 = standardDeviationSeries.slice(0);
                threeMonthDataObject.windowSD2 = standardDeviation2Series.slice(0);
                threeMonthDataObject.windowMean = windowAverages.slice(0);
                threeMonthDataObject.windowSDMinus1 = standardDeviationMinus1Series.slice(0);
                threeMonthDataObject.windowSDMinus2 = standardDeviationMinus2Series.slice(0);
                
                // We repeat the process above for 6 months (26 weeks).
                const isolated26Weeks = [];
                if (currentWeek > 24) {
                  debugger;
                  for (let i = currentWeek - 25; i <= currentWeek; i++) {
                    isolated26Weeks.push(historicalDataByWeek[i]);
                  }
                } else {
                  // If the currentweek is less than 25, we need to show the previous year's alerts.
                  let startWeek = 53 + currentWeek - 25;
                  for (let i = startWeek; i < 53; i++) {
                    isolated26Weeks.push(historicalDataByWeek[i]);
                  }
                  if (isolated26Weeks.length < 26) {
                    let currentYearWeeks = 25 - isolated26Weeks.length;
                    for (let i = 0; i <= currentYearWeeks; i++) {
                      isolated26Weeks.push(historicalDataByWeek[i]);
                    }
                  }
                }
 
                isolatedAlerts = isolated26Weeks.map(week => week.currentYearAlerts);
                currentWindowAvgs = isolated26Weeks.map(week => week.windowAverage);
                isolatedStandardDeviation1 = isolated26Weeks.map(week => week.windowStandardDeviation1 + week.windowAverage);
                isolatedStandardDeviation2 = isolated26Weeks.map(week => week.windowStandardDeviation2 + week.windowAverage);
                isolatedStandardDeviationMinus1 = isolated26Weeks.map(week => week.windowAverage - week.windowStandardDeviation1);
                isolatedStandardDeviationMinus2 = isolated26Weeks.map(week => week.windowAverage - week.windowStandardDeviation2);
                
                // Add an x value to plot each point in the proper month and send each series of data to highcharts
                xPosition = -0.75;
                sixMonthSeriesData = isolatedAlerts.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                sixMonthStandardDeviationSeries = isolatedStandardDeviation1.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                sixMonthStandardDeviation2Series = isolatedStandardDeviation2.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                sixMonthWindowAverages = currentWindowAvgs.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                sixMonthStandardDeviationMinus1Series = isolatedStandardDeviationMinus1.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                sixMonthStandardDeviationMinus2Series = isolatedStandardDeviationMinus2.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                // Save data on our 6 month global object for future reference.
                sixMonthDataObject.currentYearFires = sixMonthSeriesData.slice(0);
                sixMonthDataObject.windowSD1 = sixMonthStandardDeviationSeries.slice(0);
                sixMonthDataObject.windowSD2 = sixMonthStandardDeviation2Series.slice(0);
                sixMonthDataObject.windowMean = sixMonthWindowAverages.slice(0);
                sixMonthDataObject.windowSDMinus1 = sixMonthStandardDeviationMinus1Series.slice(0);
                sixMonthDataObject.windowSDMinus2 = sixMonthStandardDeviationMinus2Series.slice(0);

                //  We repeat the process above 12 months (52 weeks).
                const isolated52Weeks = [];
                if (currentWeek > 50) {
                  debugger;
                  for (let i = currentWeek - 51; i <= currentWeek; i++) {
                    isolated52Weeks.push(historicalDataByWeek[i]);
                  }
                } else {
                  // If the currentweek is less than 51, we need to show the previous year's alerts.
                  let startWeek = 53 + currentWeek - 51;
                  for (let i = startWeek; i < 53; i++) {
                    isolated52Weeks.push(historicalDataByWeek[i]);
                  }
                  if (isolated52Weeks.length < 52) {
                    let currentYearWeeks = 51 - isolated52Weeks.length;
                    for (let i = 0; i <= currentYearWeeks; i++) {
                      isolated52Weeks.push(historicalDataByWeek[i]);
                    }
                  }
                }
 
                isolatedAlerts = isolated52Weeks.map(week => week.currentYearAlerts);
                currentWindowAvgs = isolated52Weeks.map(week => week.windowAverage);
                isolatedStandardDeviation1 = isolated52Weeks.map(week => week.windowStandardDeviation1 + week.windowAverage);
                isolatedStandardDeviation2 = isolated52Weeks.map(week => week.windowStandardDeviation2 + week.windowAverage);
                isolatedStandardDeviationMinus1 = isolated52Weeks.map(week => week.windowAverage - week.windowStandardDeviation1);
                isolatedStandardDeviationMinus2 = isolated52Weeks.map(week => week.windowAverage - week.windowStandardDeviation2);
                
                // Add an x value to plot each point in the proper month and send each series of data to highcharts
                xPosition = -0.75;
                twelveMonthSeriesData = isolatedAlerts.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                twelveMonthStandardDeviationSeries = isolatedStandardDeviation1.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                twelveMonthStandardDeviation2Series = isolatedStandardDeviation2.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                twelveMonthWindowAverages = currentWindowAvgs.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                twelveMonthStandardDeviationMinus1Series = isolatedStandardDeviationMinus1.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                xPosition = -0.75;
                twelveMonthStandardDeviationMinus2Series = isolatedStandardDeviationMinus2.map(x => {
                  xPosition += 0.25;
                  return [xPosition, x];
                });

                // Save data on our 12 month global object for future reference.
                twelveMonthDataObject.currentYearFires = twelveMonthSeriesData.slice(0);
                twelveMonthDataObject.windowSD1 = twelveMonthStandardDeviationSeries.slice(0);
                twelveMonthDataObject.windowSD2 = twelveMonthStandardDeviation2Series.slice(0);
                twelveMonthDataObject.windowMean = twelveMonthWindowAverages.slice(0);
                twelveMonthDataObject.windowSDMinus1 = twelveMonthStandardDeviationMinus1Series.slice(0);
                twelveMonthDataObject.windowSDMinus2 = twelveMonthStandardDeviationMinus2Series.slice(0);

                /********************** NOTE **********************
                 * An unusual fire is any fires that occur in excess of the first standard deviation. Below, we sum these and update the chart header text.
                 * Additionally, the client provided us a framework for determining a subject measurement of unusual fires: 
                  * "Average" means that total fires is within 1 sigma
                  * "High" means that total fires > 1 sigma and < 2 sigma
                  * "Low" means that total fires < -1 sigma and > -2 sigma
                  * "Unusually High/Low" means that total fires > +/- 2 sigma
                ***************************************************/

                // Calculate unuusal fire counts
                // Todo: ??? This needs to be updated once we determine which standard deviation values to compare against.
                unusualFiresCount = 0;
                dataFromRequest.forEach(weekOfData => {
                  if (weekOfData.year === currentYear) unusualFiresCount += weekOfData.alerts;
                });

                earliestYearOfData = currentYear;
                dataFromRequest.forEach(week => week.year < earliestYearOfData ? earliestYearOfData = week.year : earliestYearOfData);

                // Pull the month categories based on the current month and the rangeOfMonths selected
                currentYearToDate = categoriesArray.slice(0, (currentMonth + 1));
                updatedCategoriesArray = categoriesArray.slice(currentMonth + 1);
                currentYearToDate.forEach(index => updatedCategoriesArray.push(index));
                updatedCategoriesArray = updatedCategoriesArray.slice(12 - rangeOfMonths);
                console.log(updatedCategoriesArray);
              }
            } else if (window.reportOptions.country !== 'ALL') { // Viewing all subregions in a country (adm1)
              console.log('here');
              // The data we get back are objects containing the fire counts for a specific week in a specific year. 

              dataFromRequest.sort(sortByWeekAndYear);
              console.log(dataFromRequest);

              /********************** NOTE **********************
               * On our inital load, we show the previous 3 months of data starting at the current week and going back 12 other weeks
               * We start by grabbing the most recent 13 weeks of data
               * Then, we check if any weeks are missing (because they had null data). We add placeholder week objects and cut out the weeks we no longer need.
              ***************************************************/

              const placeholderArray = [];
              // Grab 12 months of data
              for (let l = 0; l < 52; l++) {
               // Check for weeks of zero data and plug a zero value
               if (dataFromRequest[dataFromRequest.length - 1 - l].week - 1 !== dataFromRequest[dataFromRequest.length - 2 - l].week && dataFromRequest[dataFromRequest.length - 1 - l].week !== 1) {
                 let gap = dataFromRequest[dataFromRequest.length - 1 - l].week - dataFromRequest[dataFromRequest.length - 2 - l].week;
                 for (let p = 0; p < gap; p++) {
                   let object = {};
                   object.alerts = 0;
                   object.week = dataFromRequest[dataFromRequest.length - 1 - l].week - p;
                   object.year = dataFromRequest[dataFromRequest.length - 1 - l].year;
                   placeholderArray.push(object);
                 }
                } else {
                  twelveMonthData.push(dataFromRequest[dataFromRequest.length - 1 - l]);
                }
              }
              placeholderArray.forEach(x => twelveMonthData.push(x));
              twelveMonthData.sort(sortByWeekAndYear);
              console.log('twelveMonthData', twelveMonthData);

              // twelveMonthData may now have placeholder data and more than 52 points of data. We need to sort the array chronologically and remove the oldest data until we are left with 13
              const indeciesToRemove = twelveMonthData.length - 52;
              twelveMonthData.splice(0, indeciesToRemove);
              console.log('should be a sorted array of 52 weeks', twelveMonthData);

              /********************** NOTE **********************
               * Once we have our data, we need to make a new array of data to pass into highcharts. The data must be an array of arrays, each with an [x, y] value
               * Our x axis is an array of months. Since we want 4 weeks of data per month, each week is spaced out by quarter-units. 
               * E.G. If our x axis is ['January', 'February', 'March'], the 4 points we want to appear above the February category must be structured as:
               * seriesData = [ [.5, week1], [.75, week2], [1, week3], [1.25, week4] ]
               * The series needs to begin a half-unit below the first index of 0, so we start the counter at -0.75, increment it by .25, and then pass it, each time incrementing by .25.
              ***************************************************/
               
              // Do it for 12 months
              let highchartsSeriesXPosition = -0.75;
              twelveMonthData = twelveMonthData.map(weekObject => {
                highchartsSeriesXPosition += 0.25;
                return [highchartsSeriesXPosition, weekObject.alerts];
              });

              // Do it for 6
              sixMonthData = twelveMonthData.slice(26);
              highchartsSeriesXPosition = -0.75;
              sixMonthData = sixMonthData.map(weekObject => {
                highchartsSeriesXPosition += 0.25;
                return [highchartsSeriesXPosition, weekObject[1]];
              });

              // Do it for 3
              threeMonthData = twelveMonthData.slice(39);
              highchartsSeriesXPosition = -0.75;
              threeMonthData = threeMonthData.map(weekObject => {
                highchartsSeriesXPosition += 0.25;
                return [highchartsSeriesXPosition, weekObject[1]];
              });
              
              seriesData = threeMonthData.slice(0); // If we set it equal, the data may mutate later on.
              // Below we calculate the standard deviation for each week. 
              // We store 12 months of data in the historicalDataByWeek array, and pull off the indecies we need based on whether it is 12, 6, or 3 months.
              const historicalDataByWeek = [];
              for (let i = 0; i < 53; i++) {
                const historicalWeekObject = {
                  week: i,
                  historicalAlerts: [],
                  baseStandardDeviation: 0,
                  sd1: 0,
                  sd2: 0,
                }
                historicalDataByWeek.push(historicalWeekObject);
              };
              
              // Todo: ??? We need to add placeholder data for null weeks
              
              // Iterate over dataFromRequest. For each item, push the alerts to the corresponding week index on historicalDataByWeek
              dataFromRequest.forEach((weekOfData, i) => {
                historicalDataByWeek[weekOfData.week - 1].historicalAlerts.push(weekOfData.alerts);
              });
  
              // calculate average for each week
              historicalDataByWeek.forEach((weekObject, i) => {
                let sumOfAlerts = 0; 
                let average = 0;
                historicalDataByWeek[i].historicalAlerts.forEach(alert => {
                  sumOfAlerts += alert;
                });
                average = Math.round(sumOfAlerts / historicalDataByWeek[i].historicalAlerts.length);
                sumOfAlerts = 0;
              
                // calculate deviance for each week
                let deviations = [];
                historicalDataByWeek[i].historicalAlerts.forEach(alert => {
                  deviations.push(alert - average);
                });
                
                // square all of deviations
                const squaredDeviations = [];
                deviations.forEach(deviation => {
                  squaredDeviations.push(deviation * deviation);
                })
  
                // sum deviations
                if (squaredDeviations.length === 0) {
                  // there is no data to calculate a standard deviation
                  historicalDataByWeek[i].baseStandardDeviation = 0;
                  historicalDataByWeek[i].sd1 = 0;
                  historicalDataByWeek[i].sd2 = 0;
                } else {
                  const sumOfSquaredDeviations = squaredDeviations.reduce((sum, currentValue) => sum + currentValue);
                  // Divide sumOfSquaredDeviations by one less than the number of items in the data set. For example, if you had 4 numbers, divide by 3.
                  // Calculate the square root of the resulting value. This is the sample standard deviation. 
                  const simpleStandardDeviation = Math.round(Math.sqrt((sumOfSquaredDeviations / (squaredDeviations.length - 1))));
                  historicalDataByWeek[i].baseStandardDeviation = simpleStandardDeviation;
                  historicalDataByWeek[i].sd1 = average + historicalDataByWeek[i].baseStandardDeviation;
                  historicalDataByWeek[i].sd2 = historicalDataByWeek[i].sd1 + historicalDataByWeek[i].baseStandardDeviation;
                };
              });
  
              // Update the seriesData in highcharts to show 4 weeks of data per month for each standard deviation (1 sigma)
              // Similar to above, our chart will have 4 weeks shown per month. In order to make this work, each data point we pass to highcharts needs an x and y value.
              highchartsSeriesXPosition = -0.75;
              standardDeviationSeries = historicalDataByWeek.filter(x => x.week <= currentWeek).map(weekObject => {
                highchartsSeriesXPosition += 0.25;
                return [highchartsSeriesXPosition, weekObject.sd1];
              });
              
              // Update the seriesData in highcharts to show 4 weeks of data per month for each second standard deviation (2 sigma)
              // Similar to above, our chart will have 4 weeks shown per month. In order to make this work, each data point we pass to highcharts needs an x and y value.
              highchartsSeriesXPosition = -0.75;
              standardDeviation2Series = historicalDataByWeek.filter(x => x.week <= currentWeek).map(weekObject => {
                highchartsSeriesXPosition += 0.25;
                return [highchartsSeriesXPosition, weekObject.sd2];
              });
              console.log('historicalDataByWeek',historicalDataByWeek);
              console.log('down here');
              
              /********************** NOTE **********************
               * An unusual fire is any fires that occur in excess of the first standard deviation. Below, we sum these and update the chart header text.
               * Additionally, the client provided us a framework for determining a subject measurement of unusual fires: 
                * "Average" means that total fires is within 1 sigma
                * "High" means that total fires > 1 sigma and < 2 sigma
                * "Low" means that total fires < -1 sigma and > -2 sigma
                * "Unusually High/Low" means that total fires > +/- 2 sigma
              ***************************************************/

              // Calculate unuusal fire counts
              // Todo: ??? This needs to be updated once we determine which standard deviation values to compare against.
              unusualFiresCount = 0;
              dataFromRequest.forEach(weekOfData => {
                if (weekOfData.year === currentYear) unusualFiresCount += weekOfData.alerts;
              });

              earliestYearOfData = currentYear;
              dataFromRequest.forEach(week => week.year < earliestYearOfData ? earliestYearOfData = week.year : earliestYearOfData);

              // Pull the month categories based on the current month and the rangeOfMonths selected
              currentYearToDate = categoriesArray.slice(0, (currentMonth + 1));
              updatedCategoriesArray = categoriesArray.slice(currentMonth + 1);
              currentYearToDate.forEach(index => updatedCategoriesArray.push(index));
              updatedCategoriesArray = updatedCategoriesArray.slice(12 - rangeOfMonths);
              console.log(updatedCategoriesArray);
            }
            

            $('#unusualFiresCountTitle').html(
              `There were <span style='color: red'>${unusualFiresCount}</span> MODIS fire alerts reported in the week of the 14th of March 2019. This was <span style='color: red'>average</span> compared to the same week in previous years.`
            );
            $('#unusualFiresCountSubtitle').html(
              `Unusual fire history analyses use MODIS fires data only for ${earliestYearOfData} to present.`
            );

            /********************** NOTE **********************
             * HighCharts allows us to combine charts to get the desired output. 
             * We utilize areaspline charts for the two standard deviation thresholds and a spline chart for the current year data.
             * The last chart to be passed into the series array will be the one on top of the others. Because of this, we put the broadest data set (sd2) first, and current year data last.
            ***************************************************/
            var unusualFires = Highcharts.chart('unusualFires', { // UNUSUAL FIRES CHART MADE HERE
              chart: {
                type: 'line',
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
                  formatter: function() {
                      return updatedCategoriesArray[this.value];
                  }
                },
              },
              plotOptions: {
                spline: {
                    marker: {
                        enabled: false
                    }
                },
                areaspline: {
                    marker: {
                        enabled: false
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
                    '<h3 class="history-chart-tooltip__content">' + Highcharts.numberFormat(this.point.y, 0, '.', ',') + '<span class="firesCountChart__text"> Fires</span></h3>' +
                    '<p class="firesCountChart__popup">Unusually High</p>' +
                    '</div>'
                  )
                },
              },
              series: [
                {
                  // Standard deviation 2
                  type: 'areaspline',
                  color: '#E0E0E0', 
                  data: standardDeviation2Series
                },
                {
                  // Standard deviation 1
                  type: 'areaspline',
                  color: '#F8F8F8', 
                  data: standardDeviationSeries
                },
                {
                  // Current Year Data
                  type: 'spline',
                  color: '#d40000', 
                  data: seriesData
                },
                {
                  // Current Year Average Data
                  type: 'spline',
                  color: '#d40000', 
                  data: windowAverages
                },
                {
                  // Current Year -sd 1Data
                  type: 'spline',
                  color: '#d40000', 
                  data: standardDeviationMinus1Series
                },
                {
                  // Current Year -sd2 Data
                  type: 'spline',
                  color: '#d40000', 
                  data: standardDeviationMinus2Series
                },
              ]
            });
         

            // Create list of time on load
            let timeOptions = ['3 months', '6 months', '12 months'];
            timeOptions.forEach(period => $('#unusualFiresOptions').append("<ul>" + period + "</ul>"));
            // On select, update the modis data and the viirs data and the months const selectedIslandOrRegion = $(this).text();

            // On click of a time option, highlight it and update the series accordingly
            $('#unusualFiresOptions ul').click(function() {
                $('#unusualFiresOptions ul').removeClass('selected');
                $(this).addClass('selected');
                
                // Update the categories based on whether it's 3, 6, or 12 months selected.
                let selection = $(this).text();
                rangeOfMonths = selection.includes('12') ? 12 : selection.includes('6') ? 6 : 3; 
                currentYearToDate = categoriesArray.slice(0, (currentMonth + 1));
                updatedCategoriesArray = categoriesArray.slice(currentMonth + 1);
                currentYearToDate.forEach(index => updatedCategoriesArray.push(index));
                updatedCategoriesArray = updatedCategoriesArray.slice(12 - rangeOfMonths);

                // Update the series data based on whether it's 3, 6, or 12 months selected.
                seriesData = selection.includes('12') ? twelveMonthData : selection.includes('6') ? sixMonthData : threeMonthData;

                // Actually update Highcharts data
                unusualFires.update({
                  xAxis: {
                    labels: {
                      formatter: function() {
                        return updatedCategoriesArray[this.value];
                      }
                    }
                  },
                  series: [
                    {
                      // Standard deviation 2
                      type: 'areaspline',
                      color: '#E0E0E0', 
                      data: standardDeviation2Series
                    },
                    {
                      // Standard deviation 1
                      type: 'areaspline',
                      color: '#F8F8F8', 
                      data: standardDeviationSeries
                    },
                    {
                      // Current Year Data
                      type: 'spline',
                      color: '#d40000', 
                      data: seriesData
                    },
                  ]
                }, true);
            });

          });
        },

        getFireHistoryCounts: function() {

        const queryFor = this.currentISO ? this.currentISO : 'global';
        const numberOfBins = Config.colorRampFireHistory.length
        let data = [];
        const deferred = new Deferred();

        request.get(`${Config.fires_api_endpoint}admin/${queryFor}?aggregate_values=True&aggregate_by=year&fire_type=modis&period=2001-01-01,${moment().utcOffset('Asia/Jakarta').format("YYYY-MM-DD")}`, {
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
              type: 'bubble',
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
              },
              min: 1998,
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
        }, (err) => {
          document.getElementById('fireHistoryChartLoading').remove();
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
            if (districtLayerId === 0) {
              url = Config.firesLayer.global_viirs;
            } else if (districtLayerId === 21) {
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
            if (districtLayerId === 0) {
              url = Config.firesLayer.global_viirs;
            } else if (districtLayerId === 21) {
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

              if (queryConfig.tableId === 'pulpwood-fires-table' ||
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
                  }).reverse();

                  var concessionsFinalArray = [];

                  concessionsFinalArray = combineConcessionsArray.slice(0, 9);
                  // combineConcessionsArray.map(function (item, index) {
                  //   if (index > combineConcessionsArray.length - 10) {
                  //     concessionsFinalArray.push(item);
                  //   }
                  // });

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
              document.querySelector('#ConcessionRspoContainer').style.display = 'flex';
              return finaltable;
          }

          // if (configKey === "subDistrictQuery" && areaOfInterestType === "GLOBAL") {
          //   query.groupByFieldsForStatistics.push("NAME_1");
          // } else if (configKey === "subDistrictQuery" && areaOfInterestType !== "GLOBAL"){
          //   query.groupByFieldsForStatistics.push("ISLAND");
          // }


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
                      if (!adminLevelOneTwoArray[item.attributes.NAME_1]) {
                        adminLevelOneTwoArray[item.attributes.NAME_1] = item.attributes.NAME_ENGLISH;
                      }
                    } else {
                      adminLevelOneTwoArray[item.attributes.SUBDISTRIC] = item.attributes.ISLAND;
                    }
                  })
                });

                const uniqAreas = _.uniq(queryResultKeys);

                uniqAreas.forEach(function (key) {
                  let fireCount = 0;
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

                let sortCombinedResults = _.sortByOrder(combinedResults, function (element) {
                  return element.attributes.fire_count;
                }, 'desc');

                // Remove in case of nonexistent sub-district
                sortCombinedResults = $.grep(sortCombinedResults, function(item){
                  return item.attributes.SUBDISTRIC != " ";
                });

                Config.query_results[configKey] = sortCombinedResults;
                if (sortCombinedResults.length > 0) {
                  let queryConfigField;
                  if(window.reportOptions.aoitype === 'ISLAND') {
                    queryConfigField = queryConfig.UniqueValueField;
                  } else if(window.reportOptions.aoitype === 'ALL') {
                    queryConfigField = queryConfig.UniqueValueFieldAll;
                  } else {
                    queryConfigField = queryConfig.UniqueValueFieldGlobal;
                  }
                  if (queryConfigField) {
                    self.getRegion(configKey).then(function() {
                      var regmap = Config.regionmap[configKey];
                      arrayUtils.forEach(sortCombinedResults, function(feat) {
                        feat.attributes[window.reportOptions.aoitype] = regmap[feat.attributes[queryConfigField]];
                      });
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
            }, function() {
                deferred.resolve(false);
            });

            return deferred.promise;
        },

        queryForSumatraFires: function() {
          var deferred = new Deferred(),
              concessionData = [],
              self = this,
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

          failure = function() {
              deferred.resolve(false);
          };

          self.queryFireData({
              outFields: ["wdpa", "pulpwood", "palm_oil", "logging"],
          }, success, failure);

          return deferred.promise;
        },
        queryFireData: function(config, callback, errback) {
          var queryTask = new QueryTask(Config.queryUrl + "/" + Config.confidenceFireId),
              query = new Query(),
              time = new Date(),
              self = this;

          // Make Time Relative to Last Week
          time = new Date(time.getFullYear(), time.getMonth(), time.getDate() - 8);

          dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate()) + " " +
              time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
          const layerdef = self.get_layer_definition('queryFireData');
          query.where = (config.where === undefined) ? layerdef : layerdef + " AND " + config.where;

          query.returnGeometry = config.returnGeometry || false;
          query.outFields = config.outFields || ["*"];
          queryTask.execute(query, callback, errback);
        },
        queryForDailyFireData: function(areaOfInterestType) {
            var deferred = new Deferred(),
                query = new Query(),
                fireDataLabels = [],
                fireData = [],
                self = this;

            if (areaOfInterestType === 'GLOBAL' || areaOfInterestType === 'ALL') {
                queryForFiresCount();
            } else {
              var queryEndpointsIds = ['fire_id_island_viirs', 'fire_id_island_modis'];
              $('.fire-alert-count__year').text('2013');
              queryEndpointsIds.forEach(function (fireCountLayer) {
                queryTask = new QueryTask(queryURL = Config.queryUrl + "/" + Config.firesLayer[fireCountLayer]);
                queryForFiresCount();
              });
            }

            function queryForFiresCount() {
              // This query gets both our totalFireAlerts count for the Header & the daily fire alerts counts for the MODIS fire alerts chart

                const queryFor = self.currentISO ? self.currentISO : 'global';

                let fireAlertCountUrl;

                if (window.reportOptions.aoiId) {
                  fireAlertCountUrl = `${Config.fires_api_endpoint}admin/${queryFor}/${window.reportOptions.aoiId}?aggregate_values=True&aggregate_by=day&fire_type=modis&period=2001-01-01,${moment().utcOffset('Asia/Jakarta').format("YYYY-MM-DD")}`;
                } else {
                  fireAlertCountUrl = `${Config.fires_api_endpoint}admin/${queryFor}?aggregate_values=True&aggregate_by=day&fire_type=modis&period=2001-01-01,${moment().utcOffset('Asia/Jakarta').format("YYYY-MM-DD")}`;
                }

                request.get(fireAlertCountUrl, {
                  handleAs: 'json'
                }).then((res) => {
                  const allData = res.data.attributes.value;

                  // sort the data
                  const sortCombinedResults = _.sortByOrder(allData, function (element) {
                    return element.day;
                  }, 'asc');

                  let total = 0;

                  const dates = [];
                  const tmpFireAlerts = {};

                  for (let j = 0; j < sortCombinedResults.length; j++) {
                    const data = sortCombinedResults[j];
                    total += data.alerts;
                    if (dates.indexOf(data.day) > 0) {
                      tmpFireAlerts[data.day] += data.alerts;
                    } else {
                      dates.push(data.day);
                      tmpFireAlerts[data.day] = data.alerts;
                    }
                  }

                  createFigure(_.values(tmpFireAlerts), dates);
                }, (err) => {
                  document.getElementById('firesLineChartLoading').remove();
                });

                let totalFireAlertsUrl;

                if (window.reportOptions.aoiId) {
                  totalFireAlertsUrl = Config.fires_api_endpoint + 'admin/' + queryFor + '/' + window.reportOptions.aoiId + '?period=' + self.startDateRaw + ',' + self.endDateRaw;
                } else {
                  totalFireAlertsUrl = Config.fires_api_endpoint + 'admin/' + queryFor + '?period=' + self.startDateRaw + ',' + self.endDateRaw;
                }

                request.get(totalFireAlertsUrl, {
                  handleAs: 'json'
                }).then((res) => {
                  const total = res.data.attributes.value[0].alerts;
                  $("#totalFireAlerts").html(self.numberWithCommas(total));
                });


              function createFigure(fireData, fireDataLabels) {
                $("#totalFiresLabel").show()

                $('#fire-line-chart').highcharts({
                    chart: {
                      zoomType: 'x',
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
                deferred.resolve(true);
                return deferred.promise;
              }
            }
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

          let hasData = true;

          config.data.forEach((value) => {
            if (value.y < 1) {
              hasData = false;
            } else {
              hasData = true;
            }
          });

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
              exporting: !hasData ? false : {
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
              series: !hasData ? [] : [{
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
          }, function(chart) { // on complete
            if (!hasData) {
              chart.renderer.text('No Fires', 275, 120)
                .attr({
                  class: 'no-data-pie'
                })
                .css({
                  color: '#FF0000'
                }).add();
            }
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
                      if ((field === "GLOBAL" || field === 'ALL') && queryConfigTableId === "subdistrict-fires-table") {
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
        numberWithCommas: function(x) {
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    };
});
