import {modalActions} from 'actions/ModalActions';
import {modalStore} from 'stores/ModalStore';
import React from 'react';

let closeSvg = '<use xlink:href="#shape-close" />';

export default class ModalWrapper extends React.Component {

  constructor(props) {
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

  close () {
    modalActions.hideModal(React.findDOMNode(this).parentElement);
  }

  render() {
   //todo: hide footer with proper child
   if (this.props.children && this.props.children[0]) {
     console.log(this.props.children[0])
   }

    return (
      <div className='modal-container'>
        <div className='modal-background' onClick={::this.close} />
        <div className='modal-window'>
          <div title='close' className='modal-close close-icon pointer' onClick={::this.close}>
            <svg dangerouslySetInnerHTML={{ __html: closeSvg }}/>
          </div>
          <div className={`modal-wrapper custom-scroll ${this.props.children && this.props.children[0] ? '' : 'has-footer'}`}>
            {this.props.children}
            {this.props.children && this.props.children[0] ? null :
              <div className='modal-footer'>
                <div className="m-btncontainer is-center">
                  <a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank" className="btn green uppercase download-mobile-link">Learn more or download data</a>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }

}
