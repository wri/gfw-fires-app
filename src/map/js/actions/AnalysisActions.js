import GraphicsHelper from 'helpers/GraphicsHelper';
import {analysisConfig, analysisPanelText} from 'js/config';
import esriRequest from 'esri/request';
import registry from 'dijit/registry';
import all from 'dojo/promise/all';
import alt from 'js/alt';

class AnalysisActions {

  analyzeCustomArea (feature) {
    app.debug('AnalysisActions >>> analyzeCustomArea');
    GraphicsHelper.addCustomPoint(feature);
    this.dispatch(feature);
  }

  clearActiveWatershed () {
    app.debug('AnalysisActions >>> clearActiveWatershed');
    this.dispatch();
    //- Clear Highlight Polygons
    GraphicsHelper.clearActiveWatersheds();
    registry.byId(analysisPanelText.searchWidgetId).clear();
  }

  setCustomAreaName (newName) {
    app.debug('AnalysisActions >>> setCustomAreaName');
    this.dispatch(newName);
  }

  setAnalysisType (tabId) {
    this.dispatch(tabId);
  }

  toggleDrawToolbar (status) {
    this.dispatch(status);
  }

  toggleCustomize () {
    this.dispatch();
  }

  toggleImageryOptions () {
    this.dispatch();
  }

  toggleAnalysisToolsVisibility () {
    this.dispatch();
  }

  toggleAnalysisToolsExpanded () {
    this.dispatch();
  }

  toggleSubscribeToolsExpanded () {
    this.dispatch();
  }

  toggleImageryToolsExpanded () {
    this.dispatch();
  }

  toggleBasemapToolsExpanded () {
    this.dispatch();
  }

  toggleEsriSearchVisibility () {
    this.dispatch();
  }

  toggleTimelineVisibility () {
    this.dispatch();
  }

  toggleAreaIslandsActive () {
    this.dispatch();
  }

  initAreas () {
    all({
      islands: esriRequest(analysisConfig.requests.islands),
      provinces: esriRequest(analysisConfig.requests.provinces)
    }).then((responses) => {
      this.dispatch({
        islands: responses.islands.features.map((f) => f.attributes.ISLAND),
        provinces: responses.provinces.features.map((f) => f.attributes.PROVINCE)
      });
    });
  }

}

export const analysisActions = alt.createActions(AnalysisActions);
