import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalText} from 'js/config';
import dom from 'dojo/dom';
import {mapStore} from 'stores/MapStore';
import {modalActions} from 'actions/ModalActions';
import Loader from 'components/Loader';
import geometryEngine from 'esri/geometry/geometryEngine';
import all from 'dojo/promise/all';
// import {loadJS} from 'utils/loaders';
import React from 'react';
import ReactDOM from 'react-dom';
import intlTelInput from 'intlTelInput';

export default class SubscriptionModal extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    // this.state = mapStore.getState();

    this.state = {
      currentCustomGraphic: undefined,
      email: '',
      customFeatName: '', //'Custom Feature',
      phoneNumber: '',
      pointErrors: false,
      emailErrors: false,
      phoneErrors: false,
      isSubscribing: false,
      success: false
    };
  }

  componentDidMount () {

    $('#phoneInput').intlTelInput();

    // Only b/c intlTelInput doesn't like values in initialState
    this.setState({
      phoneNumber: 1
    });

    $('#phoneInput').on('countrychange', (e, countryData) => {
      this.setState({
        phoneNumber: countryData.dialCode
      });
    });
  }

  storeUpdated () {
    let newState = mapStore.getState();
    if (newState.currentCustomGraphic && newState.currentCustomGraphic !== this.state.currentCustomGraphic) {
      this.setState({
        currentCustomGraphic: newState.currentCustomGraphic,
        customFeatName: newState.currentCustomGraphic.attributes.featureName,
        pointErrors: false
      });
    } else if (!newState.currentCustomGraphic && newState.currentCustomGraphic !== this.state.currentCustomGraphic) {
      this.setState({
        currentCustomGraphic: undefined,
        customFeatName: ''
      });
    }

    if (!this.state.currentCustomGraphic && newState.currentCustomGraphic) {
      this.setState({
        pointErrors: false
      });
    }
  }

  validateEmail (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  validatePhone (phoneNumber) { //todo: use old phone # validation library
    if (phoneNumber.length > 5 || phoneNumber === 1) {
      return true;
    } else {
      return false;
    }
  }

  sendAnalytics (eventType, action, label) { //todo: why is this request getting sent so many times?
    ga('A.send', 'event', eventType, action, label);
    ga('B.send', 'event', eventType, action, label);
    ga('C.send', 'event', eventType, action, label);
  }

  updateName = evt => {
    this.setState({
      customFeatName: evt.target.value
    });

    this.state.currentCustomGraphic.attributes.featureName = evt.target.value;
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

    // if (!this.state.currentCustomGraphic) {
    //   return;
    // }

    let validPoint = this.state.currentCustomGraphic ? true : false;
    console.log('validPoint', validPoint);
    let validEmail = this.validateEmail(this.state.email);
    let validPhone = this.validatePhone(this.state.phoneNumber);

    if (!validPoint) {
      this.setState({
        pointErrors: true
      });
    } else if (!validPhone && !validEmail) {
      this.setState({
        emailErrors: true,
        phoneErrors: true
      });
    } else if (this.state.email && !validEmail) {
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
        pointErrors: false,
        emailErrors: false,
        phoneErrors: false,
        isUploading: true
      });

      let subscribeUrl = 'https://gfw-fires.wri.org/subscribe_by_polygon',
        // let subscribeUrl = 'http://54.164.126.73/subscribe_by_polygon',
        subscriptions = [],
        emailParams,
        smsParams;

        this.sendAnalytics('subscription', 'request', 'The user subscribed to alerts.');

        // Simplify the geometry and then add a stringified and simpler version of it to params.features
        let simplifiedGeometry = geometryEngine.simplify(this.state.currentCustomGraphic.geometry);

        if (this.state.email) {
          emailParams = {
            'msg_addr': this.state.email,
            'msg_type': 'email',
            'area_name': this.state.customFeatName
          };

          emailParams.features = JSON.stringify({
              'rings': simplifiedGeometry.rings,
              'spatialReference': simplifiedGeometry.spatialReference
          });

          subscriptions.push($.ajax({
            type: 'POST',
            url: subscribeUrl,
            data: emailParams,
            error: this.error,
            // success: this.success,
            dataType: 'json'
          }));
        }

        if (this.state.phoneNumber && this.state.phoneNumber !== 1) {
          let numbersOnly = this.state.phoneNumber.replace(/\D/g, '');
          // let countryData = $('#phoneInput').intlTelInput('getSelectedCountryData');

          smsParams = {
            'msg_addr': numbersOnly,
            'msg_type': 'sms',
            'area_name': this.state.customFeatName
          };

          smsParams.features = JSON.stringify({
            'rings': simplifiedGeometry.rings,
            'spatialReference': simplifiedGeometry.spatialReference
          });

          subscriptions.push($.ajax({
            type: 'POST',
            url: subscribeUrl,
            data: smsParams,
            error: this.error,
            // success: this.success,
            dataType: 'json'
          }));
        }

        all(subscriptions).then(this.success);

      // let sr = new SpatialReference(4326);
      // params.features = JSON.stringify({
      //     'rings': simplifiedGeometry.rings,
      //     'spatialReference': simplifiedGeometry.spatialReference
      // });

    }
  };

  success = () => {
    this.close();
    modalActions.showConfirmationModal(this.state);
    this.setState({
      isUploading: false
    });
  };

  error = () => {
    this.close();
    modalActions.showConfirmationModal('error');
    this.setState({
      isUploading: false
    });
  };

  deleteFeature = () => {
    this.close();
    modalActions.removeCustomFeature(this.state.currentCustomGraphic);
  };

  close () {
		modalActions.hideModal(ReactDOM.findDOMNode(this).parentElement);
	}

  render() {
    // let nameToDisplay = this.state.customFeatName;
    // if (this.state.currentCustomGraphic && this.state.currentCustomGraphic.attributes && this.state.customFeatName === 'Custom Feature') {
    //   nameToDisplay = this.state.currentCustomGraphic.attributes.featureName;
    // }
    //
    //value={this.state.customFeatName ? this.state.customFeatName : this.state.currentCustomGraphic.attributes.featureName}
    return (
      <ModalWrapper>
        <div className='canopy-modal-title'>{modalText.subscription.title}</div>
        {this.state.currentCustomGraphic ? <input className='longer' value={this.state.customFeatName} onChange={this.updateName} /> : null}
        <div className={`submit-warning ${this.state.pointErrors ? '' : 'hidden'}`}>{modalText.subscription.warningTextPoints}</div>
        <p>{modalText.subscription.emailInstructions}</p>
        <input className='longer' value={this.state.email} placeholder={modalText.subscription.emailPlaceholder} onChange={this.updateEmail}></input>
        <div className={`submit-warning ${this.state.emailErrors ? '' : 'hidden'}`}>{modalText.subscription.warningTextEmail}</div>
        <p className='sign-up'>{modalText.subscription.emailExplanationStart}
        <a href={modalText.subscription.emailExplanationAddress}>{modalText.subscription.emailExplanationDisplay}</a>
        {modalText.subscription.emailExplanationEnd}</p>
        <p>{modalText.subscription.phoneInstructions}</p>
        <input id='phoneInput' className='longer' value={this.state.phoneNumber} placeholder={modalText.subscription.phonePlaceholder} onChange={this.updatePhone}></input>
        <p className='sign-up'>{modalText.subscription.phoneExplanation}</p>
        <div className={`submit-warning ${this.state.phoneErrors ? '' : 'hidden'}`}>{modalText.subscription.warningTextPhone}</div>
        <input className='hidden' id={modalText.subscription.verifyInput} />

        <div className='subscribe-container'>
          {this.state.currentCustomGraphic && this.state.currentCustomGraphic.attributes.Layer === 'custom' ?
            <button className={`subscribe-submit left btn red ${app.mobile() === true ? 'narrow' : ''}`} onClick={this.deleteFeature.bind(this)}>{modalText.subscription.deletePlaceholder}</button> : null
          }
          <button className={`subscribe-submit btn red ${app.mobile() === true ? 'narrow' : ''}${this.state.currentCustomGraphic && this.state.currentCustomGraphic.attributes.Layer === 'custom' ? ' right' : ''}`} onClick={this.subscribe.bind(this)}>{modalText.subscription.subscribePlaceholder}</button>
        </div>
        <Loader active={this.state.isUploading} />
      </ModalWrapper>
    );
  }

}
