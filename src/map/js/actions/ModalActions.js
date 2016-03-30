import {metadataUrl, metadataIds} from 'js/config';
import esriRequest from 'esri/request';
import cookie from 'dojo/cookie';
import urlUtils from 'esri/urlUtils';
import domClass from 'dojo/dom-class';
import alt from 'js/alt';

class ModalActions {

  showLayerInfo (layerId) {
    app.debug('ModalActions >>> showLayerInfo');

    urlUtils.addProxyRule({
      urlPrefix: 'http://api.globalforestwatch.org',
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
      // this.dispatch({});
      // console.log(layerId)
      this.dispatch(layerId); //todo: show config's template based on this layerId
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

  showCalendarModal (active) {
    app.debug('ModalActions >>> showCalendarModal');
    domClass.remove('calendar-modal', 'hidden');
    this.dispatch(active);
  }

  showAlertsModal () {
    app.debug('ModalActions >>> showAlertsModal');
    domClass.remove('alerts-modal', 'hidden');
  }

  showFiresModal () {
    app.debug('ModalActions >>> showFiresModal');
    domClass.remove('fires-modal', 'hidden');
  }

  switchEmbed () {
    app.debug('ModalActions >>> switchEmbed');
    this.dispatch();
  }

  switchLink () {
    app.debug('ModalActions >>> switchLink');
    this.dispatch();
  }

  showSubscribeModal (graphic) {
    app.debug('ModalActions >>> showAlertsModal');
    this.dispatch(graphic);
    domClass.remove('subscription-modal', 'hidden');
  }

  showBasemapModal () {
    app.debug('ModalActions >>> showBasemapModal');
    let currentCookie = cookie('windBasemapDecision');
    if (currentCookie === undefined) {
      domClass.remove('basemap-modal', 'hidden');
    } else {
      if (currentCookie === 'true') { //change basemap
        this.dispatch('dark-gray');
      }
    }
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

  removeCustomFeature (graphic) {
    app.debug('ModalActions >>> removeCustomFeature');
    this.dispatch(graphic);
  }

}

export const modalActions = alt.createActions(ModalActions);
