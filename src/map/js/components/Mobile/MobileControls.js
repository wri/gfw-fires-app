import {layerActions} from 'actions/LayerActions'
import {analysisActions} from 'actions/AnalysisActions'
import {mapStore} from 'stores/MapStore';
import {analysisStore} from 'stores/AnalysisStore';
import {analysisPanelText} from 'js/config';
import {AlertsSvg, AnalysisSvg, BasemapSvg, CalendarSvg} from 'utils/svgs';
import React from 'react';

export default class Map extends React.Component {

  constructor (props) {
    super(props);
    this.toggleLayers = this.toggleLayers.bind(this)
    this.toggleAnalysis = this.toggleAnalysis.bind(this)
    this.toggleSubscription = this.toggleSubscription.bind(this)
    this.toggleTimeline = this.toggleTimeline.bind(this)
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

  render () {
    return (
      <div id='mobile-controls' className='mobile-controls mobile-show'>
        <button onClick={this.toggleLayers}>
          <BasemapSvg />
          Layers
        </button>
        <button onClick={this.toggleAnalysis}>
          <AnalysisSvg />
          Analyze Fires
        </button>
        <button onClick={this.toggleSubscription}>
          <AlertsSvg/>
          Subscribe
        </button>
        <button onClick={this.toggleTimeline}>
          <CalendarSvg/>
          Timeline
        </button>
      </div>
    );
  }

}
