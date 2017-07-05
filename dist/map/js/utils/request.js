define(['exports', 'js/config', 'esri/SpatialReference', 'esri/geometry/webMercatorUtils', 'dojo/promise/all', 'helpers/Symbols', 'esri/tasks/QueryTask', 'esri/request', 'esri/tasks/IdentifyTask', 'esri/tasks/IdentifyParameters', 'esri/tasks/query', 'dojo/Deferred', 'utils/AppUtils', 'esri/layers/FeatureLayer', 'js/constants'], function (exports, _config, _SpatialReference, _webMercatorUtils, _all, _Symbols, _QueryTask, _request, _IdentifyTask, _IdentifyParameters, _query, _Deferred, _AppUtils, _FeatureLayer, _constants) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _SpatialReference2 = _interopRequireDefault(_SpatialReference);

  var _webMercatorUtils2 = _interopRequireDefault(_webMercatorUtils);

  var _all2 = _interopRequireDefault(_all);

  var _Symbols2 = _interopRequireDefault(_Symbols);

  var _QueryTask2 = _interopRequireDefault(_QueryTask);

  var _request2 = _interopRequireDefault(_request);

  var _IdentifyTask2 = _interopRequireDefault(_IdentifyTask);

  var _IdentifyParameters2 = _interopRequireDefault(_IdentifyParameters);

  var _query2 = _interopRequireDefault(_query);

  var _Deferred2 = _interopRequireDefault(_Deferred);

  var _AppUtils2 = _interopRequireDefault(_AppUtils);

  var _FeatureLayer2 = _interopRequireDefault(_FeatureLayer);

  var _constants2 = _interopRequireDefault(_constants);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var request = {

    /**
    * @param {string} url - Url for an esri map service
    * @param {array} layerIds - An array of layer ids
    * @return {Deferred} deferred - A promise, will return either an array of layerInfos or an empty array
    */
    getLegendInfos: function getLegendInfos(url, layerIds) {
      app.debug('Request >>> getLegendInfos');
      var deferred = new _Deferred2.default();

      (0, _request2.default)({
        url: url + '/legend',
        handleAs: 'json',
        callbackParamName: 'callback',
        content: { f: 'json' }
      }).then(function (res) {
        if (res && res.layers && res.layers.length > 0) {
          var layers = res.layers.filter(function (layer) {
            return layerIds.indexOf(layer.layerId) > -1;
          });
          var legendInfos = layers.length === 1 ? layers[0].legend : layers.map(function (layer) {
            return layer.legend;
          });
          deferred.resolve(legendInfos || []);
        }
      }, function (err) {
        console.error(err);
        deferred.resolve([]);
      });

      return deferred;
    },

    getFeatureGeometry: function getFeatureGeometry(url, objectId) {
      app.debug('Request >>> getLegendInfos');
      var qDeferred = new _Deferred2.default();

      var queryTask = new _QueryTask2.default(url);
      var query = new _query2.default();
      query.where = 'OBJECTID = ' + objectId;
      query.returnGeometry = true;
      query.outFields = ['name'];
      queryTask.execute(query).then(function (results) {

        qDeferred.resolve(results);
      }, function (err) {
        console.error(err);
        qDeferred.resolve(false);
        return;
      });
      return qDeferred.promise;
    },

    getBoundingBoxes: function getBoundingBoxes() {
      app.debug('Request >>> getBoundingBoxes');
      var deferred = new _Deferred2.default();
      var dgBoxes = app.map.getLayer(_constants2.default.boundingBoxes);
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.digitalGlobe);
      var dgMoment = '';
      var extents = {};
      var moment_arr = [];

      // if (app.alreadyHaveBBs) { //todo
      //   deferred.resolve();
      // };

      var layers = config.imageServices.map(function (service) {
        var queryTask = new _QueryTask2.default(service.url);
        var qdef = new _Deferred2.default();
        var query = new _query2.default();
        var footprints = [];

        query.outFields = ['OBJECTID', 'Name', 'AcquisitionDate', 'SensorName']; //, 'Date','Tiles'];
        query.where = 'Category = 1';
        query.returnGeometry = true;

        (function (serviceConfig) {
          queryTask.execute(query, function (res) {

            // app.alreadyHaveBBs = true; //todo
            res.features.forEach(function (feature) {
              feature.setSymbol(_Symbols2.default.getBBSymbol());

              feature.attributes.Layer = 'Digital_Globe';
              feature.attributes.LayerId = serviceConfig.id;

              dgMoment = window.Kalendae.moment(feature.attributes.AcquisitionDate);

              moment_arr.push(dgMoment);
              feature.attributes.moment = dgMoment;

              dgBoxes.add(feature);
              footprints.push(feature);
              extents[feature.attributes.Tiles] = _webMercatorUtils2.default.geographicToWebMercator(feature.geometry).getExtent();
            });
            qdef.resolve(true);
            dgBoxes.show();
          }, function (err) {
            console.error(err);
            qdef.resolve(true);
            return;
          });
        })(service);

        return qdef.promise;
      });
      (0, _all2.default)(layers).then(function () {
        deferred.resolve(true);
      });

      return deferred.promise;
    },

    upload: function upload(url, content, form) {
      return (0, _request2.default)({
        url: url,
        form: form,
        content: content,
        handleAs: 'json'
      });
    },


    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyActive: function identifyActive(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.activeFires);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.activeFires,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    identifyModisArchive: function identifyModisArchive(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.modisArchive);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.modisArchive);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.modisArchive,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },
    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyViirs: function identifyViirs(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.viirsFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.viirsFires);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.viirsFires,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    identifyViirsArchive: function identifyViirsArchive(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.viirsArchive);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.viirsArchive);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.viirsArchive,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyOilPalm: function identifyOilPalm(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.oilPalm);
      var firesConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.oilPalm);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          var queries = features.map(function (feature) {
            var qDeferred = new _Deferred2.default();
            var queryTask = new _QueryTask2.default(firesConfig.url + firesConfig.layerIds[0]);
            var query = new _query2.default();
            query.geometry = feature.feature.geometry;
            var queryString = _AppUtils2.default.generateFiresQuery(7);
            query.where = queryString;
            query.outFields = ['ACQ_DATE'];
            queryTask.execute(query).then(function (results) {
              feature.fires = results.features;

              setTimeout(function () {
                qDeferred.resolve(false);
              }, 3000);
              qDeferred.resolve(feature);
            });
            return qDeferred;
          });
          (0, _all2.default)(queries).then(function (qResults) {
            deferred.resolve({
              layer: _constants2.default.oilPalm,
              features: qResults
            });
          });
          // deferred.resolve({
          //   layer: KEYS.oilPalm,
          //   features: features
          // });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyRSPOOilPalm: function identifyRSPOOilPalm(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.rspoOilPalm);
      var firesConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.rspoOilPalm);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          var queries = features.map(function (feature) {
            var qDeferred = new _Deferred2.default();
            var queryTask = new _QueryTask2.default(firesConfig.url + firesConfig.layerIds[0]);
            var query = new _query2.default();
            query.geometry = feature.feature.geometry;
            var queryString = _AppUtils2.default.generateFiresQuery(7);
            query.where = queryString;
            query.outFields = ['ACQ_DATE'];
            queryTask.execute(query).then(function (results) {
              feature.fires = results.features;

              setTimeout(function () {
                qDeferred.resolve(false);
              }, 3000);
              qDeferred.resolve(feature);
            });
            return qDeferred;
          });
          (0, _all2.default)(queries).then(function (qResults) {
            deferred.resolve({
              layer: _constants2.default.rspoOilPalm,
              features: qResults
            });
          });
          // deferred.resolve({
          //   layer: KEYS.rspoOilPalm,
          //   features: features
          // });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyWoodFiber: function identifyWoodFiber(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.woodFiber);
      var firesConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var viirsConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.viirsFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.woodFiber);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          var queries = features.map(function (feature) {
            var qDeferred = new _Deferred2.default();
            var queryTask = new _QueryTask2.default(firesConfig.url + firesConfig.layerIds[0]);
            var viirsQueryTask = new _QueryTask2.default(viirsConfig.url + viirsConfig.layerIds[0]);
            var query = new _query2.default();
            var viirsQuery = new _query2.default();
            query.geometry = feature.feature.geometry;
            viirsQuery.geometry = feature.feature.geometry;
            var queryString = _AppUtils2.default.generateFiresQuery(7);
            var viirsQueryString = _AppUtils2.default.generateViirsQuery(7);
            query.where = queryString;
            query.outFields = ['ACQ_DATE'];
            viirsQuery.where = viirsQueryString;
            viirsQuery.outFields = ['ACQ_DATE'];
            var deferreds = [];
            deferreds.push(queryTask.execute(query));
            deferreds.push(viirsQueryTask.execute(viirsQuery));
            (0, _all2.default)(deferreds).then(function (results) {
              if (results[0].features && results[1].features) {
                feature.fires = results[0].features.concat(results[1].features);
              } else if (results[0].features) {
                feature.fires = results[0].features;
              } else if (results[1].features) {
                feature.fires = results[1].features;
              }
              setTimeout(function () {
                qDeferred.resolve(false);
              }, 3000);
              qDeferred.resolve(feature);
            });

            return qDeferred;
          });
          (0, _all2.default)(queries).then(function (qResults) {
            deferred.resolve({
              layer: _constants2.default.woodFiber,
              features: qResults
            });
          });
          // deferred.resolve({
          //   layer: KEYS.woodFiber,
          //   features: features
          // });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyLoggingConcessions: function identifyLoggingConcessions(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.loggingConcessions);
      var firesConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.loggingConcessions);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          var queries = features.map(function (feature) {
            var qDeferred = new _Deferred2.default();
            var queryTask = new _QueryTask2.default(firesConfig.url + firesConfig.layerIds[0]);
            var query = new _query2.default();
            query.geometry = feature.feature.geometry;
            var queryString = _AppUtils2.default.generateFiresQuery(7);
            query.where = queryString;
            query.outFields = ['ACQ_DATE'];
            queryTask.execute(query).then(function (results) {
              feature.fires = results.features;

              setTimeout(function () {
                qDeferred.resolve(false);
              }, 3000);
              qDeferred.resolve(feature);
            });
            return qDeferred;
          });
          (0, _all2.default)(queries).then(function (qResults) {
            deferred.resolve({
              layer: _constants2.default.loggingConcessions,
              features: qResults
            });
          });
          // deferred.resolve({
          //   layer: KEYS.loggingConcessions,
          //   features: features
          // });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyoilPalmGreenpeace: function identifyoilPalmGreenpeace(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.oilPalmGreenpeace);
      var firesConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.oilPalmGreenpeace);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          var queries = features.map(function (feature) {
            var qDeferred = new _Deferred2.default();
            var queryTask = new _QueryTask2.default(firesConfig.url + firesConfig.layerIds[0]);
            var query = new _query2.default();
            query.geometry = feature.feature.geometry;
            var queryString = _AppUtils2.default.generateFiresQuery(7);
            query.where = queryString;
            query.outFields = ['ACQ_DATE'];
            queryTask.execute(query).then(function (results) {
              feature.fires = results.features;

              setTimeout(function () {
                qDeferred.resolve(false);
              }, 3000);
              qDeferred.resolve(feature);
            });
            return qDeferred;
          });
          (0, _all2.default)(queries).then(function (qResults) {
            deferred.resolve({
              layer: _constants2.default.oilPalmGreenpeace,
              features: qResults
            });
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyWoodFiberGreenpeace: function identifyWoodFiberGreenpeace(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.woodFiberGreenpeace);
      var firesConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.woodFiberGreenpeace);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          var queries = features.map(function (feature) {
            var qDeferred = new _Deferred2.default();
            var queryTask = new _QueryTask2.default(firesConfig.url + firesConfig.layerIds[0]);
            var query = new _query2.default();
            query.geometry = feature.feature.geometry;
            var queryString = _AppUtils2.default.generateFiresQuery(7);
            query.where = queryString;
            query.outFields = ['ACQ_DATE'];
            queryTask.execute(query).then(function (results) {
              feature.fires = results.features;

              setTimeout(function () {
                qDeferred.resolve(false);
              }, 3000);
              qDeferred.resolve(feature);
            });
            return qDeferred;
          });
          (0, _all2.default)(queries).then(function (qResults) {
            deferred.resolve({
              layer: _constants2.default.woodFiberGreenpeace,
              features: qResults
            });
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyLoggingGreenpeace: function identifyLoggingGreenpeace(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.loggingGreenpeace);
      var firesConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.loggingGreenpeace);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          var queries = features.map(function (feature) {
            var qDeferred = new _Deferred2.default();
            var queryTask = new _QueryTask2.default(firesConfig.url + firesConfig.layerIds[0]);
            var query = new _query2.default();
            query.geometry = feature.feature.geometry;
            var queryString = _AppUtils2.default.generateFiresQuery(7);
            query.where = queryString;
            query.outFields = ['ACQ_DATE'];
            queryTask.execute(query).then(function (results) {
              feature.fires = results.features;

              setTimeout(function () {
                qDeferred.resolve(false);
              }, 3000);
              qDeferred.resolve(feature);
            });
            return qDeferred;
          });
          (0, _all2.default)(queries).then(function (qResults) {
            deferred.resolve({
              layer: _constants2.default.loggingGreenpeace,
              features: qResults
            });
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyCoalConcessions: function identifyCoalConcessions(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.coalConcessions);
      var firesConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.coalConcessions);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          var queries = features.map(function (feature) {
            var qDeferred = new _Deferred2.default();
            var queryTask = new _QueryTask2.default(firesConfig.url + firesConfig.layerIds[0]);
            var query = new _query2.default();
            query.geometry = feature.feature.geometry;
            var queryString = _AppUtils2.default.generateFiresQuery(7);
            query.where = queryString;
            query.outFields = ['ACQ_DATE'];
            queryTask.execute(query).then(function (results) {
              feature.fires = results.features;

              setTimeout(function () {
                qDeferred.resolve(false);
              }, 3000);
              qDeferred.resolve(feature);
            });
            return qDeferred;
          });
          (0, _all2.default)(queries).then(function (qResults) {
            deferred.resolve({
              layer: _constants2.default.coalConcessions,
              features: qResults
            });
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyProtectedAreas: function identifyProtectedAreas(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.protectedAreasHelper);
      var firesConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.activeFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.protectedAreasHelper);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          var queries = features.map(function (feature) {
            var qDeferred = new _Deferred2.default();
            var queryTask = new _QueryTask2.default(firesConfig.url + firesConfig.layerIds[0]);
            var query = new _query2.default();
            query.geometry = feature.feature.geometry;
            var queryString = _AppUtils2.default.generateFiresQuery(7);
            query.where = queryString;
            query.outFields = ['ACQ_DATE'];
            queryTask.execute(query).then(function (results) {
              feature.fires = results.features;

              setTimeout(function () {
                qDeferred.resolve(false);
              }, 3000);
              qDeferred.resolve(feature);
            });
            return qDeferred;
          });
          (0, _all2.default)(queries).then(function (qResults) {
            deferred.resolve({
              layer: _constants2.default.protectedAreasHelper,
              features: qResults
            });
          });
          // deferred.resolve({
          //   layer: KEYS.protectedAreas,
          //   features: features
          // });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyFireStories: function identifyFireStories(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.fireStories);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.fireStories,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyOverlays: function identifyOverlays(mapPoint, layers) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.overlays);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      // params.layerIds = config.layerIds;
      params.layerIds = layers;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.overlays,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyTwitter: function identifyTwitter(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.twitter);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.twitter,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyArchive: function identifyArchive(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.archiveFires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.archiveFires);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.archiveFires,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyNoaa: function identifyNoaa(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.noaa18Fires);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();
      var layer = app.map.getLayer(_constants2.default.noaa18Fires);
      var layerDefinitions = [];
      layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerDefinitions = layerDefinitions;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.noaa18Fires,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyBurn: function identifyBurn(mapPoint) {
      var deferred = new _Deferred2.default();
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.burnScars);
      var identifyTask = new _IdentifyTask2.default(config.url);
      var params = new _IdentifyParameters2.default();

      params.tolerance = 10;
      params.returnGeometry = true;
      params.width = app.map.width;
      params.height = app.map.height;
      params.geometry = mapPoint;
      params.mapExtent = app.map.extent;
      params.layerIds = config.layerIds;
      params.layerOption = _IdentifyParameters2.default.LAYER_OPTION_VISIBLE;

      identifyTask.execute(params, function (features) {
        if (features.length > 0) {
          deferred.resolve({
            layer: _constants2.default.burnScars,
            features: features
          });
        } else {
          deferred.resolve(false);
        }
      }, function (error) {
        console.log(error);
        deferred.resolve(false);
      });

      return deferred.promise;
    },

    /**
    * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
    * @return {Deferred} deferred
    */
    identifyDigitalGlobe: function identifyDigitalGlobe(graphic, mapPoint) {
      var featureExtent = graphic.geometry.getExtent();
      var overlaps = [];

      for (var i = 0; i < graphic._layer.graphics.length; i++) {
        var tempExtent = graphic._layer.graphics[i].geometry.getExtent();

        //if the graphic clicked touches any other graphic, show those as well
        // if (featureExtent.intersects(tempExtent)) {
        //   overlaps.push(graphic._layer.graphics[i]);
        // }

        //if the mapPoint is within the footprint - show
        if (tempExtent.contains(mapPoint)) {
          overlaps.push(graphic._layer.graphics[i]);
        }
      }

      return {
        layer: _constants2.default.boundingBoxes,
        features: overlaps
      };
    }

  };

  exports.default = request;
});