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

  savePlanetBasemaps (basemaps) {
    this.dispatch(basemaps);
  }

  initAreas () {
    let islands = [], provinces = [], countries = [], adm1 = [];
    // There is some very wrong with WRI's AGS servers - it seems as if it cannot handle simultaneous requests, promises chaining for now
    esriRequest(analysisConfig.requests.islands)
    .then(result => {
      islands = result.features.map((f) => f.attributes.ISLAND).sort();
      return esriRequest(analysisConfig.requests.provinces);
    }).then(result => {
      provinces = result.features.map((f) => f.attributes.PROVINCE).sort();
      return esriRequest(analysisConfig.requests.countries);
    }).then(result => {
      countries = result.features.map((f) => f.attributes.NAME_0).sort();
      return esriRequest(analysisConfig.requests.adm1);
    }).then(result => {
      adm1 = result.features.map((f) => f.attributes);
      this.dispatch({
        islands,
        provinces,
        countries,
        adm1
      });
    });
  }

}

export const analysisActions = alt.createActions(AnalysisActions);
