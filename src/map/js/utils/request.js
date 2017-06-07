import {analysisConfig, layersConfig, errors} from 'js/config';
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
    queryTask.execute(query).then(function(results){

      qDeferred.resolve(results);
    }, function(err) {
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
        queryTask.execute(query, function(res) {

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
          }, function(err) {
            console.error(err);
            qdef.resolve(true);
            return;
          });

      })(service);

      return qdef.promise;

    });
    all(layers).then(function() {
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
  upload (url, content, form) {
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
    let config = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.activeFires);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.activeFires,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
      console.log(error);
      deferred.resolve(false);
    });

    return deferred.promise;
  },

  identifyModisArchive: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.modisArchive);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.modisArchive);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.modisArchive,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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
    let config = utils.getObject(layersConfig, 'id', KEYS.viirsFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.viirsFires);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.viirsFires,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
      console.log(error);
      deferred.resolve(false);
    });

    return deferred.promise;
  },

  identifyViirsArchive: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.viirsArchive);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.viirsArchive);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.viirsArchive,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.oilPalm);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        let queries = features.map(function(feature){
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let query = new Query();
          query.geometry = feature.feature.geometry;
          query.where = '1=1';
          query.outFields = ['ACQ_DATE'];
          queryTask.execute(query).then(function(results){
            feature.fires = results.features;

            setTimeout(function() {
              qDeferred.resolve(false);
            }, 3000);
            qDeferred.resolve(feature);
          });
          return qDeferred;
        });
        all(queries).then(function(qResults){
          deferred.resolve({
            layer: KEYS.oilPalm,
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
    }, function(error) {
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
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.rspoOilPalm);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        let queries = features.map(function(feature){
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let query = new Query();
          query.geometry = feature.feature.geometry;
          query.where = '1=1';
          query.outFields = ['ACQ_DATE'];
          queryTask.execute(query).then(function(results){
            feature.fires = results.features;

            setTimeout(function() {
              qDeferred.resolve(false);
            }, 3000);
            qDeferred.resolve(feature);
          });
          return qDeferred;
        });
        all(queries).then(function(qResults){
          deferred.resolve({
            layer: KEYS.rspoOilPalm,
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
    }, function(error) {
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
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.woodFiber);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        let queries = features.map(function(feature){
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let query = new Query();
          query.geometry = feature.feature.geometry;
          query.where = '1=1';
          query.outFields = ['ACQ_DATE'];
          queryTask.execute(query).then(function(results){
            feature.fires = results.features;

            setTimeout(function() {
              qDeferred.resolve(false);
            }, 3000);
            qDeferred.resolve(feature);
          });
          return qDeferred;
        });
        all(queries).then(function(qResults){
          deferred.resolve({
            layer: KEYS.woodFiber,
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
    }, function(error) {
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
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.loggingConcessions);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        let queries = features.map(function(feature){
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let query = new Query();
          query.geometry = feature.feature.geometry;
          query.where = '1=1';
          query.outFields = ['ACQ_DATE'];
          queryTask.execute(query).then(function(results){
            feature.fires = results.features;

            setTimeout(function() {
              qDeferred.resolve(false);
            }, 3000);
            qDeferred.resolve(feature);
          });
          return qDeferred;
        });
        all(queries).then(function(qResults){
          deferred.resolve({
            layer: KEYS.loggingConcessions,
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
    }, function(error) {
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
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.oilPalmGreenpeace);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        let queries = features.map(function(feature){
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let query = new Query();
          query.geometry = feature.feature.geometry;
          query.where = '1=1';
          query.outFields = ['ACQ_DATE'];
          queryTask.execute(query).then(function(results){
            feature.fires = results.features;

            setTimeout(function() {
              qDeferred.resolve(false);
            }, 3000);
            qDeferred.resolve(feature);
          });
          return qDeferred;
        });
        all(queries).then(function(qResults){
          deferred.resolve({
            layer: KEYS.oilPalmGreenpeace,
            features: qResults
          });
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.woodFiberGreenpeace);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        let queries = features.map(function(feature){
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let query = new Query();
          query.geometry = feature.feature.geometry;
          query.where = '1=1';
          query.outFields = ['ACQ_DATE'];
          queryTask.execute(query).then(function(results){
            feature.fires = results.features;

            setTimeout(function() {
              qDeferred.resolve(false);
            }, 3000);
            qDeferred.resolve(feature);
          });
          return qDeferred;
        });
        all(queries).then(function(qResults){
          deferred.resolve({
            layer: KEYS.woodFiberGreenpeace,
            features: qResults
          });
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.loggingGreenpeace);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        let queries = features.map(function(feature){
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let query = new Query();
          query.geometry = feature.feature.geometry;
          query.where = '1=1';
          query.outFields = ['ACQ_DATE'];
          queryTask.execute(query).then(function(results){
            feature.fires = results.features;

            setTimeout(function() {
              qDeferred.resolve(false);
            }, 3000);
            qDeferred.resolve(feature);
          });
          return qDeferred;
        });
        all(queries).then(function(qResults){
          deferred.resolve({
            layer: KEYS.loggingGreenpeace,
            features: qResults
          });
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.coalConcessions);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        let queries = features.map(function(feature){
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let query = new Query();
          query.geometry = feature.feature.geometry;
          query.where = '1=1';
          query.outFields = ['ACQ_DATE'];
          queryTask.execute(query).then(function(results){
            feature.fires = results.features;

            setTimeout(function() {
              qDeferred.resolve(false);
            }, 3000);
            qDeferred.resolve(feature);
          });
          return qDeferred;
        });
        all(queries).then(function(qResults){
          deferred.resolve({
            layer: KEYS.coalConcessions,
            features: qResults
          });
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.protectedAreasHelper);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        let queries = features.map(function(feature){
          let qDeferred = new Deferred();
          let queryTask = new QueryTask(firesConfig.url + firesConfig.layerIds[0]);
          let query = new Query();
          query.geometry = feature.feature.geometry;
          query.where = '1=1';
          query.outFields = ['ACQ_DATE'];
          queryTask.execute(query).then(function(results){
            feature.fires = results.features;

            setTimeout(function() {
              qDeferred.resolve(false);
            }, 3000);
            qDeferred.resolve(feature);
          });
          return qDeferred;
        });
        all(queries).then(function(qResults){
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
    }, function(error) {
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

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.fireStories,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    // params.layerIds = config.layerIds;
    params.layerIds = layers;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.overlays,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.twitter,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.archiveFires,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerDefinitions = layerDefinitions;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.noaa18Fires,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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

    params.tolerance = 10;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        deferred.resolve({
          layer: KEYS.burnScars,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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
      layer: KEYS.boundingBoxes,
      features: overlaps
    };
  }

};

export {request as default};
