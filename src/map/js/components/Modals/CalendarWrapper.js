/* @flow */
import {modalActions} from 'actions/ModalActions';
import {mapActions} from 'actions/MapActions';
import ReactDOM from 'react-dom';
import React, {
  Component
} from 'react';

let closeSvg = '<use xlink:href="#shape-close" />';

export default class CalendarWrapper extends Component {
  displayName: CalendarWrapper;

	props: {
    children?: any
  };

  close:any = ():void => {
    modalActions.hideModal(ReactDOM.findDOMNode(this).parentElement);
    mapActions.setCalendar('');
  };

  render() {
    return (
      <div className='modal-container'>
        <div className='calendar-background' onClick={this.close} />
        <div className={`calendar-window ${app.mobile() === true ? 'narrow' : ''}`}>
          <div title='close' className='modal-close close-icon pointer' onClick={this.close}>
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
