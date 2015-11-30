import {layerInformation} from 'js/config';
import domClass from 'dojo/dom-class';
import alt from 'js/alt';

class ModalActions {

  showLayerInfo (layerId) {
    app.debug('ModalActions >>> showLayerInfo');
    let emptyObj = {};
    let layerInfo = layerInformation[layerId] || emptyObj;
    this.dispatch(layerInfo);
    if (layerInfo !== emptyObj) {
      domClass.remove('layer-modal', 'hidden');
    }
  }

  showShareModal (params) {
    app.debug('ModalActions >>> showShareModal');
    //TODO: Generate a url from bitly that includes Map Store state, this way we can share params
    let url = document.location.href.split('?')[0];
    this.dispatch(`${url}?${params}`);
    domClass.remove('share-modal', 'hidden');
  }

  showAlertsModal () {
    app.debug('ModalActions >>> showAlertsModal');
    domClass.remove('alerts-modal', 'hidden');
  }

  showCanopyModal () {
    app.debug('ModalActions >>> showCanopyModal');
    domClass.remove('canopy-modal', 'hidden');
  }

  hideModal (node) {
    app.debug('ModalActions >>> hideModal');
    domClass.add(node, 'hidden');
  }

  updateCanopyDensity (newDensity) {
    app.debug('ModalActions >>> updateCanopyDensity');
    this.dispatch(newDensity);
  }

}

export const modalActions = alt.createActions(ModalActions);
