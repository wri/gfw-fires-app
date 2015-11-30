import {modalActions} from 'actions/ModalActions';
import alt from 'js/alt';

class ModalStore {

  constructor () {
    this.bitlyUrl = '';
    this.modalLayerInfo = {};

    this.bindListeners({
      showLayerInfo: modalActions.showLayerInfo,
      updateBitlyUrl: modalActions.showShareModal
    });
  }

  showLayerInfo (layerInfo) {
    this.modalLayerInfo = layerInfo;
  }

  updateBitlyUrl (bitlyUrl) {
    this.bitlyUrl = bitlyUrl;
  }

}

export const modalStore = alt.createStore(ModalStore, 'ModalStore');
