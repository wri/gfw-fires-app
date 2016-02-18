import LayersHelper from 'helpers/LayersHelper';
import FireRiskLegend from 'components/LayerPanel/FireRiskLegend';
import {calendarText} from 'js/config';
import React from 'react';


export default class RiskCalendar extends React.Component {

  componentDidMount() {
    let startDate = window.Kalendae.moment(calendarText.startDate);
    let today = window.Kalendae.moment();

    let calendar = new window.Kalendae('calendarStart', {
			months: 1,
      blackout: function (date) {
        return (date < startDate) || (date > today);
      },
			mode: 'single',
			selected: startDate
		});

    calendar.subscribe('change', this.changeRiskDay);
  }

  render () {
    return <div className='timeline-container fire-risk'>
      <div id='calendarStart'></div>
      <FireRiskLegend />
    </div>;
  }

  changeRiskDay() {
    LayersHelper.updateFireRisk(this.getSelected());
  }
}
