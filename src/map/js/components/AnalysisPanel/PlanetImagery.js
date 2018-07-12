import React from 'react';
import Select from 'react-select';
import KEYS from 'js/constants';
import { mapActions } from 'actions/MapActions';
import { analysisActions } from 'actions/AnalysisActions';
import { modalActions } from 'actions/ModalActions';

export default class PlanetImagery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            activeCategory: 'PLANET-MONTHLY',
            activePlanetBasemap: '',
            activePlanetCategory: { value: 'PLANET-MONTHLY', label: 'Monthly'}
        };
    }

    componentDidMount() {
        const self = this;
        // Request XML page
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const basemaps = [];

                    const xmlParser = new DOMParser();
                    const htmlString = '<!DOCTYPE html>' + xhttp.responseText.substring(38);

                    const xmlDoc = xmlParser.parseFromString(htmlString, 'text/html');

                    const contents = xmlDoc.getElementsByTagName('Contents')[0];
                    const layerCollection = contents.getElementsByTagName('Layer');
                    const layerCollectionLength = layerCollection.length;

                    for (let i = 0; i < layerCollectionLength; i++) {
                        const currentLayer = layerCollection[i];
                        const title = currentLayer.getElementsByTagName('ows:Title')[0].innerHTML;
                        const url = currentLayer.getElementsByTagName('ResourceURL')[0].getAttribute('template');
                        basemaps.push({ title, url });
                    }

                    const monthlyBasemaps = [];
                    const quarterlyBasemaps = [];
                    basemaps.forEach(function(basemap) {
                        if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Monthly') >= 0) {
                            monthlyBasemaps.push(basemap);
                        }
                        if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Quarterly') >= 0) {
                            quarterlyBasemaps.push(basemap);
                        }
                    });

                    analysisActions.saveMonthlyPlanetBasemaps(monthlyBasemaps);
                    analysisActions.saveQuarterlyPlanetBasemaps(quarterlyBasemaps);
                    self.getPlanetBasemaps();
                } else {
                    console.log('Error retrieving planet basemaps.');
                }
            }
        };
        xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=d4d25171b85b4f7f8fde459575cba233', true);
        xhttp.send();
    }

    setCategory(selected) {
        const { value } = selected;
        this.setState({ activeCategory: value }, () => {
            const defaultBasemap = this.createBasemapOptions().reverse()[0];
            this.setState({ activePlanetBasemap: defaultBasemap, activePlanetCategory: selected }, () => {
                mapActions.changeBasemap({
                  title: defaultBasemap.label,
                  url: defaultBasemap.value
                });
            });
        });
    }

    getPlanetBasemaps() {
        const defaultBasemap = this.createBasemapOptions().reverse()[0];
        this.setState({ activePlanetBasemap: defaultBasemap }, () => {
            mapActions.changeBasemap({
              title: defaultBasemap.label,
              url: defaultBasemap.value
            });
        });
    }
    
    parseMonthlyTitle(title) {
        // ex. formats 'Global Monthly 2016 01 Mosaic'
        const words = title.split(' ');
        const year = words[2];
        const month = words[3];
        const yyyyMM = year + ' ' + month;
        const label = window.Kalendae.moment(yyyyMM, 'YYYY MM').format('MMM YYYY');
        return label;
    }

    parseQuarterlyTitle(title) {
        const words = title.split(' ');
        const yearQuarter = words[2];

        const dict = {
            1: 'JAN-MAR',
            2: 'APR-JUN',
            3: 'JUL-SEP',
            4: 'OCT-DEC'
        };

        if (yearQuarter === undefined) {
            return title;
        } else {
            const [ year, quarter ] = yearQuarter.split('q');
            const label = `${dict[quarter]} ${year}`;
            return label;
        }
    }

    createBasemapOptions () {
        const { monthlyBasemaps, quarterlyBasemaps } = this.props;
        const { activeCategory } = this.state;
        const filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;

        // Filter out 'Latest Monthly' and 'Latest Quarterly'
        return filterBasemaps.filter(basemap => {
            if (basemap.title === 'Latest Monthly' || basemap.title === 'Latest Quarterly') {
                return false;
            } else {
                return true;
            }
        }).map(basemap => {
            const { url, title } = basemap;
            const label = activeCategory === 'PLANET-MONTHLY' ? this.parseMonthlyTitle(title) : this.parseQuarterlyTitle(title);
            return {
                value: url,
                label: label
            };
        });
    }

    handleBasemap = selected => {
        const { value } = selected;
        const { monthlyBasemaps, quarterlyBasemaps } = this.props;
        const { activeCategory } = this.state;
        const filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
        const choice = filterBasemaps.find(basemap => basemap.url === value);
        if (choice) {
            this.setState({
                activePlanetBasemap: selected
            }, () => {
                mapActions.changeBasemap(choice);
            });
        }
    }

    showInfo = () => {
        modalActions.showLayerInfo(KEYS.planetBasemap);
    }

    render () {
        const { activePlanetBasemap, activePlanetCategory } = this.state;
        const { active } = this.props;

        return (
            <div className={`relative ${active ? 'active' : 'hidden'}`} onClick={(evt) => evt.stopPropagation()}>
                <div className={`layer-content-container flex select-container ${active ? '' : 'hidden'}`}>
                    <div className='flex imagery-category-container'>
                        <Select
                            multi={false}
                            clearable={false}
                            value={activePlanetCategory}
                            options={[
                                { value: 'PLANET-MONTHLY', label: 'Monthly'},
                                { value: 'PLANET-QUARTERLY', label: 'Quarterly'}
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
                            options={this.createBasemapOptions().reverse()}
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