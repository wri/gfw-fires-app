import alt from 'js/alt';

class LayerActions {

  addActiveLayer (layerId) {
    this.dispatch(layerId);
  }

  removeActiveLayer (layerId) {
    this.dispatch(layerId);
  }

  showLoading (layerId) {
    this.dispatch(layerId);
  }

  changeFiresTimeline (selectedIndex) {
    this.dispatch(selectedIndex);
  }

  incrementFireHistoryYear() {
    this.dispatch();
  }

  decrementFireHistoryYear() {
    this.dispatch();
  }

  changeViirsTimeline (selectedIndex) {
    this.dispatch(selectedIndex);
  }

  changePlantations (selectedIndex) {
    this.dispatch(selectedIndex);
  }

  changeForestTimeline (selectedIndex) {
    this.dispatch(selectedIndex);
  }

  changeFireHistoryTimeline (selectedIndex) {
    this.dispatch(selectedIndex);
  }

  setFootprints (footprints) {
    this.dispatch(footprints);
  }

  toggleLayerPanelVisibility () {
    this.dispatch();
  }

  toggleFootprintsVisibility () {
    this.dispatch();
  }

  showFootprints () {
    this.dispatch();
  }

}

export const layerActions = alt.createActions(LayerActions);
