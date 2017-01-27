define(['exports', 'js/config', 'actions/LayerActions', 'actions/ModalActions', 'actions/MapActions', 'helpers/LayersHelper', 'helpers/ShareHelper', 'js/constants', 'js/alt'], function (exports, _config, _LayerActions, _ModalActions, _MapActions, _LayersHelper, _ShareHelper, _constants, _alt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.mapStore = undefined;

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _ShareHelper2 = _interopRequireDefault(_ShareHelper);

  var _constants2 = _interopRequireDefault(_constants);

  var _alt2 = _interopRequireDefault(_alt);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var MapStore = function () {
    function MapStore() {
      _classCallCheck(this, MapStore);

      //- activeLayers defaults should be the id's of whatever layers
      //- are configured to be visible in layersConfig, filter out layers with no group
      //- because those layers are not in the ui and should not be in this list
      this.activeLayers = _config.layersConfig.filter(function (l) {
        return l.visible && l.group;
      }).map(function (l) {
        return l.id;
      });
      this.canopyDensity = _config.defaults.canopyDensity;
      this.lossFromSelectIndex = _config.defaults.lossFromSelectIndex;
      this.footprintsVisible = true;
      this.footprints = undefined;
      this.overlaysVisible = [];
      this.date = this.getDate(_config.defaults.todaysDate);
      this.dgStartDate = this.getDate(_config.defaults.dgStartDate);
      this.dgEndDate = this.getDate(_config.defaults.todaysDate);
      this.analysisStartDate = this.getDate(_config.defaults.analysisStartDate);
      this.analysisEndDate = this.getDate(_config.defaults.yesterday);
      this.archiveStartDate = this.getDate(_config.defaults.archiveInitialDate);
      this.archiveEndDate = this.getDate(_config.defaults.analysisStartDate);
      this.noaaStartDate = this.getDate(_config.defaults.analysisStartDate);
      this.noaaEndDate = this.getDate(_config.defaults.todaysDate);
      this.riskStartDate = this.getDate(_config.defaults.riskStartDate);
      this.riskDate = this.getDate(_config.defaults.yesterday);
      this.rainStartDate = this.getDate(_config.defaults.riskStartDate);
      this.rainDate = this.getDate(_config.defaults.yesterday);
      this.airQDate = this.getDate(_config.defaults.todaysDate); //airQStartDate);
      this.windDate = this.getDate(_config.defaults.todaysDate); //windStartDate);
      this.masterDate = this.getDate(_config.defaults.todaysDate);
      this.panelsHidden = false;
      this.activeDG = undefined;
      this.currentCustomGraphic = undefined;
      this.activeBasemap = _config.defaults.activeBasemap;
      this.firesSelectIndex = 0; //layerPanelText.firesOptions.length - 1;
      this.plantationSelectIndex = _config.layerPanelText.plantationOptions.length - 1;
      this.forestSelectIndex = _config.layerPanelText.forestOptions.length - 1;
      this.viiirsSelectIndex = 0; //layerPanelText.firesOptions.length - 1; //0;
      this.lossToSelectIndex = _config.layerPanelText.lossOptions.length - 1;
      this.fireHistorySelectIndex = 14;
      this.layerPanelVisible = app.mobile === false;
      this.lat = undefined;
      this.lng = undefined;

      this.bindListeners({
        setBasemap: [_MapActions.mapActions.setBasemap, _ModalActions.modalActions.showBasemapModal],
        connectLayerEvents: _MapActions.mapActions.connectLayerEvents,
        setDGDate: _MapActions.mapActions.setDGDate,
        setAnalysisDate: _MapActions.mapActions.setAnalysisDate,
        setArchiveDate: _MapActions.mapActions.setArchiveDate,
        setNoaaDate: _MapActions.mapActions.setNoaaDate,
        setRiskDate: _MapActions.mapActions.setRiskDate,
        setRainDate: _MapActions.mapActions.setRainDate,
        setAirQDate: _MapActions.mapActions.setAirQDate,
        setWindDate: _MapActions.mapActions.setWindDate,
        setMasterDate: _MapActions.mapActions.setMasterDate,
        setGlobe: _ModalActions.modalActions.showCalendarModal,
        setCurrentCustomGraphic: _ModalActions.modalActions.showSubscribeModal,
        setCalendar: _MapActions.mapActions.setCalendar,
        updateOverlays: _MapActions.mapActions.updateOverlays,
        // sendAnalytics: mapActions.sendAnalytics,
        addActiveLayer: _LayerActions.layerActions.addActiveLayer,
        removeActiveLayer: _LayerActions.layerActions.removeActiveLayer,
        setFootprints: _LayerActions.layerActions.setFootprints,
        removeCustomFeature: _ModalActions.modalActions.removeCustomFeature,
        togglePanels: _MapActions.mapActions.togglePanels,
        changeFiresTimeline: _LayerActions.layerActions.changeFiresTimeline,
        changeForestTimeline: _LayerActions.layerActions.changeForestTimeline,
        changeFireHistoryTimeline: _LayerActions.layerActions.changeFireHistoryTimeline,
        incrementFireHistoryYear: _LayerActions.layerActions.incrementFireHistoryYear,
        decrementFireHistoryYear: _LayerActions.layerActions.decrementFireHistoryYear,
        changeViirsTimeline: _LayerActions.layerActions.changeViirsTimeline,
        changePlantations: _LayerActions.layerActions.changePlantations,
        updateCanopyDensity: _ModalActions.modalActions.updateCanopyDensity,
        showFootprints: _LayerActions.layerActions.showFootprints,
        toggleFootprintsVisibility: _LayerActions.layerActions.toggleFootprintsVisibility,
        toggleLayerPanelVisibility: _LayerActions.layerActions.toggleLayerPanelVisibility
      });
    }

    _createClass(MapStore, [{
      key: 'connectLayerEvents',
      value: function connectLayerEvents() {
        // Enable Mouse Events for al graphics layers
        app.map.graphics.enableMouseEvents();
        // Set up Click Listener to Perform Identify
        app.map.on('click', _LayersHelper2.default.performIdentify.bind(_LayersHelper2.default));

        app.map.on('extent-change, basemap-change', function () {
          _ShareHelper2.default.handleHashChange();
        });
        app.map.on('zoom-end', _LayersHelper2.default.checkZoomDependentLayers.bind(_LayersHelper2.default));

        _LayersHelper2.default.updateFireRisk(_config.defaults.yesterday);
        _LayersHelper2.default.updateLastRain(_config.defaults.yesterday);
        _LayersHelper2.default.updateAirQDate(_config.defaults.todaysDate);
        //LayersHelper.updateFireHistoryDefinitions(0);
      }
    }, {
      key: 'setCalendar',
      value: function setCalendar(calendar) {
        this.calendarVisible = calendar;
      }
    }, {
      key: 'updateOverlays',
      value: function updateOverlays(overlay) {
        var newOverlays = this.overlaysVisible.slice();
        var index = newOverlays.indexOf(overlay);
        if (index > -1) {
          newOverlays.splice(index, 1);
        } else {
          newOverlays.push(overlay);
        }
        this.overlaysVisible = newOverlays;
        _LayersHelper2.default.updateOverlays(newOverlays);
      }
    }, {
      key: 'togglePanels',
      value: function togglePanels() {
        this.panelsHidden = !this.panelsHidden;
      }
    }, {
      key: 'setCurrentCustomGraphic',
      value: function setCurrentCustomGraphic(graphic) {
        if (!graphic && app.map.graphics.graphics[0] && app.map.graphics.graphics[0].attributes && app.map.graphics.graphics[0].attributes.Layer === 'custom') {
          graphic = app.map.graphics.graphics[0];
        }
        this.currentCustomGraphic = graphic;
      }
    }, {
      key: 'setFootprints',
      value: function setFootprints(footprints) {
        this.footprints = footprints;
      }
    }, {
      key: 'setGlobe',
      value: function setGlobe(globe) {
        this.activeDG = globe;
      }
    }, {
      key: 'getDate',
      value: function getDate(date) {
        return window.Kalendae.moment(date).format('M/D/YYYY');
      }
    }, {
      key: 'setDGDate',
      value: function setDGDate(dateObj) {
        this.calendarVisible = '';

        this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

        if (!this.footprints) {
          return;
        }

        _LayersHelper2.default.updateDigitalGlobeLayerDefinitions([this.dgStartDate, this.dgEndDate, this.footprints]);
      }
    }, {
      key: 'setAnalysisDate',
      value: function setAnalysisDate(dateObj) {
        this.sendAnalytics('widget', 'timeline', 'The user updated the Analysis date expression.');
        this.calendarVisible = '';

        this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');
      }
    }, {
      key: 'setArchiveDate',
      value: function setArchiveDate(dateObj) {
        this.calendarVisible = '';

        this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

        _LayersHelper2.default.updateArchiveDates([this.archiveStartDate, this.archiveEndDate]);
      }
    }, {
      key: 'setNoaaDate',
      value: function setNoaaDate(dateObj) {
        this.calendarVisible = '';

        this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

        _LayersHelper2.default.updateNoaaDates([this.noaaStartDate, this.noaaEndDate]);
      }
    }, {
      key: 'setRiskDate',
      value: function setRiskDate(dateObj) {
        this.calendarVisible = '';

        this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

        _LayersHelper2.default.updateFireRisk(this.riskDate);
      }
    }, {
      key: 'setRainDate',
      value: function setRainDate(dateObj) {
        this.calendarVisible = '';

        this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

        _LayersHelper2.default.updateLastRain(this.rainDate);
      }
    }, {
      key: 'setAirQDate',
      value: function setAirQDate(dateObj) {
        this.calendarVisible = '';

        this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

        _LayersHelper2.default.updateAirQDate(this.airQDate);
      }
    }, {
      key: 'setWindDate',
      value: function setWindDate(dateObj) {
        this.calendarVisible = '';

        this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');
        _LayersHelper2.default.updateWindDate(this.windDate);
      }
    }, {
      key: 'setMasterDate',
      value: function setMasterDate(dateObj) {
        this.calendarVisible = '';
        //active, archive, noaa, fire risk, wind, air quality, maybe DG imagery

        var masterDate = window.Kalendae.moment(dateObj.date);
        var masterFormatted = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

        var archiveStart = window.Kalendae.moment(_config.defaults.archiveStartDate);
        var archiveEnd = window.Kalendae.moment(_config.defaults.archiveEndDate);
        var noaaStart = window.Kalendae.moment(_config.defaults.noaaStartDate);
        var riskStart = window.Kalendae.moment(_config.defaults.riskStartDate);
        var riskEnd = window.Kalendae.moment(_config.defaults.riskTempEnd);
        var rainStart = window.Kalendae.moment(_config.defaults.riskStartDate);
        var rainEnd = window.Kalendae.moment(_config.defaults.todaysDate);
        var windStart = window.Kalendae.moment(_config.defaults.windStartDate);
        var airQStart = window.Kalendae.moment(_config.defaults.airQStartDate);

        var today = window.Kalendae.moment(this.date);

        if (masterDate.isAfter(today)) {
          //todo
          this.removeActiveLayer(_constants2.default.archiveFires);
          this.removeActiveLayer(_constants2.default.activeFires);
          this.removeActiveLayer(_constants2.default.viirsFires);
        } else if (masterDate.isBefore(archiveStart)) {
          //todo: both of these are actually outside any of these
          this.removeActiveLayer(_constants2.default.archiveFires);
          this.removeActiveLayer(_constants2.default.activeFires);
          this.removeActiveLayer(_constants2.default.viirsFires);
        } else if (masterDate.isAfter(archiveEnd)) {
          this.addActiveLayer(_constants2.default.activeFires);
          this.addActiveLayer(_constants2.default.viirsFires);
          this.removeActiveLayer(_constants2.default.archiveFires);
        } else {
          this.addActiveLayer(_constants2.default.archiveFires);
          this.removeActiveLayer(_constants2.default.activeFires);
          this.removeActiveLayer(_constants2.default.viirsFires);
          this.archiveStartDate = masterFormatted;
          this.archiveEndDate = masterFormatted;
          _LayersHelper2.default.updateArchiveDates([this.archiveStartDate, this.archiveEndDate]);
        }

        if (masterDate.isBefore(noaaStart)) {
          this.removeActiveLayer(_constants2.default.noaa18Fires);
        } else {
          this.addActiveLayer(_constants2.default.noaa18Fires);
          this.noaaStartDate = masterFormatted;
          this.noaaEndDate = masterFormatted;
          _LayersHelper2.default.updateNoaaDates([this.noaaStartDate, this.noaaEndDate]);
        }

        if (masterDate.isBefore(riskStart)) {
          this.removeActiveLayer(_constants2.default.fireWeather);
        } else if (masterDate.isAfter(riskEnd)) {
          this.removeActiveLayer(_constants2.default.fireWeather);
        } else {
          this.addActiveLayer(_constants2.default.fireWeather);
          this.riskDate = masterFormatted;
          _LayersHelper2.default.updateFireRisk(this.riskDate);
        }

        if (masterDate.isBefore(rainStart)) {
          this.removeActiveLayer(_constants2.default.lastRainfall);
        } else if (masterDate.isAfter(rainEnd)) {
          this.removeActiveLayer(_constants2.default.lastRainfall);
        } else {
          this.addActiveLayer(_constants2.default.lastRainfall);
          this.rainDate = masterFormatted;
          _LayersHelper2.default.updateLastRain(this.rainDate);
        }

        if (masterDate.isBefore(airQStart)) {
          this.removeActiveLayer(_constants2.default.airQuality);
        } else {
          this.addActiveLayer(_constants2.default.airQuality);
          this.airQDate = masterFormatted;
          _LayersHelper2.default.updateAirQDate(this.airQDate);
        }

        if (masterDate.isBefore(windStart)) {
          this.removeActiveLayer(_constants2.default.windDirection);
        } else {
          this.addActiveLayer(_constants2.default.windDirection);
          this.windDate = masterFormatted;
        }
      }
    }, {
      key: 'sendAnalytics',
      value: function sendAnalytics(eventType, action, label) {
        //todo: why is this request getting sent so many times?
        ga('A.send', 'event', eventType, action, label);
        ga('B.send', 'event', eventType, action, label);
        ga('C.send', 'event', eventType, action, label);
      }
    }, {
      key: 'addActiveLayer',
      value: function addActiveLayer(layerId) {
        var index = this.activeLayers.indexOf(layerId);
        if (index === -1) {
          // Create a copy of the strings array for easy change detection
          var layers = this.activeLayers.slice();
          layers.push(layerId);
          if (layerId === 'plantationTypes') {
            // debugger
            this.removeActiveLayer('plantationSpecies');
          } else if (layerId === 'plantationSpecies') {
            this.removeActiveLayer('plantationTypes');
          }
          this.activeLayers = layers;
          app.activeLayers = layers;
          this.sendAnalytics('layer', 'toggle', 'The user toggled the ' + layerId + ' layer on.');
        }
      }
    }, {
      key: 'removeActiveLayer',
      value: function removeActiveLayer(layerId) {
        var index = this.activeLayers.indexOf(layerId);
        if (index !== -1) {
          // Create a copy of the strings array for easy change detection
          var layers = this.activeLayers.slice();
          layers.splice(index, 1);
          this.activeLayers = layers;
          app.activeLayers = layers;
          this.sendAnalytics('layer', 'toggle', 'The user toggled the ' + layerId + ' layer off.');
        }
      }
    }, {
      key: 'removeCustomFeature',
      value: function removeCustomFeature(graphic) {
        _LayersHelper2.default.removeCustomFeature(graphic);
      }
    }, {
      key: 'setBasemap',
      value: function setBasemap(basemap) {
        if (basemap !== this.activeBasemap) {
          this.sendAnalytics('basemap', 'toggle', 'The user toggled the ' + basemap + ' basemap on.');
          this.activeBasemap = basemap;
          if (basemap === _constants2.default.wriBasemap) {
            _ShareHelper2.default.handleHashChange(basemap);
          }
        }
      }
    }, {
      key: 'changeFiresTimeline',
      value: function changeFiresTimeline(activeIndex) {
        this.firesSelectIndex = activeIndex;
        this.sendAnalytics('widget', 'timeline', 'The user updated the Active Fires timeline.');
      }
    }, {
      key: 'changePlantations',
      value: function changePlantations(activeIndex) {
        this.plantationSelectIndex = activeIndex;
        this.sendAnalytics('widget', 'timeline', 'The user updated the Plantations selector.');
      }
    }, {
      key: 'changeViirsTimeline',
      value: function changeViirsTimeline(activeIndex) {
        this.viiirsSelectIndex = activeIndex;
        this.sendAnalytics('widget', 'timeline', 'The user updated the VIIRS Fires timeline.');
      }
    }, {
      key: 'changeForestTimeline',
      value: function changeForestTimeline(activeIndex) {
        this.forestSelectIndex = activeIndex;
        this.sendAnalytics('widget', 'timeline', 'The user updated the Primary Forests timeline.');
      }
    }, {
      key: 'changeFireHistoryTimeline',
      value: function changeFireHistoryTimeline(activeIndex) {
        this.fireHistorySelectIndex = activeIndex;
        this.sendAnalytics('widget', 'timeline', 'The user updated the Fire History timeline.');
      }
    }, {
      key: 'incrementFireHistoryYear',
      value: function incrementFireHistoryYear() {
        this.fireHistorySelectIndex += 1;
        this.sendAnalytics('widget', 'timeline', 'The user updated the Fire History timeline.');
      }
    }, {
      key: 'decrementFireHistoryYear',
      value: function decrementFireHistoryYear() {
        this.fireHistorySelectIndex -= 1;
        this.sendAnalytics('widget', 'timeline', 'The user updated the Fire History timeline.');
      }
    }, {
      key: 'updateCanopyDensity',
      value: function updateCanopyDensity(newDensity) {
        this.canopyDensity = newDensity;
        this.sendAnalytics('widget', 'timeline', 'The user updated the Tree Cover Density slider.');
      }
    }, {
      key: 'toggleFootprintsVisibility',
      value: function toggleFootprintsVisibility() {
        this.footprintsVisible = !this.footprintsVisible;
      }
    }, {
      key: 'showFootprints',
      value: function showFootprints() {
        this.footprintsVisible = true;
      }
    }, {
      key: 'toggleLayerPanelVisibility',
      value: function toggleLayerPanelVisibility() {
        this.layerPanelVisible = !this.layerPanelVisible;
      }
    }]);

    return MapStore;
  }();

  var mapStore = exports.mapStore = _alt2.default.createStore(MapStore, 'MapStore');
});