import {prepareStateForUrl} from 'helpers/ShareHelper';
import {modalActions} from 'actions/ModalActions';
import {analysisActions} from 'actions/AnalysisActions';
import {controlPanelText} from 'js/config';
import {mapActions} from 'actions/MapActions';
import {mapStore} from 'stores/MapStore';
import React from 'react';

let zoomInSvg = '<use xlink:href="#icon-plus" />';
let zoomOutSvg = '<use xlink:href="#icon-minus" />';
let shareSvg = '<use xlink:href="#icon-share" />';
let magnifierSvg = '<use xlink:href="#icon-magnifier" />';
// let basemapSvg = '<use xlink:href="#icon-basemap" />';
let locateSvg = '<use xlink:href="#icon-locate" />';
let timelineSvg = '<use xlink:href="#icon-timeline" />';
let printSvg = '<use xlink:href="#icon-print" />';
let showSvg = '<use xlink:href="#icon-controlstoggle__on" />';
let refreshSvg = '<use xlink:href="#icon-reset" />';

export default class ControlPanel extends React.Component {

  constructor (props) {
   super(props);

    // mapStore.listen(this.storeUpdated.bind(this));
    let defaultState = mapStore.getState();
    // this.state = {
    //   pannelsHidden: false,
    //   activeBasemap: defaultState.activeBasemap
    // };
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

  toggleMasterCalendar () {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('masterDay');
  }

  // togglePanels () {
  //   this.setState({ panelsHidden: !this.state.panelsHidden });
  // }

  clickedBasemap (id) {
    mapActions.setBasemap(id);
  }

  print () {
    window.print();
  }

  toggleShow () {
    mapActions.togglePanels();
    analysisActions.toggleAnalysisToolsVisibility();
  }

  refresh () {
    mapActions.reset();
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

  // <div className='mobile-hide'> //surrounding certain li elements?

  // if (app.mobile() === true && this.state.analysisToolsVisible === false) {
  //   className += ' hidden';
  // }

  render() {
    return (
      <div className='control-panel map-component shadow'>
        <ul>
          <li className='zoom-in pointer' title='Zoom In' onClick={this.zoomIn}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: zoomInSvg }}/>
            <span className='tooltipmap top left'>{controlPanelText.zoomInHover}</span>
          </li>
          <li className='zoom-out pointer' title='Zoom Out' onClick={this.zoomOut}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: zoomOutSvg }}/>
            <span className='tooltipmap top right'>{controlPanelText.zoomOutHover}</span>
          </li>
          <li className='share-map pointer' title='Share' onClick={this.share}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: shareSvg }}/>
            <span className='tooltipmap middle left'>{controlPanelText.shareHover}</span>
          </li>
           {app.mobile() === true ? <li className='locate-me mobs pointer' title='Locate Me' onClick={this.locateMe}>
             <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: locateSvg }}/>
           </li> : <li className='search-map pointer' title='Search' onClick={this.toggleSearch}>
             <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: magnifierSvg }}/>
             <span className='tooltipmap middle right'>{controlPanelText.searchHover}</span>
           </li>
           }
           {app.mobile() === true ? null : <li className='show-hide pointer' title='Show/Hide' onClick={this.toggleShow}>
             <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: showSvg }}/>
             <span className='tooltipmap low-mid left'>{controlPanelText.showHideHover}</span>
           </li> }
           {app.mobile() === true ? null : <li className='refresh pointer' title='Print' onClick={this.refresh}>
             <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: refreshSvg }}/>
             <span className='tooltipmap low-mid right'>{controlPanelText.refreshHover}</span>
           </li> }
          <li className='timeline-sync pointer' title='Time sync' onClick={this.toggleMasterCalendar.bind(this)}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: timelineSvg }}/>
            <span className='tooltipmap low left'>{controlPanelText.timeHover}</span>
          </li>
          {app.mobile() === true ? null : <li className='print pointer' title='Print' onClick={this.print}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: printSvg }}/>
            <span className='tooltipmap low right'>{controlPanelText.printHover}</span>
          </li> }
        </ul>

      </div>
    );
  }

}
