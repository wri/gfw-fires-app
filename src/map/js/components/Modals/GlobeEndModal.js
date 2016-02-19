import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalStore} from 'stores/ModalStore';
import {mapActions} from 'actions/MapActions';
import {modalActions} from 'actions/ModalActions';
import cookie from 'dojo/cookie';
import {modalText} from 'js/config';
import React from 'react';

export default class GlobeEndModal extends React.Component {

  constructor(props) {
    super(props);

    // modalStore.listen(this.storeUpdated.bind(this));
    // let defaultState = modalStore.getState();

  }

  storeUpdated () {
    let currentState = modalStore.getState();
    // this.setState({ layerInfo: currentState.modalLayerInfo });
  }

  render () {
    return (
        <ModalWrapper>
        <div className={`modal-content ${this.props.domClass}`}>
          <div id={this.props.domId}>hayyy</div>
        </div>;
        </ModalWrapper>
     );
  }


  close () {
    modalActions.hideModal(React.findDOMNode(this).parentElement);
  }

}
