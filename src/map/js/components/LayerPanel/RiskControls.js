import {modalActions} from 'actions/ModalActions';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';
import React from 'react';

export default class RiskControls extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  render () {

    let date = window.Kalendae.moment(this.state.riskDate);

    return <div>
      <div id='risk-date-ranges'>
        <span className='imagery-calendar-label'>{this.props.options.label}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'risk' ? ' current' : ''}`} onClick={this.changeRisk.bind(this)}>{DateHelper.getDate(date)}</button>
      </div>
    </div>;
  }

  changeRisk() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('risk');
  }

}
