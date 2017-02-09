import {layerPanelText, defaults, layersConfig} from 'js/config';
import {layerActions} from 'actions/LayerActions';
import {modalActions} from 'actions/ModalActions';
import {mapActions} from 'actions/MapActions';
import LayersHelper from 'helpers/LayersHelper';
import ShareHelper from 'helpers/ShareHelper';
import KEYS from 'js/constants';
import alt from 'js/alt';

class MapStore {

  constructor () {
    //- activeLayers defaults should be the id's of whatever layers
    //- are configured to be visible in layersConfig, filter out layers with no group
    //- because those layers are not in the ui and should not be in this list
    this.activeLayers = layersConfig.filter(l => l.visible && l.group).map(l => l.id);
    this.canopyDensity = defaults.canopyDensity;
    this.lossFromSelectIndex = defaults.lossFromSelectIndex;
    this.footprintsVisible = true;
    this.footprints = undefined;
    this.overlaysVisible = [];
    this.date = this.getDate(defaults.todaysDate);
    this.dgStartDate = this.getDate(defaults.dgStartDate);
    this.dgEndDate = this.getDate(defaults.todaysDate);
    this.analysisStartDate = this.getDate(defaults.analysisStartDate);
    this.analysisEndDate = this.getDate(defaults.yesterday);
    this.archiveStartDate = this.getDate(defaults.archiveInitialDate);
    this.archiveEndDate = this.getDate(defaults.analysisStartDate);
    this.archiveViirsStartDate = this.getDate(defaults.archiveViirsStartDate);
    this.archiveViirsEndDate = this.getDate(defaults.archiveViirsEndDate);
    this.archiveModisStartDate = this.getDate(defaults.archiveModisStartDate);
    this.archiveModisEndDate = this.getDate(defaults.archiveModisEndDate);
    this.noaaStartDate = this.getDate(defaults.analysisStartDate);
    this.noaaEndDate = this.getDate(defaults.todaysDate);
    this.riskStartDate = this.getDate(defaults.riskStartDate);
    this.riskDate = this.getDate(defaults.yesterday);
    this.rainStartDate = this.getDate(defaults.riskStartDate);
    this.rainDate = this.getDate(defaults.yesterday);
    this.airQDate = this.getDate(defaults.todaysDate); //airQStartDate);
    this.windDate = this.getDate(defaults.todaysDate); //windStartDate);
    this.masterDate = this.getDate(defaults.todaysDate);
    this.panelsHidden = false;
    this.activeDG = undefined;
    this.currentCustomGraphic = undefined;
    this.activeBasemap = defaults.activeBasemap;
    this.firesSelectIndex = 0; //layerPanelText.firesOptions.length - 1;
    this.plantationSelectIndex = layerPanelText.plantationOptions.length - 1;
    this.forestSelectIndex = layerPanelText.forestOptions.length - 1;
    this.viiirsSelectIndex = 0; //layerPanelText.firesOptions.length - 1; //0;
    this.lossToSelectIndex = layerPanelText.lossOptions.length - 1;
    this.fireHistorySelectIndex = 14;
    this.layerPanelVisible = app.mobile === false;
    this.lat = undefined;
    this.lng = undefined;

    this.bindListeners({
      setBasemap: [mapActions.setBasemap, modalActions.showBasemapModal],
      connectLayerEvents: mapActions.connectLayerEvents,
      setDGDate: mapActions.setDGDate,
      setAnalysisDate: mapActions.setAnalysisDate,
      setArchiveDate: mapActions.setArchiveDate,
      setViirsArchiveDate: mapActions.setViirsArchiveDate,
      setModisArchiveDate: mapActions.setModisArchiveDate,
      setNoaaDate: mapActions.setNoaaDate,
      setRiskDate: mapActions.setRiskDate,
      setRainDate: mapActions.setRainDate,
      setAirQDate: mapActions.setAirQDate,
      setWindDate: mapActions.setWindDate,
      setMasterDate: mapActions.setMasterDate,
      setGlobe: modalActions.showCalendarModal,
      setCurrentCustomGraphic: modalActions.showSubscribeModal,
      setCalendar: mapActions.setCalendar,
      updateOverlays: mapActions.updateOverlays,
      // sendAnalytics: mapActions.sendAnalytics,
      addActiveLayer: layerActions.addActiveLayer,
      removeActiveLayer: layerActions.removeActiveLayer,
      setFootprints: layerActions.setFootprints,
      removeCustomFeature: modalActions.removeCustomFeature,
      togglePanels: mapActions.togglePanels,
      changeFiresTimeline: layerActions.changeFiresTimeline,
      changeForestTimeline: layerActions.changeForestTimeline,
      changeFireHistoryTimeline: layerActions.changeFireHistoryTimeline,
      incrementFireHistoryYear: layerActions.incrementFireHistoryYear,
      decrementFireHistoryYear: layerActions.decrementFireHistoryYear,
      changeViirsTimeline: layerActions.changeViirsTimeline,
      changePlantations: layerActions.changePlantations,
      updateCanopyDensity: modalActions.updateCanopyDensity,
      showFootprints: layerActions.showFootprints,
      toggleFootprintsVisibility: layerActions.toggleFootprintsVisibility,
      toggleLayerPanelVisibility: layerActions.toggleLayerPanelVisibility
    });
  }

