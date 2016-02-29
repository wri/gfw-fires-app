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

  showInfo () {
    console.log(arguments)
  }

  clickedBasemap (id) {
    mapActions.setBasemap(id);
  }


  render () {
    let className = 'text-center';
    if (this.props.activeTab !== analysisPanelText.basemapTabId) { className += ' hidden'; }

    return (
      <div className={className}>
        <div>
          <div className='shadow open'>
            <div className={`basemap-item ${this.state.activeBasemap === KEYS.darkGrayBasemap ? 'active' : ''}`} onClick={this.clickedBasemap.bind(this, KEYS.darkGrayBasemap)}>
              <span className={`basemap-thumbnail dark-gray-basemap ${this.state.activeBasemap === KEYS.darkGrayBasemap ? 'active' : ''}`} />
              <span className='basemap-label'>{controlPanelText.darkGrayBasemap}</span>
              <span className='info-icon pointer' onClick={this.showInfo.bind(this)}>
                <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
              </span>
            </div>
            <div className={`basemap-item ${this.state.activeBasemap === KEYS.topoBasemap ? 'active' : ''}`} onClick={this.clickedBasemap.bind(this, KEYS.topoBasemap)}>
              <span className={`basemap-thumbnail topo-basemap ${this.state.activeBasemap === KEYS.topoBasemap ? 'active' : ''}`} />
              <span className='basemap-label'>{controlPanelText.topoBasemap}</span>
              <span className='info-icon pointer' onClick={this.showInfo.bind(this)}>
                <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
              </span>
            </div>
            <div className={`basemap-item ${this.state.activeBasemap === KEYS.wriBasemap ? 'active' : ''}`} onClick={this.clickedBasemap.bind(this, KEYS.wriBasemap)}>
              <span className={`basemap-thumbnail wri-basemap ${this.state.activeBasemap === KEYS.wriBasemap ? 'active' : ''}`} />
              <span className='basemap-label'>{controlPanelText.wriBasemap}</span>
              <span className='info-icon pointer' onClick={this.showInfo.bind(this)}>
                <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
              </span>
            </div>
            <div className={`basemap-item ${this.state.activeBasemap === KEYS.imageryBasemap ? 'active' : ''}`} onClick={this.clickedBasemap.bind(this, KEYS.imageryBasemap)}>
              <span className={`basemap-thumbnail imagery-basemap ${this.state.activeBasemap === KEYS.imageryBasemap ? 'active' : ''}`} />
              <span className='basemap-label'>{controlPanelText.imageryBasemap}</span>
              <span className='info-icon pointer' onClick={this.showInfo.bind(this)}>
                <svg dangerouslySetInnerHTML={{ __html: useSvg }}/>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
