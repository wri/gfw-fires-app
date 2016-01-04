import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText} from 'js/config';
import alt from 'js/alt';

class AnalysisStore {

  constructor () {
    // TODO: review state for unused properties
    this.toolbarActive = false;
    this.activeWatershed = null;
    this.activeCustomArea = null;
    this.activeTab = analysisPanelText.analysisTabId;
    this.customAreaName = analysisPanelText.customAreaNamePlaceholder;
    this.esriSearchVisible = false;
    this.analysisToolsVisible = app.mobile() === false;
    this.analysisToolsExpanded = true;
    this.areaIslandsActive = false;
    this.islands = [];
    this.provinces = [];

    this.bindListeners({
      clearCustomArea: analysisActions.clearCustomArea,
      setAnalysisType: analysisActions.setAnalysisType,
      toggleDrawToolbar: analysisActions.toggleDrawToolbar,
      analyzeCustomArea: analysisActions.analyzeCustomArea,
      setCustomAreaName: analysisActions.setCustomAreaName,
      clearActiveWatershed: analysisActions.clearActiveWatershed,
      analyzeCurrentWatershed: analysisActions.analyzeCurrentWatershed,
      toggleAnalysisToolsVisibility: analysisActions.toggleAnalysisToolsVisibility,
      toggleAnalysisToolsExpanded: analysisActions.toggleAnalysisToolsExpanded,
      toggleEsriSearchVisibility: analysisActions.toggleEsriSearchVisibility,
      initAreas: analysisActions.initAreas,
      toggleAreaIslandsActive: analysisActions.toggleAreaIslandsActive
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

  toggleAnalysisToolsVisibility () {
    this.analysisToolsVisible = !this.analysisToolsVisible;
  }

  toggleAnalysisToolsExpanded () {
    this.analysisToolsExpanded = !this.analysisToolsExpanded;
  }

  toggleEsriSearchVisibility () {
    this.esriSearchVisible = !this.esriSearchVisible;
  }

  initAreas (areas) {
    this.islands = areas.islands;
    this.provinces = areas.provinces;
  }

  toggleAreaIslandsActive() {
    this.areaIslandsActive = !this.areaIslandsActive;
  }

}

export const analysisStore = alt.createStore(AnalysisStore, 'AnalysisStore');
