import {layerPanelText, defaults, layersConfig} from 'js/config';
import {layerActions} from 'actions/LayerActions';
import {modalActions} from 'actions/ModalActions';
import {mapActions} from 'actions/MapActions';
import LayersHelper from 'helpers/LayersHelper';
import DateHelper from 'helpers/DateHelper';
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
    this.date = this.getDate(defaults.todaysDate);
    this.dgStartDate = this.getDate(defaults.dgStartDate);
    this.dgEndDate = this.getDate(defaults.todaysDate);
    this.analysisStartDate = this.getDate(defaults.analysisStartDate);
    this.analysisEndDate = this.getDate(defaults.todaysDate);
    this.archiveStartDate = this.getDate(defaults.archiveStartDate);
    this.archiveEndDate = this.getDate(defaults.analysisStartDate);
    this.noaaStartDate = this.getDate(defaults.analysisStartDate);
    this.noaaEndDate = this.getDate(defaults.todaysDate);
    this.riskDate = this.getDate(defaults.riskTempEnd); //todo: are we still getting data for this? -should this be hardcoded to some past date?
    this.windDate = this.getDate(defaults.windStartDate);
    this.masterDate = this.getDate(defaults.todaysDate);
    this.panelsHidden = false;
    this.activeDG = undefined;
    this.currentCustomGraphic = undefined;
    this.activeBasemap = defaults.activeBasemap;
    this.firesSelectIndex = layerPanelText.firesOptions.length - 1;
    this.lossToSelectIndex = layerPanelText.lossOptions.length - 1;
    this.layerPanelVisible = app.mobile === false;

    this.bindListeners({
      setBasemap: [mapActions.setBasemap, modalActions.showBasemapModal],
      setDGDate: mapActions.setDGDate,
      setAnalysisDate: mapActions.setAnalysisDate,
      setArchiveDate: mapActions.setArchiveDate,
      setNoaaDate: mapActions.setNoaaDate,
      setRiskDate: mapActions.setRiskDate,
      setMasterDate: mapActions.setMasterDate,
      setGlobe: modalActions.showCalendarModal,
      setCurrentCustomGraphic: modalActions.showSubscribeModal,
      setCalendar: mapActions.setCalendar,
      addActiveLayer: layerActions.addActiveLayer,
      removeActiveLayer: layerActions.removeActiveLayer,
      setFootprints: layerActions.setFootprints,
      removeCustomFeature: modalActions.removeCustomFeature,
      togglePanels: mapActions.togglePanels,
      changeFiresTimeline: layerActions.changeFiresTimeline,
      updateCanopyDensity: modalActions.updateCanopyDensity,
      showFootprints: layerActions.showFootprints,
      toggleFootprintsVisibility: layerActions.toggleFootprintsVisibility,
      changeLossToTimeline: layerActions.changeLossToTimeline,
      changeLossFromTimeline: layerActions.changeLossFromTimeline,
      toggleLayerPanelVisibility: layerActions.toggleLayerPanelVisibility
    });
  }

  setCalendar (calendar) {
    console.log(calendar);
    this.calendarVisible = calendar;
  }

  togglePanels () {
    this.panelsHidden = !this.panelsHidden;
  }

  setCurrentCustomGraphic (graphic) {
    this.currentCustomGraphic = graphic;
  }

  setFootprints (footprints) {
    this.footprints = footprints;
  }

  setGlobe (globe) {
    this.activeDG = globe;
  }

  getDate (date) {
    // let fullDate = DateHelper.getDate(date);
    // console.log(fullDate);
    return window.Kalendae.moment(date).format('M/D/YYYY');
  }

  setDGDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');
    //
    // if (this.activeDG === 'start') {
    //   this.dgStartDate = window.Kalendae.moment(date).format('M/D/YYYY');
    // } else if (this.activeDG === 'end') {
    //   this.dgEndDate = window.Kalendae.moment(date).format('M/D/YYYY');
    // }

    if (!this.footprints) {
      return;
    }

    LayersHelper.updateDigitalGlobeLayerDefinitions([this.dgStartDate, this.dgEndDate, this.footprints]);
  }

  setAnalysisDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');
  }

  setArchiveDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    LayersHelper.updateArchiveDates([this.archiveStartDate, this.archiveEndDate]);
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

  setWindDate (dateObj) {
    this.calendarVisible = '';

    this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');

    LayersHelper.updateFireRisk(this.riskDate);
  }

  setMasterDate (dateObj) {
    this.calendarVisible = '';

    debugger //todo: set up All of the calendars to listen to this!

    // this[dateObj.dest] = window.Kalendae.moment(dateObj.date).format('M/D/YYYY');
    //
    // LayersHelper.updateArchiveDates([this.archiveStartDate, this.archiveEndDate]);
  }

  addActiveLayer (layerId) {
    let index = this.activeLayers.indexOf(layerId);
    if (index === -1) {
      // Create a copy of the strings array for easy change detection
      let layers = this.activeLayers.slice();
      layers.push(layerId);
      this.activeLayers = layers;
    }
  }

  removeActiveLayer (layerId) {
    let index = this.activeLayers.indexOf(layerId);
    if (index !== -1) {
      // Create a copy of the strings array for easy change detection
      let layers = this.activeLayers.slice();
      layers.splice(index, 1);
      this.activeLayers = layers;
    }
  }

  removeCustomFeature (graphic) {
    LayersHelper.removeCustomFeature(graphic);
  }

  setBasemap (basemap) {
    if (basemap !== this.activeBasemap) {
      this.activeBasemap = basemap;
    }
  }

  showLayerInfo (layerInfo) {
    this.modalLayerInfo = layerInfo;
  }

  changeFiresTimeline (activeIndex) {
    this.firesSelectIndex = activeIndex;
  }

  changeLossFromTimeline (activeIndex) {
    this.lossFromSelectIndex = activeIndex;
  }

  changeLossToTimeline (activeIndex) {
    this.lossToSelectIndex = activeIndex;
  }

  updateCanopyDensity (newDensity) {
    this.canopyDensity = newDensity;
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
