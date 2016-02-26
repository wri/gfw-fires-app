// import LayersHelper from 'helpers/LayersHelper';
import ImagerySettings from 'components/LayerPanel/ImagerySettings';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import DateHelper from 'helpers/DateHelper';
import {modalActions} from 'actions/ModalActions';
import React from 'react';


export default class ImageryComponent extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  componentDidMount() {
    // let startDate = window.Kalendae.moment(this.props.startDate);
    // let currentDate = window.Kalendae.moment(this.props.currentDate);
    // let today = window.Kalendae.moment();
    //
    // let calendarStart = new window.Kalendae(this.props.domId, {
		// 	months: 1,
    //   blackout: function (date) {
    //     return (date < startDate) || (date > today);
    //   },
		// 	mode: 'single',
		// 	selected: currentDate
		// });
    //
    // calendarStart.subscribe('change', this.changeImageryStart);

  }

  render () {

    let startDate = window.Kalendae.moment(this.state.dgStartDate);
    let endDate = window.Kalendae.moment(this.state.dgEndDate);
    // todo: should I turn these calendars into Modals?? probably ):
    return <div className={`timeline-container ${this.props.domClass}`}>
      <ImagerySettings />
      <div id='imagery-date-ranges'>
        <span className='imagery-calendar-label'>ACQUIRED DATE MINIMUM</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'imageryMin' ? ' current' : ''}`} onClick={this.changeStart.bind(this)}>{DateHelper.getDate(startDate)}</button>
        <span className='imagery-calendar-label'>ACQUIRED DATE MAXIMUM</span>
        <button className={`gfw-btn white pointer ${this.state.calendarVisible === 'imageryMax' ? ' current' : ''}`} onClick={this.changeEnd.bind(this)}>{DateHelper.getDate(endDate)}</button>
      </div>

    </div>;
  }

  // changeImageryStart() {
  //   LayersHelper.updateImageryStart(this.getSelected());
  // }
  //
  // changeImageryEnd() {
  //   LayersHelper.updateImageryEnd(this.getSelected());
  // }

  changeStart() {
    modalActions.showGlobeModal('start');
    mapActions.setCalendar('imageryMin');

  }

  changeEnd() {
    modalActions.showGlobeModal('end');
    mapActions.setCalendar('imageryMax');
  }

}
