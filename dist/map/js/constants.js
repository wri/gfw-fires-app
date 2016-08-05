define(['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
  * NOTE: KEYS must be unique
  */
  var KEYS = {
    wriBasemap: 'wri-basemap',
    imageryBasemap: 'satellite',
    topoBasemap: 'topo',
    darkGrayBasemap: 'dark-gray',

    //- Layers and Layer Categories
    activeFires: 'activeFires',
    viirsFires: 'viirsFires',
    archiveFires: 'archiveFires',
    noaa18Fires: 'noaa18Fires',
    burnScars: 'burnScars',
    fireRisk: 'fireRisk',
    lastRainfall: 'lastRainfall',
    crowdsourcedFires: 'crowdsourcedFires',
    loggingConcessions: 'loggingConcessions',
    oilPalm: 'oilPalm',
    rspoOilPalm: 'rspoOilPalm',
    woodFiber: 'woodFiber',

    loggingGreenpeace: 'loggingGreenpeace',
    oilPalmGreenpeace: 'oilPalmGreenpeace',
    coalConcessions: 'coalConcessions',
    woodFiberGreenpeace: 'woodFiberGreenpeace',

    forestMoratorium: 'forestMoratorium',
    protectedAreas: 'protectedAreas',
    protectedAreasHelper: 'protectedAreasHelper',
    peatlands: 'peatlands',
    treeCoverDensity: 'treeCoverDensity',
    primaryForests: 'primaryForests',
    plantationSpecies: 'plantationSpecies',
    plantationTypes: 'plantationTypes',
    airQuality: 'airQuality',
    overlays: 'overlays',
    landsat8: 'landsat8',
    windDirection: 'windDirection',
    digitalGlobe: 'dg-00',
    digitalGlobe0: 'dg-01',
    digitalGlobe1: 'dg-02',
    digitalGlobe2: 'dg-03',
    digitalGlobe3: 'dg-04',
    digitalGlobe4: 'dg-05',
    boundingBoxes: 'boundingBoxes',
    twitter: 'twitter',
    fireStories: 'fireStories'
  };

  exports.default = KEYS;
});