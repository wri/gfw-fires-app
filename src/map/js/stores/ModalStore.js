import {modalActions} from 'actions/ModalActions';
import {layerInformation} from 'js/config';
import alt from 'js/alt';

class ModalStore {

  constructor () {
    this.bitlyUrl = '';
    this.modalLayerInfo = {};
    this.confirmationInfo = {};
    this.shareBy = 'link';

    this.bindListeners({
      showLayerInfo: modalActions.showLayerInfo,
      updateBitlyUrl: modalActions.showShareModal,
      switchEmbed: modalActions.switchEmbed,
      switchLink: modalActions.switchLink,
      showConfirmationModal: modalActions.showConfirmationModal
    });
  }

  sendAnalytics (eventType, action, label) {
    ga('A.send', 'event', eventType, action, label);
    ga('B.send', 'event', eventType, action, label);
    ga('C.send', 'event', eventType, action, label);
  }

  showLayerInfo (layerInfo) {
    this.sendAnalytics('metadata', 'request', 'The user requested metadata for the ' + layerInfo + ' layer.');

    if (typeof layerInfo === 'string') {
      layerInfo = layerInformation[layerInfo] ? layerInformation[layerInfo] : {};
    }

    this.modalLayerInfo = layerInfo;
  }

  showConfirmationModal (confirmationConfig) {
    this.confirmationInfo = confirmationConfig;
  }

  updateBitlyUrl (bitlyUrl) {
    this.bitlyUrl = bitlyUrl;
  }

  switchEmbed () {
    this.shareBy = 'embed';
  }

  switchLink () {
    this.shareBy = 'link';
  }

}

export const modalStore = alt.createStore(ModalStore, 'ModalStore');
