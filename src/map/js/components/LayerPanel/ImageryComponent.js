import LayersHelper from 'helpers/LayersHelper';
import ImagerySettings from 'components/LayerPanel/ImagerySettings';
import ModalWrapper from 'components/Modals/ModalWrapper';
import React from 'react';


export default class ImageryComponent extends React.Component {

  constructor (props) {
    super(props);
    // mapStore.listen(this.storeUpdated.bind(this));
    this.state = {
      startVisible: false,
      endVisible: false
    }
  }

  componentDidMount() {
    let startDate = window.Kalendae.moment(this.props.startDate);
    let currentDate = window.Kalendae.moment(this.props.currentDate);
    let today = window.Kalendae.moment();

    let calendarStart = new window.Kalendae(this.props.domId, {
			months: 1,
      blackout: function (date) {
        return (date < startDate) || (date > today);
      },
			mode: 'single',
			selected: currentDate
		});

    calendarStart.subscribe('change', this.changeImageryStart);

    let endId = this.props.domId + '-end';

    let calendarEnd = new window.Kalendae(endId, {
			months: 1,
      blackout: function (date) {
        return (date < startDate) || (date > today);
      },
			mode: 'single',
			selected: today
		});

    calendarEnd.subscribe('change', this.changeImageryStart);

  }

  render () {
    // todo: should I turn these calendars into Modals??
    return <div className={`timeline-container ${this.props.domClass}`}>
      <ImagerySettings />
      <div id='imagery-date-ranges'>
        <div className='layer-checkbox-label'>ACQUIRED DATE MINIMUM</div>
        <button className='gfw-btn white pointer' onClick={this.changeStart.bind(this)}>Thursday, 19 November 2015</button>
        <div className='layer-checkbox-label'>ACQUIRED DATE MAXIMUM</div>
        <button className='gfw-btn white pointer' onClick={this.changeEnd.bind(this)}>Friday, 19 February 2016</button>
      </div>
      <div id={this.props.domId} className={this.state.startVisible ? '' : 'hidden'}></div>
    </div>;
  }

  changeImageryStart() {
    // LayersHelper.updateImageryStart(this.getSelected());
  }

  changeImageryEnd() {
    // LayersHelper.updateImageryEnd(this.getSelected());
  }

  changeStart() {
    let visible = this.state.startVisible;
    if (visible === true) {
      this.setState({
        startVisible: false
      });
    } else if (visible === false) {
      this.setState({
        startVisible: true
      });
    }

    //showCalendarStart
  }

  changeEnd() {
    //showCalendarEnd
    this.setState({
      endVisible: true
    });
  }

}
