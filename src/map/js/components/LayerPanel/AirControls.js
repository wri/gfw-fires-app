import {modalActions} from 'actions/ModalActions';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import utils from 'utils/AppUtils';
import {layersConfig} from 'js/config';
import KEYS from 'js/constants';
import AirQualityLegend from 'components/LayerPanel/AirQualityLegend';
import DateHelper from 'helpers/DateHelper';
import React from 'react';

export default class AirControls extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  render () {

    let date = window.Kalendae.moment(this.state.airQDate);
    let config = utils.getObject(layersConfig, 'id', KEYS.airQuality);

    return <div>
      <AirQualityLegend url={config.url} layerIds={config.layerIds} />
      <div id='air-date-ranges'>
        <span className='air-calendar-label'>{this.props.options.label}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'airQ' ? ' current' : ''}`} onClick={this.changeAirQ.bind(this)}>{DateHelper.getDate(date)}</button>
      </div>
    </div>;
  }

  changeAirQ() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('airQ');
  }

}
