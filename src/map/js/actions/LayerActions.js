import alt from 'js/alt';

class LayerActions {

  addActiveLayer (layerId) {
    this.dispatch(layerId);
    // TODO: Remove once current layer panel design is approved
    // if (kids) {
    //   kids.forEach(childLayer => this.dispatch(childLayer));
    // }
  }

  removeActiveLayer (layerId) {
    this.dispatch(layerId);
    // TODO: Remove once current layer panel design is approved
    // if (kids) {
    //   kids.forEach(childLayer => this.dispatch(childLayer));
    // }
  }

  changeFiresTimeline (selectedIndex) {
    this.dispatch(selectedIndex);
  }

  changeLossFromTimeline (selectedIndex) {
    this.dispatch(selectedIndex);
  }

  changeLossToTimeline (selectedIndex) {
    this.dispatch(selectedIndex);
  }

  toggleLayerPanelVisibility () {
    this.dispatch();
  }

}

export const layerActions = alt.createActions(LayerActions);
