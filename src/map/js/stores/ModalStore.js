import {modalActions} from 'actions/ModalActions';
import {layerInformation} from 'js/config';
import alt from 'js/alt';

class ModalStore {

  constructor () {
    this.bitlyUrl = '';
    this.modalLayerInfo = {};
    this.shareBy = 'embed';

    this.bindListeners({
      showLayerInfo: modalActions.showLayerInfo,
      updateBitlyUrl: modalActions.showShareModal,
      switchEmbed: modalActions.switchEmbed,
      switchLink: modalActions.switchLink
    });
  }

  showLayerInfo (layerInfo) {
    if (typeof layerInfo === 'string') {
      layerInfo = layerInformation[layerInfo] ? layerInformation[layerInfo] : {};
    }

    this.modalLayerInfo = layerInfo;
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
