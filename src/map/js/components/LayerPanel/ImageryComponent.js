// import LayersHelper from 'helpers/LayersHelper';
import ImagerySettings from 'components/LayerPanel/ImagerySettings';
import {layerActions} from 'actions/LayerActions';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';
import LayersHelper from 'helpers/LayersHelper';
import KEYS from 'js/constants';
import {modalActions} from 'actions/ModalActions';
import React from 'react';

export default class ImageryComponent extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  componentDidMount() {
    let { layer, active } = this.props;
    if (layer.disabled) { return; }
    if (!active) {
      layerActions.removeActiveLayer(layer.id);
    } else {
      layerActions.addActiveLayer(layer.id);
    }

    if (active) {
      let layerObj = {};
      layerObj.layerId = layer.id;
      layerObj.footprints = this.state.footprints;
      layerObj.fireHistorySelectIndex = this.state.fireHistorySelectIndex;
      LayersHelper.showLayer(layerObj);
    } else {
      LayersHelper.hideLayer(layer.id);
      if (layer.id === 'activeFires') {
        console.log('removing....');
        LayersHelper.hideLayer(KEYS.modisArchive);
      }
    }
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  render () {

    let startDate = window.Kalendae.moment(this.state.dgStartDate);
    let endDate = window.Kalendae.moment(this.state.dgEndDate);
    const { active } = this.props;

    return <div className={`timeline-container ${this.props.options.domClass} ${active ? '' : 'hidden'}`}>
      <ImagerySettings />
      <div id='imagery-date-ranges'>
        <span className='imagery-calendar-label'>{this.props.options.minLabel}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'imageryStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>{this.props.options.maxLabel}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'imageryEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
      </div>
    </div>;
  }

  changeStart(evt) {
    evt.stopPropagation();
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('imageryStart');
  }

  changeEnd() {
    modalActions.showCalendarModal('end');
    mapActions.setCalendar('imageryEnd');
  }

}
