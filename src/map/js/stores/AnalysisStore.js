import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText} from 'js/config';
import alt from 'js/alt';

class AnalysisStore {

  constructor () {
    this.toolbarActive = false;
    this.activeWatershed = null;
    this.activeCustomArea = null;
    this.activeTab = analysisPanelText.watershedTabId;
    this.customAreaName = analysisPanelText.customAreaNamePlaceholder;
    this.analysisToolsVisible = app.mobile === false;
    this.esriSearchVisible = app.mobile === false;

    this.bindListeners({
      clearCustomArea: analysisActions.clearCustomArea,
      setAnalysisType: analysisActions.setAnalysisType,
      toggleDrawToolbar: analysisActions.toggleDrawToolbar,
      analyzeCustomArea: analysisActions.analyzeCustomArea,
      setCustomAreaName: analysisActions.setCustomAreaName,
      clearActiveWatershed: analysisActions.clearActiveWatershed,
      analyzeCurrentWatershed: analysisActions.analyzeCurrentWatershed,
      toggleAnalysisToolsVisiblity: analysisActions.toggleAnalysisToolsVisiblity
    });
  }

  clearActiveWatershed () {
    this.toolbarActive = false;
    this.activeWatershed = null;
  }

  clearCustomArea () {
    this.toolbarActive = false;
    this.activeCustomArea = null;
  }

  analyzeCurrentWatershed (feature) {
    this.activeWatershed = feature;
  }

  analyzeCustomArea (feature) {
    this.activeCustomArea = feature;
  }

  setCustomAreaName (newName) {
    this.customAreaName = newName;
  }

  setAnalysisType (tabId) {
    this.activeTab = tabId;
  }

  toggleDrawToolbar (status) {
    this.toolbarActive = status;
  }

  toggleAnalysisToolsVisiblity () {
    this.analysisToolsVisible = !this.analysisToolsVisible;
  }

}

export const analysisStore = alt.createStore(AnalysisStore, 'AnalysisStore');
