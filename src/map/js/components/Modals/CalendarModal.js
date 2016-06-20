/* @flow */
import CalendarWrapper from 'components/Modals/CalendarWrapper';
import {mapStore} from 'stores/MapStore';
import {mapActions} from 'actions/MapActions';
import {modalActions} from 'actions/ModalActions';
import KEYS from 'js/constants';
import {layersConfig, controlPanelText} from 'js/config';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/query';
import Deferred from 'dojo/Deferred';
import ReactDOM from 'react-dom';
import React, {
	Component
} from 'react';

type calendarProps = {
	calendars: Array<Object>;
};

export default class CalendarModal extends Component {
	displayName: CalendarModal;
	props: calendarProps;
	state: any;

	constructor (props: calendarProps) {
		super(props);
		mapStore.listen(this.storeUpdated.bind(this));
		this.state = mapStore.getState();
	}

	storeUpdated () {
		this.setState(mapStore.getState());
	}

	componentDidMount() {
		this.props.calendars.forEach(calendar => {
			if (calendar.method === 'changeRisk') {
				this.getRiskLatest().then((res) => {
          console.log(calendar.date);
					if (calendar.date.isAfter(res)) {
						calendar.date = res;
						mapActions.setRiskDate({
							date: res,
							dest: 'riskDate'
						});
					}
          console.log(calendar.date);
					let calendar_obj = new window.Kalendae(calendar.domId, {
						months: 1,
						mode: 'single',
						direction: calendar.direction,
						blackout: function (date) {
              return date > calendar.date || date.yearDay() < calendar.startDate.yearDay();
						},
						selected: calendar.date
					});
					calendar_obj.subscribe('change', this[calendar.method].bind(this));

				});

			} else {
				let calendar_obj = new window.Kalendae(calendar.domId, {
					months: 1,
					mode: 'single',
					direction: calendar.direction,
					blackout: function (date) {
						if (date.yearDay() >= calendar.startDate.yearDay()) {
							return false;
						} else {
							return true;
						}
					},
					selected: calendar.date
				});
				calendar_obj.subscribe('change', this[calendar.method].bind(this));
			}

		});
	}

	render () {
		return (
				<CalendarWrapper>
					{this.props.calendars.map(this.itemMapper, this)}
				</CalendarWrapper>
		);
	}

	itemMapper (item: any) {
		return <div className={`modal-content ${item.domClass}${this.state.calendarVisible === item.domId ? '' : ' hidden'}`}>
			{item.domId === 'masterDay' ?
				<div className='master-calendar'>{controlPanelText.timeInstructions}</div> : null
			}
			<div id={item.domId}></div>
		</div>;
	}

	close () {
		modalActions.hideModal(ReactDOM.findDOMNode(this).parentElement);
	}

	changeImageryStart(date: any) {
		this.close();
		mapActions.setDGDate({
			date: date,
			dest: 'dgStartDate'
		});
	}
	changeImageryEnd(date: any) {
		this.close();
		mapActions.setDGDate({
			date: date,
			dest: 'dgEndDate'
		});
	}
	changeAnalysisStart(date: any) {
		this.close();
		mapActions.setAnalysisDate({
			date: date,
			dest: 'analysisStartDate'
		});
	}
	changeAnalysisEnd(date: any) {
		this.close();
		mapActions.setAnalysisDate({
			date: date,
			dest: 'analysisEndDate'
		});
	}
	changeArchiveStart(date: any) {
		this.close();
		mapActions.setArchiveDate({
			date: date,
			dest: 'archiveStartDate'
		});
	}
	changeArchiveEnd(date: any) {
		this.close();
		mapActions.setArchiveDate({
			date: date,
			dest: 'archiveEndDate'
		});
	}
	changeNoaaStart(date: any) {
		this.close();
		mapActions.setNoaaDate({
			date: date,
			dest: 'noaaStartDate'
		});
	}
	changeNoaaEnd(date: any) {
		this.close();
		mapActions.setNoaaDate({
			date: date,
			dest: 'noaaEndDate'
		});
	}
	changeRisk(date: any) {
		this.close();
		console.log(date);
		mapActions.setRiskDate({
			date: date,
			dest: 'riskDate'
		});
	}
	changeRain(date: any) {
		this.close();
		mapActions.setRainDate({
			date: date,
			dest: 'rainDate'
		});
	}
	changeAirQ(date: any) {
		this.close();
		mapActions.setAirQDate({
			date: date,
			dest: 'airQDate'
		});
	}
	changeWind(date: any) {
		this.close();
		mapActions.setWindDate({
			date: date,
			dest: 'windDate'
		});
	}
	changeMaster(date: any) {
		this.close();
		mapActions.setMasterDate({
			date: date,
			dest: 'masterDate'
		});
	}

	getRiskLatest () {
		let deferred = new Deferred();
		let riskLayer = layersConfig.filter(layer => layer && layer.id === KEYS.fireRisk)[0];
		let queryTask = new QueryTask(riskLayer.url);
		let query = new Query();
		query.where = '1=1';
		query.returnGeometry = false;
		query.outFields = ['OBJECTID', 'Name'];

		queryTask.execute(query, (results) => {
			let newest = results.features[results.features.length - 1];
			let date = newest.attributes.Name.split('_IDN_FireRisk')[0];
			let dates = date.split('2016');
			let julian = new window.Kalendae.moment('2016').add(parseInt(dates[1]), 'd');
			deferred.resolve(julian);
		});
		return deferred;
	}

}
