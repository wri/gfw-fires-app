import {layerPanelText, layersConfig, uploadConfig, shortTermServices} from 'js/config';
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
import WindHelper from 'helpers/WindHelper';
import KEYS from 'js/constants';
import ShareHelper from 'helpers/ShareHelper';

let LayersHelper = {

  sendAnalytics (eventType, action, label) { //todo: why is this request getting sent so many times?
    ga('A.send', 'event', eventType, action, label);
    ga('B.send', 'event', eventType, action, label);
    ga('C.send', 'event', eventType, action, label);
  },

  removeCustomFeature (feature) {
    this.sendAnalytics('feature', 'delete', 'The user deleted a custom feature.');
    app.map.graphics.remove(feature);
  },

  checkZoomDependentLayers () {
    app.debug('LayerHelper >>> checkZoomDependentLayers');

    let level = 6,
      mainLayer = app.map.getLayer(KEYS.protectedAreas),
      helperLayer = app.map.getLayer(KEYS.protectedAreasHelper);

    if (mainLayer === undefined || helperLayer === undefined) {
      // Error Loading Layers and they do not work
      return;
    }

    if (!mainLayer.visible && !helperLayer.visible) {
      return;
    }

    if (app.map.getLevel() > level) {
      helperLayer.show();
      mainLayer.hide();
    } else {

      helperLayer.hide();
      mainLayer.show();
    }

  },

  performIdentify (evt) {
    app.debug('LayerHelper >>> performIdentify');
    this.sendAnalytics('map', 'click', 'The user performed an identify task by clicking the map.');

    let mapPoint = evt.mapPoint,
      deferreds = [],
      features = [],
      layer;

    app.map.infoWindow.hide();
    app.map.infoWindow.clearFeatures();
    app.map.infoWindow.resize(270);

    if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes.Layer === 'custom') {
      modalActions.showSubscribeModal(evt.graphic);
      return;
    }

    layer = app.map.getLayer(KEYS.activeFires);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyActive(mapPoint));
      }
    }


    layer = app.map.getLayer(KEYS.viirsFires);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyViirs(mapPoint));
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

    layer = app.map.getLayer(KEYS.mining);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyMining(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.gfwLogging);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyLogging(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.loggingConcessions);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyLoggingConcessions(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.oilPalmGreenpeace);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyoilPalmGreenpeace(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.woodFiberGreenpeace);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyWoodFiberGreenpeace(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.loggingGreenpeace);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyLoggingGreenpeace(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.coalConcessions);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyCoalConcessions(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.protectedAreas);
    let helperLayer = app.map.getLayer(KEYS.protectedAreasHelper);
    if (layer && helperLayer) {
      if (layer.visible || helperLayer.visible) {
        deferreds.push(Request.identifyProtectedAreas(mapPoint));
      }
    }

    layer = app.map.getLayer(KEYS.fireStories);
    if (layer) {
      if (layer.visible) {
        deferreds.push(Request.identifyFireStories(mapPoint));
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

    layer = app.map.getLayer(KEYS.overlays);
    if (layer) {
      if (layer.visible) {
        let visibleLayers = layer.visibleLayers;
        deferreds.push(Request.identifyOverlays(mapPoint, visibleLayers));
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
          case KEYS.viirsFires:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.viirsFires));
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
          case KEYS.mining:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.mining));
            break;
          case KEYS.gfwLogging:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.gfwLogging));
            break;
          case KEYS.loggingConcessions:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.loggingConcessions));
            break;
          case KEYS.oilPalmGreenpeace:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.oilPalmGreenpeace));
            break;
          case KEYS.woodFiberGreenpeace:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.woodFiberGreenpeace));
            break;
          case KEYS.loggingGreenpeace:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.loggingGreenpeace));
            break;
          case KEYS.coalConcessions:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.coalConcessions));
            break;
          case KEYS.protectedAreasHelper:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.protectedAreasHelper));
            break;
          case KEYS.fireStories:
            features = features.concat(this.setStoryTemplates(item.features, KEYS.fireStories));
            // features = features.concat(this.setActiveTemplates(item.features, KEYS.fireStories));
            break;
          case KEYS.overlays:
            features = features.concat(this.setActiveTemplates(item.features, KEYS.overlays));
            break;
          case KEYS.boundingBoxes:
            features = features.concat(this.setDigitalGlobeTemplates(item.features));
            break;
          default: // Do Nothing
            break;
        }
      });

      if (features.length > 0) {
        if (features[0].infoTemplate && features[0].infoTemplate.title === 'Crowdsourced fire stories' && app.mobile() !== true) {
          app.map.infoWindow.resize(650);
        }

        app.map.infoWindow.setFeatures(features);
        app.map.infoWindow.show(mapPoint);
        let handles = [];
        let subscribeHandles = [];
        let closeHandles = [];
        let self = this;

        dojoQuery('.contentPane .layer-subscribe').forEach((rowData) => {

          subscribeHandles.push(on(rowData, 'click', function(clickEvt) {
            let target = clickEvt.target ? clickEvt.target : clickEvt.srcElement,
                url = target.getAttribute('data-url'),
                objId = target.getAttribute('data-id');

                Request.getFeatureGeometry(url, objId).then(item => {
                  item.features[0].attributes.Layer = 'prebuilt';
                  item.features[0].attributes.featureName = item.features[0].attributes.name;
                  modalActions.showSubscribeModal(item.features[0]);
                });
          }));

        });

        dojoQuery('.infoWindow-close').forEach((rowData) => {
          closeHandles.push(on(rowData, 'click', function() {
            let tweet = document.getElementById('tweet');
            if (tweet) {
              tweet.style.display = 'none';
            }
            app.map.infoWindow.hide();
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
      if (keyword === KEYS.woodFiber || keyword === KEYS.gfwLogging || keyword === KEYS.oilPalm || keyword === KEYS.mining || keyword === KEYS.loggingConcessions || keyword === KEYS.oilPalmGreenpeace || keyword === KEYS.woodFiberGreenpeace || keyword === KEYS.loggingGreenpeace || keyword === KEYS.coalConcessions) {
        fire_results = this.getFirePopupContent(item);
        subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div><div class="layer-subscribe-container"><button data-url=' + config.url + '/' + config.layerIds[0] + ' data-id=' + item.feature.attributes.OBJECTID + ' class="layer-subscribe subscribe-submit right btn red" id="subscribeViaFeature">Subscribe</button></div>';
      } else if (keyword === KEYS.rspoOilPalm || keyword === KEYS.protectedAreasHelper) {
        fire_results = this.getFirePopupContent(item);
        subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div><div class="layer-subscribe-container"><button data-url=' + config.url + '/' + config.layerIds[0] + ' data-id=' + item.feature.attributes.objectid + ' class="layer-subscribe subscribe-submit right btn red" id="subscribeViaFeature">Subscribe</button></div>';
      } else if (keyword === KEYS.burnScars) {
        subscribe = '</table><div id="burnScarImagery"><img height="220" width="220" src="https://s3.amazonaws.com/explorationlab/' + item.feature.attributes.ChipURL + '"></div><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
      } else if (keyword === KEYS.overlays) {
        subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div><div class="layer-subscribe-container"><button data-url=' + config.url + '/' + config.layerIds[0] + ' data-id=' + item.feature.attributes.OBJECTID + ' class="layer-subscribe subscribe-submit right btn red" id="subscribeViaFeature">Subscribe</button></div>';
        config = config[item.layerName];
      } else {
        subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
      }

      let content = '<div>' + fire_results + config.infoTemplate.content + subscribe + '</div>';

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
      htmlContent += '<tr class="imagery-row"><td data-id="' + feature.attributes.OBJECTID + '" data-layer="' + feature.attributes.LayerId + '" data-bucket="' + feature.attributes.SensorName + '" class="imagery-data left">' + date + ' </td><td data-id="' + feature.attributes.OBJECTID + '" data-layer="' + feature.attributes.LayerId + '" data-bucket="' + feature.attributes.SensorName + '" class="imagery-data right">' + feature.attributes.SensorName + '</td></tr><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
    });
    htmlContent += '</table>';
    template = new InfoTemplate('DigitalGlobe Imagery', htmlContent);
    features[0].setInfoTemplate(template);
    return [features[0]];
  },

  setStoryTemplates: function(features) {
    let template, htmlContent;

    features.forEach(item => {
      if (app.mobile() === true) {
        htmlContent = '<table class="fire-stories-popup mobile"><span class="name-field">' + item.feature.attributes.Title + '</span></tr><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
      } else {
        htmlContent = '<table class="fire-stories-popup"><span class="name-field">' + item.feature.attributes.Title + '</span></tr><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
      }
      if (item.feature.attributes.Details && item.feature.attributes.Details !== 'Null') {
        htmlContent += '<tr><td class="field-value wide">' + item.feature.attributes.Details + '</td></tr>';
      }

      if (item.feature.attributes.Video && item.feature.attributes.Details !== 'Null') {
        htmlContent += '<tr><td class="field-value wide"><a href="' + item.feature.attributes.Video + '" target="_blank">Video</a></td></tr>';
      }

      htmlContent += '<tr><td class="field-value wide">' + item.feature.attributes.Date + '</td></tr>';

    });
    htmlContent += '</table>';
    template = new InfoTemplate('Crowdsourced fire stories', htmlContent);
    features[0].feature.setInfoTemplate(template);
    return [features[0].feature];
  },

  setCustomFeaturesTemplates: function(feature) {
    let template = new InfoTemplate('Custom', uploadConfig.infoTemplate.content);
    feature.setInfoTemplate(template);

    return feature;
  },

  changeOpacity (parameters) {
    let layer = app.map.getLayer(parameters.layerId);
    if (layer) {
      // Change the opacity of the layer
      layer.setOpacity(parameters.value);
      // Special clause for fire history layer
      if (layer.hasOwnProperty('id') && layer.id === KEYS.fireHistory) {
        let layers = layersConfig.filter(layerConfig => layerConfig && layerConfig.label === 'Fire history');
        layers.forEach(subLayer => {
          let firesHistoryLayer = app.map.getLayer(subLayer.id);
          firesHistoryLayer.setOpacity(parameters.value);
        });
      }
    }
  },

  updateOverlays (layers) {
    let layer = app.map.getLayer(KEYS.overlays);
    if ( layer ) {
      if (layers.length === 0) {
        layer.hide();
      } else {
        let visibleLayers = [];
        layers.forEach(layerName => {
          switch (layerName) {
            case 'provinces':
              visibleLayers.push(7);
              break;
            case 'districts':
              visibleLayers.push(6);
              break;
            case 'subdistricts':
              visibleLayers.push(5);
              break;
            case 'villages':
              visibleLayers.push(4);
              break;
            default:
              break;
          }
        });
        layer.setVisibleLayers(visibleLayers);
        layer.show();
      }
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
        ShareHelper.applyInitialState();
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
        ShareHelper.applyInitialState();
        return;
      }

    } else if (layerObj.layerId === KEYS.protectedAreas || layerObj.layerId === KEYS.protectedAreasHelper) {
      let level = 6,
        mainLayer = app.map.getLayer(KEYS.protectedAreas),
        helperLayer = app.map.getLayer(KEYS.protectedAreasHelper);

      if (app.map.getLevel() > level) {
        if (helperLayer) { helperLayer.show(); }
        if (mainLayer) { mainLayer.hide(); }
      } else {
        if (mainLayer) { mainLayer.show(); }
        if (helperLayer) { helperLayer.hide(); }
      }
      ShareHelper.applyInitialState();
      return;
    }

    let layer = app.map.getLayer(layerObj.layerId);
    if (layer) { layer.show(); }
    ShareHelper.applyInitialState();
  },

  hideLayer (layerId) {
    app.debug(`LayersHelper >>> hideLayer - ${layerId}`);

    if (layerId === KEYS.digitalGlobe) {
      let config = utils.getObject(layersConfig, 'id', KEYS.digitalGlobe);
      let bb = app.map.getLayer(KEYS.boundingBoxes);
      if (bb) { bb.hide(); }
      let subLayers = config.subLayers;
      let dgZero = app.map.getLayer(layerId);
      if (dgZero) { dgZero.hide(); }
      subLayers.forEach(subLayer => {
        let sub = app.map.getLayer(subLayer);
        if (sub) { sub.hide(); }
      });
      ShareHelper.applyInitialState();
      return;
    } else if (layerId === KEYS.protectedAreas || layerId === KEYS.protectedAreasHelper) {
      let mainLayer = app.map.getLayer(KEYS.protectedAreas),
        helperLayer = app.map.getLayer(KEYS.protectedAreasHelper);

      if (mainLayer) { mainLayer.hide(); }
      if (helperLayer) { helperLayer.hide(); }

      ShareHelper.applyInitialState();
      return;
    }

    let layer = app.map.getLayer(layerId);
    if (layer) { layer.hide(); }
    ShareHelper.applyInitialState();
  },

  toggleWind(checked) {
    app.debug(`LayersHelper >>> toggleWind - ${checked}`);

    if (checked) {
      this.sendAnalytics('layer', 'toggle', 'The user toggled the Wind layer on.');
      WindHelper.activateWindLayer();
    } else {
      this.sendAnalytics('layer', 'toggle', 'The user toggled the Wind layer off.');
      WindHelper.deactivateWindLayer();
    }

  },

  getFirePopupContent(item) {
    app.debug('LayersHelper >>> getFirePopupContent');
    let isFires = item.fires.length > 0;

    let firesDiv = '<div class="fire-popup-list" id="fireResults">RECENT FIRES';
    let noFiresDiv = '<div class="fire-popup-list no-fires" id="fireResults">No fires in past 7 days';
    let fire_results = isFires ? [firesDiv] : [noFiresDiv];


    if (isFires) {
      let fireCounts = [1, 2, 3, 7].map(function(numdays){
      return item.fires.filter(function(fire) {
        return window.Kalendae.moment(fire.attributes.ACQ_DATE) > window.Kalendae.moment().subtract(numdays, 'days');
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
  updateFiresLayerDefinitions (optionIndex) {
    app.debug('LayersHelper >>> updateFiresLayerDefinitions');
    this.sendAnalytics('widget', 'timeline', 'The user updated the Active Fires expression.');

    let firesLayer = app.map.getLayer(KEYS.activeFires);
    if (firesLayer) {
      // normally you wouldn't alter the urls for a layer but since we have moved from one behemoth service to 4 different services, we need to modify the layer url and id.
      // We are hiding and showing the layer to avoid calling the service multiple times.
      firesLayer.hide();
      const layaDefs = [];
      switch(optionIndex) {
        case 0: //past 24 hours
          firesLayer.url = shortTermServices.modis24HR.url;
          firesLayer._url.path = shortTermServices.modis24HR.url;
          firesLayer.setVisibleLayers([shortTermServices.modis24HR.id]);
          break;
        case 1: //past 48 hours
          firesLayer.url = shortTermServices.modis48HR.url;
          firesLayer._url.path = shortTermServices.modis48HR.url;
          firesLayer.setVisibleLayers([shortTermServices.modis48HR.id]);
          break;
        case 2: //past 72 hours
          firesLayer.url = shortTermServices.modis7D.url;
          firesLayer._url.path = shortTermServices.modis7D.url;
          firesLayer.setVisibleLayers([shortTermServices.modis7D.id]);
          layaDefs[shortTermServices.modis7D.id] = `Date > date'${new window.Kalendae.moment().subtract(3, 'd').format('YYYY-MM-DD HH:mm:ss')}'`;
          break;
        case 3: //past 7 days
          firesLayer.url = shortTermServices.modis7D.url;
          firesLayer._url.path = shortTermServices.modis7D.url;
          firesLayer.setVisibleLayers([shortTermServices.modis7D.id]);
          break;
        default:
          console.log('default');
          break;
      }
      firesLayer.setLayerDefinitions(layaDefs);
      firesLayer.refresh();
      firesLayer.show();
    }
  },

  updateViirsDefinitions (optionIndex) {
    let viirs = app.map.getLayer(KEYS.viirsFires);

    if (viirs) {
      // normally you wouldn't alter the urls for a layer but since we have moved from one behemoth service to 4 different services, we need to modify the layer url and id.
      // We are hiding and showing the layer to avoid calling the service multiple times.
      viirs.hide();
      const layaDefs = [];

      switch(optionIndex) {
        case 0: //past 24 hours
          viirs.url = shortTermServices.viirs24HR.url;
          viirs._url.path = shortTermServices.viirs24HR.url;
          viirs.setVisibleLayers([shortTermServices.viirs24HR.id]);
          viirs.dynamicLayerInfos[0].id = shortTermServices.viirs24HR.id;
          viirs.dynamicLayerInfos[0].source.mapLayerId = shortTermServices.viirs24HR.id;
          break;
        case 1: //past 48 hours
          viirs.url = shortTermServices.viirs48HR.url;
          viirs._url.path = shortTermServices.viirs48HR.url;
          viirs.setVisibleLayers([shortTermServices.viirs48HR.id]);
          viirs.dynamicLayerInfos[0].id = shortTermServices.viirs48HR.id;
          viirs.dynamicLayerInfos[0].source.mapLayerId = shortTermServices.viirs48HR.id;
          break;
        case 2: //past 72 hours
          viirs.url = shortTermServices.viirs7D.url;
          viirs._url.path = shortTermServices.viirs7D.url;
          viirs.setVisibleLayers([shortTermServices.viirs7D.id]);
          layaDefs[shortTermServices.viirs7D.id] = `Date > date'${new window.Kalendae.moment().subtract(3, 'd').format('YYYY-MM-DD HH:mm:ss')}'`;
          viirs.dynamicLayerInfos[0].id = shortTermServices.viirs7D.id;
          viirs.dynamicLayerInfos[0].source.mapLayerId = shortTermServices.viirs7D.id;
          break;
        case 3: //past 7 days
          viirs.url = shortTermServices.viirs7D.url;
          viirs._url.path = shortTermServices.viirs7D.url;
          viirs.setVisibleLayers([shortTermServices.viirs7D.id]);
          viirs.dynamicLayerInfos[0].id = shortTermServices.viirs7D.id;
          viirs.dynamicLayerInfos[0].source.mapLayerId = shortTermServices.viirs7D.id;
          break;
        default:
          console.log('default');
          break;
      }
      viirs.setLayerDefinitions(layaDefs);
      viirs.refresh();
      viirs.show();
    }
  },

  updatePlantationLayerDefinitions (optionIndex) {
    app.debug('LayersHelper >>> updatePlantationLayerDefinitions');

    let plantations = app.map.getLayer(KEYS.plantationTypes);

    if (plantations) {
      plantations.setVisibleLayers([optionIndex]);
    }

  },

  updateForestDefinitions (optionIndex) {
    app.debug('LayersHelper >>> updateForestDefinitions');

    let primaryForests = app.map.getLayer(KEYS.primaryForests);

    if (primaryForests) {
      primaryForests.setVisibleLayers([optionIndex]);
    }

  },

  updateFireHistoryDefinitions (index) {
    let firesHistory = app.map.getLayer(KEYS.fireHistory);
    let value = 'kd' + layerPanelText.fireHistoryOptions[index].value;
    if (firesHistory) {
      firesHistory.setDefinitionExpression("Name = '" + value + "'");
    }
  },

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

      let layerDefs = [];
      layerDefs[0] = defQuery;

      archiveLayer.setLayerDefinitions(layerDefs);
    }
  },

  updateArchiveDates (clauseArray) {
    app.debug('LayersHelper >>> updateArchiveDates');
    this.sendAnalytics('widget', 'timeline', 'The user updated the Archive Fires expression.');
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

      let layerDefs = [];
      layerDefs[0] = defQuery;

      archiveLayer.setLayerDefinitions(layerDefs);
    }

  },

  updateViirsArchiveDates (clauseArray) {
    app.debug('LayersHelper >>> updateArchiveDates');
    this.sendAnalytics('widget', 'timeline', 'The user updated the Archive Fires expression.');
    let archiveLayer = app.map.getLayer(KEYS.viirsFires);

    if (archiveLayer) {
      // normally you wouldn't alter the urls for a layer but since we have moved from one behemoth service to 4 different services, we need to modify the layer url and id.
      // We are hiding and showing the layer to avoid calling the service multiple times.
      archiveLayer.hide();
      archiveLayer.url = shortTermServices.viirs1YR.url;
      archiveLayer._url.path = shortTermServices.viirs1YR.url;
      archiveLayer.setVisibleLayers([shortTermServices.viirs1YR.id]);
      archiveLayer.layerDrawingOptions[0] = archiveLayer.layerDrawingOptions[layersConfig.filter(index => index.id === 'viirsFires')[0].layerIds[0]];
      let string = "ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format('M/D/YYYY') + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY') + "'";
      archiveLayer.dynamicLayerInfos[shortTermServices.viirs1YR.id].id = shortTermServices.viirs1YR.id;
      archiveLayer.dynamicLayerInfos[shortTermServices.viirs1YR.id].source.mapLayerId = shortTermServices.viirs1YR.id;
      archiveLayer.dynamicLayerInfos[shortTermServices.viirs1YR.id].definitionExpression = string;

      let layerDefs = [];
      layerDefs[shortTermServices.viirs1YR.id] = string;

      archiveLayer.setLayerDefinitions(layerDefs);
      archiveLayer.refresh();
      archiveLayer.show();
    }
  },

  updateModisArchiveDates (clauseArray) {
    app.debug('LayersHelper >>> updateArchiveDates');
    this.sendAnalytics('widget', 'timeline', 'The user updated the Archive Fires expression.');
    let archiveLayer = app.map.getLayer(KEYS.activeFires);
    if (archiveLayer) {
      // normally you wouldn't alter the urls for a layer but since we have moved from one behemoth service to 4 different services, we need to modify the layer url and id.
      // We are hiding and showing the layer to avoid calling the service multiple times.
      archiveLayer.hide();
      archiveLayer.url = shortTermServices.modis1YR.url;
      archiveLayer._url.path = shortTermServices.modis1YR.url;
      archiveLayer.setVisibleLayers([shortTermServices.modis1YR.id]);
      let string = "ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format('M/D/YYYY') + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY') + "'";
      let layerDefs = [];
      layerDefs[shortTermServices.modis1YR.id] = string;

      archiveLayer.setLayerDefinitions(layerDefs);
      archiveLayer.refresh();
      archiveLayer.show();
    }
  },

  updateNoaaDates (clauseArray) {
    app.debug('LayersHelper >>> updateNoaaDates');
    this.sendAnalytics('widget', 'timeline', 'The user updated the NOAA-18 Fires date expression.');
    let noaaLayer = app.map.getLayer(KEYS.noaa18Fires);

    if (noaaLayer) {

      let startDate = new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY');
      let endDate = new window.Kalendae.moment(clauseArray[1]).add(1, 'day').format('M/D/YYYY');

      let defQuery = "Date >= date'" + startDate + "' AND Date <= date'" + endDate + "'";
      let layerDefs = [];
      layerDefs[9] = defQuery;

      noaaLayer.setLayerDefinitions(layerDefs);
    }

  },

  /**
  * @param {number} optionIndex - Index of the selected option in the UI, see js/config
  * @param {boolean} dontRefresh - Whether or not to not fetch a new image
  */
  updateDigitalGlobeLayerDefinitions (clauseArray) {
    app.debug('LayersHelper >>> updateDigitalGlobeLayerDefinitions');
    this.sendAnalytics('widget', 'timeline', 'The user updated the DigitalGlobe date expression.');
    let dgGraphics = clauseArray[2];

    clauseArray[1] = new window.Kalendae.moment(clauseArray[1]).add(1, 'day').format('M/D/YYYY');

    let startDate = new Date(clauseArray[0]);
    let endDate = new Date(clauseArray[1]);

    let newGraphics = [];
    let ids = [];

    for (let i = 0; i < dgGraphics.length; i++) {
      let tempDate = new Date(dgGraphics[i].attributes.AcquisitionDate);
      if (startDate <= tempDate && tempDate <= endDate) {//} && ids.indexOf(dgGraphics[i].attributes.OBJECTID) === -1) {
        // let newGraphic = new Graphic(dgGraphics[i].geometry, dgGraphics[i].symbol, dgGraphics[i].attributes);
        newGraphics.push(dgGraphics[i]);
        // newGraphics.push(newGraphic);
        ids.push(dgGraphics[i].attributes.OBJECTID);
      }
    }
    let dgGraphicsLayer = app.map.getLayer(KEYS.boundingBoxes);

    dgGraphicsLayer.clear();
    dgGraphicsLayer.graphics = newGraphics;

    dgGraphicsLayer.redraw();

  },

  updateTreeCoverDefinitions (densityValue) {
    app.debug('LayersHelper >>> updateTreeCoverDefinitions');
    this.sendAnalytics('widget', 'timeline', 'The user updated the Tree Cover Density slider.');

    let layerConfig = utils.getObject(layersConfig, 'id', KEYS.treeCoverDensity);

    let rasterFunction = rasterFuncs.getColormapRemap(layerConfig.colormap, [densityValue, layerConfig.inputRange[1]], layerConfig.outputRange);
    let layer = app.map.getLayer(KEYS.treeCoverDensity);

    if (layer) {
      layer.setRenderingRule(rasterFunction);
    }
  },

  updateFireRisk (dayValue) {
    app.debug('LayersHelper >>> updateFireRisk');
    this.sendAnalytics('widget', 'timeline', 'The user updated the Fire Risk date expression.');

    let date = window.Kalendae.moment(dayValue).format('M/D/YYYY');

    let otherDate = new Date(dayValue);
    let month = otherDate.getMonth();
    let year = otherDate.getFullYear();
    let janOne = new Date(year, 0, 0);

    let origDate = window.Kalendae.moment(janOne).format('M/D/YYYY');

    let julian = this.daydiff(this.parseDate(origDate), this.parseDate(date));

    // if (month > 1 && this.isLeapYear(year)) {
    //   julian--;
    // }

    if (julian.toString().length === 1) {
      julian = '00' + julian.toString();
    } else if (julian.toString().length === 2) {
      julian = '0' + julian.toString();
    } else {
      julian = julian.toString();
    }

    let defQuery = year.toString() + julian + '_HEMI_FireRisk';

    let riskLayer = app.map.getLayer(KEYS.fireWeather);

    if (riskLayer) {
      riskLayer.setDefinitionExpression("Name = '" + defQuery + "'");
    }
  },

  updateLastRain (dayValue) {
    app.debug('LayersHelper >>> updateLastRain');
    this.sendAnalytics('widget', 'timeline', 'The user updated the Days Since Last Rainfall date expression.');

    let date = window.Kalendae.moment(dayValue).format('M/D/YYYY');
    let otherDate = new Date(dayValue);
    let month = otherDate.getMonth();
    let year = otherDate.getFullYear();
    let janOne = new Date(year, 0, 0);
    let origDate = window.Kalendae.moment(janOne).format('M/D/YYYY');

  let julian = this.daydiff(this.parseDate(origDate), this.parseDate(date));
    // if (month > 1 && this.isLeapYear(year)) {
    //   julian--;
    // }

    if (julian.toString().length === 1) {
      julian = '00' + julian.toString();
    } else if (julian.toString().length === 2) {
      julian = '0' + julian.toString();
    } else {
      julian = julian.toString();
    }

    let defQuery = 'DSLR_' + year.toString() + julian + '_HEMI';
    let rainLayer = app.map.getLayer(KEYS.lastRainfall);

    if (rainLayer) {
      rainLayer.setDefinitionExpression("Name = '" + defQuery + "'");
    }
  },

  updateAirQDate (dayValue) {
    app.debug('LayersHelper >>> updateAirQDate');
    this.sendAnalytics('widget', 'timeline', 'The user updated the Air Quality date expression.');
    const layer = app.map.getLayer(KEYS.airQuality);

    // Start of day
    const start = window.Kalendae.moment(dayValue).startOf('day');
    // End of day
    const end = window.Kalendae.moment(dayValue).endOf('day');

    const layerDefs = [];
    // Create layer definition
    layerDefs[0] = `update_date >= date'${start.format('YYYY-MM-DD HH:mm:ss')}' AND update_date <= date'${end.format('YYYY-MM-DD HH:mm:ss')}'`;
    layer.setLayerDefinitions(layerDefs);
  },

  updateWindDate (dayValue) {
    app.debug('LayersHelper >>> updateWindDate');
    this.sendAnalytics('widget', 'timeline', 'The user updated the Wind Layer date expression.');

    let dateArray = window.Kalendae.moment(dayValue).format('MM/DD/YYYY');

    let reportdates = dateArray.split('/');
    let datesFormatted = reportdates[2].toString() + reportdates[0].toString() + reportdates[1].toString();
    let updatedURL = 'https://suitability-mapper.s3.amazonaws.com/wind/archive/wind-surface-level-gfs-' + datesFormatted + '00' + '.1-0.gz.json';
    WindHelper.deactivateWindLayer();
    WindHelper.activateWindLayer(updatedURL);
  },

  parseDate (str) {
    let mdy = str.split('/');
    return new Date(mdy[2], mdy[0] - 1, mdy[1]);
  },

  daydiff (first, second) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
  },

  isLeapYear (year) {
    if((year & 3) !== 0) {
        return false;
    }
    return ((year % 100) !== 0 || (year % 400) === 0);
  }

};

export { LayersHelper as default };
