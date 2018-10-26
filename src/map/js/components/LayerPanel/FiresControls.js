import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalActions} from 'actions/ModalActions';
import {layerPanelText} from 'js/config';
import DateHelper from 'helpers/DateHelper';
import {mapActions} from 'actions/MapActions';
import KEYS from 'js/constants';

import React from 'react';

let firesOptions = layerPanelText.firesOptions;

export type FiresProps = {
  loaded: bool,
  options: Object,
  firesSelectIndex: Number,
  archiveModisStartDate: string,
  archiveModisEndDate: string,
  calendarVisible: string
};

export default class FiresControls extends React.Component {

  props: FiresProps;
  displayName: 'FiresControls';
  state: {
    modisArchiveVisible: boolean
  };

  constructor(props) {
    super(props);
    this.state = {
      modisArchiveVisible: false
    };
  }
  componentDidUpdate(prevProps) {
    if ((prevProps.firesSelectIndex !== this.props.firesSelectIndex) && (this.props.firesSelectIndex !== firesOptions.length - 1)) {
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
        <select id='modis-select' className={`pointer select-modis ${this.state.modisArchiveVisible === true ? '' : 'darken'}`} value={activeItem.value} onChange={this.changeFiresTimeline.bind(this)}>
          {firesOptions.map(this.optionsMap, this)}
        </select>
        <div id='modis-time-options' className={`active-fires-control gfw-btn sml white ${this.state.modisArchiveVisible === true ? '' : 'darken'}`} >{activeItem.label}</div>
        <div id='modis-custom-range-btn' className={`active-fires-control gfw-btn sml white pointer ${this.state.modisArchiveVisible === true ? 'darken' : ''}`} onClick={this.toggleModisArchive.bind(this)}>Custom Range</div>
      </div>
      <div id='modis-archive-date-ranges' className={showModisArchive}>
        <span className='imagery-calendar-label'>{this.props.options.minLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>{this.props.options.maxLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
      </div>
    </div>;
  }

  toggleModisArchive () {
    this.setState({ modisArchiveVisible: !this.state.modisArchiveVisible });
    layerActions.changeFiresTimeline(firesOptions.length - 1); //change to disabled option of Active fires
    document.getElementById('modis-select').selectedIndex = firesOptions.length - 1;
  }

  optionsMap (item, index) {
    if (item.label === 'Active Fires') {
      return <option key={index} value={item.value} disabled >{item.label}</option>;
    } else {
      return <option key={index} value={item.value}>{item.label}</option>;
    }
  }

  changeFiresTimeline (evt) {
    let layerObj = {};
    const layerIndex = layerPanelText.firesOptions[this.props.firesSelectIndex].value;
    layerActions.changeFiresTimeline(evt.target.selectedIndex);
    LayersHelper.hideLayer(KEYS.modisArchive);
    LayersHelper.hideLayer(`${KEYS.activeFires}${layerIndex === 0 ? '' : layerIndex}`);

    switch (evt.target.selectedIndex) {
      case 0:
        layerObj.layerId = KEYS.activeFires;
        break;
      case 1:
        layerObj.layerId = `${KEYS.activeFires}2`;
        break;
      case 2:
        layerObj.layerId = `${KEYS.activeFires}3`;
        break;
      case 3:
        layerObj.layerId = `${KEYS.activeFires}7`;
        break;
    }

		LayersHelper.showLayer(layerObj);

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
