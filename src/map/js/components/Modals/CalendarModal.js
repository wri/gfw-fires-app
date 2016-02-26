import CalendarWrapper from 'components/Modals/CalendarWrapper';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import {modalActions} from 'actions/ModalActions';
import React from 'react';

export default class CalendarModal extends React.Component {

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
		// let startDate;
		// if (this.state.date) {
		//   startDate = window.Kalendae.moment(this.state.date);
		// } else {
		//   startDate = window.Kalendae.moment();
		// }
		//
		// let calendarStart = new window.Kalendae(this.props.domId, {
		// 	months: 1,
		// 	mode: 'single',
		// 	selected: startDate
		// });

		//
		// calendarStart.subscribe('change', this.changeImagery.bind(this));

		this.props.calendars.forEach(calendar => {
			let calendar_obj = new window.Kalendae(calendar.domId, {
				months: 1,
				mode: 'single',
				selected: calendar.date
			});

			calendar_obj.subscribe('change', this[calendar.method].bind(this));
		});

	}

	render () {
		return (
				<CalendarWrapper>
					{this.props.calendars.map(this.itemMapper, this)}
				</CalendarWrapper>
		 );
	}

	itemMapper (item, index) {
		return <div className={`modal-content ${item.domClass}`}>
			<div id={item.domId}></div>
		</div>;
	}

	close () {
		modalActions.hideModal(React.findDOMNode(this).parentElement);
	}

  changeImageryStart(date) {
    console.log('changeImageryStart');
		this.close();
		// mapActions.setDate(date);
	}
  changeImageryEnd(date) {
    console.log('changeImageryEnd');
		this.close();
		mapActions.setDate(date);
	}
  changeAnalysisStart(date) {
    console.log('changeAnalysisStart');
		this.close();
		mapActions.setDate(date);
	}
  changeAnalysisEnd(date) {
    console.log('changeAnalysisEnd');
		this.close();
		mapActions.setDate(date);
	}

}
