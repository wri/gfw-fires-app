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
    this.activeDG = undefined;
    this.activeBasemap = defaults.activeBasemap;
    this.firesSelectIndex = layerPanelText.firesOptions.length - 1;
    this.lossToSelectIndex = layerPanelText.lossOptions.length - 1;
    this.layerPanelVisible = app.mobile === false;

    this.bindListeners({
      setBasemap: [mapActions.setBasemap, modalActions.showBasemapModal],
      setDate: mapActions.setDate,
      setGlobe: modalActions.showGlobeModal,
      setCalendar: mapActions.setCalendar,
      addActiveLayer: layerActions.addActiveLayer,
      removeActiveLayer: layerActions.removeActiveLayer,
      setFootprints: layerActions.setFootprints,
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
    this.calendarVisible = calendar;
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

  setDate (date) {
    let fullDate = DateHelper.getDate(date);
    console.log(fullDate);
    if (this.activeDG === 'start') {
      this.dgStartDate = window.Kalendae.moment(date).format('M/D/YYYY');
    } else if (this.activeDG === 'end') {
      this.dgEndDate = window.Kalendae.moment(date).format('M/D/YYYY');
    }

    LayersHelper.updateDigitalGlobeLayerDefinitions([this.dgStartDate, this.dgEndDate, this.footprints]);
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
