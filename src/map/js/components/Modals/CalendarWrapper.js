import {modalActions} from 'actions/ModalActions';
import {mapActions} from 'actions/MapActions';
import {modalStore} from 'stores/ModalStore';
import React from 'react';

let closeSvg = '<use xlink:href="#shape-close" />';

export default class CalendarWrapper extends React.Component {

  close () {
    modalActions.hideModal(React.findDOMNode(this).parentElement);
    mapActions.setCalendar('');
  }

  render() {
    return (
      <div className='modal-container'>
        <div className='calendar-background' onClick={::this.close} />
        <div className={`calendar-window ${app.mobile() === true ? 'narrow' : ''}`}>
          <div title='close' className='modal-close close-icon pointer' onClick={::this.close}>
            <svg dangerouslySetInnerHTML={{ __html: closeSvg }}/>
          </div>
          <div className='calendar-wrapper custom-scroll'>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }

}
