import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalActions} from 'actions/ModalActions';
import {layerPanelText} from 'js/config';
import DateHelper from 'helpers/DateHelper';
import {mapActions} from 'actions/MapActions';
import KEYS from 'js/constants';
import React from 'react';

let firesOptions = layerPanelText.firesOptions;

export type ViirsProps = {
  loaded: bool,
  options: Object,
  viirsSelectIndex: Number,
  archiveViirsStartDate: string,
  archiveViirsEndDate: string,
  calendarVisible: string
};

export default class ViirsControls extends React.Component {

  props: ViirsProps;
  displayName: 'ViirsControls';

  constructor(props) {
    super(props);
    this.state = {
      viirsArchiveVisible: false
    };
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.viirsSelectIndex !== this.props.viirsSelectIndex) && (this.props.viirsSelectIndex !== firesOptions.length - 1)) {
      LayersHelper.updateViirsDefinitions(this.props.viirsSelectIndex);
    }
  }

  componentWillReceiveProps(nextProps) {
    // Set the default layer definition when the map has been loaded
    if (!this.props.loaded && nextProps.loaded) {
      LayersHelper.updateViirsDefinitions(nextProps.viirsSelectIndex);
    }
  }

  render () {
    let activeItem = firesOptions[this.props.viirsSelectIndex];
    let startDate = window.Kalendae.moment(this.props.archiveViirsStartDate);
    let endDate = window.Kalendae.moment(this.props.archiveViirsEndDate);
    let showViirsArchive = this.state.viirsArchiveVisible ? '' : 'hidden';

    return <div>
      <div className='timeline-container fires'>
        <select id='viirs-select' className={`pointer ${this.state.viirsArchiveVisible === true ? '' : 'darken'}`} value={activeItem.value} onChange={this.changeViirsTimeline.bind(this)}>
          {firesOptions.map(this.optionsMap, this)}
        </select>
        <div id='viirs-time-options' className={`active-fires-control gfw-btn sml white ${this.state.viirsArchiveVisible === true ? '' : 'darken'}`} >{activeItem.label}</div>
        <div id={`viirs-custom-range-btn`} className={`active-fires-control gfw-btn sml white pointer ${this.state.viirsArchiveVisible === true ? 'darken' : ''}`} onClick={this.toggleViirsArchive.bind(this)}>Custom Range</div>
      </div>
      <div id='viirs-archive-date-ranges' className={showViirsArchive}>
        <span className='imagery-calendar-label'>{this.props.options.minLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>{this.props.options.maxLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
        { new Date(this.props.archiveViirsEndDate) < new Date(this.props.archiveViirsStartDate) ? <p className="error-message">{layerPanelText.calendarValidation}</p> : '' }
      </div>
    </div>;
  }

  toggleViirsArchive () {
    this.setState({ viirsArchiveVisible: !this.state.viirsArchiveVisible });
    layerActions.changeViirsTimeline(firesOptions.length - 1); //change to disabled option of Viirs fires
    document.getElementById('viirs-select').selectedIndex = firesOptions.length - 1;
  }

  optionsMap (item, index) {
    if (item.label === 'Active Fires') {
      return <option key={index} value={item.value} disabled >{item.label}</option>;
    } else {
      return <option key={index} value={item.value}>{item.label}</option>;
    }
  }

  changeViirsTimeline (evt) {
    layerActions.changeViirsTimeline(evt.target.selectedIndex);

    if (this.state.viirsArchiveVisible === true) {
      this.setState({ viirsArchiveVisible: false });
    }
  }

  changeStart() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('archiveViirsStart');
  }

  changeEnd() {
    modalActions.showCalendarModal('end');
    mapActions.setCalendar('archiveViirsEnd');
  }
}
