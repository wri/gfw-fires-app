define(['exports', 'js/config', 'utils/rasterFunctions', 'utils/request', 'utils/AppUtils', 'dojo/promise/all', 'dojo/query', 'dojo/dom-class', 'actions/LayerActions', 'actions/ModalActions', 'esri/layers/MosaicRule', 'dojo/on', 'esri/InfoTemplate', 'esri/graphic', 'helpers/WindHelper', 'js/constants'], function (exports, _config, _rasterFunctions, _request, _AppUtils, _all, _query, _domClass, _LayerActions, _ModalActions, _MosaicRule, _on, _InfoTemplate, _graphic, _WindHelper, _constants) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _rasterFunctions2 = _interopRequireDefault(_rasterFunctions);

  var _request2 = _interopRequireDefault(_request);

  var _AppUtils2 = _interopRequireDefault(_AppUtils);

  var _all2 = _interopRequireDefault(_all);

  var _query2 = _interopRequireDefault(_query);

  var _domClass2 = _interopRequireDefault(_domClass);

  var _MosaicRule2 = _interopRequireDefault(_MosaicRule);

  var _on2 = _interopRequireDefault(_on);

  var _InfoTemplate2 = _interopRequireDefault(_InfoTemplate);

  var _graphic2 = _interopRequireDefault(_graphic);

  var _WindHelper2 = _interopRequireDefault(_WindHelper);

  var _constants2 = _interopRequireDefault(_constants);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var LayersHelper = {
    connectLayerEvents: function connectLayerEvents() {
      app.debug('LayersHelper >>> connectLayerEvents');
      // Enable Mouse Events for al graphics layers
      app.map.graphics.enableMouseEvents();
      // Set up Click Listener to Perform Identify
      app.map.on('click', this.performIdentify.bind(this));

      this.updateFireRisk(_config.defaults.riskTempEnd); //defaults.riskStartDate
      //todo:updateAirQuality?!
    },
    removeCustomFeature: function removeCustomFeature(feature) {
      app.map.graphics.remove(feature);
    },


    checkZoomDependentLayers: function checkZoomDependentLayers() {

      var level = 6,
          mainLayer = app.map.getLayer(_constants2.default.protectedAreas),
          helperLayer = app.map.getLayer(_constants2.default.protectedAreasHelper);

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

    performIdentify: function performIdentify(evt) {
      app.debug('LayerHelper >>> performIdentify');

      var mapPoint = evt.mapPoint,
          deferreds = [],
          features = [],
          layer = void 0;

      app.map.infoWindow.hide();
      app.map.infoWindow.clearFeatures();
      app.map.infoWindow.resize(270);

      if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes.Layer === 'custom') {
        // this.setCustomFeaturesTemplates(evt.graphic);
        // app.map.infoWindow.setFeatures([evt.graphic]);
        // app.map.infoWindow.show(mapPoint);

        // on(rowData, 'click', function(clickEvt) {
        _ModalActions.modalActions.showSubscribeModal(evt.graphic);

        return;
      }

      layer = app.map.getLayer(_constants2.default.activeFires);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyActive(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.archiveFires);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyArchive(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.noaa18Fires);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyNoaa(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.burnScars);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyBurn(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.oilPalm);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyOilPalm(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.rspoOilPalm);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyRSPOOilPalm(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.woodFiber);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyWoodFiber(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.loggingConcessions);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyLoggingConcessions(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.protectedAreas);
      var helperLayer = app.map.getLayer(_constants2.default.protectedAreasHelper);
      if (layer && helperLayer) {
        if (layer.visible || helperLayer.visible) {
          deferreds.push(_request2.default.identifyProtectedAreas(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.fireStories);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyFireStories(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.twitter);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyTwitter(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.boundingBoxes);
      if (layer) {
        if (layer.visible) {
          if (evt.graphic) {
            deferreds.push(_request2.default.identifyDigitalGlobe(evt.graphic, mapPoint));
          }
        }
      }

      if (deferreds.length === 0) {
        return;
      }

      (0, _all2.default)(deferreds).then(function (featureSets) {
        var _this = this;

        featureSets.forEach(function (item) {
          switch (item.layer) {
            case _constants2.default.activeFires:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.activeFires));
              break;
            case _constants2.default.archiveFires:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.archiveFires));
              break;
            case _constants2.default.noaa18Fires:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.noaa18Fires));
              break;
            case _constants2.default.burnScars:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.burnScars));
              break;
            case _constants2.default.oilPalm:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.oilPalm));
              break;
            case _constants2.default.rspoOilPalm:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.rspoOilPalm));
              break;
            case _constants2.default.woodFiber:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.woodFiber));
              break;
            case _constants2.default.loggingConcessions:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.loggingConcessions));
              break;
            case _constants2.default.protectedAreas:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.protectedAreas));
              break;
            case _constants2.default.fireStories:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.fireStories));
              break;
            case _constants2.default.twitter:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.twitter));
              break;
            case _constants2.default.boundingBoxes:
              features = features.concat(_this.setDigitalGlobeTemplates(item.features));
              break;
            default:
              // Do Nothing
              break;
          }
        });

        if (features.length > 0) {
          (function () {

            if (features[0].infoTemplate && features[0].infoTemplate.title === 'Crowdsourced fire stories' && app.mobile() !== true) {
              console.log('poj');
              app.map.infoWindow.resize(500);
            }
            //esize(width, height)
            app.map.infoWindow.setFeatures(features);
            app.map.infoWindow.show(mapPoint);
            var handles = [];
            var subscribeHandles = [];
            var closeHandles = [];
            var self = _this;

            (0, _query2.default)('.contentPane .layer-subscribe').forEach(function (rowData) {

              subscribeHandles.push((0, _on2.default)(rowData, 'click', function (clickEvt) {
                var target = clickEvt.target ? clickEvt.target : clickEvt.srcElement,
                    url = target.getAttribute('data-url'),
                    objId = target.getAttribute('data-id');

                _request2.default.getFeatureGeometry(url, objId).then(function (item) {
                  item.features[0].attributes.Layer = 'prebuilt';
                  item.features[0].attributes.featureName = item.features[0].attributes.name;
                  // if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes.Layer === 'custom') {

                  _ModalActions.modalActions.showSubscribeModal(item.features[0]);

                  // }
                });
              }));
            });

            (0, _query2.default)('.infoWindow-close').forEach(function (rowData) {
              closeHandles.push((0, _on2.default)(rowData, 'click', function () {
                app.map.infoWindow.hide();
              }));
            });

            (0, _query2.default)('.contentPane .imagery-data').forEach(function (rowData) {

              handles.push((0, _on2.default)(rowData, 'click', function (clickEvt) {
                var target = clickEvt.target ? clickEvt.target : clickEvt.srcElement,
                    bucket = target.dataset ? target.dataset.bucket : target.getAttribute('data-bucket'),
                    layerId = target.getAttribute('data-layer'),
                    objId = target.getAttribute('data-id');

                (0, _query2.default)('.contentPane .imagery-data').forEach(function (innerNode) {
                  _domClass2.default.remove(innerNode.parentElement, 'selected');
                });

                _domClass2.default.add(clickEvt.currentTarget.parentElement, 'selected');

                var propertyArray = bucket.split('_');
                var bucketObj = {};
                bucketObj.feature = {};
                bucketObj.feature.attributes = {};
                bucketObj.feature.attributes.SensorName = propertyArray[0];

                bucketObj.feature.attributes.OBJECTID = objId;
                bucketObj.feature.attributes.LayerId = layerId;
                self.showDigitalGlobeImagery(bucketObj);
              }));
            });
          })();
        }
      }.bind(this));
    },


    showDigitalGlobeImagery: function showDigitalGlobeImagery(imageryItem) {
      var feature = imageryItem.feature;
      var objectId = feature.attributes.OBJECTID;
      var layerId = feature.attributes.LayerId;
      var layer = app.map.getLayer(layerId);
      var mrule = new _MosaicRule2.default();
      mrule.method = _MosaicRule2.default.METHOD_LOCKRASTER;
      var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.digitalGlobe);

      config.imageServices.forEach(function (service) {
        var mapLayer = app.map.getLayer(service.id);
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

    setActiveTemplates: function setActiveTemplates(featureObjects, keyword) {
      var _this2 = this;

      app.debug('LayersHelper >>> setActiveTemplates');
      var template = void 0,
          features = [];

      featureObjects.forEach(function (item) {
        var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default[keyword]);
        var fire_results = '',
            subscribe = '';
        if (keyword === _constants2.default.woodFiber || keyword === _constants2.default.oilPalm || keyword === _constants2.default.rspoOilPalm || keyword === _constants2.default.loggingConcessions || keyword === _constants2.default.protectedAreas) {
          fire_results = _this2.getFirePopupContent(item);
          subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div><div class="layer-subscribe-container"><button data-url=' + config.url + '/' + config.layerIds[0] + ' data-id=' + item.feature.attributes.OBJECTID + ' class="layer-subscribe subscribe-submit right btn red" id="subscribeViaFeature">Subscribe</button></div>';
        } else {
          subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
        }

        var content = fire_results + config.infoTemplate.content + subscribe;

        template = new _InfoTemplate2.default(item.layerName, content);
        item.feature.setInfoTemplate(template);
        features.push(item.feature);
      });
      return features;
    },

    setDigitalGlobeTemplates: function setDigitalGlobeTemplates(features) {
      var template = void 0;

      var htmlContent = '<table>';
      features.forEach(function (feature) {
        var date = window.Kalendae.moment(feature.attributes.AcquisitionDate).format('M/D/YYYY');
        htmlContent += '<tr class="imagery-row"><td data-id="' + feature.attributes.OBJECTID + '" data-layer="' + feature.attributes.LayerId + '" data-bucket="' + feature.attributes.SensorName + '" class="imagery-data left">' + date + ' </td><td data-id="' + feature.attributes.OBJECTID + '" data-layer="' + feature.attributes.LayerId + '" data-bucket="' + feature.attributes.SensorName + '" class="imagery-data right">' + feature.attributes.SensorName + '</td></tr>';
      });
      htmlContent += '</table>';
      template = new _InfoTemplate2.default('Digital Globe Imagery', htmlContent);
      features[0].setInfoTemplate(template);
      // return features;
      return [features[0]];
    },

    setCustomFeaturesTemplates: function setCustomFeaturesTemplates(feature) {
      var template = new _InfoTemplate2.default('Custom', _config.uploadConfig.infoTemplate.content);
      feature.setInfoTemplate(template);

      return feature;
    },

    changeOpacity: function changeOpacity(parameters) {
      console.log(parameters);
      var layer = app.map.getLayer(parameters.layerId);
      if (layer) {
        // TODO:  check that value is >= 0 and <= 1.
        layer.setOpacity(parameters.value);
      }
    },
    showLayer: function showLayer(layerObj) {
      app.debug('LayersHelper >>> showLayer - ' + layerObj.layerId);
      if (layerObj.layerId === _constants2.default.digitalGlobe) {
        _LayerActions.layerActions.showFootprints.defer();
        var footprints = layerObj.footprints;
        if (footprints) {
          var footprintsLayer = app.map.getLayer(_constants2.default.boundingBoxes);
          footprintsLayer.show();
          return;
        } else {
          _request2.default.getBoundingBoxes().then(function (item) {
            if (item === true) {
              var _footprintsLayer = app.map.getLayer(_constants2.default.boundingBoxes);
              var tempGraphics = [];
              for (var t = 0; t < _footprintsLayer.graphics.length; t++) {
                tempGraphics.push(_footprintsLayer.graphics[t]);
              }
              _LayerActions.layerActions.setFootprints(tempGraphics);
            }
          });
          return;
        }
      }
      var layer = app.map.getLayer(layerObj.layerId);
      if (layer) {
        layer.show();
      }
    },
    hideLayer: function hideLayer(layerId) {
      app.debug('LayersHelper >>> hideLayer - ' + layerId);
      if (layerId === _constants2.default.digitalGlobe) {
        var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.digitalGlobe);
        var bb = app.map.getLayer(_constants2.default.boundingBoxes);
        if (bb) {
          bb.hide();
        }
        var subLayers = config.subLayers;
        subLayers.forEach(function (subLayer) {
          var sub = app.map.getLayer(subLayer);
          if (sub) {
            sub.hide();
          }
        });
        return;
      }
      var layer = app.map.getLayer(layerId);
      if (layer) {
        layer.hide();
      }
    },
    toggleWind: function toggleWind(checked) {
      app.debug('LayersHelper >>> toggleWind - ' + checked);
      if (checked) {
        _WindHelper2.default.activateWindLayer();
      } else {
        _WindHelper2.default.deactivateWindLayer();
      }
    },
    getFirePopupContent: function getFirePopupContent(item) {
      app.debug('LayersHelper >>> getFirePopupContent');
      var isFires = item.fires.length > 0;

      var firesDiv = '<div class="fire-popup-list" id="fireResults">Recent Fires';
      var noFiresDiv = '<div class="fire-popup-list no-fires" id="fireResults">No fires in past 7 days';
      var fire_results = isFires ? [firesDiv] : [noFiresDiv];

      if (isFires) {
        var fireCounts = [1, 2, 3, 7].map(function (numdays) {
          return item.fires.filter(function (fire) {
            return window.Kalendae.moment(fire.attributes.Date) > window.Kalendae.moment().subtract(numdays + 1, 'days');
          }).length;
        });

        fire_results += '<div class="fire-pop-item-cont">' + '<div id="firesWeek-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[3] + '</div><div class="fire-pop-label">Week</div></div>' + '<div id="fires72-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[2] + '</div><div class="fire-pop-label">72 hrs</div></div>' + '<div id="fires48-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[1] + '</div><div class="fire-pop-label">48 hrs</div></div>' + '<div id="fires24-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[0] + '</div><div class="fire-pop-label">24 hrs</div></div>' + '</div>';
      }

      fire_results += '</div>';
      return fire_results;
    },
    updateImageryStart: function updateImageryStart(date) {
      app.debug('LayersHelper >>> updateImageryStart - ' + date);
    },
    updateImageryEnd: function updateImageryEnd(date) {
      app.debug('LayersHelper >>> updateImageryEnd - ' + date);
    },
    updateFiresLayerDefinitions: function updateFiresLayerDefinitions(optionIndex, dontRefresh) {
      app.debug('LayersHelper >>> updateFiresLayerDefinitions');
      var value = _config.layerPanelText.firesOptions[optionIndex].value || 1; // 1 is the default value, means last 24 hours
      var queryString = _AppUtils2.default.generateFiresQuery(value);

      var firesLayer = app.map.getLayer(_constants2.default.activeFires);
      var defs = void 0;
      if (!firesLayer) {
        defs = [];
      } else {
        defs = firesLayer.layerDefinitions;
      }

      if (firesLayer) {
        firesLayer.visibleLayers.forEach(function (val) {
          var currentString = defs[val];
          if (currentString) {
            if (currentString.indexOf('CONFIDENCE >= 30') > -1) {
              var string = currentString.split('>= 30')[0];
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
    updateViirsDefinitions: function updateViirsDefinitions(optionIndex) {
      app.debug('LayersHelper >>> updateViirsDefinitions');

      var viirsFires = app.map.getLayer(_constants2.default.viirsFires);

      if (viirsFires) {
        viirsFires.setVisibleLayers([optionIndex]);
      }
    },
    toggleConfidence: function toggleConfidence(checked) {
      app.debug('LayersHelper >>> toggleConfidence');

      var firesLayer = app.map.getLayer(_constants2.default.activeFires);
      var defs = firesLayer.layerDefinitions;

      if (firesLayer) {

        firesLayer.visibleLayers.forEach(function (val) {
          var currentString = defs[val];
          if (currentString) {
            if (currentString.indexOf('ACQ_DATE') > -1) {
              if (checked) {
                defs[val] = 'BRIGHTNESS >= 330 AND CONFIDENCE >= 30 AND ' + currentString;
              } else {
                var string = currentString.split('ACQ_DATE')[1];
                defs[val] = 'ACQ_DATE' + string;
              }
            } else {
              defs[val] = '1=1';
            }
          } else {
            defs[val] = 'BRIGHTNESS >= 330 AND CONFIDENCE >= 30';
          }
        });
        console.log(defs[0]);
        firesLayer.setLayerDefinitions(defs);
      }
    },
    toggleArchiveConfidence: function toggleArchiveConfidence(checked) {
      app.debug('LayersHelper >>> toggleArchiveConfidence');

      var archiveLayer = app.map.getLayer(_constants2.default.archiveFires);

      if (archiveLayer) {
        var defQuery = void 0;
        var currentString = archiveLayer.layerDefinitions[0];

        if (checked) {
          defQuery = currentString + ' AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30';
        } else {
          var string = currentString.split(' AND BRIGHTNESS')[0];
          defQuery = string;
        }

        console.log(defQuery);
        var layerDefs = [];
        layerDefs[0] = defQuery;

        archiveLayer.setLayerDefinitions(layerDefs);
      }
    },
    updateArchiveDates: function updateArchiveDates(clauseArray) {
      app.debug('LayersHelper >>> updateArchiveDates');
      // let startDate = new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY');
      // let endDate = new window.Kalendae.moment(clauseArray[1]).format('M/D/YYYY');
      var archiveLayer = app.map.getLayer(_constants2.default.archiveFires);

      if (archiveLayer) {
        var defQuery = void 0;

        var currentString = archiveLayer.layerDefinitions[0];

        if (currentString.indexOf(' AND BRIGHTNESS') > -1) {
          var string = "ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format('M/D/YYYY') + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY') + "' AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30";
          defQuery = string + ' AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30';
        } else {
          var _string = "ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format('M/D/YYYY') + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY') + "'";
          defQuery = _string;
        }

        console.log(defQuery);
        var layerDefs = [];
        layerDefs[0] = defQuery;

        archiveLayer.setLayerDefinitions(layerDefs);
      }
    },
    updateNoaaDates: function updateNoaaDates(clauseArray) {
      app.debug('LayersHelper >>> updateNoaaDates');
      var noaaLayer = app.map.getLayer(_constants2.default.noaa18Fires);

      if (noaaLayer) {

        var startDate = new window.Kalendae.moment(clauseArray[0]).format('M/D/YYYY');
        var endDate = new window.Kalendae.moment(clauseArray[1]).add(1, 'day').format('M/D/YYYY');

        var defQuery = "Date >= date'" + startDate + "' AND Date <= date'" + endDate + "'";
        var layerDefs = [];
        layerDefs[9] = defQuery;
        console.log(defQuery);
        noaaLayer.setLayerDefinitions(layerDefs);
      }
    },
    updateDigitalGlobeLayerDefinitions: function updateDigitalGlobeLayerDefinitions(clauseArray) {
      app.debug('LayersHelper >>> updateDigitalGlobeLayerDefinitions');
      // let queryString = utils.generateImageryQuery(clauseArray);

      var dgGraphics = clauseArray[2];
      console.log(dgGraphics.length);
      var startDate = new Date(clauseArray[0]);
      var endDate = new Date(clauseArray[1]);

      var newGraphics = [];
      var ids = [];

      for (var i = 0; i < dgGraphics.length; i++) {
        var tempDate = new Date(dgGraphics[i].attributes.AcquisitionDate);
        if (startDate < tempDate && tempDate < endDate && ids.indexOf(dgGraphics[i].attributes.OBJECTID) === -1) {
          // let newGraphic = new Graphic(dgGraphics[i].geometry, dgGraphics[i].symbol, dgGraphics[i].attributes);
          newGraphics.push(dgGraphics[i]);
          // newGraphics.push(newGraphic);
          ids.push(dgGraphics[i].attributes.OBJECTID);
        }
      }
      var dgGraphicsLayer = app.map.getLayer(_constants2.default.boundingBoxes);

      dgGraphicsLayer.clear();
      dgGraphicsLayer.graphics = newGraphics;

      console.log(dgGraphicsLayer.graphics.length);
      dgGraphicsLayer.redraw();
    },
    updateLossLayerDefinitions: function updateLossLayerDefinitions(fromIndex, toIndex) {
      app.debug('LayersHelper >>> updateLossLayerDefinitions');
      var fromValue = _config.layerPanelText.lossOptions[fromIndex].value;
      var toValue = _config.layerPanelText.lossOptions[toIndex].value;
      var layerConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.loss);
      //- [fromValue, toValue] is inclusive, exclusive, which is why the + 1 is present
      var rasterFunction = _rasterFunctions2.default.getColormapRemap(layerConfig.colormap, [fromValue, toValue + 1], layerConfig.outputRange);
      var layer = app.map.getLayer(_constants2.default.loss);

      if (layer) {
        layer.setRenderingRule(rasterFunction);
      }
    },
    updateTreeCoverDefinitions: function updateTreeCoverDefinitions(densityValue) {
      app.debug('LayersHelper >>> updateTreeCoverDefinitions');

      var layerConfig = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.treeCoverDensity);

      var rasterFunction = _rasterFunctions2.default.getColormapRemap(layerConfig.colormap, [densityValue, layerConfig.inputRange[1]], layerConfig.outputRange);
      var layer = app.map.getLayer(_constants2.default.treeCoverDensity);

      if (layer) {
        layer.setRenderingRule(rasterFunction);
      }
    },
    updateFireRisk: function updateFireRisk(dayValue) {
      app.debug('LayersHelper >>> updateFireRisk');

      var date = window.Kalendae.moment(dayValue).format('M/D/YYYY');
      var otherDate = new Date(dayValue);
      var month = otherDate.getMonth();
      var year = otherDate.getFullYear();
      var janOne = new Date(year + ' 01 01');
      var origDate = window.Kalendae.moment(janOne).format('M/D/YYYY');

      var julian = this.daydiff(this.parseDate(origDate), this.parseDate(date));

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

      var defQuery = year.toString() + julian + '_IDN_FireRisk';

      console.log("Name = '" + defQuery + "'");
      var riskLayer = app.map.getLayer(_constants2.default.fireRisk);

      if (riskLayer) {
        riskLayer.setDefinitionExpression("Name = '" + defQuery + "'");
      }
    },
    updateAirQDate: function updateAirQDate(dayValue) {

      var layer = app.map.getLayer(_constants2.default.airQuality);
      var date = window.Kalendae.moment(dayValue).format('MM/DD/YYYY');

      var reportdates = date.split('/');
      reportdates[0] = parseInt(reportdates[0]);
      reportdates[1] = parseInt(reportdates[1]);

      date = reportdates.join('/');

      var layerDefs = [];
      layerDefs[1] = "Date LIKE '" + date + "%'";

      layer.setLayerDefinitions(layerDefs);
    },
    updateWindDate: function updateWindDate(dayValue) {
      console.log(dayValue);

      var dateArray = window.Kalendae.moment(dayValue).format('MM/DD/YYYY');

      var reportdates = dateArray.split('/');
      var datesFormatted = reportdates[2].toString() + reportdates[0].toString() + reportdates[1].toString();
      console.log(datesFormatted);
      var updatedURL = 'http://suitability-mapper.s3.amazonaws.com/wind/archive/wind-surface-level-gfs-' + datesFormatted + '00' + '.1-0.gz.json';
      _WindHelper2.default.deactivateWindLayer();
      _WindHelper2.default.activateWindLayer(updatedURL);
    },
    parseDate: function parseDate(str) {
      var mdy = str.split('/');
      return new Date(mdy[2], mdy[0] - 1, mdy[1]);
    },
    daydiff: function daydiff(first, second) {
      return Math.round((second - first) / (1000 * 60 * 60 * 24)) + 1;
    },
    isLeapYear: function isLeapYear(year) {
      if ((year & 3) !== 0) {
        return false;
      }
      return year % 100 !== 0 || year % 400 === 0;
    }
  };

  exports.default = LayersHelper;
});