  connectLayerEvents () {
    // Enable Mouse Events for al graphics layers
    app.map.graphics.enableMouseEvents();
    // Set up Click Listener to Perform Identify
    app.map.on('click', LayersHelper.performIdentify.bind(LayersHelper));

    app.map.on('extent-change, basemap-change', function(){
      ShareHelper.handleHashChange();
    });
    app.map.on('zoom-end', LayersHelper.checkZoomDependentLayers.bind(LayersHelper));

    LayersHelper.updateFireRisk(defaults.yesterday);
    LayersHelper.updateLastRain(defaults.yesterday);
    LayersHelper.updateAirQDate(defaults.todaysDate);
    //LayersHelper.updateFireHistoryDefinitions(0);

  }

  setCalendar (calendar) {
    this.calendarVisible = calendar;
  }

  updateOverlays (overlay) {
    let newOverlays = this.overlaysVisible.slice();
    let index = newOverlays.indexOf(overlay);
    if (index > -1) {
      newOverlays.splice(index, 1);
    } else {
      newOverlays.push(overlay);
    }
    this.overlaysVisible = newOverlays;
    LayersHelper.updateOverlays(newOverlays);
  }

  togglePanels () {
    this.panelsHidden = !this.panelsHidden;
  }

  setCurrentCustomGraphic (graphic) {
    if (!graphic && app.map.graphics.graphics[0] && app.map.graphics.graphics[0].attributes && app.map.graphics.graphics[0].attributes.Layer === 'custom') {
      graphic = app.map.graphics.graphics[0];
    }
    this.currentCustomGraphic = graphic;
  }

  setFootprints (footprints) {
    this.footprints = footprints;
  }

  setGlobe (globe) {
    this.activeDG = globe;
  }

  getDate (date) {
    return window.Kalendae.moment(date).format('M/D/YYYY');
  }

  setDGDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    if (!this.footprints) {
      return;
    }

