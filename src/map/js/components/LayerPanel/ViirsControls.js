import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalActions} from 'actions/ModalActions';
import {layerPanelText} from 'js/config';
import DateHelper from 'helpers/DateHelper';
import {mapActions} from 'actions/MapActions';
import KEYS from 'js/constants';



import React from 'react';

let firesOptions = layerPanelText.firesOptions;

export default class ViirsControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viirsArchiveVisible: false
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.viiirsSelectIndex !== this.props.viiirsSelectIndex) {
      LayersHelper.updateViirsDefinitions(this.props.viiirsSelectIndex);
    }
  }

  componentWillReceiveProps(nextProps) {
    // Set the default layer definition when the map has been loaded
    if (!this.props.loaded && nextProps.loaded) {
      LayersHelper.updateViirsDefinitions(nextProps.viiirsSelectIndex);
    }
  }

  render () {


    let activeItem = firesOptions[this.props.viiirsSelectIndex];

    let startDate = window.Kalendae.moment(this.props.archiveViirsStartDate);
    let endDate = window.Kalendae.moment(this.props.archiveViirsEndDate);

    let showViirsArchive = this.state.viirsArchiveVisible ? '' : 'hidden';

    return <div>
      <div className='timeline-container fires'>
        <select className='pointer' value={activeItem.value} onChange={this.changeViirsTimeline}>
          {firesOptions.map(this.optionsMap, this)}
        </select>
        <div className='active-fires-control gfw-btn sml white'>{activeItem.label}</div>
        <div className='active-fires-control gfw-btn sml white pointer' onClick={this.toggleViirsArchive.bind(this)}>Date Range</div>
      </div>
      <div id='viirs-archive-date-ranges' className={showViirsArchive}>
        <span className='imagery-calendar-label'>{this.props.options.minLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>{this.props.options.maxLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
      </div>
    </div>;
  }

  toggleViirsArchive () {
    this.setState({ viirsArchiveVisible: !this.state.viirsArchiveVisible });
  }

  toggleConfidence (evt) {
    LayersHelper.toggleConfidence(evt.target.checked);
  }

  optionsMap (item, index) {
    return <option key={index} value={item.value}>{item.label}</option>;
  }

  changeViirsTimeline (evt) {
    layerActions.changeViirsTimeline(evt.target.selectedIndex);
    LayersHelper.hideLayer(KEYS.viirsArchive);
    let layerObj = {};
		layerObj.layerId = KEYS.viirsFires;
		LayersHelper.showLayer(layerObj);
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
