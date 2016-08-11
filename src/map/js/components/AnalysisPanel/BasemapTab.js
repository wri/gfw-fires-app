import {analysisPanelText} from 'js/config';
import {prepareStateForUrl} from 'helpers/ShareHelper';
import {modalActions} from 'actions/ModalActions';
import {analysisActions} from 'actions/AnalysisActions';
import {mapActions} from 'actions/MapActions';
import {controlPanelText} from 'js/config';
import {mapStore} from 'stores/MapStore';
import KEYS from 'js/constants';
import React from 'react';

let useSvg = '<use xlink:href="#shape-info" />';

export default class BasemapTab extends React.Component {

  constructor (props) {
   super(props);

    mapStore.listen(this.storeUpdated.bind(this));
    let defaultState = mapStore.getState();
    this.state = {
      basemapGalleryOpen: false,
      activeBasemap: defaultState.activeBasemap,
      overlaysVisible: defaultState.overlaysVisible
    };
  }

  storeUpdated () {
    let newState = mapStore.getState();
    if (newState.activeBasemap !== this.state.activeBasemap) {
      this.setState({
        activeBasemap: newState.activeBasemap
      });
      mapActions.changeBasemap(newState.activeBasemap);
    }

    if (newState.overlaysVisible !== this.state.overlaysVisible) {
      this.setState({
        overlaysVisible: newState.overlaysVisible
      });
    }
  }

  clickedBasemap = (evt) => {
    let id = evt.currentTarget.getAttribute('data-basemap');
    if (id === KEYS.landsat8) {
      mapActions.changeBasemap(id);
      mapActions.setBasemap(id);
    } else {
      mapActions.setBasemap(id);
    }
  };

  handleCheckToggle = (evt) => {
    mapActions.updateOverlays(evt.target.id);
  };

  render () {
    let className = 'text-center';
    if (this.props.activeTab !== analysisPanelText.basemapTabId) { className += ' hidden'; }

    return (
      <div className={className}>
        <div>
          <div className='basemap-holder shadow open'>
            <div className='basemap-item'>
              <div className='basemap-admin'><input checked={this.state.overlaysVisible.indexOf('provinces') > -1} onChange={this.handleCheckToggle} type='checkbox' id='provinces' /><span>Provinces</span></div>
              <div className='basemap-admin'><input checked={this.state.overlaysVisible.indexOf('districts') > -1} onChange={this.handleCheckToggle} type='checkbox' id='districts' /><span>Districts</span></div>
              <div className='basemap-admin'><input checked={this.state.overlaysVisible.indexOf('subdistricts') > -1} onChange={this.handleCheckToggle} type='checkbox' id='subdistricts' /><span>Subdistricts</span></div>
              <div className='basemap-admin'><input checked={this.state.overlaysVisible.indexOf('villages') > -1} onChange={this.handleCheckToggle} type='checkbox' id='villages' /><span>Villages</span></div>
            </div>
            <div data-basemap={KEYS.darkGrayBasemap} className={`basemap-item ${this.state.activeBasemap === KEYS.darkGrayBasemap ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail dark-gray-basemap ${this.state.activeBasemap === KEYS.darkGrayBasemap ? 'active' : ''}`} />
              <div className='basemap-label'>{controlPanelText.darkGrayBasemap}</div>
            </div>
            <div data-basemap={KEYS.topoBasemap} className={`basemap-item ${this.state.activeBasemap === KEYS.topoBasemap ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail topo-basemap ${this.state.activeBasemap === KEYS.topoBasemap ? 'active' : ''}`} />
              <div className='basemap-label'>{controlPanelText.topoBasemap}</div>
            </div>
            <div data-basemap={KEYS.wriBasemap} className={`basemap-item ${this.state.activeBasemap === KEYS.wriBasemap ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail wri-basemap ${this.state.activeBasemap === KEYS.wriBasemap ? 'active' : ''}`} />
              <div className='basemap-label'>{controlPanelText.wriBasemap}</div>
            </div>
            <div data-basemap={KEYS.imageryBasemap} className={`basemap-item ${this.state.activeBasemap === KEYS.imageryBasemap ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail imagery-basemap ${this.state.activeBasemap === KEYS.imageryBasemap ? 'active' : ''}`} />
              <div className='basemap-label'>{controlPanelText.imageryBasemap}</div>
            </div>
            <div data-basemap={KEYS.landsat8} className={`basemap-item ${this.state.activeBasemap === KEYS.landsat8 ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail landsat-basemap ${this.state.activeBasemap === KEYS.landsat8 ? 'active' : ''}`} />
              <div className='basemap-label'>{controlPanelText.landsat8}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
