import LayersHelper from 'helpers/LayersHelper';
import FireRiskLegend from 'components/LayerPanel/FireRiskLegend';
import React from 'react';


export default class RiskCalendar extends React.Component {

  componentDidMount() {
    let startDate = window.Kalendae.moment(this.props.startDate);
    let currentDate = window.Kalendae.moment(this.props.currentDate);
    let today = window.Kalendae.moment();
    let props = this.props;

    let calendar = new window.Kalendae(this.props.domId, {
			months: 1,
      blackout: function (date) {

        if (props.domId === 'windDirectionCalendar') {
          return (date < startDate) || (date > today);
        } else if (props.domId === 'fireRiskCalendar') {
          return (date < startDate) || (date > today);
        }
      },
			mode: 'single',
			selected: currentDate
		});

    calendar.subscribe('change', this.changeRiskDay);
  }

  render () {
    //<FireRiskLegend />

    return <div className={`timeline-container ${this.props.domClass}`}>
      <div id={this.props.domId}></div>
      <FireRiskLegend domClass={this.props.childDomClass} />
    </div>;
  }

  changeRiskDay() {
    LayersHelper.updateFireRisk(this.getSelected());
  }
}
