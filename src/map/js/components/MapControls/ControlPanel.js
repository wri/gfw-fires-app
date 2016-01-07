import {prepareStateForUrl} from 'helpers/ShareHelper';
import {modalActions} from 'actions/ModalActions';
import {analysisActions} from 'actions/AnalysisActions';
import {mapActions} from 'actions/MapActions';
import {controlPanelText} from 'js/config';
import {mapStore} from 'stores/MapStore';
import KEYS from 'js/constants';
import React from 'react';

let zoomInSvg = '<use xlink:href="#icon-plus" />';
let zoomOutSvg = '<use xlink:href="#icon-minus" />';
let shareSvg = '<use xlink:href="#icon-share" />';
let resetSvg = '<use xlink:href="#icon-reset" />';
let magnifierSvg = '<use xlink:href="#icon-magnifier" />';
let basemapSvg = '<use xlink:href="#icon-basemap" />';
let locateSvg = '<use xlink:href="#icon-locate" />';

export default class ControlPanel extends React.Component {

  constructor (props) {
   super(props);

    mapStore.listen(this.storeUpdated.bind(this));
    let defaultState = mapStore.getState();
    this.state = {
      basemapGalleryOpen: false,
      activeBasemap: defaultState.activeBasemap
    };
  }

  storeUpdated () {
    let newState = mapStore.getState();
    if (newState.activeBasemap !== this.state.activeBasemap) {
      this.setState({ activeBasemap: newState.activeBasemap });
      mapActions.changeBasemap(newState.activeBasemap);
    }
  }

  zoomIn () {
    app.map.setZoom(app.map.getZoom() + 1);
  }

  zoomOut () {
    app.map.setZoom(app.map.getZoom() - 1);
  }

  share () {
    modalActions.showShareModal(prepareStateForUrl());
  }

  reset () {
    mapActions.reset();
  }

  toggleBasemapGallery () {
    this.setState({ basemapGalleryOpen: !this.state.basemapGalleryOpen });
  }

  clickedBasemap (id) {
    mapActions.setBasemap(id);
  }

  locateMe () {
    mapActions.zoomToUserLocation();
  }

  toggleSearch () {
    analysisActions.toggleEsriSearchVisibility();
  }

  render() {
    return (
      <div className='control-panel map-component shadow'>
        <ul>
          <li className='zoom-in pointer' title='Zoom In' onClick={this.zoomIn}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: zoomInSvg }}/>
          </li>
          <li className='zoom-out pointer' title='Zoom Out' onClick={this.zoomOut}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: zoomOutSvg }}/>
          </li>
          <li className='share-map pointer' title='Share' onClick={this.share}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: shareSvg }}/>
          </li>
          <li className='search-map pointer' title='Reset' onClick={this.toggleSearch}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: magnifierSvg }}/>
          </li>
          <div className='mobile-hide'>
            <li className='basemap-layers pointer' title='Basemaps' onClick={this.toggleBasemapGallery.bind(this)}>
              <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: basemapSvg }}/>
            </li>
          </div>
          <li className='locate-me pointer' title='Locate Me' onClick={this.locateMe}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: locateSvg }}/>
          </li>
        </ul>
        <div className='mobile-hide'>
          <div className={`basemap-switcher shadow ${this.state.basemapGalleryOpen ? 'open' : ''}`}>
            <div className='basemap-item pointer' onClick={this.clickedBasemap.bind(this, KEYS.darkGrayBasemap)}>
              <div className={`basemap-thumbnail dark-gray-basemap ${this.state.activeBasemap === KEYS.darkGrayBasemap ? 'active' : ''}`} />
              <div className='basemap-label'>{controlPanelText.darkGrayBasemap}</div>
            </div>
            <div className='basemap-item pointer' onClick={this.clickedBasemap.bind(this, KEYS.topoBasemap)}>
              <div className={`basemap-thumbnail topo-basemap ${this.state.activeBasemap === KEYS.topoBasemap ? 'active' : ''}`} />
              <div className='basemap-label'>{controlPanelText.topoBasemap}</div>
            </div>
            <div className='basemap-item pointer' onClick={this.clickedBasemap.bind(this, KEYS.wriBasemap)}>
              <div className={`basemap-thumbnail wri-basemap ${this.state.activeBasemap === KEYS.wriBasemap ? 'active' : ''}`} />
              <div className='basemap-label'>{controlPanelText.wriBasemap}</div>
            </div>
            <div className='basemap-item pointer' onClick={this.clickedBasemap.bind(this, KEYS.imageryBasemap)}>
              <div className={`basemap-thumbnail imagery-basemap ${this.state.activeBasemap === KEYS.imageryBasemap ? 'active' : ''}`} />
              <div className='basemap-label'>{controlPanelText.imageryBasemap}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
