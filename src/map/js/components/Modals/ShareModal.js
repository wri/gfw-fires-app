import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalStore} from 'stores/ModalStore';
import {modalText} from 'js/config';
import {modalActions} from 'actions/ModalActions';
import utils from 'utils/AppUtils';
import React from 'react';

let facebookSvg = '<use xlink:href="#icon-facebook" />';
let twitterSvg = '<use xlink:href="#icon-twitter" />';
let googleSvg = '<use xlink:href="#icon-googleplus" />';

let windowOptions = 'toolbar=0,status=0,height=650,width=450';

export default class ShareModal extends React.Component {

  constructor (props) {
    super(props);

    modalStore.listen(this.storeUpdated.bind(this));
    let defaultState = modalStore.getState();
    this.state = {
      bitlyUrl: defaultState.bitlyUrl,
      copyText: modalText.share.copyButton,
      shareBy: defaultState.shareBy
    };
  }

  storeUpdated () {
    let newState = modalStore.getState();
    this.setState({
      bitlyUrl: newState.bitlyUrl,
      copyText: modalText.share.copyButton,
      shareBy: newState.shareBy
    });
  }

  copyShare () {
    let element;
    if (this.state.shareBy === 'embed') {
      element = this.refs.shareInputEmbed;
    } else {
      element = this.refs.shareInputLink;
    }
    if (utils.copySelectionFrom(element)) {
      this.setState({ copyText: modalText.share.copiedButton });
    } else {
      alert(modalText.share.copyFailure);
    }
  }

  shareGoogle () {
    let url = modalText.share.googleUrl(this.state.bitlyUrl);
    window.open(url, 'Google Plus', windowOptions);
  }

  shareFacebook () {
    let url = modalText.share.facebookUrl(this.state.bitlyUrl);
    window.open(url, 'Facebook', windowOptions);
  }

  shareTwitter () {
    let url = modalText.share.twitterUrl(this.state.bitlyUrl);
    window.open(url, 'Twitter', windowOptions);
  }

  handleFocus (e) {
    setTimeout(() => {
      e.target.select();
    }, 0);
  }

  switchEmbed () {
    modalActions.switchEmbed(); //todo: make a bitly
  }

  switchLink () {
    modalActions.switchLink();
  }

  render () {
    let prefix = '<iframe width="600" height="600" frameborder="0" src="';
    let suffix = '"></iframe>';
    let iframeURL = prefix + this.state.bitlyUrl + suffix;
    return (
      <ModalWrapper>
        <div className='share-modal-title'>{modalText.share.title}</div>
        <div className='share-instructions'>{modalText.share.linkInstructions}</div>
        <div className='share-input'>
          <input className={`${this.state.shareBy === 'link' ? 'hidden' : ''}`} ref='shareInputEmbed' type='text' readOnly value={iframeURL} onClick={this.handleFocus} />
          <input className={`${this.state.shareBy === 'embed' ? 'hidden' : ''}`} ref='shareInputLink' type='text' readOnly value={this.state.bitlyUrl} onClick={this.handleFocus} />
          <button className='gfw-btn white pointer' onClick={this.copyShare.bind(this)}>{this.state.copyText}</button>
        </div>
        <div className='share-options'>
          <button className={`gfw-btn white basemap-button pointer ${this.state.shareBy === 'embed' ? 'active' : ''}`} onClick={this.switchEmbed.bind(this)}>EMBED</button>
          <button className={`gfw-btn white basemap-button pointer ${this.state.shareBy === 'link' ? 'active' : ''}`} onClick={this.switchLink.bind(this)}>LINK</button>
        </div>
        <div className='share-items'>
          <ul>
            <li title='Google Plus' className='share-card googleplus-modal pointer' onClick={this.shareGoogle.bind(this)}>
              <svg dangerouslySetInnerHTML={{ __html: googleSvg }}/>
            </li>
            <li title='Twitter' className='share-card twitter-modal pointer' onClick={this.shareTwitter.bind(this)}>
              <svg dangerouslySetInnerHTML={{ __html: twitterSvg }}/>
            </li>
            <li title='Facebook' className='share-card facebook-modal pointer' onClick={this.shareFacebook.bind(this)}>
              <svg dangerouslySetInnerHTML={{ __html: facebookSvg }}/>
            </li>
          </ul>

        </div>
      </ModalWrapper>
    );
  }
}
