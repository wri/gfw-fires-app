import ShareHelper from 'helpers/ShareHelper';
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

  zoomIn () {
    app.map.setZoom(app.map.getZoom() + 1);
  }

  zoomOut () {
    app.map.setZoom(app.map.getZoom() - 1);
  }

  share () {
    this.sendAnalytics('map', 'share', 'The is prepping the application to share.');
    modalActions.showShareModal(ShareHelper.prepareStateForUrl());
  }

  reset () {
    mapActions.reset();
  }

  toggleMasterCalendar () {
    modalActions.showCalendarModal('start');
    mapActions.setCalendar('masterDay');
  }

  clickedBasemap (id) {
    mapActions.setBasemap(id);
  }

  sendAnalytics (eventType, action, label) { //todo: why is this request getting sent so many times?
    ga('A.send', 'event', eventType, action, label);
    ga('B.send', 'event', eventType, action, label);
    ga('C.send', 'event', eventType, action, label);
  }

  printMap = () => {
    this.sendAnalytics('map', 'print', 'The user printed the map.');
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
    // analysisActions.toggleEsriSearchVisibility();
    modalActions.showSearchModal();
  }
  // <li className='basemap-layers pointer' onClick={this.togglePanels.bind(this)}>
  //   <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: timelineSvg }}/>
  // </li>

  // <div className='mobile-hide'> //surrounding certain li elements?

  // if (app.mobile() === true && this.state.analysisToolsVisible === false) {
  //   className += ' hidden';
  // }

  // <li className='locate-me mobs pointer' onClick={this.locateMe}>
  //   <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: locateSvg }}/>
  // </li>

  render() {
    return (
      <div className='control-panel map-component shadow'>
        <ul>
          <li className='zoom-in pointer' onClick={this.zoomIn}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: zoomInSvg }}/>
            <span className='tooltipmap top left'>{controlPanelText.zoomInHover}</span>
          </li>
          <li className='zoom-out pointer' onClick={this.zoomOut}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: zoomOutSvg }}/>
            <span className='tooltipmap top right'>{controlPanelText.zoomOutHover}</span>
          </li>
          <li className='share-map pointer' onClick={this.share}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: shareSvg }}/>
            <span className='tooltipmap middle left'>{controlPanelText.shareHover}</span>
          </li>
           <li className='search-map pointer' onClick={this.toggleSearch}>
             <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: magnifierSvg }}/>
             <span className='tooltipmap middle right'>{controlPanelText.searchHover}</span>
           </li>
           {app.mobile() === true ? null : <li className='show-hide pointer' onClick={this.toggleShow}>
             <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: showSvg }}/>
             <span className='tooltipmap low-mid left'>{controlPanelText.showHideHover}</span>
           </li> }
           {app.mobile() === true ? null : <li className='refresh pointer' onClick={this.refresh}>
             <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: refreshSvg }}/>
             <span className='tooltipmap low-mid right'>{controlPanelText.refreshHover}</span>
           </li> }
          <li className='timeline-sync pointer' onClick={this.toggleMasterCalendar.bind(this)}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: timelineSvg }}/>
            <span className='tooltipmap low left'>{controlPanelText.timeHover}</span>
          </li>
          {app.mobile() === true ? null : <li className='print pointer' onClick={this.printMap}>
            <svg className='panel-icon' dangerouslySetInnerHTML={{ __html: printSvg }}/>
            <span className='tooltipmap low right'>{controlPanelText.printHover}</span>
          </li> }
        </ul>

      </div>
    );
  }

}
