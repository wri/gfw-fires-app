/* @flow */
import ModalWrapper from 'components/Modals/ModalWrapper';
import {mapActions} from 'actions/MapActions';
import {modalActions} from 'actions/ModalActions';
import cookie from 'dojo/cookie';
import ReactDOM from 'react-dom';
import React, {
  Component
} from 'react';

type CookiePropType = {
  target: {
    checked: boolean
  }
};

export default class BasemapModal extends Component {
  displayName: BasemapModal;
  state: any;

  constructor(props: any) {
    super(props);

    this.state = {
      cookieChecked: undefined
    };
  }

  render () {
    return (
        <ModalWrapper>
          <div className='modal-content'>
            <div className='modal-source'>
              <h3 className='modal-subtitle'>Would you like to change basemaps?</h3>

              <div className='modal-overview'>
                <p>The wind layer is best visualized with the Dark Gray Canvas basemap. Would you like to switch to it now.</p>
                <button className='gfw-btn white basemap-button pointer' onClick={this.switchBasemap}>Yes</button>
                <button className='gfw-btn white basemap-button pointer' onClick={this.keepBasemap}>No</button>
                <div id='basemap-checkbox-container'>
                  <input id='basemap-cookie-checkbox' onChange={this.setCookie} type='checkbox'>Remember my decision</input>
                </div>
              </div>
            </div>
          </div>
        </ModalWrapper>
     );
  }

  switchBasemap:any = ():void => {
    if (this.state.cookieChecked !== undefined) {
      this.createCookie(this.state.cookieChecked);
    }
    mapActions.setBasemap('dark-gray');
    this.close();
  };

  keepBasemap:any = ():void => {
    if (this.state.cookieChecked !== undefined) {
      this.createCookie(this.state.cookieChecked);
    }
    this.close();
  };

  setCookie:{} = (evt: CookiePropType) => { //todo: is this {} in setCookie proper object typing?
    this.setState({
      cookieChecked: evt.target.checked
    });
  };

  createCookie:any = (cookieValue: string) => {
    cookie('windBasemapDecision', cookieValue, {
      expires: 7
    });
  };

  close:any = ():void => {
    modalActions.hideModal(ReactDOM.findDOMNode(this).parentElement);
  };

}
