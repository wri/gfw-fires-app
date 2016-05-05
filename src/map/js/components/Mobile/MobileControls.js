/* @flow */
import {layerActions} from 'actions/LayerActions';
import {analysisActions} from 'actions/AnalysisActions';
import {mapStore} from 'stores/MapStore';
import {analysisStore} from 'stores/AnalysisStore';
import {analysisPanelText} from 'js/config';
import {AlertsSvg, AnalysisSvg, BasemapSvg, ImagerySvg} from 'utils/svgs';
import React, {
  Component
} from 'react';

export default class MobileControls extends Component {
  displayName: MobileControls;

  hidePanels:any = ():void => {
    if (mapStore.getState().layerPanelVisible === true) {
      layerActions.toggleLayerPanelVisibility();
    }
    if (analysisStore.getState().analysisToolsVisible === true) {
      analysisActions.toggleAnalysisToolsVisibility();
    }
    if (analysisStore.getState().timelineVisible === true) {
      analysisActions.toggleTimelineVisibility();
    }
  };

  toggleAnalysis:any = ():void => {
    if (analysisStore.getState().analysisToolsVisible === true
      && analysisStore.getState().activeTab === analysisPanelText.analysisTabId) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.setAnalysisType(analysisPanelText.analysisTabId);
      analysisActions.toggleAnalysisToolsVisibility();
    }
  };

  toggleSubscription:any = ():void => {
    if (analysisStore.getState().analysisToolsVisible === true
      && analysisStore.getState().activeTab === analysisPanelText.subscriptionTabId) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.setAnalysisType(analysisPanelText.subscriptionTabId);
      analysisActions.toggleAnalysisToolsVisibility();
    }
  };

  toggleLayers:any = ():void => {
    if (mapStore.getState().layerPanelVisible === true) {
      this.hidePanels();
    } else {
      this.hidePanels();
      layerActions.toggleLayerPanelVisibility();
    }
  };

  toggleTimeline:any = ():void => {
    if (analysisStore.getState().timelineVisible === true) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.toggleTimelineVisibility();
    }
  };

  toggleImagery:any = ():void => {
    if (analysisStore.getState().analysisToolsVisible === true
      && analysisStore.getState().activeTab === analysisPanelText.imageryTabId) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.setAnalysisType(analysisPanelText.imageryTabId);
      analysisActions.toggleAnalysisToolsVisibility();
    }
  };

  toggleBasemaps:any = ():void => {
    if (analysisStore.getState().analysisToolsVisible === true
      && analysisStore.getState().activeTab === analysisPanelText.basemapTabId) {
      this.hidePanels();
    } else {
      this.hidePanels();
      analysisActions.setAnalysisType(analysisPanelText.basemapTabId);
      analysisActions.toggleAnalysisToolsVisibility();
    }
  };

  render () {
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
