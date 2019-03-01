import ImageryComponent from 'components/LayerPanel/ImageryComponent';
import {layersConfig, analysisPanelText} from 'js/config';
import {modalActions} from 'actions/ModalActions';
import { mapActions } from 'actions/MapActions';
import { mapStore } from 'stores/MapStore';
import LayersHelper from 'helpers/LayersHelper';
import KEYS from 'js/constants';
import React from 'react';

import PlanetImagery from 'components/AnalysisPanel/PlanetImagery';
import SentinalImagery from 'components/AnalysisPanel/SentinalImagery';

let useSvg = '<use xlink:href="#shape-info" />';

export default class ImageryTab extends React.Component {

  constructor (props) {
    super(props);
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = mapStore.getState();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.imageryModalVisible && !this.state.imageryModalVisible && this.state.activeImagery === KEYS.sentinalImagery) {
      mapActions.setImagery('');
      app.map.getLayer(KEYS.RECENT_IMAGERY).hide();
    }
  }

  storeUpdated () {
    this.setState(mapStore.getState());
  }

  clickedImagery = (evt) => {
    // let currImagery = '';
    // const { activeImagery } = this.state;
    const { basemap: clickedImagery } = evt.currentTarget.dataset;
    const currImagery = clickedImagery;

    if (clickedImagery === KEYS.digitalGlobeBasemap) {
      const dgLayer = layersConfig.filter((l) => l.id === KEYS.digitalGlobe)[0];
      LayersHelper.hideLayer(dgLayer.id);
      if (app.map.getLayer('planetBasemap')) {
        app.map.removeLayer(app.map.getLayer('planetBasemap'));
      }
      if (this.state.imageryModalVisible) {
        this.toggleSentinal(!this.state.imageryModalVisible);
      }
    } else if (clickedImagery === KEYS.sentinalImagery) {
      this.toggleSentinal(!this.state.imageryModalVisible);
      if (app.map.getLayer(KEYS.RECENT_IMAGERY)) {
        if (this.state.imageryModalVisible) {
          app.map.getLayer(KEYS.RECENT_IMAGERY).hide();
        } else {
          app.map.getLayer(KEYS.RECENT_IMAGERY).show();
        }
      }
      if (app.map.getLayer('planetBasemap')) {
        app.map.removeLayer(app.map.getLayer('planetBasemap'));
      }
      const dgLayer = layersConfig.filter((l) => l.id === KEYS.digitalGlobe)[0];
      if (dgLayer) {
        LayersHelper.hideLayer(dgLayer.id);
      }
    } else {
      if (clickedImagery === KEYS.planetBasemap && app.map.getLayer('planetBasemap')) {
        app.map.removeLayer(app.map.getLayer('planetBasemap'));
      }
      const dgLayer = layersConfig.filter((l) => l.id === KEYS.digitalGlobe)[0];
      if (dgLayer) {
        LayersHelper.hideLayer(dgLayer.id);
      }
      if (this.state.imageryModalVisible) {
        this.toggleSentinal(!this.state.imageryModalVisible);
      }
    }

    mapActions.setImagery(currImagery);
  };

  showInfo = (evt) => {
    evt.stopPropagation();
    console.log('evt', evt.currentTarget.parentElement.dataset.basemap);
    const id = evt.currentTarget.parentElement.dataset.basemap === 'digitalGlobeBasemap' ? 'dg-00' : evt.currentTarget.parentElement.dataset.basemap;
    modalActions.showLayerInfo(id);
  }

  toggleSentinal = (sentinalToggled) => {
    mapActions.toggleImageryVisible(sentinalToggled);
  }

  render () {
    const { activeImagery, iconLoading, activePlanetPeriod, activeCategory, activePlanetBasemap, selectedImagery } = this.state;
    const { monthlyPlanetBasemaps, quarterlyPlanetBasemaps, activeTab } = this.props;
    const { planetBasemap, digitalGlobe, digitalGlobeBasemap, sentinalImagery } = KEYS;

    let className = 'imagery-tab';
    if (activeTab !== analysisPanelText.imageryTabId) { className += ' hidden'; }
    let dgLayer = layersConfig.filter((l) => l.id === digitalGlobe)[0];
    let imageryString;
    if (selectedImagery) {
      imageryString = `${window.Kalendae.moment(selectedImagery.attributes.date_time).format('DD MMM YYYY')}, ${Math.round(selectedImagery.attributes.cloud_score)}% cloud coverage, ${selectedImagery.attributes.instrument}`;
    }

    return (
      <div className={className}>
        <h3>{analysisPanelText.imageryArea}</h3>
        <div data-basemap={planetBasemap} className={`basemap-item ${activeImagery === planetBasemap ? 'active' : ''}`} onClick={this.clickedImagery}>
          <span className={`basemap-thumbnail planet-basemap-image ${activeImagery === planetBasemap ? 'active' : ''}`} />
          <div className='basemap-label'>Planet Basemaps
            <div className='layer-checkbox-sublabel basemap-sublabel'>(Monthly/quarterly, 4.77m, global)</div>
          </div>
          <span className={`info-icon pointer info-icon-center ${iconLoading === planetBasemap ? 'iconLoading' : ''}`} onClick={this.showInfo.bind(this)}>
            <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
          </span>
          { activeImagery === planetBasemap &&
          <PlanetImagery activeCategory={activeCategory} activePlanetBasemap={activePlanetBasemap} activeImagery={activeImagery} activePlanetPeriod={activePlanetPeriod} monthlyBasemaps={monthlyPlanetBasemaps} quarterlyBasemaps={quarterlyPlanetBasemaps} active={activeImagery === planetBasemap}/> }
        </div>
        <div data-basemap={digitalGlobeBasemap} className={`basemap-item ${activeImagery === digitalGlobeBasemap ? 'active' : ''}`} onClick={this.clickedImagery}>
          <span className={`basemap-thumbnail digital-globe-basemap ${activeImagery === digitalGlobeBasemap ? 'active' : ''}`} />
          <div className='basemap-label'>DigitalGlobe
            <div className='layer-checkbox-sublabel basemap-sublabel'>(2014-15, 0.3-1m, selected Indonesia locations)</div>
          </div>
          <span className={`info-icon pointer info-icon-center ${iconLoading === digitalGlobeBasemap ? 'iconLoading' : ''}`} onClick={this.showInfo.bind(this)}>
            <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
          </span>
          { activeImagery === digitalGlobeBasemap &&
          <ImageryComponent {...this.state} options={dgLayer.calendar} active={activeImagery === digitalGlobeBasemap} layer={dgLayer} /> }
        </div>
        <div data-basemap={sentinalImagery} className={`basemap-item ${activeImagery === sentinalImagery ? 'active' : ''}`} onClick={this.clickedImagery}>
          <span className={`basemap-thumbnail sentinal-imagery-basemap ${activeImagery === sentinalImagery ? 'active' : ''}`} />
          <div className='basemap-label'>Sentinal Imagery
            {selectedImagery && <div className='layer-checkbox-sublabel basemap-sublabel'>({imageryString})</div>}
          </div>
          <span className={`info-icon pointer info-icon-center ${iconLoading === sentinalImagery ? 'iconLoading' : ''}`} onClick={this.showInfo.bind(this)}>
            <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
          </span>
          {/* { activeImagery === sentinalImagery &&
          <SentinalImagery {...this.state} active={activeImagery === sentinalImagery} /> } */}
        </div>
      </div>
    );
  }

}
