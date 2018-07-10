import ImageryComponent from 'components/LayerPanel/ImageryComponent';
import {layersConfig, analysisPanelText} from 'js/config';
import { mapActions } from 'actions/MapActions';
import { mapStore } from 'stores/MapStore';
import LayersHelper from 'helpers/LayersHelper';
import KEYS from 'js/constants';
import React from 'react';

import PlanetImagery from 'components/AnalysisPanel/PlanetImagery';

export default class ImageryTab extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = {
      ...mapStore.getState(),
      activeImagery: ''
    };
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  clickedImagery = (evt) => {
    let currImagery;
    const { activeImagery, activeBasemap } = this.state;
    const { basemap: clickedImagery } = evt.currentTarget.dataset;
    const dgLayer = layersConfig.filter((l) => l.id === KEYS.digitalGlobe)[0];
    if (activeImagery === clickedImagery) {
      if (clickedImagery === KEYS.planetBasemap) {
        mapActions.changeBasemap(activeBasemap);
      } else {
        LayersHelper.hideLayer(dgLayer.id);
      }
    } else {
      currImagery = clickedImagery;
    }
    // if (activeImagery === KEYS.planetBasemap) {
    //   currImagery = activeImagery === clickedImagery ? mapActions.changeBasemap(activeBasemap) : clickedImagery;
    // } else if (activeImagery === KEYS.digitalGlobeBasemap) {
    //   currImagery = activeImagery === clickedImagery ? LayersHelper.hideLayer(dgLayer.id) : clickedImagery;
    // }
    
    this.setState({ activeImagery: currImagery });
  };

  render () {
    let className = 'imagery-tab';
    if (this.props.activeTab !== analysisPanelText.imageryTabId) { className += ' hidden'; }
    let dgLayer = layersConfig.filter((l) => l.id === KEYS.digitalGlobe)[0];

    return (
      <div className={className}>
        <h3>{analysisPanelText.imageryArea}</h3>
        <div data-basemap={KEYS.planetBasemap} className={`basemap-item ${this.state.activeImagery === KEYS.planetBasemap ? 'active' : ''}`} onClick={this.clickedImagery}>
          <span className={`basemap-thumbnail dark-gray-basemap ${this.state.activeImagery === KEYS.planetBasemap ? 'active' : ''}`} />
          <div className='basemap-label'>Planet Basemaps</div>
          { this.state.activeImagery === KEYS.planetBasemap &&
          <PlanetImagery monthlyBasemaps={this.props.monthlyPlanetBasemaps} quarterlyBasemaps={this.props.quarterlyPlanetBasemaps} active={this.state.activeImagery === KEYS.planetBasemap}/> }
        </div>
        <div data-basemap={KEYS.digitalGlobeBasemap} className={`basemap-item ${this.state.activeImagery === KEYS.digitalGlobeBasemap ? 'active' : ''}`} onClick={this.clickedImagery}>
          <span className={`basemap-thumbnail dark-gray-basemap ${this.state.activeImagery === KEYS.digitalGlobeBasemap ? 'active' : ''}`} />
          <div className='basemap-label'>DigitalGlobe - FirstLook</div>
          { this.state.activeImagery === KEYS.digitalGlobeBasemap &&
          <ImageryComponent {...this.state} options={dgLayer.calendar} active={this.state.activeImagery === KEYS.digitalGlobeBasemap} layer={dgLayer} /> }
        </div>
      </div>
    );
  }

}
