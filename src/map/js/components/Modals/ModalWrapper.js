/* @flow */
import {modalActions} from 'actions/ModalActions';
import {modalStore} from 'stores/ModalStore';
import ReactDOM from 'react-dom';
import React, {
  Component
} from 'react';

type WrapperPropType = {
  downloadData?: any,
  children?: any
};

export default class ModalWrapper extends Component {
  displayName: ModalWrapper;
  state: any;
  props: WrapperPropType;

  constructor(props: WrapperPropType) {
    super(props);

    modalStore.listen(this.storeUpdated.bind(this));
    let defaultState = modalStore.getState();
    this.state = {
      layerInfo: defaultState.modalLayerInfo
    };
  }

  storeUpdated () {
    let currentState = modalStore.getState();
    this.setState({ layerInfo: currentState.modalLayerInfo });
  }

  close:any = ():void => {
    modalActions.hideModal(ReactDOM.findDOMNode(this).parentElement);
  };

  sendDownloadAnalytics = (evt) => {
    this.sendAnalytics('map', 'download', 'The user is downloading data via a layer info panel.');
  }

  sendAnalytics (eventType, action, label) { //todo: why is this request getting sent so many times?
    ga('A.send', 'event', eventType, action, label);
    ga('B.send', 'event', eventType, action, label);
    ga('C.send', 'event', eventType, action, label);
  }

  render() {
    return (
      <div className='modal-container'>
        <div className='modal-background' onClick={this.close} />
        <div className={`modal-window ${app.mobile() === true ? 'narrow' : ''}`}>
          <div className="modal-header">
            <h2 className='modal-title'>{this.state.layerInfo.title}</h2>
            {!this.state.layerInfo.subtitle ? null :
              <h3 className='modal-subtitle'>{this.state.layerInfo.subtitle}</h3>
            }
            <div title='close' className='modal-close close-icon pointer' onClick={this.close}></div>
          </div>
          <div className={`modal-wrapper custom-scroll ${(this.props.children && this.props.children[0]) || !this.props.downloadData ? '' : 'has-footer'}`}>
            {this.props.children}
            {(this.props.children && this.props.children[0]) || !this.props.downloadData ? null :
              <div className='modal-footer'>
                <div className="m-btncontainer is-center">
                  <a href={this.props.downloadData} onClick={this.sendDownloadAnalytics} target="_blank" className="btn green uppercase download-mobile-link">Learn more or download data</a>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}
