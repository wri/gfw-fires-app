import React from 'react';
import Select from 'react-select';
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

                    const xmlParser = new DOMParser();
                    const xmlString = xhttp.responseText;
                    const xmlDoc = xmlParser.parseFromString(xmlString, 'text/xml');

                    const contents = xmlDoc.getElementsByTagName('Contents')[0];
                    const layerCollection = contents.getElementsByTagName('Layer');
                    const layerCollectionLength = layerCollection.length;

                    for (let i = 0; i < layerCollectionLength; i++) {
                        const currentLayer = layerCollection[i];
                        const title = currentLayer.getElementsByTagName('ows:Title')[0].innerHTML;
                        const url = currentLayer.getElementsByTagName('ResourceURL')[0].getAttribute('template');
                        basemaps.push({ title, url });
                    }


                    // const xmlDoc = $.parseXML(xhttp.responseText);
                    // const $xml = $(xmlDoc);
                    // $xml.find('Layer').each(function (i, el) {
                    //     const title = el.firstChild.innerHTML;
                    //     const url = $(this).find('ResourceURL').attr('template');
                    //     basemaps.push({ title, url });
                    // });

                    const monthlyBasemaps = [];
                    const quarterlyBasemaps = [];
                    console.log('hello');
                    basemaps.forEach(function(basemap) {
                        console.log(basemap);
                        if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Monthly') >= 0) {
                            monthlyBasemaps.push(basemap);
                        }
                        if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Quarterly') >= 0) {
                            quarterlyBasemaps.push(basemap);
                        }
                    });

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
            } else if (this.state.checked) {
                const defaultBasemap = this.createBasemapOptions().reverse()[0];
                this.setState({
                  activePlanetBasemap: defaultBasemap
                }, () => {
                  mapActions.changeBasemap({
                    title: defaultBasemap.label,
                    url: defaultBasemap.value
                  });
                });
            }
        });
    }

    setCategory(evt) {
        const id = evt.target.id;
        this.setState({ activeCategory: id }, () => {
            const defaultBasemap = this.createBasemapOptions().reverse()[0];
            this.setState({ activePlanetBasemap: defaultBasemap }, () => {
                mapActions.changeBasemap({
                  title: defaultBasemap.label,
                  url: defaultBasemap.value
                });
            });
        });
    }
    
    parseMonthlyTitle(title) {
        // ex. formats 'Global Monthly 2016 01 Mosaic' OR 'Latest Monthly'
        const words = title.split(' ');
        const year = words[2];
        const month = words[3];
        if (year === undefined || month === undefined) {
            return title;
        } else {
            const yyyyMM = year + ' ' + month;
            const label = window.Kalendae.moment(yyyyMM, 'YYYY MM').format('MMM YYYY');
            return label;
        }
    }

    parseQuarterlyTitle(title) {
        const words = title.split(' ');
        const yearQuarter = words[2];
        if (yearQuarter === undefined) {
            return title;
        } else {
            const [ year, quarter ] = yearQuarter.split('q');
            const label = `Quarter ${quarter} ${year}`;
            return label;
        }
    }

    createBasemapOptions () {
        const { monthlyBasemaps, quarterlyBasemaps } = this.props;
        const { activeCategory, activePlanetBasemap } = this.state;
        const filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
        return filterBasemaps.map(basemap => {
            const { url, title } = basemap;
            const label = activeCategory === 'PLANET-MONTHLY' ? this.parseMonthlyTitle(title) : this.parseQuarterlyTitle(title);
            return {
                value: url,
                label: label
            };
        });
    }

    handleBasemap = selected => {
        const { label, value } = selected;
        const { monthlyBasemaps, quarterlyBasemaps } = this.props;
        const { activeCategory } = this.state;
        const filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
        const choice = filterBasemaps.find(basemap => basemap.url === value);
        if (choice) {
            this.setState({
                activePlanetBasemap: selected
            }, () => {
                console.log(choice);
                mapActions.changeBasemap(choice);
            });
        }
    }

    render () {
        const { checked, activeCategory, activePlanetBasemap } = this.state;
        return (
            <div className={`layer-checkbox relative ${checked ? 'active' : ''}`}>
                <span className='toggle-switch pointer' onClick={this.toggle.bind(this)}>
                    <span/>
                </span>
                <span className='layer-checkbox-label pointer' onClick={this.toggle.bind(this)}>
                    Planet Basemaps
                </span>
                <div className={`layer-content-container flex flex-column justify-center ${checked ? '' : 'hidden'}`}>
                    <div className='flex imagery-category-container'>
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
                    <div className='planet-small-margin flex'>
                        <Select
                            multi={false}
                            value={activePlanetBasemap}
                            options={this.createBasemapOptions().reverse()}
                            onChange={this.handleBasemap.bind(this)}
                            style={{
                                width: '200px'
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}