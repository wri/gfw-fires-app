/* @flow */
import {modalActions} from 'actions/ModalActions';
import {modalStore} from 'stores/ModalStore';
import ReactDOM from 'react-dom';
import React, {
  Component
} from 'react';

type WrapperPropType = {
  downloadData?: any, //todo: both of these are STILL 'Missing in props validation' !!
  children?: any
};

let closeSvg = '<use xlink:href="#shape-close" />';

export default class ModalWrapper extends Component {
  displayName: ModalWrapper;
  state: any;

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

  render() {
   //todo: hide footer with proper child
   //<a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank" className="btn green uppercase download-mobile-link">Learn more or download data</a>

    return (
      <div className='modal-container'>
        <div className='modal-background' onClick={this.close} />
        <div className={`modal-window ${app.mobile() === true ? 'narrow' : ''}`}>
          <div title='close' className='modal-close close-icon pointer' onClick={this.close}>
            <svg dangerouslySetInnerHTML={{ __html: closeSvg }}/>
          </div>
          <div className={`modal-wrapper custom-scroll ${(this.props.children && this.props.children[0]) || !this.props.downloadData ? '' : 'has-footer'}`}>
            {this.props.children}
            {(this.props.children && this.props.children[0]) || !this.props.downloadData ? null :
              <div className='modal-footer'>
                <div className="m-btncontainer is-center">
                  <a href={this.props.downloadData} target="_blank" className="btn green uppercase download-mobile-link">Learn more or download data</a>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }

}
