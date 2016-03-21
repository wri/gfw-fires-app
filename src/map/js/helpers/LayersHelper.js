import {layerPanelText, layersConfig, defaults, uploadConfig} from 'js/config';
import rasterFuncs from 'utils/rasterFunctions';
import Request from 'utils/request';
import utils from 'utils/AppUtils';
import all from 'dojo/promise/all';
import dojoQuery from 'dojo/query';
import domClass from 'dojo/dom-class';
import {layerActions} from 'actions/LayerActions';
import {modalActions} from 'actions/ModalActions';
import MosaicRule from 'esri/layers/MosaicRule';
import on from 'dojo/on';
import InfoTemplate from 'esri/InfoTemplate';
import Graphic from 'esri/graphic';
import WindHelper from 'helpers/WindHelper';
import KEYS from 'js/constants';

let LayersHelper = {

  connectLayerEvents () {
    app.debug('LayersHelper >>> connectLayerEvents');
    // Enable Mouse Events for al graphics layers
    app.map.graphics.enableMouseEvents();
    // Set up Click Listener to Perform Identify
    app.map.on('click', this.performIdentify.bind(this));

    this.updateFireRisk(defaults.riskTempEnd); //defaults.riskStartDate
    //todo:updateAirQuality?!

  },

  removeCustomFeature (feature) {
    app.map.graphics.remove(feature);
  },

  performIdentify (evt) {
    app.debug('LayerHelper >>> performIdentify');

    let mapPoint = evt.mapPoint,
      deferreds = [],
      features = [],
      layer;

    app.map.infoWindow.clearFeatures();

    if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes.Layer === 'custom') {
      // this.setCustomFeaturesTemplates(evt.graphic);
      // app.map.infoWindow.setFeatures([evt.graphic]);
      // app.map.infoWindow.show(mapPoint);

      // on(rowData, 'click', function(clickEvt) {
      modalActions.showSubscribeModal(evt.graphic);

      return;
    }

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

    layer = app.map.getLayer(KEYS.oilPalm);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyOilPalm(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.rspoOilPalm);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyRSPOOilPalm(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.woodFiber);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyWoodFiber(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.loggingConcessions);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyLoggingConcessions(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.protectedAreas);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyProtectedAreas(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.fireStories);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyFireStories(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.twitter);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyTwitter(mapPoint));
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
          case KEYS.oilPalm:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.oilPalm));
            break;
          case KEYS.rspoOilPalm:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.rspoOilPalm));
            break;
          case KEYS.woodFiber:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.woodFiber));
            break;
          case KEYS.loggingConcessions:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.loggingConcessions));
            break;
          case KEYS.protectedAreas:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.protectedAreas));
            break;
          case KEYS.fireStories:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.fireStories));
            break;
          case KEYS.twitter:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.twitter));
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
        let subscribeHandles = [];
        let self = this;



        dojoQuery('.contentPane .layer-subscribe').forEach((rowData) => {

          subscribeHandles.push(on(rowData, 'click', function(clickEvt) {
            let target = clickEvt.target ? clickEvt.target : clickEvt.srcElement,
                url = target.getAttribute('data-url'),
                objId = target.getAttribute('data-id');

                Request.getFeatureGeometry(url, objId).then(item => {
                  item.features[0].attributes.Layer = 'prebuilt';
                  item.features[0].attributes.featureName = item.features[0].attributes.name;
                  // if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes.Layer === 'custom') {

                    modalActions.showSubscribeModal(item.features[0]);

                  // }
                });
          }));

        });

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
    app.debug('LayersHelper >>> setActiveTemplates');
    let template,
      features = [];

    featureObjects.forEach(item => {
      let config = utils.getObject(layersConfig, 'id', KEYS[keyword]);
      let fire_results = '', subscribe = '';
      if (keyword === KEYS.woodFiber || keyword === KEYS.woodFiber || keyword === KEYS.oilPalm || keyword === KEYS.rspoOilPalm || keyword === KEYS.loggingConcessions || keyword === KEYS.protectedAreas) {
        fire_results = this.getFirePopupContent(item);
        subscribe = '</table><button data-url=' + config.url + '/' + config.layerIds[0] + ' data-id=' + item.feature.attributes.OBJECTID + ' class="layer-subscribe subscribe-submit right btn red" id="subscribeViaFeature">Subscribe</button>';
      }
      // template_content_block = config.infoTemplate.content + template_content_block;
      let content = fire_results + config.infoTemplate.content + subscribe;


      // template = new InfoTemplate(item.layerName, template_content_block);
      template = new InfoTemplate(item.layerName, content);
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

  setCustomFeaturesTemplates: function(feature) {
    let template = new InfoTemplate('Custom', uploadConfig.infoTemplate.content);
    feature.setInfoTemplate(template);

    return feature;
  },

  changeOpacity (parameters) {
    console.log(parameters)
    let layer = app.map.getLayer(parameters.layerId);
    if ( layer ) {
      // TODO:  check that value is >= 0 and <= 1.
      layer.setOpacity(parameters.value);
    }
  },

  showLayer (layerObj) {
    app.debug(`LayersHelper >>> showLayer - ${layerObj.layerId}`);
    if (layerObj.layerId === KEYS.digitalGlobe) {
      layerActions.showFootprints.defer();
      let footprints = layerObj.footprints;
      if (footprints) {
        let footprintsLayer = app.map.getLayer(KEYS.boundingBoxes);
        footprintsLayer.show();
        return;
      } else {
        Request.getBoundingBoxes().then(item => {
          if (item === true) {
            let footprintsLayer = app.map.getLayer(KEYS.boundingBoxes);
            let tempGraphics = [];
            for (let t = 0; t < footprintsLayer.graphics.length; t++) {
              tempGraphics.push(footprintsLayer.graphics[t]);
            }
            layerActions.setFootprints(tempGraphics);
          }
        });
        return;
      }

    }
    let layer = app.map.getLayer(layerObj.layerId);
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

  getFirePopupContent(item) {
    app.debug('LayersHelper >>> getFirePopupContent');
    let isFires = item.fires.length > 0;

    let firesDiv = '<div class="fire-popup-list" id="fireResults">Recent Fires';
    let noFiresDiv = '<div class="fire-popup-list no-fires" id="fireResults">No fires in past 7 days';
    let fire_results = isFires ? [firesDiv] : [noFiresDiv];

    if(isFires){
      let fireCounts = [1, 2, 3, 7].map(function(numdays){
      return item.fires.filter(function(fire){
        return window.Kalendae.moment(fire.attributes.Date) > window.Kalendae.moment().subtract(numdays + 1, 'days');
        }).length;
      });

      fire_results += '<div class="fire-pop-item-cont">' +
        '<div id="firesWeek-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[3] + '</div><div class="fire-pop-label">Week</div></div>' +
        '<div id="fires72-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[2] + '</div><div class="fire-pop-label">72 hrs</div></div>' +
        '<div id="fires48-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[1] + '</div><div class="fire-pop-label">48 hrs</div></div>' +
        '<div id="fires24-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[0] + '</div><div class="fire-pop-label">24 hrs</div></div>' +
        '</div>';
    }

    fire_results += '</div>';
    return fire_results;
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
    let defs;
    if (!firesLayer) {
      defs = [];
    } else {
      defs = firesLayer.layerDefinitions;
    }

    if (firesLayer) {
      firesLayer.visibleLayers.forEach(val => {
        let currentString = defs[val];
        if (currentString) {
          if (currentString.indexOf('CONFIDENCE >= 30') > -1) {
            let string = currentString.split('>= 30')[0];
            defs[val] = string + '>= 30 AND ' + queryString;
          } else {
            defs[val] = queryString;
          }
        } else {
          defs[val] = queryString;
        }

      });

      firesLayer.setLayerDefinitions(defs, dontRefresh);
    }
  },

  toggleConfidence (checked) {
    app.debug('LayersHelper >>> toggleConfidence');

    let firesLayer = app.map.getLayer(KEYS.activeFires);
    let defs = firesLayer.layerDefinitions;

    if (firesLayer) {

      firesLayer.visibleLayers.forEach(val => {
        let currentString = defs[val];
        if (currentString) {
          if (currentString.indexOf('ACQ_DATE') > -1) {
            if (checked) {
              defs[val] = 'BRIGHTNESS >= 330 AND CONFIDENCE >= 30 AND ' + currentString;
            } else {
              let string = currentString.split('ACQ_DATE')[1];
              defs[val] = 'ACQ_DATE' + string;
            }
          } else {
            defs[val] = '1=1';
          }
        } else {
          defs[val] = 'BRIGHTNESS >= 330 AND CONFIDENCE >= 30';
        }
      });
      console.log(defs[0])
      firesLayer.setLayerDefinitions(defs);
    }
  },

  //todo update docs

  toggleArchiveConfidence (checked) {
    app.debug('LayersHelper >>> toggleArchiveConfidence');

    let archiveLayer = app.map.getLayer(KEYS.archiveFires);

    if (archiveLayer) {
      let defQuery;
      let currentString = archiveLayer.layerDefinitions[0];

      if (checked) {
        defQuery = currentString + ' AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30';
      } else {
        let string = currentString.split(' AND BRIGHTNESS')[0];
        defQuery = string;
      }

      console.log(defQuery);
      let layerDefs = [];
      layerDefs[0] = defQuery;

      archiveLayer.setLayerDefinitions(layerDefs);
    }
  },

  //todo update docs

  updateArchiveDates (clauseArray) {
    app.debug('LayersHelper >>> updateArchiveDates');
    // let startDate = new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY');
    // let endDate = new window.Kalendae.moment(clauseArray[1]).format('M/D/YYYY');
    let archiveLayer = app.map.getLayer(KEYS.archiveFires);

    if (archiveLayer) {
      let defQuery;

      let currentString = archiveLayer.layerDefinitions[0];

      if (currentString.indexOf(' AND BRIGHTNESS') > -1) {
        let string = "ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format('M/D/YYYY') + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY') + "' AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30";
        defQuery = string + ' AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30';
      } else {
        let string = "ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format('M/D/YYYY') + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY') + "'";
        defQuery = string;
      }

      console.log(defQuery);
      let layerDefs = [];
      layerDefs[0] = defQuery;

      archiveLayer.setLayerDefinitions(layerDefs);
    }

  },

  updateNoaaDates (clauseArray) {
    app.debug('LayersHelper >>> updateNoaaDates');
    let noaaLayer = app.map.getLayer(KEYS.noaa18Fires);

    if (noaaLayer) {

      let startDate = new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY');
      let endDate = new window.Kalendae.moment(clauseArray[1]).add(1, 'day').format('M/D/YYYY');

      let defQuery = "Date >= date'" + startDate + "' AND Date <= date'" + endDate + "'";
      let layerDefs = [];
      layerDefs[9] = defQuery;
      console.log(defQuery);
      noaaLayer.setLayerDefinitions(layerDefs);
    }

  },

  /**
  * @param {number} optionIndex - Index of the selected option in the UI, see js/config
  * @param {boolean} dontRefresh - Whether or not to not fetch a new image
  */
  updateDigitalGlobeLayerDefinitions (clauseArray) {
    app.debug('LayersHelper >>> updateDigitalGlobeLayerDefinitions');
    // let queryString = utils.generateImageryQuery(clauseArray);

    let dgGraphics = clauseArray[2];
    console.log(dgGraphics.length);
    let startDate = new Date(clauseArray[0]);
    let endDate = new Date(clauseArray[1]);

    let newGraphics = [];
    let ids = [];

    for (let i = 0; i < dgGraphics.length; i++) {
      let tempDate = new Date(dgGraphics[i].attributes.AcquisitionDate);
      if (startDate < tempDate && tempDate < endDate && ids.indexOf(dgGraphics[i].attributes.OBJECTID) === -1) {
        // let newGraphic = new Graphic(dgGraphics[i].geometry, dgGraphics[i].symbol, dgGraphics[i].attributes);
        newGraphics.push(dgGraphics[i]);
        // newGraphics.push(newGraphic);
        ids.push(dgGraphics[i].attributes.OBJECTID);
      }
    }
    let dgGraphicsLayer = app.map.getLayer(KEYS.boundingBoxes);

    dgGraphicsLayer.clear();
    dgGraphicsLayer.graphics = newGraphics;

    console.log(dgGraphicsLayer.graphics.length);
    dgGraphicsLayer.redraw();

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
    let layer = app.map.getLayer(KEYS.treeCoverDensity);

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

  updateAirQDate (dayValue) {

    let layer = app.map.getLayer(KEYS.airQuality);
    let date = window.Kalendae.moment(dayValue).format('MM/DD/YYYY');

    let reportdates = date.split('/');
    reportdates[0] = parseInt(reportdates[0]);
    reportdates[1] = parseInt(reportdates[1]);

    date = reportdates.join('/');

    let layerDefs = [];
    layerDefs[1] = "Date LIKE '" + date + "%'";

    layer.setLayerDefinitions(layerDefs);
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
