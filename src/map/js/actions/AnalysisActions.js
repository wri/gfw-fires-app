import GraphicsHelper from 'helpers/GraphicsHelper';
import {analysisConfig} from 'js/config';
import esriRequest from 'esri/request';
import all from 'dojo/promise/all';
import alt from 'js/alt';

class AnalysisActions {

  analyzeCustomArea (feature) {
    app.debug('AnalysisActions >>> analyzeCustomArea');
    GraphicsHelper.addCustomPoint(feature);
    this.dispatch(feature);
  }

  setCustomAreaName (newName) {
    app.debug('AnalysisActions >>> setCustomAreaName');
    this.dispatch(newName);
  }

  setAnalysisType (tabId) {
    this.dispatch(tabId);
  }

  toggleAnalysisSource () {
    this.dispatch();
  }

  toggleDrawToolbar (status) {
    this.dispatch(status);
  }

  toggleCustomize () {
    this.dispatch();
  }

  toggleCountryCustomize () {
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
      provinces: esriRequest(analysisConfig.requests.provinces),
      countries: esriRequest(analysisConfig.requests.countries)
    }).then((responses) => {
      this.dispatch({
        islands: responses.islands.features.map((f) => f.attributes.ISLAND).sort(),
        provinces: responses.provinces.features.map((f) => f.attributes.PROVINCE).sort(),
        countries: responses.countries.features.map((f) => f.attributes.NAME_0).sort()
      });
    });
  }

}

export const analysisActions = alt.createActions(AnalysisActions);
