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

    params.tolerance = 3;
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

  /**
  * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
  * @return {Deferred} deferred
  */
  identifyOilPalm: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.oilPalm);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.oilPalm);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 3;
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
          layer: KEYS.oilPalm,
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
  identifyRSPOOilPalm: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.rspoOilPalm);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.rspoOilPalm);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 3;
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
          layer: KEYS.rspoOilPalm,
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
  identifyWoodFiber: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.woodFiber);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.woodFiber);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 3;
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
          layer: KEYS.woodFiber,
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
  identifyLoggingConcessions: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.loggingConcessions);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.loggingConcessions);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 3;
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
          layer: KEYS.loggingConcessions,
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
  identifyProtectedAreas: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.protectedAreas);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();
    let layer = app.map.getLayer(KEYS.protectedAreas);
    let layerDefinitions = [];
    layerDefinitions[config.layerIds[0]] = layer.layerDefinitions[config.layerIds[0]];

    params.tolerance = 3;
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
          layer: KEYS.protectedAreas,
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
  identifyFireStories: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.fireStories);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();

    params.tolerance = 3;
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
  identifyTwitter: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.twitter);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();

    params.tolerance = 3;
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

    params.tolerance = 3;
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

    params.tolerance = 3;
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

    params.tolerance = 3;
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
  identifyDigitalGlobe: (graphic) => {
    let featureExtent = graphic.geometry.getExtent();
    let overlaps = [];

    for (let i = 0; i < graphic._layer.graphics.length; i++) {
      let tempExtent = graphic._layer.graphics[i].geometry.getExtent();
      if (featureExtent.intersects(tempExtent)) {
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
