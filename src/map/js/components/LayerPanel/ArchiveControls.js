import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalActions} from 'actions/ModalActions';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';
import React from 'react';

export default class ArchiveControls extends React.Component {


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

    let startDate = window.Kalendae.moment(this.state.archiveStartDate);
    let endDate = window.Kalendae.moment(this.state.archiveEndDate);
    console.log(this.props)

    return <div>
      <input onChange={this.toggleConfidence} type='checkbox' /><span className='fires-confidence-wrapper'>Only show <span className='fires-confidence' onClick={this.showFiresModal}>high confidence fires</span></span>
      <div id='archive-date-ranges'>
        <span className='imagery-calendar-label'>{this.props.options.minLabel}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'archiveStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>{this.props.options.maxLabel}</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'archiveEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
      </div>
    </div>;
  }

  changeStart() {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('archiveStart');
  }

  changeEnd() {
    modalActions.showCalendarModal('end');
    mapActions.setCalendar('archiveEnd');
  }

  showFiresModal () {
    modalActions.showFiresModal();
  }

  toggleConfidence (evt) {
    LayersHelper.toggleArchiveConfidence(evt.target.checked);
  }

}
