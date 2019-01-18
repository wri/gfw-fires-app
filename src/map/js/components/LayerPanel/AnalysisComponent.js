import {analysisPanelText} from 'js/config';
import {mapActions} from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';
import {modalActions} from 'actions/ModalActions';
import React from 'react';

export type AnalysisProps = {
  options: Object
};

export default class AnalysisComponent extends React.Component {

  props: AnalysisProps;
  displayName: 'AnalysisComponent';

  render () {
    let startDate = window.Kalendae.moment(this.props.analysisStartDate);
    let endDate = window.Kalendae.moment(this.props.analysisEndDate);

    return <div className={`timeline-container ${this.props.options.domClass}`}>
      <div id='analysis-date-ranges'>
        <div className='analysis-date-ranges__range-container'>
          <span className='imagery-calendar-label'>{this.props.options.minLabelPlus}</span>
          <button className={`gfw-btn no-pad white pointer ${this.props.calendarVisible === 'analysisStart' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        </div>
        <div className='analysis-date-ranges__range-container'>
          <span className='imagery-calendar-label'>{this.props.options.maxLabel}</span>
          <button className={`gfw-btn no-pad white pointer ${this.props.calendarVisible === 'analysisEnd' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
        </div>
      </div>
      { new Date(this.props.analysisEndDate) < new Date(this.props.analysisStartDate) ? <p className="error-message">{analysisPanelText.analysisInvalidDatesErrorMessage}</p> : ''}
    </div>;
  }

  changeStart () {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('analysisStart');
  }

  changeEnd () {
    modalActions.showCalendarModal('end');
    mapActions.setCalendar('analysisEnd');
  }

}
