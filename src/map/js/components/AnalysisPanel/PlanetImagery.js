import React from 'react';
import Select from 'react-select';
import { mapStore } from 'stores/MapStore';
import { mapActions } from 'actions/MapActions';

export default class PlanetImagery extends React.Component {

	constructor(props) {
		super(props);
		mapStore.listen(this.storeUpdated.bind(this));

		this.state = {
			...mapStore.getState(),
			checked: false
		};
	}

	storeUpdated () {
    this.setState(mapStore.getState());
  }

	shouldComponentUpdate(nextProps, nextState) {
		if(nextState.activePlanetBasemap === '' && this.state.activePlanetPeriod !== nextState.activePlanetPeriod && nextState.activePlanetPeriod !== '' && nextState.activePlanetPeriod !== 'null') {
			this.getPlanetBasemaps(nextState.activePlanetPeriod);
		}

		if (nextState.activePlanetPeriod !== '' && this.state.activePlanetPeriod !== nextState.activePlanetPeriod && nextState.activePlanetPeriod !== 'null' && this.state.activeCategory !== nextState.activeCategory) {
			this.getPlanetBasemaps(nextState.activePlanetPeriod);
			return true;
		} else if (nextState.activeCategory !== '' && this.state.activeCategory !== nextState.activeCategory && nextState.activeCategory !== 'null' && nextState.activePlanetPeriod !== 'null' && nextState.activePlanetPeriod !== '') {
			return true;
		} else if (nextState.activePlanetPeriod !== '' && this.state.activePlanetPeriod !== nextState.activePlanetPeriod && nextState.activePlanetPeriod !== 'null') {
			return true;
		} else if (nextState.activePlanetBasemap !== '' && this.state.activePlanetBasemap !== nextState.activePlanetBasemap && nextState.activePlanetBasemap !== 'null') {
			return true;
		}
		return false;
	}

	setCategory = selected => {
		const { value } = selected;
		const { monthlyBasemaps, quarterlyBasemaps } = this.props;

		const defaultBasemap = value === 'PLANET-MONTHLY' ? monthlyBasemaps[0] : quarterlyBasemaps[0];

		mapActions.setActivePlanetBasemap.defer(defaultBasemap);
		mapActions.setActivePlanetPeriod.defer(defaultBasemap.label);
		mapActions.setActivePlanetCategory.defer(value);
	
		mapActions.changeBasemap.defer(defaultBasemap);
	}

	getPlanetBasemaps(period) {
		const { monthlyBasemaps, quarterlyBasemaps } = this.props;

		const basemaps = this.state.activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;

		const defaultBasemap = basemaps.find((item) => {
			return item.label === period ? period : this.state.activePlanetPeriod;
		});

		mapActions.setActivePlanetBasemap.defer(defaultBasemap);
		mapActions.setActivePlanetPeriod.defer(defaultBasemap.label);
		mapActions.setActivePlanetCategory.defer(this.state.activeCategory);

		mapActions.changeBasemap.defer(defaultBasemap);
	}

	handleBasemap = selected => {
		const { value } = selected;
		const { monthlyBasemaps, quarterlyBasemaps } = this.props;
		const { activeCategory } = this.state;
		const filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
		const choice = filterBasemaps.find(basemap => basemap.value === value);

		if (choice) {
			mapActions.setActivePlanetBasemap.defer(selected);
			mapActions.setActivePlanetPeriod.defer(selected.label);
			mapActions.changeBasemap.defer(choice);
		}
	}

	render() {
		let tmpActiveBasemap;
		const { activePlanetBasemap, activeCategory } = this.state;
		const { active, monthlyBasemaps, quarterlyBasemaps } = this.props;

		return (
			<div className={`relative ${active ? 'active' : 'hidden'}`} onClick={(evt) => evt.stopPropagation()}>
				<div className={`layer-content-container flex select-container ${active ? '' : 'hidden'}`}>
					<div className='flex imagery-category-container'>
						<Select
							multi={false}
							clearable={false}
							value={activeCategory}
							options={[
								{ value: 'PLANET-MONTHLY', label: 'Monthly' },
								{ value: 'PLANET-QUARTERLY', label: 'Quarterly' }
							]}
							onChange={this.setCategory.bind(this)}
							style={{
								width: '175px'
							}}
						/>
					</div>
					<div>
						<Select
							multi={false}
							clearable={false}
							value={activePlanetBasemap === '' ? tmpActiveBasemap : activePlanetBasemap}
							options={activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps}
							onChange={this.handleBasemap.bind(this)}
							style={{
								width: '175px'
							}}
						/>
					</div>
				</div>
			</div>
		);
	}
}
