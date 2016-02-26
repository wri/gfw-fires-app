import CalendarWrapper from 'components/Modals/CalendarWrapper';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import {modalActions} from 'actions/ModalActions';
import React from 'react';

export default class GlobeEndModal extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  componentDidMount() {
    console.log(this.state);
    let startDate;
    if (this.state.date) {
      startDate = window.Kalendae.moment(this.state.date);
    } else {
      startDate = window.Kalendae.moment();
    }

    let calendarStart = new window.Kalendae(this.props.domId, {
			months: 1,
			mode: 'single',
			selected: startDate
		});
    debugger

    calendarStart.subscribe('change', this.changeImagery.bind(this));

  }

  render () {
    return (
        <CalendarWrapper>
          <div className={`modal-content ${this.props.domClass}`}>
            <div id={this.props.domId}></div>
          </div>
        </CalendarWrapper>
     );
  }

  close () {
    modalActions.hideModal(React.findDOMNode(this).parentElement);
  }

  changeImagery(date) {
    this.close();
    mapActions.setDate(date);
  }

}
