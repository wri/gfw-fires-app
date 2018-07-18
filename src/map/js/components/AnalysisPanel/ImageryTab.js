import ImageryComponent from 'components/LayerPanel/ImageryComponent';
import {layersConfig, analysisPanelText} from 'js/config';
import { analysisActions } from 'actions/AnalysisActions';
import {modalActions} from 'actions/ModalActions';
import { mapActions } from 'actions/MapActions';
import { mapStore } from 'stores/MapStore';
import LayersHelper from 'helpers/LayersHelper';
import KEYS from 'js/constants';
import React from 'react';

import PlanetImagery from 'components/AnalysisPanel/PlanetImagery';

let useSvg = '<use xlink:href="#shape-info" />';

export default class ImageryTab extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
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

          const parsedMonthly = self.parseTitles(monthlyBasemaps, true).reverse();
          const parsedQuarterly = self.parseTitles(quarterlyBasemaps, false).reverse();

          analysisActions.saveMonthlyPlanetBasemaps(parsedMonthly);
          analysisActions.saveQuarterlyPlanetBasemaps(parsedQuarterly);
        } else {
          console.log('Error retrieving planet basemaps.');
        }
      }
    };
    xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=d4d25171b85b4f7f8fde459575cba233', true);
    xhttp.send();
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  parseTitles(planetBasemaps, isMonthly) {
    // Filter out 'Latest Monthly' and 'Latest Quarterly'
    return planetBasemaps.filter(basemap => {
      if (basemap.title === 'Latest Monthly' || basemap.title === 'Latest Quarterly') {
        return false;
      } else {
        return true;
      }
    }).map(basemap => {
      const { url, title } = basemap;
      const label = isMonthly ? this.parseMonthlyTitle(title) : this.parseQuarterlyTitle(title);
      return {
        value: url,
        label: label
      };
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

  clickedImagery = (evt) => {
    let currImagery = '';
    const { activeImagery } = this.state;
    const { basemap: clickedImagery } = evt.currentTarget.dataset;
    const dgLayer = layersConfig.filter((l) => l.id === KEYS.digitalGlobe)[0];

    if (activeImagery === clickedImagery) {
      if (clickedImagery === KEYS.planetBasemap) {
        mapActions.changeBasemap(app.map.getBasemap());
      } else {
        LayersHelper.hideLayer(dgLayer.id);
      }
    } else {
      currImagery = clickedImagery;
    }

      mapActions.setImagery(currImagery);
  };

  showInfo = (evt) => {
    evt.stopPropagation();
    const id = evt.currentTarget.parentElement.dataset.basemap === 'planetBasemap' ? evt.currentTarget.parentElement.dataset.basemap : 'dg-00';
    modalActions.showLayerInfo(id);
  }

  render () {
    const { activeImagery, iconLoading } = this.state;
    const { monthlyPlanetBasemaps, quarterlyPlanetBasemaps, activeTab } = this.props;
    const { planetBasemap, digitalGlobe, digitalGlobeBasemap } = KEYS;

    let className = 'imagery-tab';
    if (activeTab !== analysisPanelText.imageryTabId) { className += ' hidden'; }
    let dgLayer = layersConfig.filter((l) => l.id === digitalGlobe)[0];

    return (
      <div className={className}>
        <h3>{analysisPanelText.imageryArea}</h3>
        <div data-basemap={planetBasemap} className={`basemap-item ${activeImagery === planetBasemap ? 'active' : ''}`} onClick={this.clickedImagery}>
          <span className={`basemap-thumbnail dark-gray-basemap ${activeImagery === planetBasemap ? 'active' : ''}`} />
          <div className='basemap-label'>Planet Basemaps</div>
          <span className={`info-icon pointer info-icon-center ${iconLoading === planetBasemap ? 'iconLoading' : ''}`} onClick={this.showInfo.bind(this)}>
            <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
          </span>
          { activeImagery === planetBasemap &&
          <PlanetImagery monthlyBasemaps={monthlyPlanetBasemaps} quarterlyBasemaps={quarterlyPlanetBasemaps} active={activeImagery === planetBasemap}/> }
        </div>
        <div data-basemap={digitalGlobeBasemap} className={`basemap-item ${activeImagery === digitalGlobeBasemap ? 'active' : ''}`} onClick={this.clickedImagery}>
          <span className={`basemap-thumbnail dark-gray-basemap ${activeImagery === digitalGlobeBasemap ? 'active' : ''}`} />
          <div className='basemap-label'>DigitalGlobe - FirstLook</div>
          <span className={`info-icon pointer info-icon-center ${iconLoading === digitalGlobeBasemap ? 'iconLoading' : ''}`} onClick={this.showInfo.bind(this)}>
            <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
          </span>
          { activeImagery === digitalGlobeBasemap &&
          <ImageryComponent {...this.state} options={dgLayer.calendar} active={activeImagery === digitalGlobeBasemap} layer={dgLayer} /> }
        </div>
      </div>
    );
  }

}
