// import LayersHelper from 'helpers/LayersHelper';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';
import {modalActions} from 'actions/ModalActions';
import React from 'react';


export default class AnalysisComponent extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  render () {
    let startDate = window.Kalendae.moment(this.state.analysisStartDate);
    let endDate = window.Kalendae.moment(this.state.analysisEndDate);
    // debugger
    return <div className={`timeline-container ${this.props.domClass}`}>
      <div id='analysis-date-ranges'>
        <span className='imagery-calendar-label'>START DATE</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'analysisStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>END DATE</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'analysisEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
      </div>

    </div>;
  }

  changeStart() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('analysisStart');
  }

  changeEnd() {
    modalActions.showCalendarModal('end');
    mapActions.setCalendar('analysisEnd');
  }

}
