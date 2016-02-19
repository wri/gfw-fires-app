import {analysisConfig, layersConfig, errors} from 'js/config';
import SpatialReference from 'esri/SpatialReference';
import GraphicsHelper from 'helpers/GraphicsHelper';
import GeoProcessor from 'esri/tasks/Geoprocessor';
import FeatureSet from 'esri/tasks/FeatureSet';
import QueryTask from 'esri/tasks/QueryTask';
import esriRequest from 'esri/request';
import IdentifyTask from 'esri/tasks/IdentifyTask';
import IdentifyParameters from 'esri/tasks/IdentifyParameters';
import Query from 'esri/tasks/query';
import Deferred from 'dojo/Deferred';
import utils from 'utils/AppUtils';
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

  /**
  * @param {Point} geometry - Esri Point geometry to use as a query for a feature on the logging service
  * @return {Deferred} deferred
  */
  identifyActive: mapPoint => {
    let deferred = new Deferred();
    let config = utils.getObject(layersConfig, 'id', KEYS.activeFires);
    let identifyTask = new IdentifyTask(config.url);
    let params = new IdentifyParameters();

    params.tolerance = 300;
    params.returnGeometry = true;
    params.width = app.map.width;
    params.height = app.map.height;
    params.geometry = mapPoint;
    params.mapExtent = app.map.extent;
    params.layerIds = config.layerIds;
    params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

    identifyTask.execute(params, function(features) {
      if (features.length > 0) {
        console.log(features)
        deferred.resolve({
          layer: KEYS.activeFires,
          features: features
        });
      } else {
        console.log("nahh")
        deferred.resolve(false);
      }
    }, function(error) {
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
          layer: KEYS.archiveFires,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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
          layer: KEYS.noaa18Fires,
          features: features
        });
      } else {
        deferred.resolve(false);
      }
    }, function(error) {
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
      deferred.resolve(false);
    });

    return deferred.promise;
  },

};

export {request as default};
