import {layerActions} from 'actions/LayerActions';
import {analysisActions} from 'actions/AnalysisActions';
import {mapStore} from 'stores/MapStore';
import {analysisStore} from 'stores/AnalysisStore';
import {analysisPanelText} from 'js/config';
import {AlertsSvg, AnalysisSvg, BasemapSvg, CalendarSvg, ImagerySvg} from 'utils/svgs';
import React from 'react';

export default class Map extends React.Component {

  constructor (props) {
    super(props);
    this.toggleLayers = this.toggleLayers.bind(this);
    this.toggleAnalysis = this.toggleAnalysis.bind(this);
    this.toggleSubscription = this.toggleSubscription.bind(this);
    this.toggleTimeline = this.toggleTimeline.bind(this);
    this.toggleImagery = this.toggleImagery.bind(this);
    this.toggleBasemaps = this.toggleBasemaps.bind(this);
  }

  hidePanels () {
    if (mapStore.getState().layerPanelVisible === true) {
      layerActions.toggleLayerPanelVisibility();
    }
    if (analysisStore.getState().analysisToolsVisible === true) {
      analysisActions.toggleAnalysisToolsVisibility();
    }
    if (analysisStore.getState().timelineVisible === true) {
      analysisActions.toggleTimelineVisibility();
    }
  }

  toggleAnalysis () {
    if (analysisStore.getState().analysisToolsVisible === true
      && analysisStore.getState().activeTab === analysisPanelText.analysisTabId) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.setAnalysisType(analysisPanelText.analysisTabId);
      analysisActions.toggleAnalysisToolsVisibility();
    }
  }

  toggleSubscription () {
    if (analysisStore.getState().analysisToolsVisible === true
      && analysisStore.getState().activeTab === analysisPanelText.subscriptionTabId) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.setAnalysisType(analysisPanelText.subscriptionTabId);
      analysisActions.toggleAnalysisToolsVisibility();
    }
  }

  toggleLayers () {
    if (mapStore.getState().layerPanelVisible === true) {
      this.hidePanels();
    } else {
      this.hidePanels();
      layerActions.toggleLayerPanelVisibility();
    }
  }

  toggleTimeline () {
    if (analysisStore.getState().timelineVisible === true) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.toggleTimelineVisibility();
    }
  }

  toggleImagery () {
    if (analysisStore.getState().analysisToolsVisible === true
      && analysisStore.getState().activeTab === analysisPanelText.imageryTabId) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.setAnalysisType(analysisPanelText.imageryTabId);
      analysisActions.toggleAnalysisToolsVisibility();
    }
  }

  // toggleImagery () {
  //   if (analysisStore.getState().imageryToolsExpanded === true) {
  //     this.hidePanels();
  //   } else {
  //     this.hidePanels();
  //     analysisActions.toggleImageryToolsExpanded();
  //   }
  // }

  toggleBasemaps () {
    if (analysisStore.getState().analysisToolsVisible === true
      && analysisStore.getState().activeTab === analysisPanelText.basemapTabId) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.setAnalysisType(analysisPanelText.basemapTabId);
      analysisActions.toggleAnalysisToolsVisibility();
    }
  }

  render () {

    // <button onClick={this.toggleTimeline}>
    //   <CalendarSvg/>
    //   Timeline
    // </button>
    // <button onClick={this.toggleBasemaps}>
    //   <BasemapSvg />
    //   BASEMAPS
    // </button>
    return (
      <div id='mobile-controls' className='mobile-controls mobile-show'>
        <button onClick={this.toggleLayers}>
          <BasemapSvg />
          LAYERS
        </button>
        <button onClick={this.toggleAnalysis}>
          <AnalysisSvg />
          FIRE REPORT
        </button>
        <button onClick={this.toggleSubscription}>
          <AlertsSvg/>
          ALERTS
        </button>
        <button onClick={this.toggleImagery}>
          <ImagerySvg/>
          IMAGERY
        </button>
      </div>
    );
  }

}
