import ModalWrapper from 'components/Modals/ModalWrapper';
import {modalStore} from 'stores/ModalStore';
import {modalText} from 'js/config';
import React, {
  Component
} from 'react';

export default class ConfirmationModal extends Component {
  displayName: ConfirmationModal;
  state: any;

  constructor(props: any) {
    super(props);

    modalStore.listen(this.storeUpdated.bind(this));
    let defaultState = modalStore.getState();
    this.state = {
      confirmationInfo: defaultState.confirmationInfo
    };
  }

  storeUpdated () {
    let currentState = modalStore.getState();
    this.setState({ confirmationInfo: currentState.confirmationInfo });
  }

  render () {

    return (
      <ModalWrapper>
        <div>
          <div className='canopy-modal-title'>Subscription success!</div>
          {this.state.confirmationInfo.email ?
            <div className='longer'>{modalText.subscription.emailConfirmation}</div> : null
          }
          {this.state.confirmationInfo.phoneNumber ? <div className='longer'>{modalText.subscription.phoneConfirmation}</div> : null}
        </div>
      </ModalWrapper>
    );
  }

  tableMap (item: string, label: string) {
    return (
      <dl className='source-row'>
        <dt>{label}</dt>
        <dd dangerouslySetInnerHTML={{ __html: item }}></dd>
      </dl>
    );
  }

  summaryMap (item: any) {
    if (typeof item === 'string') {
      return <p dangerouslySetInnerHTML={{ __html: item }} />;
    } else {
      return (
        <ul>
          {item.map(listItem => <li dangerouslySetInnerHTML={{ __html: listItem }} />)}
        </ul>
      );
    }
  }

  paragraphMap (item: string) {
    return <p dangerouslySetInnerHTML={{ __html: item }} />;
  }

  htmlContentMap (item: string) {
    return <div dangerouslySetInnerHTML={{ __html: item }} />;
  }

}
