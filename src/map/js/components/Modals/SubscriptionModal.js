import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalActions} from 'actions/ModalActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalText} from 'js/config';
import {mapStore} from 'stores/MapStore';
import {loadJS} from 'utils/loaders';
import React from 'react';

export default class SubscriptionModal extends React.Component {

  constructor(props) {
    super(props);

    // modalStore.listen(this.storeUpdated.bind(this));
    // let defaultState = modalStore.getState();
    // this.state = {
    //   layerInfo: defaultState.modalLayerInfo
    // };
  }

  // storeUpdated () {
  //   let currentState = modalStore.getState();
  //   this.setState({ layerInfo: currentState.modalLayerInfo });
  // }

  render() {
    return (
      <ModalWrapper>
        <div className='canopy-modal-title'>{modalText.subscription.title}</div>
        <p>{modalText.subscription.emailInstructions}</p>
        <input>{modalText.subscription.emailPlaceholder}</input>
        <p>{modalText.subscription.phoneInstructions}</p>
        <input>{modalText.subscription.phonePlaceholder}</input>
        <div>
          <button>{modalText.subscription.subscribePlaceholder}</button>
        </div>
      </ModalWrapper>
    );
  }

}
