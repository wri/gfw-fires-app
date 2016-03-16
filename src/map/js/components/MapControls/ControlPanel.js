import {prepareStateForUrl} from 'helpers/ShareHelper';
import {modalActions} from 'actions/ModalActions';
import {analysisActions} from 'actions/AnalysisActions';
import {mapActions} from 'actions/MapActions';
import {controlPanelText} from 'js/config';
import {mapStore} from 'stores/MapStore';
import React from 'react';

let zoomInSvg = '<use xlink:href="#icon-plus" />';
let zoomOutSvg = '<use xlink:href="#icon-minus" />';
let shareSvg = '<use xlink:href="#icon-share" />';
let magnifierSvg = '<use xlink:href="#icon-magnifier" />';
let basemapSvg = '<use xlink:href="#icon-basemap" />';
let timelineSvg = '<use xlink:href="#icon-timeline" />';
let locateSvg = '<use xlink:href="#icon-locate" />';

export default class ControlPanel extends React.Component {

  constructor (props) {
   super(props);

    // mapStore.listen(this.storeUpdated.bind(this));
    let defaultState = mapStore.getState();
    this.state = {
      pannelsHidden: false,
      activeBasemap: defaultState.activeBasemap
    };
  }

  storeUpdated () {
    let newState = mapStore.getState();
    if (newState.pannelsHidden !== this.state.pannelsHidden) {
      //todo: figure out how this is triggering when they are both false
      console.log(newState.pannelsHidden)
      console.log(this.state.pannelsHidden)
      console.log('would hide panels..')
      // debugger
      // this.setState({ pannelsHidden: newState.pannelsHidden });
      // mapActions.togglePanels(newState.pannelsHidden);
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

  // toggleBasemapGallery () {
  //   this.setState({ basemapGalleryOpen: !this.state.basemapGalleryOpen });
  // }

  toggleMasterCalendar () {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('masterDay');
  }

  togglePanels () {
    this.setState({ panelsHidden: !this.state.panelsHidden });
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
  // <li className='basemap-layers pointer' title='Basemaps' onClick={this.togglePanels.bind(this)}>
  //   <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: timelineSvg }}/>
  // </li>

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
            <li className='basemap-layers pointer' title='Basemaps' onClick={this.toggleMasterCalendar.bind(this)}>
              <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: timelineSvg }}/>
            </li>
          </div>
          <li className='locate-me pointer' title='Locate Me' onClick={this.locateMe}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: locateSvg }}/>
          </li>
        </ul>

      </div>
    );
  }

}