    LayersHelper.updateDigitalGlobeLayerDefinitions([this.dgStartDate, this.dgEndDate, this.footprints]);
  }

  setAnalysisDate (dateObj) {
    this.sendAnalytics('widget', 'timeline', 'The user updated the Analysis date expression.');
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');
  }

  setArchiveDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    LayersHelper.updateArchiveDates([this.archiveStartDate, this.archiveEndDate]);
  }

  setViirsArchiveDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    LayersHelper.updateViirsArchiveDates([this.archiveViirsStartDate, this.archiveViirsEndDate]);
  }

  setModisArchiveDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    LayersHelper.updateModisArchiveDates([this.archiveModisStartDate, this.archiveModisEndDate]);
  }

  setNoaaDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    LayersHelper.updateNoaaDates([this.noaaStartDate, this.noaaEndDate]);
  }

  setRiskDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    LayersHelper.updateFireRisk(this.riskDate);
  }

  setRainDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    LayersHelper.updateLastRain(this.rainDate);
  }

  setAirQDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    LayersHelper.updateAirQDate(this.airQDate);
  }

  setWindDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');
    LayersHelper.updateWindDate(this.windDate);
  }

  setMasterDate (dateObj) {
    this.calendarVisible = '';
    //active, archive, noaa, fire risk, wind, air quality, maybe DG imagery

    let masterDate = window.Kalendae.moment(dateObj.date);
    let masterFormatted = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    let archiveStart = window.Kalendae.moment(defaults.archiveStartDate);
    let archiveEnd = window.Kalendae.moment(defaults.archiveEndDate);
    let noaaStart = window.Kalendae.moment(defaults.noaaStartDate);
    let riskStart = window.Kalendae.moment(defaults.riskStartDate);
    let riskEnd = window.Kalendae.moment(defaults.riskTempEnd);
    let rainStart = window.Kalendae.moment(defaults.riskStartDate);
    let rainEnd = window.Kalendae.moment(defaults.todaysDate);
    let windStart = window.Kalendae.moment(defaults.windStartDate);
    let airQStart = window.Kalendae.moment(defaults.airQStartDate);

    let today = window.Kalendae.moment(this.date);

    if (masterDate.isAfter(today)) { //todo
      this.removeActiveLayer(KEYS.archiveFires);
      this.removeActiveLayer(KEYS.activeFires);
      this.removeActiveLayer(KEYS.viirsFires);
    } else if (masterDate.isBefore(archiveStart)) { //todo: both of these are actually outside any of these
      this.removeActiveLayer(KEYS.archiveFires);
      this.removeActiveLayer(KEYS.activeFires);
      this.removeActiveLayer(KEYS.viirsFires);
    } else if (masterDate.isAfter(archiveEnd)) {
      this.addActiveLayer(KEYS.activeFires);
      this.addActiveLayer(KEYS.viirsFires);
      this.removeActiveLayer(KEYS.archiveFires);
    } else {
      this.addActiveLayer(KEYS.archiveFires);
      this.removeActiveLayer(KEYS.activeFires);
      this.removeActiveLayer(KEYS.viirsFires);
      this.archiveStartDate = masterFormatted;
      this.archiveEndDate = masterFormatted;
      LayersHelper.updateArchiveDates([this.archiveStartDate, this.archiveEndDate]);
    }

    if (masterDate.isBefore(noaaStart)) {
      this.removeActiveLayer(KEYS.noaa18Fires);
    } else {
      this.addActiveLayer(KEYS.noaa18Fires);
      this.noaaStartDate = masterFormatted;
      this.noaaEndDate = masterFormatted;
      LayersHelper.updateNoaaDates([this.noaaStartDate, this.noaaEndDate]);
    }

    if (masterDate.isBefore(riskStart)) {
      this.removeActiveLayer(KEYS.fireWeather);
    } else if (masterDate.isAfter(riskEnd)) {
      this.removeActiveLayer(KEYS.fireWeather);
    } else {
      this.addActiveLayer(KEYS.fireWeather);
      this.riskDate = masterFormatted;
      LayersHelper.updateFireRisk(this.riskDate);
    }

    if (masterDate.isBefore(rainStart)) {
      this.removeActiveLayer(KEYS.lastRainfall);
    } else if (masterDate.isAfter(rainEnd)) {
      this.removeActiveLayer(KEYS.lastRainfall);
    } else {
      this.addActiveLayer(KEYS.lastRainfall);
      this.rainDate = masterFormatted;
      LayersHelper.updateLastRain(this.rainDate);
    }

    if (masterDate.isBefore(airQStart)) {
      this.removeActiveLayer(KEYS.airQuality);
    } else {
      this.addActiveLayer(KEYS.airQuality);
      this.airQDate = masterFormatted;
      LayersHelper.updateAirQDate(this.airQDate);
    }

    if (masterDate.isBefore(windStart)) {
      this.removeActiveLayer(KEYS.windDirection);
    } else {
      this.addActiveLayer(KEYS.windDirection);
      this.windDate = masterFormatted;
    }

  }

  sendAnalytics (eventType, action, label) { //todo: why is this request getting sent so many times?
    ga('A.send', 'event', eventType, action, label);
    ga('B.send', 'event', eventType, action, label);
    ga('C.send', 'event', eventType, action, label);
  }

  addActiveLayer (layerId) {
    let index = this.activeLayers.indexOf(layerId);
    if (index === -1) {
      // Create a copy of the strings array for easy change detection
      let layers = this.activeLayers.slice();
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

  removeActiveLayer (layerId) {
    let index = this.activeLayers.indexOf(layerId);
    if (index !== -1) {
      // Create a copy of the strings array for easy change detection
      let layers = this.activeLayers.slice();
      layers.splice(index, 1);
      this.activeLayers = layers;
      app.activeLayers = layers;
      this.sendAnalytics('layer', 'toggle', 'The user toggled the ' + layerId + ' layer off.');
    }
  }

  removeCustomFeature (graphic) {
    LayersHelper.removeCustomFeature(graphic);
  }

  setBasemap (basemap) {
    if (basemap !== this.activeBasemap) {
      this.sendAnalytics('basemap', 'toggle', 'The user toggled the ' + basemap + ' basemap on.');
      this.activeBasemap = basemap;
      if (basemap === KEYS.wriBasemap) {
        ShareHelper.handleHashChange(basemap);
      }
    }
  }

  changeFiresTimeline (activeIndex) {
    this.firesSelectIndex = activeIndex;
    this.sendAnalytics('widget', 'timeline', 'The user updated the Active Fires timeline.');
  }

  changePlantations (activeIndex) {
    this.plantationSelectIndex = activeIndex;
    this.sendAnalytics('widget', 'timeline', 'The user updated the Plantations selector.');
  }

  changeViirsTimeline (activeIndex) {
    this.viiirsSelectIndex = activeIndex;
    this.sendAnalytics('widget', 'timeline', 'The user updated the VIIRS Fires timeline.');
  }

  changeForestTimeline (activeIndex) {
    this.forestSelectIndex = activeIndex;
    this.sendAnalytics('widget', 'timeline', 'The user updated the Primary Forests timeline.');
  }

  changeFireHistoryTimeline (activeIndex) {
    this.fireHistorySelectIndex = activeIndex;
    this.sendAnalytics('widget', 'timeline', 'The user updated the Fire History timeline.');
  }

  incrementFireHistoryYear () {
    this.fireHistorySelectIndex += 1;
    this.sendAnalytics('widget', 'timeline', 'The user updated the Fire History timeline.');
  }

  decrementFireHistoryYear () {
    this.fireHistorySelectIndex -= 1;
    this.sendAnalytics('widget', 'timeline', 'The user updated the Fire History timeline.');
  }

  updateCanopyDensity (newDensity) {
    this.canopyDensity = newDensity;
    this.sendAnalytics('widget', 'timeline', 'The user updated the Tree Cover Density slider.');
  }

  toggleFootprintsVisibility () {
    this.footprintsVisible = !this.footprintsVisible;
  }

  showFootprints () {
    this.footprintsVisible = true;
  }

  toggleLayerPanelVisibility () {
    this.layerPanelVisible = !this.layerPanelVisible;
  }

}

export const mapStore = alt.createStore(MapStore, 'MapStore');
