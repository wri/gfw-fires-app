import React from 'react';

import { analysisActions } from 'actions/AnalysisActions';
import { mapActions } from 'actions/MapActions';

export default class PlanetBasemaps extends React.Component {
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
        return basemaps.map((basemap, idx) => {
            return (
                <div key={idx} className='analysis-planet__option' data-basemap={basemap.url} onClick={this.handleBasemap}>{basemap.title}</div>
            );
        });
    }

    handleBasemap = (evt) => {
        const url = evt.currentTarget.getAttribute('data-basemap');
        const choice = this.props.basemaps.find(basemap => basemap.url === url);
        if (choice) {
            mapActions.changePlanetBasemap(choice);
        }
    }

    render () {
        const {visible} = this.props;
        return (
            <div className={`analysis-planet__container ${visible ? '' : 'hidden'}`}>
                {this.renderBasemapOptions()}
            </div>
        );
    }
}

