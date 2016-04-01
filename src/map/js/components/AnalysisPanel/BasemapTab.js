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

  childClicked = (evt) => {
    evt.stopPropagation();
    let id = evt.currentTarget.getAttribute('data-id');
    modalActions.showLayerInfo(id);
  };

  clickedBasemap = (evt) => {
    let id = evt.currentTarget.getAttribute('data-basemap');
    if (id === KEYS.landsat8) {
      mapActions.changeBasemap(id);
      mapActions.setBasemap(id);
    } else {
      mapActions.setBasemap(id);
    }
  };

  render () {
    let className = 'text-center';
    if (this.props.activeTab !== analysisPanelText.basemapTabId) { className += ' hidden'; }

    return (
      <div className={className}>
        <div>
          <div className='basemap-holder shadow open'>
            <div data-basemap={KEYS.darkGrayBasemap} className={`basemap-item ${this.state.activeBasemap === KEYS.darkGrayBasemap ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail dark-gray-basemap ${this.state.activeBasemap === KEYS.darkGrayBasemap ? 'active' : ''}`} />
              <span className='basemap-label'>{controlPanelText.darkGrayBasemap}</span>
              <span onClick={this.childClicked} data-id={KEYS.darkGrayBasemap} className='info-icon pointer'>
                <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
              </span>
            </div>
            <div data-basemap={KEYS.topoBasemap} className={`basemap-item ${this.state.activeBasemap === KEYS.topoBasemap ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail topo-basemap ${this.state.activeBasemap === KEYS.topoBasemap ? 'active' : ''}`} />
              <span className='basemap-label'>{controlPanelText.topoBasemap}</span>
              <span onClick={this.childClicked} data-id={KEYS.topoBasemap} className='info-icon pointer'>
                <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
              </span>
            </div>
            <div data-basemap={KEYS.wriBasemap} className={`basemap-item ${this.state.activeBasemap === KEYS.wriBasemap ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail wri-basemap ${this.state.activeBasemap === KEYS.wriBasemap ? 'active' : ''}`} />
              <span className='basemap-label'>{controlPanelText.wriBasemap}</span>
              <span onClick={this.childClicked} data-id={KEYS.wriBasemap} className='info-icon pointer'>
                <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
              </span>
            </div>
            <div data-basemap={KEYS.imageryBasemap} className={`basemap-item ${this.state.activeBasemap === KEYS.imageryBasemap ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail imagery-basemap ${this.state.activeBasemap === KEYS.imageryBasemap ? 'active' : ''}`} />
              <span className='basemap-label'>{controlPanelText.imageryBasemap}</span>
              <span onClick={this.childClicked} data-id={KEYS.imageryBasemap} className='info-icon pointer'>
                <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
              </span>
            </div>
            <div data-basemap={KEYS.landsat8} className={`basemap-item ${this.state.activeBasemap === KEYS.landsat8 ? 'active' : ''}`} onClick={this.clickedBasemap}>
              <span className={`basemap-thumbnail landsat-basemap ${this.state.activeBasemap === KEYS.landsat8 ? 'active' : ''}`} />
              <span className='basemap-label'>{controlPanelText.landsat8}</span>
              <span onClick={this.childClicked} data-id={KEYS.landsat8} className='info-icon pointer'>
                <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
