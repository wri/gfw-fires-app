import { analysisConfig, layersConfig, errors, urls } from 'js/config';
import SpatialReference from 'esri/SpatialReference';
import webMercatorUtils from 'esri/geometry/webMercatorUtils';
import all from 'dojo/promise/all';
import Symbols from 'helpers/Symbols';
import QueryTask from 'esri/tasks/QueryTask';
import esriRequest from 'esri/request';
import IdentifyTask from 'esri/tasks/IdentifyTask';
import IdentifyParameters from 'esri/tasks/IdentifyParameters';
import Query from 'esri/tasks/query';
import Deferred from 'dojo/Deferred';
import utils from 'utils/AppUtils';
import FeatureLayer from 'esri/layers/FeatureLayer';
import KEYS from 'js/constants';

const request = {

  /**
  * @param {string} url - Url for an esri map service
  * @param {array} layerIds - An array of layer ids
  * @return {Deferred} deferred - A promise, will return either an array of layerInfos or an empty array
  */
  getLegendInfos: (url, layerIds) => {
    app.debug('Request >>> getLegendInfos');
    let deferred = new Deferred();

    esriRequest({
      url: `${url}/legend`,
      handleAs: 'json',
      callbackParamName: 'callback',
      content: { f: 'json' }
    }).then(res => {
      if (res && res.layers && res.layers.length > 0) {
        let layers = res.layers.filter(layer => layerIds.indexOf(layer.layerId) > -1);
        let legendInfos = layers.length === 1 ? layers[0].legend : layers.map(layer => layer.legend);
        deferred.resolve(legendInfos || []);
      }
    }, err => {
      console.error(err);
      deferred.resolve([]);
    });

    return deferred;
  },

  getFeatureGeometry: (url, objectId) => {
    app.debug('Request >>> getLegendInfos');
    let qDeferred = new Deferred();

    let queryTask = new QueryTask(url);
    let query = new Query();
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

  getBoundingBoxes: () => {
    app.debug('Request >>> getBoundingBoxes');
    let deferred = new Deferred();
    let dgBoxes = app.map.getLayer(KEYS.boundingBoxes);
    let config = utils.getObject(layersConfig, 'id', KEYS.digitalGlobe);
    let dgMoment = '';
    let extents = {};
    let moment_arr = [];

    // if (app.alreadyHaveBBs) { //todo
    //   deferred.resolve();
    // };

    let layers = config.imageServices.map(function (service) {
      let queryTask = new QueryTask(service.url);
      let qdef = new Deferred();
      let query = new Query();
      let footprints = [];

      query.outFields = ['OBJECTID', 'Name', 'AcquisitionDate', 'SensorName']; //, 'Date','Tiles'];
      query.where = 'Category = 1';
      query.returnGeometry = true;

      (function (serviceConfig) {
        queryTask.execute(query, function (res) {

          // app.alreadyHaveBBs = true; //todo
          res.features.forEach(feature => {
            feature.setSymbol(Symbols.getBBSymbol());

            feature.attributes.Layer = 'Digital_Globe';
            feature.attributes.LayerId = serviceConfig.id;

            dgMoment = window.Kalendae.moment(feature.attributes.AcquisitionDate);

            moment_arr.push(dgMoment);
            feature.attributes.moment = dgMoment;

            dgBoxes.add(feature);
            footprints.push(feature);
            extents[feature.attributes.Tiles] = webMercatorUtils.geographicToWebMercator(feature.geometry).getExtent();

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
    all(layers).then(function () {
      deferred.resolve(true);
    });

    return deferred.promise;
  },

  /**
  * @param {string} url - Portal URL for the generate features service
  * @param {object} content - payload for the request
  * @param {DOM} form - form containing an input with files attached to it
  * @return {promise}
  */
  upload(url, content, form) {
    return esriRequest({
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
  identifyActive: mapPoint => {
    let deferred = new Deferred();
    let layer = app.map.getLayer(KEYS.activeFires);
    let identifyTask = new IdentifyTask(layer.url);
    let params = new IdentifyParameters();
    let layerDefinitions = [];
    layerDefinitions[layer.visibleLayers[0]] = layer.layerDefinitions[layer.visibleLayers[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = layer.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.activeFires,
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
  identifyViirs: mapPoint => {
    let deferred = new Deferred();
    let layer = app.map.getLayer(KEYS.viirsFires);
    let identifyTask = new IdentifyTask(layer.url);
    let params = new IdentifyParameters();
    let layerDefinitions = [];
    layerDefinitions[layer.visibleLayers[0]] = layer.layerDefinitions[layer.visibleLayers[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = layer.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.viirsFires,
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
  identifyOilPalm: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.oilPalm);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    const viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.oilPalm);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.oilPalm,
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
  identifyRSPOOilPalm: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.rspoOilPalm);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    const viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.rspoOilPalm);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.rspoOilPalm,
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
  identifyWoodFiber: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.woodFiber);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    let viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.woodFiber);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.woodFiber,
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
  identifyLogging: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.gfwLogging);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    let viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.gfwLogging);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + '/' + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + '/' + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
            console.log('feature.fires', feature.fires);
            qDeferred.resolve(feature);
          });

          return qDeferred;
        });
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.gfwLogging,
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
  identifyLoggingConcessions: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.loggingConcessions);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    let viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.loggingConcessions);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.loggingConcessions,
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
  identifyoilPalmGreenpeace: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.oilPalmGreenpeace);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    const viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.oilPalmGreenpeace);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.oilPalmGreenpeace,
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
  identifyWoodFiberGreenpeace: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.woodFiberGreenpeace);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    const viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.woodFiberGreenpeace);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.woodFiberGreenpeace,
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
  identifyLoggingGreenpeace: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.loggingGreenpeace);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    const viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.loggingGreenpeace);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.loggingGreenpeace,
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
  identifyCoalConcessions: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.coalConcessions);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    const viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.coalConcessions);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + '/' + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + '/' + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.coalConcessions,
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
  identifyProtectedAreas: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.protectedAreasHelper);
    let firesConfig = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    const viirsConfig = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.protectedAreasHelper);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        let queries = features.map(function (feature) {
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let viirsQueryTask = new QueryTask(viirsConfig.url + viirsConfig.layerIds[0]);
          let query = new Query();
          let viirsQuery = new Query();
          query.geometry = feature.feature.geometry;
          viirsQuery.geometry = feature.feature.geometry;
          const queryString = utils.generateFiresQuery(7);
          const viirsQueryString = utils.generateViirsQuery(7);
          query.where = queryString;
          query.outFields = ['ACQ_DATE'];
          viirsQuery.where = viirsQueryString;
          viirsQuery.outFields = ['ACQ_DATE'];
          const deferreds = [];
          deferreds.push(queryTask.execute(query));
          deferreds.push(viirsQueryTask.execute(viirsQuery));
          all(deferreds).then(results => {
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
        all(queries).then(function (qResults) {
          deferred.resolve({
            layer: KEYS.protectedAreasHelper,
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
  identifyFireStories: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.fireStories);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.fireStories,
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
  identifyOverlays: (mapPoint, layers) => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.overlays);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    // params.layerIds = config.layerIds;
    params.layerIds = layers;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.overlays,
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
  identifyTwitter: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.twitter);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.twitter,
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
  identifyArchive: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.archiveFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.archiveFires);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.archiveFires,
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
  identifyNoaa: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.noaa18Fires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.noaa18Fires);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.noaa18Fires,
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
  identifyBurn: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.burnScars);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();

    params.tolerance = 2;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function (features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.burnScars,
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
  identifyDigitalGlobe: (graphic, mapPoint) => {
    let featureExtent = graphic.geometry.getExtent();
    let overlaps = [];

    for (let i = 0; i < graphic._layer.graphics.length; i++) {
      let tempExtent = graphic._layer.graphics[i].geometry.getExtent();

      //if the mapPoint is within the footprint - show
      if (tempExtent.contains(mapPoint)) {
        overlaps.push(graphic._layer.graphics[i]);
      }
    }

    return {
      layer: KEYS.boundingBoxes,
      features: overlaps
    };
  },

  fetchTiles(url, count = 0) {
    return fetch(
      url,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
      }
    ).then(res => res.json())
      .then(res => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (res.errors && res.errors[0].status !== 200 && count < 25) {
              count++;
              resolve(this.fetchTiles(url, count));
            }
            resolve(res);
          }, 100);
        });
      });
  },


  getRecentTiles(params) {
    const deferred = new Deferred();

    if (!params.start || !params.end) {
      // If no date, use the default.
      params.start = window.Kalendae.moment().subtract(3, 'months').format('YYYY-MM-DD');
      params.end = window.Kalendae.moment().format('YYYY-MM-DD');
    }

    const recentTilesUrl = new URL(urls.satelliteImageService);
    Object.keys(params).forEach(key => recentTilesUrl.searchParams.append(key, params[key]));
    this.fetchTiles(recentTilesUrl).then(response => {
      if (response.errors) {
        deferred.reject(response);
        return;
      }
      deferred.resolve(response);
    });
    return deferred;
  },

  postTiles(content, count = 0) {
    return fetch(
      urls.satelliteImageService + '/tiles',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      }
    ).then(res => res.json())
      .then(res => {
        // If the request fails, try it again up to 15 times and then fail it.
        // There are resource limitations with the imagery endpoint.
        if (res.errors && res.errors[0].status !== 200 && count < 25) {
          return new Promise((resolve) => {
            setTimeout(() => {
              count++;
              resolve(this.postTiles(content, count));
            }, 100);
          });
        } else {
          return res;
        }

      });
  },

  postThumbs(content, count = 0) {
    return fetch(
      urls.satelliteImageService + '/thumbs',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      }
    ).then(res => res.json())
      .then(res => {
        // If the request fails, try it again up to 15 times and then fail it.
        // There are resource limitations with the imagery endpoint.
        if (res.errors && res.errors[0].status !== 200 && count < 25) {
          return new Promise((resolve) => {
            setTimeout(() => {
              count++;
              resolve(this.postThumbs(content, count));
            }, 100);
          });
        } else {
          return res;
        }
      });
  },

  getImageryData(params, tiles) {
    const deferred = new Deferred();
    const sourceData = [];
    tiles.forEach((tile) => {
      sourceData.push({ source: tile.attributes.source });
    });

    // Create request body that will be used for both the recent-tiles/tiles
    // request and the recent-tiles/thumbs request
    const content = {
      bands: params.bands,
      source_data: sourceData,
    };

    // Make a post request to the tiles endpoint to all of the tile_urls for
    // each tile returned in the get recent tiles request
    this.postTiles(content).then(tileResponse => {
      if (tileResponse.errors) {
        deferred.reject(tileResponse);
        return;
      }

      // Make a post request to the thumbs endpoint to get all of the thumbnail image urls for
      // each tile returned in the get recent tiles request.
      this.postThumbs(content).then(thumbResponse => {
        if (thumbResponse.errors) {
          deferred.reject(thumbResponse);
          return;
        }

        tiles.forEach((data, i) => {
          data.tileUrl = tileResponse.data.attributes[i].tile_url;
          data.thumbUrl = thumbResponse.data.attributes[i].thumbnail_url;
        });
        deferred.resolve(tiles);
      });
    });
    return deferred;
  }

};

export { request as default };
