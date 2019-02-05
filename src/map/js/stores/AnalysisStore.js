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
    this.customizeCountryOpen = false;

    this.imageryOpen = false;
    this.analysisToolsExpanded = true;
    this.imageryToolsExpanded = false;
    this.basemapToolsExpanded = false;
    this.subscribeToolsExpanded = false;
    this.timelineVisible = false;
    this.analysisSourceGFW = true;
    this.provinces = [];
    this.countries = [];
    this.adm1 = [];

    this.monthlyPlanetBasemaps = [];
    this.quarterlyPlanetBasemaps = [];

    this.bindListeners({
      setAnalysisType: analysisActions.setAnalysisType,
      toggleDrawToolbar: analysisActions.toggleDrawToolbar,
      toggleCustomize: analysisActions.toggleCustomize,
      toggleCountryCustomize: analysisActions.toggleCountryCustomize,
      toggleImageryOptions: analysisActions.toggleImageryOptions,
      analyzeCustomArea: analysisActions.analyzeCustomArea,
      setCustomAreaName: analysisActions.setCustomAreaName,
      toggleAnalysisToolsVisibility: analysisActions.toggleAnalysisToolsVisibility,
      toggleAnalysisToolsExpanded: analysisActions.toggleAnalysisToolsExpanded,
      toggleSubscribeToolsExpanded: analysisActions.toggleSubscribeToolsExpanded,
      toggleImageryToolsExpanded: analysisActions.toggleImageryToolsExpanded,
      toggleBasemapToolsExpanded: analysisActions.toggleBasemapToolsExpanded,
      toggleEsriSearchVisibility: analysisActions.toggleEsriSearchVisibility,
      toggleTimelineVisibility: analysisActions.toggleTimelineVisibility,
      toggleAnalysisSource: analysisActions.toggleAnalysisSource,
      initAreas: analysisActions.initAreas,
      saveMonthlyPlanetBasemaps: analysisActions.saveMonthlyPlanetBasemaps,
      saveQuarterlyPlanetBasemaps: analysisActions.saveQuarterlyPlanetBasemaps
    });
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

  toggleAnalysisSource () {
    this.analysisSourceGFW = !this.analysisSourceGFW;
  }

  toggleDrawToolbar (status) {
    this.toolbarActive = status;
  }

  toggleCustomize () {
    this.customizeOpen = !this.customizeOpen;
  }

  toggleCountryCustomize () {
    this.customizeCountryOpen = !this.customizeCountryOpen;
  }

  toggleImageryOptions () {
    this.imageryOpen = !this.imageryOpen;
  }

  toggleAnalysisToolsVisibility () {
    this.analysisToolsVisible = !this.analysisToolsVisible;
  }

  toggleAnalysisToolsExpanded () {
    this.analysisToolsExpanded = !this.analysisToolsExpanded;
    if (this.analysisToolsExpanded === true) {
      this.subscribeToolsExpanded = false;
      this.imageryToolsExpanded = false;
      this.basemapToolsExpanded = false;
    }
  }

  toggleSubscribeToolsExpanded () {
    this.subscribeToolsExpanded = !this.subscribeToolsExpanded;
    if (this.subscribeToolsExpanded === true) {
      this.analysisToolsExpanded = false;
      this.imageryToolsExpanded = false;
      this.basemapToolsExpanded = false;
    }
  }

  toggleImageryToolsExpanded () {
    this.imageryToolsExpanded = !this.imageryToolsExpanded;
    if (this.imageryToolsExpanded === true) {
      this.analysisToolsExpanded = false;
      this.subscribeToolsExpanded = false;
      this.basemapToolsExpanded = false;
    }
  }

  toggleBasemapToolsExpanded () {
    this.basemapToolsExpanded = !this.basemapToolsExpanded;
    if (this.basemapToolsExpanded === true) {
      this.analysisToolsExpanded = false;
      this.imageryToolsExpanded = false;
      this.subscribeToolsExpanded = false;
    }
  }

  toggleEsriSearchVisibility () {
    this.esriSearchVisible = !this.esriSearchVisible;
  }

  toggleTimelineVisibility () {
    this.timelineVisible = !this.timelineVisible;
  }

  initAreas (areas) {
    this.provinces = areas.provinces;
    this.countries = areas.countries;
    this.adm1 = areas.adm1;

  }

  savePlanetBasemaps (basemaps) {
    this.planetBasemaps = basemaps;
  }

  saveMonthlyPlanetBasemaps(basemaps) {
    this.monthlyPlanetBasemaps = basemaps;
  }

  saveQuarterlyPlanetBasemaps(basemaps) {
    this.quarterlyPlanetBasemaps = basemaps;
  }

}

export const analysisStore = alt.createStore(AnalysisStore, 'AnalysisStore');
