import ImageryComponent from 'components/LayerPanel/ImageryComponent';
import {layersConfig, analysisPanelText} from 'js/config';
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

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  clickedImagery = (evt) => {
    let currImagery = '';
    const { activeImagery } = this.state;
    const { basemap: clickedImagery } = evt.currentTarget.dataset;

    if (activeImagery === clickedImagery && clickedImagery !== KEYS.planetBasemap) {
      const dgLayer = layersConfig.filter((l) => l.id === KEYS.digitalGlobe)[0];
      LayersHelper.hideLayer(dgLayer.id);
    } else {
      currImagery = clickedImagery;
      if (clickedImagery === KEYS.planetBasemap && app.map.getLayer('planetBasemap')) {
        app.map.removeLayer(app.map.getLayer('planetBasemap'));
      }
    }

    mapActions.setImagery(currImagery);
  };

  showInfo = (evt) => {
    evt.stopPropagation();
    const id = evt.currentTarget.parentElement.dataset.basemap === 'planetBasemap' ? evt.currentTarget.parentElement.dataset.basemap : 'dg-00';
    modalActions.showLayerInfo(id);
  }

  render () {
    const { activeImagery, iconLoading, activePlanetPeriod, activeCategory, activePlanetBasemap } = this.state;
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
          <PlanetImagery activeCategory={activeCategory} activePlanetBasemap={activePlanetBasemap} activeImagery={activeImagery} activePlanetPeriod={activePlanetPeriod} monthlyBasemaps={monthlyPlanetBasemaps} quarterlyBasemaps={quarterlyPlanetBasemaps} active={activeImagery === planetBasemap}/> }
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
