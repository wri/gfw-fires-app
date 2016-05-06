import {modalActions} from 'actions/ModalActions';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import LastRainLegend from 'components/LayerPanel/LastRainLegend';
import DateHelper from 'helpers/DateHelper';
import React from 'react';

export default class RainControls extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  render () {

    let date = window.Kalendae.moment(this.state.rainDate);

    return <div>
      <div id='rain-date-ranges'>
        <span className='imagery-calendar-label'>{this.props.options.label}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'rain' ? ' current' : ''}`} onClick={this.changeRain.bind(this)}>{DateHelper.getDate(date)}</button>
        <LastRainLegend domClass={this.props.childDomClass} />
      </div>
    </div>;
  }

  changeRain() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('rain');
  }

}
