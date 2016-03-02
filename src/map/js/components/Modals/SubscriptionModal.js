import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalText} from 'js/config';
import dom from 'dojo/dom';
import {mapStore} from 'stores/MapStore';
import Loader from 'components/Loader';
// import {loadJS} from 'utils/loaders';
import React from 'react';

export default class SubscriptionModal extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    // this.state = mapStore.getState();

    this.state = {
      currentCustomGraphic: undefined,
      email: '',
      phoneNumber: '',
      emailErrors: false,
      phoneErrors: false,
      isSubscribing: false,
      success: false
    };
  }

  storeUpdated () {
    let newState = mapStore.getState();
    if (newState.currentCustomGraphic !== this.state.currentCustomGraphic) {
      this.setState({ currentCustomGraphic: newState.currentCustomGraphic });
    }
  }

  validateEmail (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  validatePhone (phoneNumber) { //todo: use old phone # validation library
    if (phoneNumber.length > 5) {
      return true;
    } else {
      return false;
    }
  }

  updateName = evt => {
    this.setState({
      customFeatName: evt.target.value
    });
  };

  updateEmail = evt => {
    this.setState({
      email: evt.target.value
    });
  };

  updatePhone = evt => {
    this.setState({
      phoneNumber: evt.target.value
    });
  };

  subscribe = () => {
    let honeyPotValue = dom.byId(modalText.subscription.verifyInput).value;
    if (honeyPotValue) {
      return;
    }

    let validEmail = this.validateEmail(this.state.email);
    let validPhone = this.validatePhone(this.state.phoneNumber);

    if (!this.state.email || !validEmail) {
      this.setState({
        emailErrors: true,
        phoneErrors: false
      });
    } else if (this.state.phoneNumber && !validPhone) {
      this.setState({
        emailErrors: false,
        phoneErrors: true
      });
    } else {
      this.setState({
        emailErrors: false,
        phoneErrors: false,
        isUploading: true
      });
      //todo: submit the request, and on success or failure, hide the loader
    }
  };


  render() {

    return (
      <ModalWrapper>
        <div className='canopy-modal-title'>{modalText.subscription.title}</div>
        {this.state.currentCustomGraphic ? <input value={this.state.customFeatName !== undefined ? this.state.customFeatName : this.state.currentCustomGraphic.attributes.featureName} onChange={this.updateName} /> : null}

        <p>{modalText.subscription.emailInstructions}</p>
        <input value={this.state.email} placeholder={modalText.subscription.emailPlaceholder} onChange={this.updateEmail}></input>
        <div className={`submit-warning ${this.state.emailErrors ? '' : 'hidden'}`}>{modalText.subscription.warningTextEmail}</div>
        <p>{modalText.subscription.phoneInstructions}</p>
        <input value={this.state.phoneNumber} placeholder={modalText.subscription.phonePlaceholder} onChange={this.updatePhone}></input>
        <div className={`submit-warning ${this.state.phoneErrors ? '' : 'hidden'}`}>{modalText.subscription.warningTextPhone}</div>
        <input className='hidden' id={modalText.subscription.verifyInput} />

        <div className='subscribe-container'>
          <button className='subscribe-submit btn green' onClick={this.subscribe.bind(this)}>{modalText.subscription.subscribePlaceholder}</button>
        </div>
        <Loader active={this.state.isUploading} />
        <div className={`submit-success ${this.state.success ? '' : 'hidden'}`}>{modalText.subscription.successMessage}</div>
      </ModalWrapper>
    );
  }

}
