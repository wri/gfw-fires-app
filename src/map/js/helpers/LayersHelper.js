import {layerPanelText, layersConfig, calendarText} from 'js/config';
import rasterFuncs from 'utils/rasterFunctions';
import Request from 'utils/request';
import utils from 'utils/AppUtils';
import all from 'dojo/promise/all';
import dojoQuery from 'dojo/query';
import domClass from 'dojo/dom-class';
import {layerActions} from 'actions/LayerActions';
import MosaicRule from 'esri/layers/MosaicRule';
import on from 'dojo/on';
import InfoTemplate from 'esri/InfoTemplate';
import WindHelper from 'helpers/WindHelper';
import KEYS from 'js/constants';

let LayersHelper = {

  connectLayerEvents () {
    app.debug('LayersHelper >>> connectLayerEvents');
    // Enable Mouse Events for al graphics layers
    app.map.graphics.enableMouseEvents();
    // Set up Click Listener to Perform Identify
    app.map.on('click', this.performIdentify.bind(this));
    this.updateFireRisk(calendarText.startDate);

  },

  performIdentify (evt) {
    app.debug('LayerHelper >>> performIdentify');

    let mapPoint = evt.mapPoint,
      deferreds = [],
      features = [],
      layer;

    app.map.infoWindow.clearFeatures();

    layer = app.map.getLayer(KEYS.activeFires);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyActive(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.archiveFires);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyArchive(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.noaa18Fires);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyNoaa(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.burnScars);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyBurn(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.boundingBoxes);
    if (layer) {
      if (layer.visible) {
        if (evt.graphic) {
          deferreds.push(Request.identifyDigitalGlobe(evt.graphic, mapPoint));
        }
      }
    }

    if (deferreds.length === 0) {
      return;
    }

    all(deferreds).then(function(featureSets) {

      featureSets.forEach(item => {
        switch (item.layer) {
          case KEYS.activeFires:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.activeFires));
            break;
          case KEYS.archiveFires:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.archiveFires));
            break;
          case KEYS.noaa18Fires:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.noaa18Fires));
            break;
          case KEYS.burnScars:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.burnScars));
            break;
          case KEYS.boundingBoxes:
            features = features.concat(this.setDigitalGlobeTemplates(item.features));
            break;
          default: // Do Nothing
            break;
        }
      });

      if (features.length > 0) {
        app.map.infoWindow.setFeatures(features);
        app.map.infoWindow.show(mapPoint);
        let handles = [];
        let self = this;

        dojoQuery('.contentPane .imagery-data').forEach((rowData) => {

          handles.push(on(rowData, 'click', function(clickEvt) {
            let target = clickEvt.target ? clickEvt.target : clickEvt.srcElement,
                bucket = target.dataset ? target.dataset.bucket : target.getAttribute('data-bucket'),
                layerId = target.getAttribute('data-layer'),
                objId = target.getAttribute('data-id');

            dojoQuery('.contentPane .imagery-data').forEach(function(innerNode){
                domClass.remove(innerNode.parentElement, 'selected');
            });

            domClass.add(clickEvt.currentTarget.parentElement, 'selected');

            let propertyArray = bucket.split('_');
            let bucketObj = {};
            bucketObj.feature = {};
            bucketObj.feature.attributes = {};
            bucketObj.feature.attributes.SensorName = propertyArray[0];

            bucketObj.feature.attributes.OBJECTID = objId;
            bucketObj.feature.attributes.LayerId = layerId;
            self.showDigitalGlobeImagery(bucketObj);

          }));

        });

      }

    }.bind(this));

  },

  showDigitalGlobeImagery: function(imageryItem) {
    let feature = imageryItem.feature;
    let objectId = feature.attributes.OBJECTID;
    let layerId = feature.attributes.LayerId;
    let layer = app.map.getLayer(layerId);
    let mrule = new MosaicRule();
    mrule.method = MosaicRule.METHOD_LOCKRASTER;
    let config = utils.getObject(layersConfig, 'id', KEYS.digitalGlobe);

    config.imageServices.forEach(function (service) {
      let mapLayer = app.map.getLayer(service.id);
      if (mapLayer) {
        mapLayer.hide();
      }
    });

    if (layer) {
      mrule.lockRasterIds = [objectId];
      layer.setMosaicRule(mrule);
      layer.show();
    }
  },

  setActiveTemplates: function(featureObjects, keyword) {
    let template,
      features = [];
    featureObjects.forEach(item => {
      let config = utils.getObject(layersConfig, 'id', KEYS[keyword]);
      template = new InfoTemplate(item.layerName, config.infoTemplate.content);
      item.feature.setInfoTemplate(template);
      features.push(item.feature);
    });
    return features;
  },

  setDigitalGlobeTemplates: function(features) {
    let template;

    let htmlContent = '<table>';
    features.forEach(feature => {
      let date = window.Kalendae.moment(feature.attributes.AcquisitionDate).format('M/D/YYYY');
      htmlContent += '<tr class="imagery-row"><td data-id="' + feature.attributes.OBJECTID + '" data-layer="' + feature.attributes.LayerId + '" data-bucket="' + feature.attributes.SensorName + '" class="imagery-data left">' + date + ' </td><td data-id="' + feature.attributes.OBJECTID + '" data-layer="' + feature.attributes.LayerId + '" data-bucket="' + feature.attributes.SensorName + '" class="imagery-data right">' + feature.attributes.SensorName + '</td></tr>';
    });
    htmlContent += '</table>';
    template = new InfoTemplate('Digital Globe Imagery', htmlContent);
    features[0].setInfoTemplate(template);
    // return features;
    return [features[0]];
  },

  showLayer (layerId) {
    app.debug(`LayersHelper >>> showLayer - ${layerId}`);
    if (layerId === KEYS.digitalGlobe) {
      layerActions.showFootprints();
      Request.getBoundingBoxes();
      return;
    }
    let layer = app.map.getLayer(layerId);
    if (layer) { layer.show(); }
  },

  hideLayer (layerId) {
    app.debug(`LayersHelper >>> hideLayer - ${layerId}`);
    if (layerId === KEYS.digitalGlobe) {
      let config = utils.getObject(layersConfig, 'id', KEYS.digitalGlobe);
      let bb = app.map.getLayer(KEYS.boundingBoxes);
      if (bb) { bb.hide(); }
      let subLayers = config.subLayers;
      subLayers.forEach(subLayer => {
        let sub = app.map.getLayer(subLayer);
        if (sub) { sub.hide(); }
      });
      return;
    }
    let layer = app.map.getLayer(layerId);
    if (layer) { layer.hide(); }
  },

  toggleWind(checked) {
    app.debug(`LayersHelper >>> toggleWind - ${checked}`);
    if (checked) {
      WindHelper.activateWindLayer();
    } else {
      WindHelper.deactivateWindLayer();
    }

  },

  updateImageryStart(date) {
    app.debug(`LayersHelper >>> updateImageryStart - ${date}`);
  },

  updateImageryEnd(date) {
    app.debug(`LayersHelper >>> updateImageryEnd - ${date}`);
  },

  /**
  * @param {number} optionIndex - Index of the selected option in the UI, see js/config
  * @param {boolean} dontRefresh - Whether or not to not fetch a new image
  */
  updateFiresLayerDefinitions (optionIndex, dontRefresh) {
    app.debug('LayersHelper >>> updateFiresLayerDefinitions');
    let value = layerPanelText.firesOptions[optionIndex].value || 1; // 1 is the default value, means last 24 hours
    let queryString = utils.generateFiresQuery(value);
    let firesLayer = app.map.getLayer(KEYS.activeFires);
    let defs = [];

    if (firesLayer) {
      firesLayer.visibleLayers.forEach(val => { defs[val] = queryString; });
      firesLayer.setLayerDefinitions(defs, dontRefresh);
    }
  },

  /**
  * @param {number} optionIndex - Index of the selected option in the UI, see js/config
  * @param {boolean} dontRefresh - Whether or not to not fetch a new image
  */
  updateDigitalGlobeLayerDefinitions (clauseArray) {
    app.debug('LayersHelper >>> updateDigitalGlobeLayerDefinitions');
    let queryString = utils.generateImageryQuery(clauseArray);
    let dgGraphics = app.map.getLayer(KEYS.boundingBoxes);

    dgGraphics.setDefinitionExpression(queryString);

  },

  updateLossLayerDefinitions (fromIndex, toIndex) {
    app.debug('LayersHelper >>> updateLossLayerDefinitions');
    let fromValue = layerPanelText.lossOptions[fromIndex].value;
    let toValue = layerPanelText.lossOptions[toIndex].value;
    let layerConfig = utils.getObject(layersConfig, 'id', KEYS.loss);
    //- [fromValue, toValue] is inclusive, exclusive, which is why the + 1 is present
    let rasterFunction = rasterFuncs.getColormapRemap(layerConfig.colormap, [fromValue, (toValue + 1)], layerConfig.outputRange);
    let layer = app.map.getLayer(KEYS.loss);

    if (layer) {
      layer.setRenderingRule(rasterFunction);
    }
  },

  updateTreeCoverDefinitions (densityValue) {
    app.debug('LayersHelper >>> updateTreeCoverDefinitions');
    let layerConfig = utils.getObject(layersConfig, 'id', KEYS.treeCoverDensity);

    let rasterFunction = rasterFuncs.getColormapRemap(layerConfig.colormap, [densityValue, layerConfig.inputRange[1]], layerConfig.outputRange);
    let layer = app.map.getLayer(KEYS.treeCover);

    if (layer) {
      layer.setRenderingRule(rasterFunction);
    }
  },

  updateFireRisk (dayValue) {
    app.debug('LayersHelper >>> updateFireRisk');

    let date = window.Kalendae.moment(dayValue).format('M/D/YYYY');
    let otherDate = new Date(dayValue);
    let month = otherDate.getMonth();
    let year = otherDate.getFullYear();
    let janOne = new Date(year + ' 01 01');
    let origDate = window.Kalendae.moment(janOne).format('M/D/YYYY');

    let julian = this.daydiff(this.parseDate(origDate), this.parseDate(date));

    if (month > 1 && this.isLeapYear(year)) {
      julian++;
    }

    if (julian.toString().length === 1) {
      julian = '00' + julian.toString();
    } else if (julian.toString().length === 2) {
      julian = '0' + julian.toString();
    } else {
      julian = julian.toString();
    }

    let defQuery = year.toString() + julian + '_IDN_FireRisk';

    console.log("Name = '" + defQuery + "'");
    let riskLayer = app.map.getLayer(KEYS.fireRisk);

    if (riskLayer) {
      riskLayer.setDefinitionExpression("Name = '" + defQuery + "'");
    }
  },

  updateWindDate (dayValue) {
    console.log(dayValue);

    let dateArray = window.Kalendae.moment(dayValue).format('MM/DD/YYYY');

    let reportdates = dateArray.split('/');
    let datesFormatted = reportdates[2].toString() + reportdates[0].toString() + reportdates[1].toString();
    console.log(datesFormatted);
    let updatedURL = 'http://suitability-mapper.s3.amazonaws.com/wind/archive/wind-surface-level-gfs-' + datesFormatted + '00' + '.1-0.gz.json';
    WindHelper.deactivateWindLayer();
    WindHelper.activateWindLayer(updatedURL);
  },

  parseDate (str) {
    let mdy = str.split('/');
    return new Date(mdy[2], mdy[0] - 1, mdy[1]);
  },

  daydiff (first, second) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24)) + 1;
  },

  isLeapYear (year) {
    if((year & 3) !== 0) {
        return false;
    }
    return ((year % 100) !== 0 || (year % 400) === 0);
  }

};

export { LayersHelper as default };
