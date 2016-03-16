import {modalActions} from 'actions/ModalActions';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';
import React from 'react';

export default class WindControls extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  render () {

    let date = window.Kalendae.moment(this.state.windDate);

    return <div>
      <div id='wind-date-ranges'>
        <span className='imagery-calendar-label'>{this.props.options.label}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'wind' ? ' current' : ''}`} onClick={this.changeWind.bind(this)}>{DateHelper.getDate(date)}</button>
      </div>
    </div>;
  }

  changeWind() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('wind');
  }

}
