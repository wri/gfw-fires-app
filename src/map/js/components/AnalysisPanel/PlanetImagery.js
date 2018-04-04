import React from 'react';
import { mapActions } from 'actions/MapActions';
import { analysisActions } from 'actions/AnalysisActions';

export default class PlanetImagery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            activeCategory: 'PLANET-MONTHLY',
            activePlanetBasemap: ''
        };
    }

    componentDidMount() {
        // Request XML page
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const basemaps = [];
                    const xmlDoc = $.parseXML(xhttp.responseText);
                    const $xml = $(xmlDoc);
                    $xml.find('Layer').each(function (i, el) {
                        const title = el.firstChild.innerHTML;
                        const url = $(this).find('ResourceURL').attr('template');
                        basemaps.push({ title, url });
                    });
                    const monthlyBasemaps = basemaps.filter(b => b.title.includes('Monthly'));
                    const quarterlyBasemaps = basemaps.filter(b => b.title.includes('Quarterly'));
                    analysisActions.saveMonthlyPlanetBasemaps(monthlyBasemaps);
                    analysisActions.saveQuarterlyPlanetBasemaps(quarterlyBasemaps);
                } else {
                    console.log('Error retrieving planet basemaps.');
                }
            }
        };
        xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=d4d25171b85b4f7f8fde459575cba233', true);
        xhttp.send();
    }
    
    toggle() {
        this.setState({
            checked: !this.state.checked
        }, () => {
            if (!this.state.checked) {
                mapActions.changeBasemap('topo');
            } else if (this.state.checked && this.state.activePlanetBasemap) {
                const checkMonthly = this.props.monthlyBasemaps.find(b => b.title === this.state.activePlanetBasemap);
                const checkQuarterly = this.props.quarterlyBasemaps.find(b => b.title === this.state.activePlanetBasemap);
                if (checkMonthly) { mapActions.changeBasemap(checkMonthly); }
                if (checkQuarterly) { mapActions.changeBasemap(checkQuarterly); }
            }
        });
    }

    setCategory(evt) {
        const id = evt.target.id;
        this.setState({ activeCategory: id });
    }

    createBasemapOptions () {
        const { monthlyBasemaps, quarterlyBasemaps } = this.props;
        const { activeCategory, activePlanetBasemap } = this.state;
        const filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
        return filterBasemaps.map((basemap, idx) => {
            const { url, title } = basemap;
            const pieces = title.split(' ');

            const content = activeCategory === 'PLANET-MONTHLY' ? pieces[2] + ' ' + pieces[3] : pieces[2];

            let formattedTitle = '';
            if (activeCategory === 'PLANET-MONTHLY') {
                formattedTitle = window.Kalendae.moment(content, 'YYYY MM').format('MMM YYYY');
            } else {
                const subpieces = content.split('q');
                formattedTitle = `Quarter ${subpieces[1]} ${subpieces[0]}`;
            }

            return (
                <div
                    key={idx}
                    data-basemap={url}
                    onClick={this.handleBasemap}
                    className={`planet-basemap ${activePlanetBasemap === title ? 'active' : ''}`}
                    onClick={this.handleBasemap}
                >
                    {formattedTitle}
                </div>
            );
        });
    }

    handleBasemap = (evt) => {
        const { monthlyBasemaps, quarterlyBasemaps } = this.props;
        const { activeCategory } = this.state;
        const url = evt.currentTarget.getAttribute('data-basemap');
        const filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
        const choice = filterBasemaps.find(basemap => basemap.url === url);
        if (choice) {
            this.setState({
                activePlanetBasemap: choice.title
            }, () => {
                mapActions.changeBasemap(choice);
            });
        }
    }

    render () {
        const { checked, activeCategory } = this.state;
        return (
            <div className={`layer-checkbox relative ${checked ? 'active' : ''}`}>
                <span className='toggle-switch pointer' onClick={this.toggle.bind(this)}>
                    <span/>
                </span>
                <span className='layer-checkbox-label pointer' onClick={this.toggle.bind(this)}>
                    Planet Basemaps
                </span>
                <div className={`layer-content-container flex flex-column justify-center ${checked ? '' : 'hidden'}`}>
                    <div className='flex'>
                        <div
                            id='PLANET-MONTHLY'
                            onClick={this.setCategory.bind(this)}
                            className={`planet-category ${activeCategory === 'PLANET-MONTHLY' ? 'active' : ''}`}
                        >
                            Monthly
                        </div>
                        <div
                            id='PLANET-QUARTERLY'
                            onClick={this.setCategory.bind(this)}
                            className={`planet-category ${activeCategory === 'PLANET-QUARTERLY' ? 'active' : '' }`}
                        >
                            Quarterly
                        </div>
                    </div>
                    <div className='flex flex-wrap justify-between'>
                        {this.createBasemapOptions()}
                    </div>
                </div>
            </div>
        );
    }
}