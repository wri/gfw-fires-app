import React from 'react';
import Select from 'react-select';
import ShareHelper from 'helpers/ShareHelper';
import { mapActions } from 'actions/MapActions';

export default class PlanetImagery extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const { activePlanetPeriod } = this.props;
		if(activePlanetPeriod && activePlanetPeriod !== '' && activePlanetPeriod !== 'null') {
			this.getPlanetBasemaps(activePlanetPeriod);
		}
	}

	componentDidUpdate(prevProps) {
		const { activePlanetPeriod, activeCategory } = this.props;
		if((prevProps.activePlanetBasemap === '' && activePlanetPeriod !== prevProps.activePlanetPeriod && prevProps.activePlanetPeriod !== '' && prevProps.activePlanetPeriod !== 'null') ||
		(prevProps.activePlanetPeriod !== '' && activePlanetPeriod !== prevProps.activePlanetPeriod && prevProps.activePlanetPeriod !== 'null' && activeCategory !== prevProps.activeCategory)) {
			this.getPlanetBasemaps(prevProps.activePlanetPeriod);
		}
	}

	setCategory = selected => {
		const { value } = selected;
		const { monthlyBasemaps, quarterlyBasemaps, activeImagery } = this.props;

		const defaultBasemap = value === 'PLANET-MONTHLY' ? monthlyBasemaps[0] : quarterlyBasemaps[0];

		if(defaultBasemap) {
			mapActions.setActivePlanetBasemap.defer(defaultBasemap);
			mapActions.setActivePlanetPeriod.defer(defaultBasemap.label);
			mapActions.setActivePlanetCategory.defer(value);

			mapActions.changeBasemap.defer(defaultBasemap);

			ShareHelper.handleHashChange(undefined, activeImagery, value, defaultBasemap.label);
		}
	}

	getPlanetBasemaps(period) {
		const { monthlyBasemaps, quarterlyBasemaps, activeImagery, activeCategory, activePlanetPeriod } = this.props;

		const basemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;

		const defaultBasemap = basemaps.find((item) => {
			return item.label === activePlanetPeriod;
		});

		if (defaultBasemap) {
			mapActions.setActivePlanetBasemap.defer(defaultBasemap);
			mapActions.setActivePlanetPeriod.defer(defaultBasemap.label);
			mapActions.setActivePlanetCategory.defer(activeCategory);

			mapActions.changeBasemap.defer(defaultBasemap);

			ShareHelper.handleHashChange(undefined, activeImagery, activeCategory, defaultBasemap.label);
		}
	}

	handleBasemap = selected => {
		const { value } = selected;
		const { monthlyBasemaps, quarterlyBasemaps, activeCategory, activeImagery } = this.props;
		const filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
		const choice = filterBasemaps.find(basemap => basemap.value === value);

		if (choice) {
			mapActions.setActivePlanetBasemap.defer(selected);
			mapActions.setActivePlanetPeriod.defer(selected.label);
			mapActions.changeBasemap.defer(choice);
			ShareHelper.handleHashChange(undefined, activeImagery, activeCategory, selected.label);
		}
	}

	render() {
		const { active, monthlyBasemaps, quarterlyBasemaps, activeCategory, activePlanetBasemap } = this.props;

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
							value={activePlanetBasemap}
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
