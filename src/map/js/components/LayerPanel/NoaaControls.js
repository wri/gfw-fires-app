import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalActions} from 'actions/ModalActions';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';
import {layerPanelText} from 'js/config';
import React from 'react';

export default class NoaaControls extends React.Component {


  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.firesSelectIndex !== this.props.firesSelectIndex) {
  //     LayersHelper.updateFiresLayerDefinitions(this.props.firesSelectIndex);
  //   }
  // }

  // componentWillReceiveProps(nextProps) {
  //   // Set the default layer definition when the map has been loaded
  //   if (!this.props.loaded && nextProps.loaded) {
  //     LayersHelper.updateFiresLayerDefinitions(nextProps.firesSelectIndex);
  //   }
  // }

  render () {

    let startDate = window.Kalendae.moment(this.state.noaaStartDate);
    let endDate = window.Kalendae.moment(this.state.noaaEndDate);

    return <div>
      <div id='noaa-date-ranges'>
        <span className='imagery-calendar-label'>{this.props.options.minLabel}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'noaaStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>{this.props.options.maxLabel}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'noaaEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
        { new Date(this.state.noaaEndDate) < new Date(this.state.noaaStartDate) ? <p className="error-message">{layerPanelText.calendarValidation}</p> : '' }
      </div>
    </div>;
  }

  changeStart() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('noaaStart');
  }

  changeEnd() {
    modalActions.showCalendarModal('end');
    mapActions.setCalendar('noaaEnd');
  }

}
