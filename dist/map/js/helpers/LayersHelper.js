define(["exports", "js/config", "utils/rasterFunctions", "utils/request", "utils/AppUtils", "dojo/promise/all", "dojo/query", "dojo/dom-class", "actions/LayerActions", "actions/ModalActions", "esri/layers/MosaicRule", "dojo/on", "esri/InfoTemplate", "helpers/WindHelper", "js/constants", "helpers/ShareHelper"], function (exports, _config, _rasterFunctions, _request, _AppUtils, _all, _query, _domClass, _LayerActions, _ModalActions, _MosaicRule, _on, _InfoTemplate, _WindHelper, _constants, _ShareHelper) {
  "use strict";

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

  var _WindHelper2 = _interopRequireDefault(_WindHelper);

  var _constants2 = _interopRequireDefault(_constants);

  var _ShareHelper2 = _interopRequireDefault(_ShareHelper);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var LayersHelper = {
    sendAnalytics: function sendAnalytics(eventType, action, label) {
      //todo: why is this request getting sent so many times?
      ga("A.send", "event", eventType, action, label);
      ga("B.send", "event", eventType, action, label);
      ga("C.send", "event", eventType, action, label);
    },
    removeCustomFeature: function removeCustomFeature(feature) {
      this.sendAnalytics("feature", "delete", "The user deleted a custom feature.");
      app.map.graphics.remove(feature);
    },
    checkZoomDependentLayers: function checkZoomDependentLayers() {
      app.debug("LayerHelper >>> checkZoomDependentLayers");

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
      app.debug("LayerHelper >>> performIdentify");
      this.sendAnalytics("map", "click", "The user performed an identify task by clicking the map.");

      var mapPoint = evt.mapPoint,
          deferreds = [],
          features = [],
          layer = void 0;

      app.map.infoWindow.hide();
      app.map.infoWindow.clearFeatures();
      app.map.infoWindow.resize(270);

      if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes.Layer === "custom") {
        _ModalActions.modalActions.showSubscribeModal(evt.graphic);
        return;
      }

      layer = app.map.getLayer(_constants2.default.activeFires);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyActive(mapPoint, layer));
        }
      }

      layer = app.map.getLayer(_constants2.default.activeFires48);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyActive(mapPoint, layer));
        }
      }

      layer = app.map.getLayer(_constants2.default.activeFires72);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyActive(mapPoint, layer));
        }
      }

      layer = app.map.getLayer(_constants2.default.activeFires7D);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyActive(mapPoint, layer));
        }
      }

      layer = app.map.getLayer(_constants2.default.activeFires1Y);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyActive(mapPoint, layer));
        }
      }

      layer = app.map.getLayer(_constants2.default.viirsFires);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyViirs(mapPoint, layer));
        }
      }

      layer = app.map.getLayer(_constants2.default.viirsFires48);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyViirs(mapPoint, layer));
        }
      }

      layer = app.map.getLayer(_constants2.default.viirsFires72);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyViirs(mapPoint, layer));
        }
      }

      layer = app.map.getLayer(_constants2.default.viirsFires7D);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyViirs(mapPoint, layer));
        }
      }

      layer = app.map.getLayer(_constants2.default.viirsFires1Y);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyViirs(mapPoint, layer));
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

      layer = app.map.getLayer(_constants2.default.mining);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyMining(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.gfwLogging);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyLogging(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.loggingConcessions);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyLoggingConcessions(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.oilPalmGreenpeace);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyoilPalmGreenpeace(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.woodFiberGreenpeace);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyWoodFiberGreenpeace(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.loggingGreenpeace);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyLoggingGreenpeace(mapPoint));
        }
      }

      layer = app.map.getLayer(_constants2.default.coalConcessions);
      if (layer) {
        if (layer.visible) {
          deferreds.push(_request2.default.identifyCoalConcessions(mapPoint));
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

      layer = app.map.getLayer(_constants2.default.boundingBoxes);
      if (layer) {
        if (layer.visible) {
          if (evt.graphic) {
            deferreds.push(_request2.default.identifyDigitalGlobe(evt.graphic, mapPoint));
          }
        }
      }

      layer = app.map.getLayer(_constants2.default.overlays);
      if (layer) {
        if (layer.visible) {
          var visibleLayers = layer.visibleLayers;
          deferreds.push(_request2.default.identifyOverlays(mapPoint, visibleLayers));
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
            case _constants2.default.viirsFires:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.viirsFires));
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
            case _constants2.default.mining:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.mining));
              break;
            case _constants2.default.gfwLogging:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.gfwLogging));
              break;
            case _constants2.default.loggingConcessions:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.loggingConcessions));
              break;
            case _constants2.default.oilPalmGreenpeace:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.oilPalmGreenpeace));
              break;
            case _constants2.default.woodFiberGreenpeace:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.woodFiberGreenpeace));
              break;
            case _constants2.default.loggingGreenpeace:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.loggingGreenpeace));
              break;
            case _constants2.default.coalConcessions:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.coalConcessions));
              break;
            case _constants2.default.protectedAreasHelper:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.protectedAreasHelper));
              break;
            case _constants2.default.fireStories:
              features = features.concat(_this.setStoryTemplates(item.features, _constants2.default.fireStories));
              // features = features.concat(this.setActiveTemplates(item.features, KEYS.fireStories));
              break;
            case _constants2.default.overlays:
              features = features.concat(_this.setActiveTemplates(item.features, _constants2.default.overlays));
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
          if (features[0].infoTemplate && features[0].infoTemplate.title === "Crowdsourced fire stories" && app.mobile() !== true) {
            app.map.infoWindow.resize(650);
          }

          app.map.infoWindow.setFeatures(features);
          app.map.infoWindow.show(mapPoint);
          var handles = [];
          var subscribeHandles = [];
          var closeHandles = [];
          var self = this;

          (0, _query2.default)(".contentPane .layer-subscribe").forEach(function (rowData) {
            subscribeHandles.push((0, _on2.default)(rowData, "click", function (clickEvt) {
              var target = clickEvt.target ? clickEvt.target : clickEvt.srcElement,
                  url = target.getAttribute("data-url"),
                  objId = target.getAttribute("data-id");

              _request2.default.getFeatureGeometry(url, objId).then(function (item) {
                item.features[0].attributes.Layer = "prebuilt";
                item.features[0].attributes.featureName = item.features[0].attributes.name;
                _ModalActions.modalActions.showSubscribeModal(item.features[0]);
              });
            }));
          });

          (0, _query2.default)(".infoWindow-close").forEach(function (rowData) {
            closeHandles.push((0, _on2.default)(rowData, "click", function () {
              var tweet = document.getElementById("tweet");
              if (tweet) {
                tweet.style.display = "none";
              }
              app.map.infoWindow.hide();
            }));
          });

          (0, _query2.default)(".contentPane .imagery-data").forEach(function (rowData) {
            handles.push((0, _on2.default)(rowData, "click", function (clickEvt) {
              var target = clickEvt.target ? clickEvt.target : clickEvt.srcElement,
                  bucket = target.dataset ? target.dataset.bucket : target.getAttribute("data-bucket"),
                  layerId = target.getAttribute("data-layer"),
                  objId = target.getAttribute("data-id");

              (0, _query2.default)(".contentPane .imagery-data").forEach(function (innerNode) {
                _domClass2.default.remove(innerNode.parentElement, "selected");
              });

              _domClass2.default.add(clickEvt.currentTarget.parentElement, "selected");

              var propertyArray = bucket.split("_");
              var bucketObj = {};
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


    showDigitalGlobeImagery: function showDigitalGlobeImagery(imageryItem) {
      var feature = imageryItem.feature;
      var objectId = feature.attributes.OBJECTID;
      var layerId = feature.attributes.LayerId;
      var layer = app.map.getLayer(layerId);
      var mrule = new _MosaicRule2.default();
      mrule.method = _MosaicRule2.default.METHOD_LOCKRASTER;
      var config = _AppUtils2.default.getObject(_config.layersConfig, "id", _constants2.default.digitalGlobe);

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

      app.debug("LayersHelper >>> setActiveTemplates");
      var template = void 0,
          features = [];

      featureObjects.forEach(function (item) {
        var config = _AppUtils2.default.getObject(_config.layersConfig, "id", _constants2.default[keyword]);
        var fire_results = "",
            subscribe = "";
        if (keyword === _constants2.default.woodFiber || keyword === _constants2.default.gfwLogging || keyword === _constants2.default.oilPalm || keyword === _constants2.default.mining || keyword === _constants2.default.loggingConcessions || keyword === _constants2.default.oilPalmGreenpeace || keyword === _constants2.default.woodFiberGreenpeace || keyword === _constants2.default.loggingGreenpeace || keyword === _constants2.default.coalConcessions) {
          fire_results = _this2.getFirePopupContent(item);
          subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div><div class="layer-subscribe-container"><button data-url=' + config.url + "/" + config.layerIds[0] + " data-id=" + item.feature.attributes.OBJECTID + ' class="layer-subscribe subscribe-submit right btn red" id="subscribeViaFeature">Subscribe</button></div>';
        } else if (keyword === _constants2.default.rspoOilPalm || keyword === _constants2.default.protectedAreasHelper) {
          fire_results = _this2.getFirePopupContent(item);
          subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div><div class="layer-subscribe-container"><button data-url=' + config.url + "/" + config.layerIds[0] + " data-id=" + item.feature.attributes.objectid + ' class="layer-subscribe subscribe-submit right btn red" id="subscribeViaFeature">Subscribe</button></div>';
        } else if (keyword === _constants2.default.burnScars) {
          subscribe = '</table><div id="burnScarImagery"><img height="220" width="220" src="https://s3.amazonaws.com/explorationlab/' + item.feature.attributes.ChipURL + '"></div><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
        } else if (keyword === _constants2.default.overlays) {
          subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div><div class="layer-subscribe-container"><button data-url=' + config.url + "/" + config.layerIds[0] + " data-id=" + item.feature.attributes.OBJECTID + ' class="layer-subscribe subscribe-submit right btn red" id="subscribeViaFeature">Subscribe</button></div>';
          config = config[item.layerName];
        } else {
          subscribe = '</table><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
        }

        var content = "<div>" + fire_results + config.infoTemplate.content + subscribe + "</div>";

        template = new _InfoTemplate2.default(item.layerName, content);
        item.feature.setInfoTemplate(template);
        features.push(item.feature);
      });
      return features;
    },

    setDigitalGlobeTemplates: function setDigitalGlobeTemplates(features) {
      var template = void 0;

      var htmlContent = "<table>";
      features.forEach(function (feature) {
        var date = window.Kalendae.moment(feature.attributes.AcquisitionDate).format("M/D/YYYY");
        htmlContent += '<tr class="imagery-row"><td data-id="' + feature.attributes.OBJECTID + '" data-layer="' + feature.attributes.LayerId + '" data-bucket="' + feature.attributes.SensorName + '" class="imagery-data left">' + date + ' </td><td data-id="' + feature.attributes.OBJECTID + '" data-layer="' + feature.attributes.LayerId + '" data-bucket="' + feature.attributes.SensorName + '" class="imagery-data right">' + feature.attributes.SensorName + '</td></tr><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
      });
      htmlContent += "</table>";
      template = new _InfoTemplate2.default("DigitalGlobe Imagery", htmlContent);
      features[0].setInfoTemplate(template);
      return [features[0]];
    },

    setStoryTemplates: function setStoryTemplates(features) {
      var template = void 0,
          htmlContent = void 0;

      features.forEach(function (item) {
        if (app.mobile() === true) {
          htmlContent = '<table class="fire-stories-popup mobile"><span class="name-field">' + item.feature.attributes.Title + '</span></tr><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
        } else {
          htmlContent = '<table class="fire-stories-popup"><span class="name-field">' + item.feature.attributes.Title + '</span></tr><div title="close" class="infoWindow-close close-icon"><svg viewBox="0 0 100 100"><use xlink:href="#shape-close" /></use></svg></div>';
        }
        if (item.feature.attributes.Details && item.feature.attributes.Details !== "Null") {
          htmlContent += '<tr><td class="field-value wide">' + item.feature.attributes.Details + "</td></tr>";
        }

        if (item.feature.attributes.Video && item.feature.attributes.Details !== "Null") {
          htmlContent += '<tr><td class="field-value wide"><a href="' + item.feature.attributes.Video + '" target="_blank">Video</a></td></tr>';
        }

        htmlContent += '<tr><td class="field-value wide">' + item.feature.attributes.Date + "</td></tr>";
      });
      htmlContent += "</table>";
      template = new _InfoTemplate2.default("Crowdsourced fire stories", htmlContent);
      features[0].feature.setInfoTemplate(template);
      return [features[0].feature];
    },

    setCustomFeaturesTemplates: function setCustomFeaturesTemplates(feature) {
      var template = new _InfoTemplate2.default("Custom", _config.uploadConfig.infoTemplate.content);
      feature.setInfoTemplate(template);

      return feature;
    },

    changeOpacity: function changeOpacity(parameters) {
      var layer = app.map.getLayer(parameters.layerId);
      if (layer) {
        // Change the opacity of the layer
        layer.setOpacity(parameters.value);
        // Special clause for fire history layer
        if (layer.hasOwnProperty("id") && layer.id === _constants2.default.fireHistory) {
          var layers = _config.layersConfig.filter(function (layerConfig) {
            return layerConfig && layerConfig.label === "Fire history";
          });
          layers.forEach(function (subLayer) {
            var firesHistoryLayer = app.map.getLayer(subLayer.id);
            firesHistoryLayer.setOpacity(parameters.value);
          });
        }
      }
    },
    updateOverlays: function updateOverlays(layers) {
      var layer = app.map.getLayer(_constants2.default.overlays);
      if (layer) {
        if (layers.length === 0) {
          layer.hide();
        } else {
          var visibleLayers = [];
          layers.forEach(function (layerName) {
            switch (layerName) {
              case "provinces":
                visibleLayers.push(7);
                break;
              case "districts":
                visibleLayers.push(6);
                break;
              case "subdistricts":
                visibleLayers.push(5);
                break;
              case "villages":
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
    showLayer: function showLayer(layerObj) {
      app.debug("LayersHelper >>> showLayer - " + layerObj.layerId);
      if (layerObj.layerId === _constants2.default.digitalGlobe) {
        _LayerActions.layerActions.showFootprints.defer();
        var footprints = layerObj.footprints;
        if (footprints) {
          var footprintsLayer = app.map.getLayer(_constants2.default.boundingBoxes);
          footprintsLayer.show();
          _ShareHelper2.default.applyInitialState();
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
          _ShareHelper2.default.applyInitialState();
          return;
        }
      } else if (layerObj.layerId === _constants2.default.protectedAreas || layerObj.layerId === _constants2.default.protectedAreasHelper) {
        var level = 6,
            mainLayer = app.map.getLayer(_constants2.default.protectedAreas),
            helperLayer = app.map.getLayer(_constants2.default.protectedAreasHelper);

        if (app.map.getLevel() > level) {
          if (helperLayer) {
            helperLayer.show();
          }
          if (mainLayer) {
            mainLayer.hide();
          }
        } else {
          if (mainLayer) {
            mainLayer.show();
          }
          if (helperLayer) {
            helperLayer.hide();
          }
        }
        _ShareHelper2.default.applyInitialState();
        return;
      }

      var layer = app.map.getLayer(layerObj.layerId);
      if (layer) {
        layer.show();
      }
      _ShareHelper2.default.applyInitialState();
    },
    hideLayer: function hideLayer(layerId) {
      app.debug("LayersHelper >>> hideLayer - " + layerId);

      if (layerId === _constants2.default.digitalGlobe) {
        var config = _AppUtils2.default.getObject(_config.layersConfig, "id", _constants2.default.digitalGlobe);
        var bb = app.map.getLayer(_constants2.default.boundingBoxes);
        if (bb) {
          bb.hide();
        }
        var subLayers = config.subLayers;
        var dgZero = app.map.getLayer(layerId);
        if (dgZero) {
          dgZero.hide();
        }
        subLayers.forEach(function (subLayer) {
          var sub = app.map.getLayer(subLayer);
          if (sub) {
            sub.hide();
          }
        });
        _ShareHelper2.default.applyInitialState();
        return;
      } else if (layerId === _constants2.default.protectedAreas || layerId === _constants2.default.protectedAreasHelper) {
        var mainLayer = app.map.getLayer(_constants2.default.protectedAreas),
            helperLayer = app.map.getLayer(_constants2.default.protectedAreasHelper);

        if (mainLayer) {
          mainLayer.hide();
        }
        if (helperLayer) {
          helperLayer.hide();
        }

        _ShareHelper2.default.applyInitialState();
        return;
      }

      var layer = app.map.getLayer(layerId);
      if (layer) {
        layer.hide();
      }
      _ShareHelper2.default.applyInitialState();
    },
    toggleWind: function toggleWind(checked) {
      app.debug("LayersHelper >>> toggleWind - " + checked);

      if (checked) {
        this.sendAnalytics("layer", "toggle", "The user toggled the Wind layer on.");
        _WindHelper2.default.activateWindLayer();
      } else {
        this.sendAnalytics("layer", "toggle", "The user toggled the Wind layer off.");
        _WindHelper2.default.deactivateWindLayer();
      }
    },
    getFirePopupContent: function getFirePopupContent(item) {
      app.debug("LayersHelper >>> getFirePopupContent");
      var isFires = item.fires.length > 0;

      var firesDiv = '<div class="fire-popup-list" id="fireResults">RECENT FIRES';
      var noFiresDiv = '<div class="fire-popup-list no-fires" id="fireResults">No fires in past 7 days';
      var fire_results = isFires ? [firesDiv] : [noFiresDiv];

      if (isFires) {
        var fireCounts = [1, 2, 3, 7].map(function (numdays) {
          return item.fires.filter(function (fire) {
            return window.Kalendae.moment(fire.attributes.ACQ_DATE) > window.Kalendae.moment().subtract(numdays, "days");
          }).length;
        });

        fire_results += '<div class="fire-pop-item-cont">' + '<div id="firesWeek-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[3] + '</div><div class="fire-pop-label">Week</div></div>' + '<div id="fires72-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[2] + '</div><div class="fire-pop-label">72 hrs</div></div>' + '<div id="fires48-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[1] + '</div><div class="fire-pop-label">48 hrs</div></div>' + '<div id="fires24-pop" class="fire-pop-item"><div class="fire-pop-count">' + fireCounts[0] + '</div><div class="fire-pop-label">24 hrs</div></div>' + "</div>";
      }

      fire_results += "</div>";
      return fire_results;
    },
    updateImageryStart: function updateImageryStart(date) {
      app.debug("LayersHelper >>> updateImageryStart - " + date);
    },
    updateImageryEnd: function updateImageryEnd(date) {
      app.debug("LayersHelper >>> updateImageryEnd - " + date);
    },
    updateFiresLayerDefinitions: function updateFiresLayerDefinitions(optionIndex) {
      app.debug("LayersHelper >>> updateFiresLayerDefinitions");
      this.sendAnalytics("widget", "timeline", "The user updated the Active Fires expression.");
      /* normally you wouldn't alter the urls for a layer but since we have moved from one behemoth service to 4 different services, we need to modify the layer url and id.
       * We are hiding and showing the layer to avoid calling the service multiple times.
       */
      var modisLayerIds = [_constants2.default.activeFires, _constants2.default.activeFires48, _constants2.default.activeFires72, _constants2.default.activeFires7D];

      var modisLayer = app.map.getLayer(modisLayerIds[optionIndex]);

      if (modisLayer) {
        modisLayerIds.filter(function (id) {
          return id !== modisLayerIds[optionIndex];
        }).forEach(function (id) {
          var layer = app.map.getLayer(id);
          if (layer) {
            layer.hide();
          }
        });
        // The 72 hour layer uses the 7D service and filters the points with a definition expression.
        if (optionIndex === 2) {
          modisLayer.setDefinitionExpression("Date > date'" + new window.Kalendae.moment().subtract(3, "d").format("YYYY-MM-DD HH:mm:ss") + "'");
        }
        modisLayer.show();
      }
    },
    updateViirsDefinitions: function updateViirsDefinitions(optionIndex) {
      /* normally you wouldn't alter the urls for a layer but since we have moved from one behemoth service to 4 different services, we need to modify the layer url and id.
       * We are hiding and showing the layer to avoid calling the service multiple times.
       */
      var viirsLayerIds = [_constants2.default.viirsFires, _constants2.default.viirsFires48, _constants2.default.viirsFires72, _constants2.default.viirsFires7D];
      var viirsLayer = app.map.getLayer(viirsLayerIds[optionIndex]);
      if (viirsLayer) {
        viirsLayerIds.filter(function (id) {
          return id !== viirsLayerIds[optionIndex];
        }).forEach(function (id) {
          var layer = app.map.getLayer(id);
          if (layer) {
            layer.hide();
          }
        });
        // The 72 hour layer uses the 7D service and filters the points with a definition expression.
        if (optionIndex === 2) {
          viirsLayer.setDefinitionExpression("Date > date'" + new window.Kalendae.moment().subtract(3, "d").format("YYYY-MM-DD HH:mm:ss") + "'");
        }
        viirsLayer.show();
      }
    },
    updatePlantationLayerDefinitions: function updatePlantationLayerDefinitions(optionIndex) {
      app.debug("LayersHelper >>> updatePlantationLayerDefinitions");

      var plantations = app.map.getLayer(_constants2.default.plantationTypes);

      if (plantations) {
        plantations.setVisibleLayers([optionIndex]);
      }
    },
    updateForestDefinitions: function updateForestDefinitions(optionIndex) {
      app.debug("LayersHelper >>> updateForestDefinitions");

      var primaryForests = app.map.getLayer(_constants2.default.primaryForests);

      if (primaryForests) {
        primaryForests.setVisibleLayers([optionIndex]);
      }
    },
    updateFireHistoryDefinitions: function updateFireHistoryDefinitions(index) {
      var firesHistory = app.map.getLayer(_constants2.default.fireHistory);
      var value = "kd" + _config.layerPanelText.fireHistoryOptions[index].value;
      if (firesHistory) {
        firesHistory.setDefinitionExpression("Name = '" + value + "'");
      }
    },
    toggleArchiveConfidence: function toggleArchiveConfidence(checked) {
      app.debug("LayersHelper >>> toggleArchiveConfidence");

      var archiveLayer = app.map.getLayer(_constants2.default.archiveFires);

      if (archiveLayer) {
        var defQuery = void 0;
        var currentString = archiveLayer.layerDefinitions[0];

        if (checked) {
          defQuery = currentString + " AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30";
        } else {
          var string = currentString.split(" AND BRIGHTNESS")[0];
          defQuery = string;
        }

        var layerDefs = [];
        layerDefs[0] = defQuery;

        archiveLayer.setLayerDefinitions(layerDefs);
      }
    },
    updateArchiveDates: function updateArchiveDates(clauseArray) {
      app.debug("LayersHelper >>> updateArchiveDates");
      this.sendAnalytics("widget", "timeline", "The user updated the Archive Fires expression.");
      var archiveLayer = app.map.getLayer(_constants2.default.archiveFires);

      if (archiveLayer) {
        var defQuery = void 0;

        var currentString = archiveLayer.layerDefinitions[0];

        if (currentString.indexOf(" AND BRIGHTNESS") > -1) {
          var string = "ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format("M/D/YYYY") + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format("M/D/YYYY") + "' AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30";
          defQuery = string + " AND BRIGHTNESS >= 330 AND CONFIDENCE >= 30";
        } else {
          var _string = "ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format("M/D/YYYY") + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format("M/D/YYYY") + "'";
          defQuery = _string;
        }

        var layerDefs = [];
        layerDefs[0] = defQuery;

        archiveLayer.setLayerDefinitions(layerDefs);
      }
    },
    updateViirsArchiveDates: function updateViirsArchiveDates(clauseArray) {
      app.debug("LayersHelper >>> updateArchiveDates");
      this.sendAnalytics("widget", "timeline", "The user updated the Archive Fires expression.");

      var viirsLayerIds = [_constants2.default.viirsFires, _constants2.default.viirsFires48, _constants2.default.viirsFires72, _constants2.default.viirsFires7D];
      var viirsLayer = app.map.getLayer(_constants2.default.viirsFires1Y);
      if (viirsLayer) {
        // Hide all other viirs layers, just in case.
        viirsLayerIds.forEach(function (id) {
          var layer = app.map.getLayer(id);
          if (layer) {
            layer.hide();
          }
        });
        viirsLayer.setDefinitionExpression("ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format("M/D/YYYY") + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format("M/D/YYYY") + "'");
        viirsLayer.show();
      }
    },
    updateModisArchiveDates: function updateModisArchiveDates(clauseArray) {
      app.debug("LayersHelper >>> updateArchiveDates");
      this.sendAnalytics("widget", "timeline", "The user updated the Archive Fires expression.");

      var modisLayerIds = [_constants2.default.activeFires, _constants2.default.activeFires48, _constants2.default.activeFires72, _constants2.default.activeFires7D];
      console.log("start");
      var modisLayer = app.map.getLayer(_constants2.default.activeFires1Y);
      if (modisLayer) {
        // Hide all other viirs layers, just in case.
        modisLayerIds.forEach(function (id) {
          var layer = app.map.getLayer(id);
          if (layer) {
            layer.hide();
          }
        });
        modisLayer.setDefinitionExpression("ACQ_DATE <= date'" + new window.Kalendae.moment(clauseArray[1]).format("M/D/YYYY") + "' AND ACQ_DATE >= date'" + new window.Kalendae.moment(clauseArray[0]).format("M/D/YYYY") + "'");
        modisLayer.show();
      }

      // let archiveLayer = app.map.getLayer(KEYS.activeFires);
      // if (archiveLayer) {
      //   // normally you wouldn't alter the urls for a layer but since we have moved from one behemoth service to 4 different services, we need to modify the layer url and id.
      //   // We are hiding and showing the layer to avoid calling the service multiple times.
      //   archiveLayer.hide();
      //   archiveLayer.url = shortTermServices.modis1YR.url;
      //   archiveLayer._url.path = shortTermServices.modis1YR.url;
      //   archiveLayer.setVisibleLayers([shortTermServices.modis1YR.id]);
      //   let string =
      //     "ACQ_DATE <= date'" +
      //     new window.Kalendae.moment(clauseArray[1]).format("M/D/YYYY") +
      //     "' AND ACQ_DATE >= date'" +
      //     new window.Kalendae.moment(clauseArray[0]).format("M/D/YYYY") +
      //     "'";
      //   let layerDefs = [];
      //   layerDefs[shortTermServices.modis1YR.id] = string;

      //   archiveLayer.setLayerDefinitions(layerDefs);
      //   archiveLayer.refresh();
      //   archiveLayer.show();
      // }
    },
    updateNoaaDates: function updateNoaaDates(clauseArray) {
      app.debug("LayersHelper >>> updateNoaaDates");
      this.sendAnalytics("widget", "timeline", "The user updated the NOAA-18 Fires date expression.");
      var noaaLayer = app.map.getLayer(_constants2.default.noaa18Fires);

      if (noaaLayer) {
        var startDate = new window.Kalendae.moment(clauseArray[0]).format("M/D/YYYY");
        var endDate = new window.Kalendae.moment(clauseArray[1]).add(1, "day").format("M/D/YYYY");

        var defQuery = "Date >= date'" + startDate + "' AND Date <= date'" + endDate + "'";
        var layerDefs = [];
        layerDefs[9] = defQuery;

        noaaLayer.setLayerDefinitions(layerDefs);
      }
    },
    updateDigitalGlobeLayerDefinitions: function updateDigitalGlobeLayerDefinitions(clauseArray) {
      app.debug("LayersHelper >>> updateDigitalGlobeLayerDefinitions");
      this.sendAnalytics("widget", "timeline", "The user updated the DigitalGlobe date expression.");
      var dgGraphics = clauseArray[2];

      clauseArray[1] = new window.Kalendae.moment(clauseArray[1]).add(1, "day").format("M/D/YYYY");

      var startDate = new Date(clauseArray[0]);
      var endDate = new Date(clauseArray[1]);

      var newGraphics = [];
      var ids = [];

      for (var i = 0; i < dgGraphics.length; i++) {
        var tempDate = new Date(dgGraphics[i].attributes.AcquisitionDate);
        if (startDate <= tempDate && tempDate <= endDate) {
          //} && ids.indexOf(dgGraphics[i].attributes.OBJECTID) === -1) {
          // let newGraphic = new Graphic(dgGraphics[i].geometry, dgGraphics[i].symbol, dgGraphics[i].attributes);
          newGraphics.push(dgGraphics[i]);
          // newGraphics.push(newGraphic);
          ids.push(dgGraphics[i].attributes.OBJECTID);
        }
      }
      var dgGraphicsLayer = app.map.getLayer(_constants2.default.boundingBoxes);

      dgGraphicsLayer.clear();
      dgGraphicsLayer.graphics = newGraphics;

      dgGraphicsLayer.redraw();
    },
    updateTreeCoverDefinitions: function updateTreeCoverDefinitions(densityValue) {
      app.debug("LayersHelper >>> updateTreeCoverDefinitions");
      this.sendAnalytics("widget", "timeline", "The user updated the Tree Cover Density slider.");

      var layerConfig = _AppUtils2.default.getObject(_config.layersConfig, "id", _constants2.default.treeCoverDensity);

      var rasterFunction = _rasterFunctions2.default.getColormapRemap(layerConfig.colormap, [densityValue, layerConfig.inputRange[1]], layerConfig.outputRange);
      var layer = app.map.getLayer(_constants2.default.treeCoverDensity);

      if (layer) {
        layer.setRenderingRule(rasterFunction);
      }
    },
    updateFireRisk: function updateFireRisk(dayValue) {
      app.debug("LayersHelper >>> updateFireRisk");
      this.sendAnalytics("widget", "timeline", "The user updated the Fire Risk date expression.");

      var date = window.Kalendae.moment(dayValue).format("M/D/YYYY");

      var otherDate = new Date(dayValue);
      var month = otherDate.getMonth();
      var year = otherDate.getFullYear();
      var janOne = new Date(year, 0, 0);

      var origDate = window.Kalendae.moment(janOne).format("M/D/YYYY");

      var julian = this.daydiff(this.parseDate(origDate), this.parseDate(date));

      // if (month > 1 && this.isLeapYear(year)) {
      //   julian--;
      // }

      if (julian.toString().length === 1) {
        julian = "00" + julian.toString();
      } else if (julian.toString().length === 2) {
        julian = "0" + julian.toString();
      } else {
        julian = julian.toString();
      }

      var defQuery = year.toString() + julian + "_HEMI_FireRisk";

      var riskLayer = app.map.getLayer(_constants2.default.fireWeather);

      if (riskLayer) {
        riskLayer.setDefinitionExpression("Name = '" + defQuery + "'");
      }
    },
    updateLastRain: function updateLastRain(dayValue) {
      app.debug("LayersHelper >>> updateLastRain");
      this.sendAnalytics("widget", "timeline", "The user updated the Days Since Last Rainfall date expression.");

      var date = window.Kalendae.moment(dayValue).format("M/D/YYYY");
      var otherDate = new Date(dayValue);
      var month = otherDate.getMonth();
      var year = otherDate.getFullYear();
      var janOne = new Date(year, 0, 0);
      var origDate = window.Kalendae.moment(janOne).format("M/D/YYYY");

      var julian = this.daydiff(this.parseDate(origDate), this.parseDate(date));
      // if (month > 1 && this.isLeapYear(year)) {
      //   julian--;
      // }

      if (julian.toString().length === 1) {
        julian = "00" + julian.toString();
      } else if (julian.toString().length === 2) {
        julian = "0" + julian.toString();
      } else {
        julian = julian.toString();
      }

      var defQuery = "DSLR_" + year.toString() + julian + "_HEMI";
      var rainLayer = app.map.getLayer(_constants2.default.lastRainfall);

      if (rainLayer) {
        rainLayer.setDefinitionExpression("Name = '" + defQuery + "'");
      }
    },
    updateAirQDate: function updateAirQDate(dayValue) {
      app.debug("LayersHelper >>> updateAirQDate");
      this.sendAnalytics("widget", "timeline", "The user updated the Air Quality date expression.");
      var layer = app.map.getLayer(_constants2.default.airQuality);

      // Start of day
      var start = window.Kalendae.moment(dayValue).startOf("day");
      // End of day
      var end = window.Kalendae.moment(dayValue).endOf("day");

      var layerDefs = [];
      // Create layer definition
      layerDefs[0] = "update_date >= date'" + start.format("YYYY-MM-DD HH:mm:ss") + "' AND update_date <= date'" + end.format("YYYY-MM-DD HH:mm:ss") + "'";
      layer.setLayerDefinitions(layerDefs);
    },
    updateWindDate: function updateWindDate(dayValue) {
      app.debug("LayersHelper >>> updateWindDate");
      this.sendAnalytics("widget", "timeline", "The user updated the Wind Layer date expression.");

      var dateArray = window.Kalendae.moment(dayValue).format("MM/DD/YYYY");

      var reportdates = dateArray.split("/");
      var datesFormatted = reportdates[2].toString() + reportdates[0].toString() + reportdates[1].toString();
      var updatedURL = "https://suitability-mapper.s3.amazonaws.com/wind/archive/wind-surface-level-gfs-" + datesFormatted + "00" + ".1-0.gz.json";
      _WindHelper2.default.deactivateWindLayer();
      _WindHelper2.default.activateWindLayer(updatedURL);
    },
    parseDate: function parseDate(str) {
      var mdy = str.split("/");
      return new Date(mdy[2], mdy[0] - 1, mdy[1]);
    },
    daydiff: function daydiff(first, second) {
      return Math.round((second - first) / (1000 * 60 * 60 * 24));
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