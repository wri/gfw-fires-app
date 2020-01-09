define(["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /**
   * NOTE: KEYS must be unique
   */
  var KEYS = {
    wriBasemap: "wri-basemap",
    imageryBasemap: "hybrid",
    topoBasemap: "topo",
    osmBasemap: "osm",
    darkGrayBasemap: "dark-gray",

    //- Layers and Layer Categories
    viirsFires: "viirsFires",
    viirsFires48: "viirsFires48",
    viirsFires72: "viirsFires72",
    viirsFires7D: "viirsFires7D",
    viirsFires1Y: "viirsFires1Y",
    activeFires: "activeFires",
    activeFires48: "activeFires48",
    activeFires72: "activeFires72",
    activeFires7D: "activeFires7D",
    activeFires1Y: "activeFires1Y",
    archiveFires: "archiveFires",
    noaa18Fires: "noaa18Fires",
    burnScars: "burnScars",
    fireWeather: "fireWeather",
    fireHistory: "fireHistory",
    lastRainfall: "lastRainfall",
    crowdsourcedFires: "crowdsourcedFires",
    loggingConcessions: "loggingConcessions",
    oilPalm: "oilPalm",
    rspoOilPalm: "rspoOilPalm",
    woodFiber: "woodFiber",
    mining: "mining",
    gfwLogging: "gfwLogging",

    loggingGreenpeace: "loggingGreenpeace",
    oilPalmGreenpeace: "oilPalmGreenpeace",
    coalConcessions: "coalConcessions",
    woodFiberGreenpeace: "woodFiberGreenpeace",

    forestMoratorium: "forestMoratorium",
    protectedAreas: "protectedAreas",
    protectedAreasHelper: "protectedAreasHelper",
    peatlands: "peatlands",
    treeCoverDensity: "treeCoverDensity",
    primaryForests: "primaryForests",
    plantationSpecies: "plantationSpecies",
    plantationTypes: "plantationTypes",
    airQuality: "airQuality",
    gfedEmissions: "gfedEmissions",
    overlays: "overlays",
    landsat8: "landsat8",
    windDirection: "windDirection",
    digitalGlobe: "dg-00",
    digitalGlobe0: "dg-01",
    digitalGlobe1: "dg-02",
    digitalGlobe2: "dg-03",
    digitalGlobe3: "dg-04",
    digitalGlobe4: "dg-05",
    boundingBoxes: "boundingBoxes",
    fireStories: "fireStories",

    planetBasemap: "planetBasemap",
    digitalGlobeBasemap: "digitalGlobeBasemap",
    sentinalImagery: "sentinalImagery",
    EXTRA_LAYERS: "extraLayers",
    RECENT_IMAGERY: "RECENT_IMAGERY"
  };

  exports.default = KEYS;
});