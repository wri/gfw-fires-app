import React from 'react';
import { analysisActions } from 'actions/AnalysisActions';
import { mapActions } from 'actions/MapActions';

export default class PlanetBasemaps extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            activePlanetBasemap: ''
        };
    }

    componentDidMount () {
        this.getBasemaps();
    }

    getBasemaps = () => {
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
                    analysisActions.savePlanetBasemaps(basemaps);
                } else {
                    console.log('Error retrieving planet basemaps.');
                }
            }
        };
        xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=d4d25171b85b4f7f8fde459575cba233', true);
        xhttp.send();
    }

    renderBasemapOptions = () => {
        const {basemaps} = this.props;
        const {activePlanetBasemap} = this.state;
        return basemaps.map((basemap, idx) => {
            const {url, title} = basemap;
            return (
                <div
                    key={idx}
                    className={`analysis-planet__option ${activePlanetBasemap === title ? 'planet__option-active' : ''}`}
                    data-basemap={url}
                    onClick={this.handleBasemap}
                >
                    {title}
                </div>
            );
        });
    }

    handleBasemap = (evt) => {
        const url = evt.currentTarget.getAttribute('data-basemap');
        const choice = this.props.basemaps.find(basemap => basemap.url === url);
        if (choice) {
            this.setState({
                activePlanetBasemap: choice.title
            }, () => {
                mapActions.changeBasemap(choice);
            });
        }
    }

    render () {
        const { visible } = this.props;
        return (
            <div className={`analysis-planet__container ${visible ? '' : 'hidden'}`}>
                {this.renderBasemapOptions()}
            </div>
        );
    }
}

