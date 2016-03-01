import {modalActions} from 'actions/ModalActions';
import {layerInformation} from 'js/config';
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
    if (typeof layerInfo === 'string') {
      console.log(layerInfo)
      layerInfo = layerInformation[layerInfo] ? layerInformation[layerInfo] : {};
    }

    this.modalLayerInfo = layerInfo;
  }

  updateBitlyUrl (bitlyUrl) {
    this.bitlyUrl = bitlyUrl;
  }

}

export const modalStore = alt.createStore(ModalStore, 'ModalStore');
