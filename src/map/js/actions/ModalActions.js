import {metadataUrl, metadataIds} from 'js/config';
import esriRequest from 'esri/request';
import urlUtils from 'esri/urlUtils';
import domClass from 'dojo/dom-class';
import alt from 'js/alt';

class ModalActions {

  showLayerInfo (layerId) {
    app.debug('ModalActions >>> showLayerInfo');

    urlUtils.addProxyRule({
      urlPrefix: 'http://54.88.79.102',
      proxyUrl: './php/proxy.php'
    });

    esriRequest({
      url: metadataUrl + metadataIds[layerId],
      handleAs: 'json',
      callbackParamName: 'callback'
    }, {
      usePost: true
    }).then(res => {
      this.dispatch(res);
      domClass.remove('layer-modal', 'hidden');
    }, err => {
      this.dispatch({});
      domClass.remove('layer-modal', 'hidden');
      console.error(err);
    });
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
