import LayersHelper from 'helpers/LayersHelper';
import {modalActions} from 'actions/ModalActions';
import {mapActions} from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';
import {layerPanelText} from 'js/config';
import React from 'react';

export type ArchiveProps = {
  options: Object,
  archiveStartDate: string,
  archiveEndDate: string,
  calendarVisible: string
};

export default class ArchiveControls extends React.Component {

  props: ArchiveProps;
  displayName: 'ArchiveControls';

  render () {

    let startDate = window.Kalendae.moment(this.props.archiveStartDate);
    let endDate = window.Kalendae.moment(this.props.archiveEndDate);

    return <div>
      <input onChange={this.toggleConfidence} type='checkbox' /><span className='fires-confidence-wrapper'>Only show <span className='fires-confidence' onClick={this.showFiresModal}>high confidence fires</span></span>
      <div id='archive-date-ranges'>
        <span className='imagery-calendar-label'>{this.props.options.minLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>{this.props.options.maxLabel}</span>
        <button className={`gfw-btn white pointer ${this.props.calendarVisible === 'archiveEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
        { new Date(this.props.archiveEndDate) < new Date(this.props.archiveStartDate) ? <p className="error-message">{layerPanelText.calendarValidation}</p> : '' }
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
