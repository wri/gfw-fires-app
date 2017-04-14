import ModisLegend from 'components/LayerPanel/ModisLegend';
import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalActions} from 'actions/ModalActions';
import {layerPanelText} from 'js/config';
import DateHelper from 'helpers/DateHelper';
import {mapActions} from 'actions/MapActions';
import KEYS from 'js/constants';

import React from 'react';

let firesOptions = layerPanelText.firesOptions;

export default class FiresControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modisArchiveVisible: false
    };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.firesSelectIndex !== this.props.firesSelectIndex) {
      LayersHelper.updateFiresLayerDefinitions(this.props.firesSelectIndex);
    }
  }

  componentWillReceiveProps(nextProps) {
    // Set the default layer definition when the map has been loaded
    if (!this.props.loaded && nextProps.loaded) {
      LayersHelper.updateFiresLayerDefinitions(nextProps.firesSelectIndex);
    }
  }

  render () {
    let activeItem = firesOptions[this.props.firesSelectIndex];

    let startDate = window.Kalendae.moment(this.props.archiveModisStartDate);
    let endDate = window.Kalendae.moment(this.props.archiveModisEndDate);

    let showModisArchive = this.state.modisArchiveVisible ? '' : 'hidden';

    return <div>
      <div className='timeline-container relative fires'>
        <select className='pointer select-modis' value={activeItem.value} onChange={this.changeFiresTimeline.bind(this)}>
          {firesOptions.map(this.optionsMap, this)}
        </select>
        <div id='modis-time-options' className='active-fires-control gfw-btn sml white darken'>{activeItem.label}</div>
        <div id='modis-custom-range-btn' className='active-fires-control gfw-btn sml white pointer' onClick={this.toggleModisArchive.bind(this)}>Custom Range</div>
      </div>
      <div id='modis-archive-date-ranges' className={showModisArchive}>
        <span className='imagery-calendar-label'>{this.props.options.minLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>{this.props.options.maxLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
      </div>
    </div>;
  }

  toggleModisArchive (evt) {
    this.setState({ modisArchiveVisible: !this.state.modisArchiveVisible });
    evt.target.classList.add('darken');
    document.getElementById('modis-time-options').classList.remove('darken');
  }

  optionsMap (item, index) {
    return <option key={index} value={item.value}>{item.label}</option>;
  }

  changeFiresTimeline (evt) {
    layerActions.changeFiresTimeline(evt.target.selectedIndex);
    LayersHelper.hideLayer(KEYS.modisArchive);
    let layerObj = {};
		layerObj.layerId = KEYS.activeFires;
		LayersHelper.showLayer(layerObj);

    document.getElementById('modis-custom-range-btn').classList.remove('darken');
    document.getElementById('modis-time-options').classList.add('darken');

    if (this.state.modisArchiveVisible === true) {
      this.setState({ modisArchiveVisible: false });
    }
  }

  changeStart() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('archiveModisStart');
  }

  changeEnd() {
    modalActions.showCalendarModal('end');
    mapActions.setCalendar('archiveModisEnd');
  }

}
