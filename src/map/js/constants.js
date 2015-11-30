/**
* NOTE: KEYS must be unique
*/
const KEYS = {
  wriBasemap: 'wri-basemap',
  imageryBasemap: 'satellite',
  wriBasemapLabel: 'wri-basemap-label',
  //- Layers and Layer Categories
  fires: 'fires',
  treeCoverChange: 'tcc',
  waterStress: 'water-stress',
  majorDams: 'dams',
  activeFires: 'active-fires',
  burnScars: 'burn-scars',
  sediment: 'sediment',
  loss: 'loss',
  gain: 'gain',
  waterIntake: 'intake',
  treeCover: 'tree-cover',
  wetlands: 'wetlands',
  historicLoss: 'historic-loss',
  landCover: 'land-cover',
  //- Layers not in UI
  watershed: 'watersheds',
  rivers: 'rivers',
  watershedAnalysis: 'watershedAnalysis',
  customAnalysis: 'customAnalysis'
};

export { KEYS as default };
