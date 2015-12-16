import {layerPanelText, defaults, layersConfig} from 'js/config';
import {layerActions} from 'actions/LayerActions';
import {modalActions} from 'actions/ModalActions';
import {mapActions} from 'actions/MapActions';
import alt from 'js/alt';

class MapStore {

  constructor () {
    //- activeLayers defaults should be the id's of whatever layers
    //- are configured to be visible in layersConfig, filter out layers with no group
    //- because those layers are not in the ui and should not be in this list
    this.activeLayers = layersConfig.filter(l => l.visible && l.group).map(l => l.id);
    this.canopyDensity = defaults.canopyDensity;
    this.lossFromSelectIndex = defaults.lossFromSelectIndex;
    this.activeBasemap = defaults.activeBasemap;
    this.firesSelectIndex = layerPanelText.firesOptions.length - 1;
    this.lossToSelectIndex = layerPanelText.lossOptions.length - 1;
    this.layerPanelVisible = app.mobile === false;

    this.bindListeners({
      setBasemap: mapActions.setBasemap,
      addActiveLayer: layerActions.addActiveLayer,
      removeActiveLayer: layerActions.removeActiveLayer,
      changeFiresTimeline: layerActions.changeFiresTimeline,
      updateCanopyDensity: modalActions.updateCanopyDensity,
      changeLossToTimeline: layerActions.changeLossToTimeline,
      changeLossFromTimeline: layerActions.changeLossFromTimeline,
      toggleLayerPanelVisibility: layerActions.toggleLayerPanelVisibility
    });
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
    this.activeBasemap = basemap;
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

  toggleLayerPanelVisibility () {
    this.layerPanelVisible = !this.layerPanelVisible;
  }

}

export const mapStore = alt.createStore(MapStore, 'MapStore');
