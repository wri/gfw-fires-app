import React, { Component } from 'react';
import { modalActions } from 'actions/ModalActions';
import { mapStore } from 'stores/MapStore';
import { mapActions } from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';

export default class AnalysisDatePicker extends Component {
  constructor(props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated() {
    this.setState(mapStore.getState());
  }

  render() {
    let date = window.Kalendae.moment(this.state.sentinalDate);

    return (
      <div className='analysis-results__select-form-item-container'>
        <div id='modis-archive-date-ranges'>
          <button className={`gfw-btn sml white pointer ${this.state.calendarVisible === 'changeSentinal' ? ' current' : ''}`} onClick={this.changeSentinal.bind(this)}>{DateHelper.getDate(date)}</button> {/*  */}
        </div>
      </div>
    );
  }

  changeSentinal() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('sentinal');
  }
}
