import LayersHelper from 'helpers/LayersHelper';
// import FireRiskLegend from 'components/LayerPanel/FireRiskLegend';
import React from 'react';


export default class ImagerySettings extends React.Component {

  componentDidMount() {
    // let startDate = window.Kalendae.moment(this.props.startDate);
    // let currentDate = window.Kalendae.moment(this.props.currentDate);
    // let today = window.Kalendae.moment();
    //
    // let calendar = new window.Kalendae(this.props.domId, {
		// 	months: 1,
    //   blackout: function (date) {
    //     return (date < startDate) || (date > today);
    //   },
		// 	mode: 'single',
		// 	selected: currentDate
		// });
    //
    // calendar.subscribe('change', this.changeImageryDay);

  }

  render () {
    //<FireRiskLegend />
    return <div className={'timeline-container'}>
      <p>Advanced Settings</p>
    </div>;
  }

  changeImageryDay() {
    // LayersHelper.updateImagery(this.getSelected());
  }

  changeStart() {
    //showCalendarStart
  }

  changeStart() {
    //showCalendarEnd
  }

}
