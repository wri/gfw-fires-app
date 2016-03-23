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
    this.customizeOpen = false;
    this.analysisToolsExpanded = true;
    this.imageryToolsExpanded = false;
    this.basemapToolsExpanded = false;
    this.subscribeToolsExpanded = false;
    this.timelineVisible = false;
    this.areaIslandsActive = true;
    this.islands = [];
    this.provinces = [];

    this.bindListeners({
      clearCustomArea: analysisActions.clearCustomArea,
      setAnalysisType: analysisActions.setAnalysisType,
      toggleDrawToolbar: analysisActions.toggleDrawToolbar,
      toggleCustomize: analysisActions.toggleCustomize,
      analyzeCustomArea: analysisActions.analyzeCustomArea,
      setCustomAreaName: analysisActions.setCustomAreaName,
      clearActiveWatershed: analysisActions.clearActiveWatershed,
      toggleAnalysisToolsVisibility: analysisActions.toggleAnalysisToolsVisibility,
      toggleAnalysisToolsExpanded: analysisActions.toggleAnalysisToolsExpanded,
      toggleSubscribeToolsExpanded: analysisActions.toggleSubscribeToolsExpanded,
      toggleImageryToolsExpanded: analysisActions.toggleImageryToolsExpanded,
      toggleBasemapToolsExpanded: analysisActions.toggleBasemapToolsExpanded,
      toggleEsriSearchVisibility: analysisActions.toggleEsriSearchVisibility,
      toggleTimelineVisibility: analysisActions.toggleTimelineVisibility,
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

  toggleCustomize () {
    this.customizeOpen = !this.customizeOpen;
  }

  toggleAnalysisToolsVisibility () {
    this.analysisToolsVisible = !this.analysisToolsVisible;
  }

  toggleAnalysisToolsExpanded () {
    this.analysisToolsExpanded = !this.analysisToolsExpanded;
  }

  toggleSubscribeToolsExpanded () {
    this.subscribeToolsExpanded = !this.subscribeToolsExpanded;
  }

  toggleImageryToolsExpanded () {
    this.imageryToolsExpanded = !this.imageryToolsExpanded;
  }

  toggleBasemapToolsExpanded () {
    this.basemapToolsExpanded = !this.basemapToolsExpanded;
  }

  toggleEsriSearchVisibility () {
    this.esriSearchVisible = !this.esriSearchVisible;
  }

  toggleTimelineVisibility () {
    this.timelineVisible = !this.timelineVisible;
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
