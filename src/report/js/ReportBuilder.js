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
      let countryTotal = []; // countryTotal
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
              console.log(values);
            } else {
              values = responses[0].data.attributes.value;
              console.log(values)
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

            console.log(backupValues);
              if (window.reportOptions.aoiId) { // aoiIds are only when viewing a country report with a single subregion selected.
                debugger;
                countryTotalWith1Subregion;
                debugger;
                specificCountryData = backupValues[0];
                specificSubregionData = values; // place the specific subregion's historical data in a global object. 
                
                let regionDataByYear = []; // This array will contain 1 index for each subregion in the country. Each of these arrays will contain all historical fires data grouped by year.
                const yearsToAdd = currentYear - 2001;
                for (let i = 0; i <= yearsToAdd; i++) {
                  const currentYearColor = i === yearsToAdd ? '#d40000' : '#e0e0df';
                  const regionYearObject = {};
                  regionYearObject['color'] = '#e0e0df';
                  regionYearObject['data'] = [];
                  regionYearObject['lineWidth'] = 1;
                  regionYearObject['year'] = 2001 + i;
                  regionDataByYear.push(regionYearObject)
                }
                values.forEach((monthOfData) => {
                  for (let x = 0; x < regionDataByYear.length; x++) {
                    if (regionDataByYear[x].year === monthOfData.year) {
                      if (monthOfData.month === 12) {
                        regionDataByYear[x].data.push({'y': monthOfData.alerts, 'dataLabels': { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } });
                      } else if (monthOfData.year === currentYear && monthOfData.month === currentMonth) {
                        regionDataByYear[x].data.push({'y': monthOfData.alerts, 'dataLabels': { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } });
                      } else {
                        regionDataByYear[x].data.push(monthOfData.alerts);
                      }
                    }
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

                    historicalDataForSelectedRegion.push(regionYearObject);
                  }
                })

                backupValues[0].forEach(monthOfData => {
                  let itemToPush;
                  if (monthOfData.year === currentYear && monthOfData.month === currentMonth) { // if it's the last month of the current year...
                    itemToPush = { y: monthOfData.alerts, dataLabels: { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } }
                  } else {
                    itemToPush = (monthOfData.month) === 12 ? // The last index of each data array needs to be an object containing the alerts and a dataLabels object for Highcharts.
                    {y: monthOfData.alerts, dataLabels: { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } } :
                    monthOfData.alerts;
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
                      data: [monthOfData.alerts]
                    };
                  }
                })
                historicalDataForSelectedRegion[historicalDataForSelectedRegion.length - 1].color = '#d40000';  
                countryTotalWith1Subregion = historicalDataForSelectedRegion // assign country data to a global object
                aoiDataSpecificRegion = historicalDataForSelectedRegion;

                series = countryTotalWith1Subregion; // assign country data on load.

                // firesCount total on load
                countryTotalWith1Subregion[countryTotalWith1Subregion.length - 1].data.forEach(month => {
                  if (typeof month === 'number'){
                    firesCount += month
                  } else {
                    firesCount += month.y;
                  }
                })
              } else if (window.reportOptions.country === 'ALL') { // , or a Global Report
                console.log('hi');
                let historicalDataForSelectedRegion = []; // This array will contain 1 index for each subregion in the country. Each of these arrays will contain all historical fires data grouped by year.

                /********************** NOTE **********************
                 * backupValues[0] contains 1 index per month, for each year since 2001, for each subregion in the selected country.
                 * Each backupValue contains an adm1 number which corresponds with a subregion Id. We iterate over each backupValue and update our historicalData array with each subregion's information.
                 * Because each subregion contains 12 months of data, we only need to make 1 placeholder object on every 12th iteration. 
                **************************************************/
                values.forEach((monthOfData, i) => {
                  console.log(monthOfData);
                  const currentYearColor = monthOfData.year === currentYear ? '#d40000' : '#e0e0df';
                  if (i % 12 === 0) {
                    const regionYearObject = {};
                    regionYearObject['color'] = currentYearColor;
                    regionYearObject['data'] = [];
                    regionYearObject['lineWidth'] = 1;
                    regionYearObject['year'] = monthOfData.year;
                    historicalDataForSelectedRegion.push(regionYearObject);
                  }
                })
                console.log('historicalDataForSelectedRegion', historicalDataForSelectedRegion);

                values.forEach(monthOfData => {
                  const itemToPush = monthOfData.month === 12 ? // The last index of each data array needs to be an object containing the alerts and a dataLabels object for Highcharts.
                  {'y': monthOfData.alerts, 'dataLabels': { align: "left", crop: false, enabled: true, format: "{series.name}", overflow: true, verticalAlign: "middle", x: 0 } } : monthOfData.alerts;
                  const yearIndex = monthOfData.year - 2001;
                  const countryIndex = historicalDataForSelectedRegion.map(x => x.year).indexOf(monthOfData.year);
                  if (countryIndex !== -1) {
                    historicalDataForSelectedRegion[countryIndex].data.push(itemToPush)
                  } else { // This serves as a check to ensure that all current year data is included in our historicalData array. 
                    historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex] = {
                      color: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].color,
                      lineWidth: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].lineWidth,
                      year: historicalDataForSelectedRegion[monthOfData.adm1 - 1][countryIndex][yearIndex - 1].year + 1,
                      data: [monthOfData.alerts]
                    };
                  }
                })
                console.log('historicalDataForSelectedRegion', historicalDataForSelectedRegion);
                // assign series on load
                series = historicalDataForSelectedRegion;

                // firesCount total on load
                historicalDataForSelectedRegion[historicalDataForSelectedRegion.length - 1].data.forEach(month => {
                  if (typeof month === 'number'){
                    firesCount += month
                  } else {
                    firesCount += month.y;
                  }
                })
                console.log(firesCount);
              } else { // Otherwise, we are dealing with a single country with all of its subregions
                /********************** NOTE **********************
                 * values contains 1 point for each month of the country's history since 2001.
                 * backupValues[0] contains 1 index per month, for each year since 2001, for each subregion in the selected country.
                 * Each backupValue contains an adm1 number which corresponds with a subregion Id. We iterate over each backupValue and update our historicalData array with each subregion's information.
                 * Because each subregion contains 12 months of data, we only need to make 1 placeholder object on every 12th iteration. 
                **************************************************/

                console.log('single country with all of its subregions');
                let statesArray = []; // This array will contain 1 index for each subregion in the country. Each of these indexes will be an array containining all historical fires data grouped by year.

                window.reportOptions.stateObjects.forEach(state => { // A listing of substatess is available on the window object. We iterate over this and create a placerholder object for each substates.
                  const object = {};
                  object[state.name_1] = [];
                  statesArray.push(object);
                });
                
                const stateNames = window.reportOptions.stateObjects.map(x => x.name_1);
                console.log(stateNames);
                console.log(statesArray); // placeholders for 51 states
                // each region needs to have an array of object taken from the backupValues[0]

                let yearCounter = 2001;
                let currentState = 0;
                backupValues[0].forEach((monthData, i) => {
                  if (monthData.year === currentYear && monthData.month === currentMonth) {
                    const yearObject = {
                      year: yearCounter,
                      data: [],
                      color: '#e0e0df',
                      lineWidth: 1
                    };
                    statesArray[monthData.adm1 - 1][stateNames[monthData.adm1 - 1]].push(yearObject); // works!
                  } else if (monthData.month === 12) {
                      const yearObject = {
                        year: yearCounter,
                        data: [],
                        color: '#e0e0df',
                        lineWidth: 1
                      };
                      statesArray[monthData.adm1 - 1][stateNames[monthData.adm1 - 1]].push(yearObject); // works!
                      yearCounter++;
                  } else if(currentState !== monthData.adm1) {
                    yearCounter = 2001;
                  }
                  currentState = monthData.adm1;
                });


                console.log(statesArray); // placeholders for all states
                backupValues[0].forEach((monthData, i) => {
                  if (i < 10) {
                    console.log(monthData);
                    console.log(statesArray[monthData.adm1 - 1][stateNames[monthData.adm1 - 1]][monthData.year - 2001].data);
                  }

                  if (monthData.month === 12 || (monthData.month === currentMonth & monthData.year === currentYear)) {
                    const object = {// december OR the last month of the current year has an object.
                      y: monthData.alerts, 
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
                    statesArray[monthData.adm1 - 1][stateNames[monthData.adm1 - 1]][monthData.year - 2001].data.push(monthData.alerts);
                  }
                });


                console.log(statesArray); // placeholders for all states
                console.log(values);


                countryTotalWithAllSubregions = statesArray; // store all state data on global variable
                // Massage the data frm values
                values.forEach(monthOfData => {
                  console.log(monthOfData);
                  if (monthOfData.month === 12) {
                    const yearObject = {
                      year: monthOfData.year,
                      data: [],
                      color: '#d40000',
                      lineWidth: 1
                    };
                    countryTotal.push(yearObject);
                  } else if (monthOfData.month === currentMonth && monthOfData.year === currentYear) {
                    const yearObject = {
                      year: monthOfData.year,
                      data: [],
                      color: '#e0e0df',
                      lineWidth: 1
                    };
                    countryTotal.push(yearObject);
                  }
                })
                console.log(countryTotal); // get 1 year object on global variable

                // populate the data
                let placeholder = 0;
                values.forEach((monthOfData, i) => {
                  if (i % 11 === 0 && i !== 0) {
                    const object = {// december OR the last month of the current year has an object.
                      y: monthOfData.alerts, 
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
                    countryTotal[monthOfData.year - 2001].data.push(object);
                  } else {
                    countryTotal[monthOfData.year - 2001].data.push(monthOfData.alerts);
                  }
                })
                console.log(countryTotal);
                // assign series on load
                series = countryTotal;
                console.log(countryTotalWithAllSubregions);
                
                // firesCount total on load
                firesCount = 0;
                console.log('countryTotal[currentYear - 2001]', countryTotal[currentYear - 2001]);
                countryTotal[currentYear - 2001].data.forEach(month => {
                  console.log(month);
                    if (typeof month === 'number') {
                      firesCount += month;
                    } else {
                      firesCount += month.y;
                    }
                  })
                console.log(firesCount);
              }


            console.log('firesCount', firesCount);
            $('#firesCountTitle').html(
              `${currentYear} MODIS Fire Alerts, Year to Date
              <span class="total_firecounts">${firesCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>`
              );
              
            console.log('firesCount', firesCount);
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

            const selectedCountry = window.reportOptions['country'] ? window.reportOptions['country'] : 'Indonesia';

            // Create list of regions
            $('#firesCountIslandsListContainer h3').html("<p class=\"fires-count__label\">Region:</p> <strong> " + selectedCountry + " </strong>");
            if (window.reportOptions.aoiId) {
              $('#firesCountIslandsList').append("<li>" + window.reportOptions.aois.split("''").join("'") + "</li>");
              $('#firesCountIslandsList li').addClass('selected');
              $('#firesCountIslandsListContainer h3').removeClass('selected');
            } else if (window.reportOptions.stateObjects) {
              const allAois = window.reportOptions.stateObjects.map(stateObj => stateObj.name_1);
              allAois.forEach(aoiStr => {
                $('#firesCountIslandsList').append("<li>" + aoiStr + "</li>");
              });
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
            console.log('countryTotalWith1Subregion', countryTotalWith1Subregion);

             let updatedSeriesTotal = [] // Series of data to be given to Highcharts
             const countryData = newSeriesDataObj[selectedCountry] ? newSeriesDataObj[selectedCountry] : window.firesCountRegionSeries;
             let currentYearMonthlyCounts = []; // Contains monthly data for current year
             let totalRegion = 0; // Year-To-Date Total to be displayed in the subheader of the chart 
            console.log('countryData', countryData);
            console.log('window.firesCountRegionSeries', window.firesCountRegionSeries);
            if (window.reportOptions.country === 'ALL') { // If we're viewing a global report
              // We don't do anything
            } else if (window.reportOptions.country !== 'ALL' && window.reportOptions.aois) { // If we're viewing a report for a specific subregion in a specific country
               console.log(countryTotalWith1Subregion);
               updatedSeriesTotal = countryTotalWith1Subregion;
               
               // Updated firesCount total on click
               firesCount = 0;
               countryTotalWith1Subregion[countryTotalWith1Subregion.length - 1].data.forEach(month => {
                if (typeof month === 'number'){
                  firesCount += month
                } else {
                  firesCount += month.y;
                }
              })
              console.log(firesCount);
            } else if (window.reportOptions.country !== 'ALL' && window.reportOptions.aois === undefined) { // If we're viewing all subregions in a specific country
              // console.log(countryTotalWithAllSubregions);
              // console.log(countryTotal);
              // update series
              updatedSeriesTotal = countryTotal;

              // Updated firesCount total
              firesCount = 0;
              countryTotal[currentYear - 2001].data.forEach(month => firesCount += typeof month === 'number' ? month : month.y);
              console.log(firesCount);
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
             console.log('subregionTotal', subregionTotal);
             const selectedIslandOrRegion = $(this).text();
             let updatedSeriesTotal = [] // Series of data to be given to Highcharts
             const countryData = historicalDataByRegion;
             let currentYearMonthlyCounts = []; // Contains monthly data for current year
             let totalRegionFiresYTD = 0; // Year-To-Date Total to be displayed in the subheader of the chart 
            let updatedSeries = [] // Series of data to be given to Highcharts
            console.log(subregionDataINeed);
            
            if (window.reportOptions.country === 'ALL') { // If we're viewing a global report
              // we shouldn't have to do anything, because the data is the same for both the region and the aggregate.
            } else if (window.reportOptions.country !== 'ALL' && window.reportOptions.aois) { // If we're viewing a report for a specific subregion in a specific country
              updatedSeries = subregionTotal; // update Series
                
              // Updated firesCount total on click
              firesCount = 0;
              subregionTotal[subregionTotal.length - 1].data.forEach(month => {
                if (typeof month === 'number'){
                  firesCount += month
                } else {
                  firesCount += month.y;
                }
              })
            } else if (window.reportOptions !== 'ALL' && window.reportOptions.aois === undefined) { // If we're viewing all subregions in a specific country
              /********************** NOTE **********************
               * Calculate data and current year total for a report on a specific subregion in a country
               ***************************************************/
              let index; // Find the index on our global historicalDataByRegion object that matches our selected region
              for (let i = 0; i < historicalDataByRegion.length; i++) {
                if (Object.keys(historicalDataByRegion[i]).toString() === selectedIslandOrRegion) {
                  index = i;
                }
              }
              updatedSeries = historicalDataByRegion[index][selectedIslandOrRegion]; // update the series we pass to highcharts with the specific region's data
              updatedSeries[updatedSeries.length - 1].color = 'red';

              totalRegionFiresYTD = 0; // reset total ??? shouldn;'t be necessary
              if (historicalDataByRegion[index][selectedIslandOrRegion][historicalDataByRegion[index][selectedIslandOrRegion].length - 1].year === currentYear) {
                historicalDataByRegion[index][selectedIslandOrRegion][historicalDataByRegion[index][selectedIslandOrRegion].length - 1].data.forEach(x => {
                  totalRegionFiresYTD += typeof x === 'number' ? x : x.y; // Get the current year total depending on the index. The last index usually is an object, thus this check.
                });
              }
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
