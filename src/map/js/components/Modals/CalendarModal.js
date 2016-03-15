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

	itemMapper (item) {
		return <div className={`modal-content ${item.domClass}${this.state.calendarVisible === item.domId ? '' : ' hidden'}`}>
			<div id={item.domId}></div>
		</div>;
	}

	close () {
		modalActions.hideModal(React.findDOMNode(this).parentElement);
	}

	changeImageryStart(date) {
		this.close();
    mapActions.setDGDate({
      date: date,
      dest: 'dgStartDate'
    });
	}
	changeImageryEnd(date) {
		this.close();
		// mapActions.setDGDate(date);
    mapActions.setDGDate({
      date: date,
      dest: 'dgEndDate'
    });
	}
	changeAnalysisStart(date) {
		this.close();
		mapActions.setAnalysisDate({
      date: date,
      dest: 'analysisStartDate'
    });
	}
	changeAnalysisEnd(date) {
		this.close();
    mapActions.setAnalysisDate({
      date: date,
      dest: 'analysisEndDate'
    });
	}
	changeArchiveStart(date) {
		this.close();
    mapActions.setArchiveDate({
      date: date,
      dest: 'archiveStartDate'
    });
	}
	changeArchiveEnd(date) {
		this.close();
    mapActions.setArchiveDate({
      date: date,
      dest: 'archiveEndDate'
    });
	}
	changeNoaaStart(date) {
		this.close();
    mapActions.setNoaaDate({
      date: date,
      dest: 'noaaStartDate'
    });
	}
	changeNoaaEnd(date) {
		this.close();
    mapActions.setNoaaDate({
      date: date,
      dest: 'noaaEndDate'
    });
	}
	changeMaster(date) {
		this.close();
    mapActions.setMasterDate({
      date: date,
      dest: 'masterDate'
    });
	}

}
