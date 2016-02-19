import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalStore} from 'stores/ModalStore';
import {mapActions} from 'actions/MapActions';
import {modalActions} from 'actions/ModalActions';
import cookie from 'dojo/cookie';
import {modalText} from 'js/config';
import React from 'react';

export default class BasemapModal extends React.Component {

  constructor(props) {
    super(props);

    modalStore.listen(this.storeUpdated.bind(this));
    let defaultState = modalStore.getState();
    this.state = {
      cookieChecked: undefined
    };
  }

  storeUpdated () {
    let currentState = modalStore.getState();
    // this.setState({ layerInfo: currentState.modalLayerInfo });
  }

  render () {
    return (
        <ModalWrapper>
          <div className='modal-content'>
            <div className='modal-source'>
              <h3 className='modal-subtitle'>Would you like to change basemaps?</h3>

              <div className='modal-overview'>
                <p>This layer is best visualized with the Dark Gray Canvas basemap. Would you like to switch to it now.</p>
                <button className='gfw-btn white pointer' onClick={this.switchBasemap.bind(this)}>Yes</button>
                <button className='gfw-btn white pointer' onClick={this.keepBasemap.bind(this)}>No</button>
                <div id='basemap-checkbox-container'>
                  <input id='basemap-cookie-checkbox' onChange={this.setCookie.bind(this)} type='checkbox'>Remember my decision</input>
                </div>
              </div>
            </div>
          </div>
        </ModalWrapper>
     );
  }

  switchBasemap () {
    if (this.state.cookieChecked !== undefined) {
      this.createCookie(this.state.cookieChecked);
    }
    mapActions.setBasemap('dark-gray');
    this.close();
  }

  keepBasemap () {
    if (this.state.cookieChecked !== undefined) {
      this.createCookie(this.state.cookieChecked);
    }
    this.close();
  }


  setCookie (evt) {
    this.setState({
      cookieChecked: evt.target.checked
    });
  }

  createCookie (cookieValue) {
    cookie('windBasemapDecision', cookieValue, {
      expires: 7
    });
  }

  close () {
    modalActions.hideModal(React.findDOMNode(this).parentElement);
  }

}
