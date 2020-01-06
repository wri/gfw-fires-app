import KEYS from 'js/constants';

export const config = {

  map: {
    id: 'map',
    options: {
      navigationMode: 'css-transforms',
      force3DTransforms: true,
      showAttribution: false,
      center: [0, 40],
      fadeOnZoom: true,
      basemap: 'topo',
      slider: false,
      logo: false,
      zoom: app.mobile() === true ? 4 : 3
    },
    customBasemap: {
      url: 'https://api.tiles.mapbox.com/v4/wri.c974eefc/${level}/${col}/${row}.png?access_token=pk.eyJ1Ijoid3JpIiwiYSI6IjU3NWNiNGI4Njc4ODk4MmIyODFkYmJmM2NhNDgxMWJjIn0.v1tciCeBElMdpnrikGDrPg',
      options: {
        id: KEYS.wriBasemap,
        visible: false
      }
    },
    geometryServiceUrl: 'https://gis-gfw.wri.org/arcgis/rest/services/Utilities/Geometry/GeometryServer'
  },

  /**
  * These are passed to various stores, make sure they match the format in the stores/*.js files
  * For default active layers, set the visible property to true below in layers, thats how the store
  * determines the activeLayers
  * activeBasemap controls the UI only, so if you need to change it
  * set the customBasemap.options.visible property to false and add a basemap property to map.options
  */
  defaults: {
    canopyDensity: 30,
    lossFromSelectIndex: 0,
    showImageryFootprints: true,
    activeBasemap: KEYS.topoBasemap,
    todaysDate: new window.Kalendae.moment(),
    yesterday: new window.Kalendae.moment().subtract(1, 'd'),
    dgStartDate: new window.Kalendae.moment('10/19/2015'),
    archiveStartDate: new window.Kalendae.moment('01/01/2013'),
    archiveInitialDate: new window.Kalendae.moment().subtract(14, 'd'),
    noaaStartDate: new window.Kalendae.moment('10/22/2014'),
    riskStartDate: new window.Kalendae.moment('04/02/2015'),
    airQStartDate: new window.Kalendae.moment('09/25/2015'),
    windStartDate: new window.Kalendae.moment('10/19/2014'),
    analysisStartDate: new window.Kalendae.moment().subtract(8, 'd'),
    archiveViirsStartDate: new window.Kalendae.moment().subtract(14, 'd'),
    archiveViirsEndDate: new window.Kalendae.moment(),
    archiveModisStartDate: new window.Kalendae.moment().subtract(14, 'd'),
    archiveModisEndDate: new window.Kalendae.moment(),
    planetActiveCategory: 'PLANET-MONTHLY',
    activePlanetCategory: { value: 'PLANET-MONTHLY', label: 'Monthly' },
    corsEnabledServers: [
      'wri-gfw-fires-staging.herokuapp.com',
      'fires.globalforestwatch.org',
      'gfw-fires.wri.org',
      'gis-gfw.wri.org',
      'gfw-staging.wri.org',
      'https://gis-gfw.wri.org/',
      'https://production-api.globalforestwatch.org/v1/gfw-metadata/',
      'https://fires.globalforestwatch.org/map/php/proxy.php',
      'https://gis-gfw.wri.org',
      'https://production-api.globalforestwatch.org/recent-tiles/thumbs',
      'production-api.globalforestwatch.org/recent-tiles/thumbs'
    ],
    initialHash: '#activeLayers=activeFires&activeBasemap=topo&x=115&y=0&z=5',
    calendars: [
      {
        date: new window.Kalendae.moment(), //('10/19/2015'),
        method: 'changeImageryStart',
        direction: 'past',
        startDate: new window.Kalendae.moment('07/12/2008'), //'10/19/2015'),
        domId: 'imageryStart',
        domClass: 'imagery-start'
      },
      {
        date: new window.Kalendae.moment(),
        method: 'changeImageryEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment('07/12/2008'), //'10/19/2015'),
        domId: 'imageryEnd',
        domClass: 'imagery-end'
      },
      {
        date: new window.Kalendae.moment().subtract(8, 'd'),
        method: 'changeAnalysisStart',
        direction: 'past',
        startDate: new window.Kalendae.moment().subtract(1, 'y'),
        domId: 'analysisStart',
        domClass: 'analysis-start'
      },
      {
        date: new window.Kalendae.moment().subtract(1, 'd'),
        method: 'changeAnalysisEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment().subtract(1, 'y'),
        domId: 'analysisEnd',
        domClass: 'analysis-end'
      },
      {
        date: new window.Kalendae.moment().subtract(14, 'd'), //'01/01/2013'),
        method: 'changeArchiveStart',
        direction: 'past',
        startDate: new window.Kalendae.moment('01/01/2013'),
        domId: 'archiveStart',
        domClass: 'archive-start'
      },
      {
        date: new window.Kalendae.moment().subtract(7, 'd'),
        method: 'changeArchiveEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment('01/01/2013'),
        domId: 'archiveEnd',
        domClass: 'archive-end'
      },
      {
        date: new window.Kalendae.moment().subtract(14, 'd'),
        method: 'changeViirsArchiveStart',
        direction: 'past',
        startDate: new window.Kalendae.moment().subtract(1, 'y'),
        domId: 'archiveViirsStart',
        domClass: 'viirs-archive-start'
      },
      {
        date: new window.Kalendae.moment().subtract(7, 'd'),
        method: 'changeViirsArchiveEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment().subtract(1, 'y'),
        domId: 'archiveViirsEnd',
        domClass: 'viirs-archive-end'
      },
      {
        date: new window.Kalendae.moment().subtract(14, 'd'),
        method: 'changeModisArchiveStart',
        direction: 'past',
        startDate: new window.Kalendae.moment().subtract(1, 'y'),
        domId: 'archiveModisStart',
        domClass: 'modis-archive-start'
      },
      {
        date: new window.Kalendae.moment().subtract(7, 'd'),
        method: 'changeModisArchiveEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment().subtract(1, 'y'),
        domId: 'archiveModisEnd',
        domClass: 'modis-archive-end'
      },
      {
        date: new window.Kalendae.moment(), //('10/22/2014'),
        method: 'changeNoaaStart',
        direction: 'past',
        startDate: new window.Kalendae.moment('10/22/2014'),
        domId: 'noaaStart',
        domClass: 'noaa-start'
      },
      {
        date: new window.Kalendae.moment(),
        method: 'changeNoaaEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment('10/22/2014'),
        domId: 'noaaEnd',
        domClass: 'noaa-end'
      },
      {
        date: new window.Kalendae.moment().subtract(1, 'd'),
        method: 'changeRisk',
        direction: 'past',
        startDate: new window.Kalendae.moment('04/02/2015'),
        domId: 'risk',
        domClass: 'risk'
      },
      {
        date: new window.Kalendae.moment().subtract(1, 'd'),
        method: 'changeRain',
        direction: 'past',
        startDate: new window.Kalendae.moment('04/02/2015'),
        domId: 'rain',
        domClass: 'rain'
      },
      {
        date: new window.Kalendae.moment(),
        method: 'changeWind',
        direction: 'past',
        startDate: new window.Kalendae.moment('10/19/2014'),
        domId: 'wind',
        domClass: 'wind'
      },
      {
        date: new window.Kalendae.moment(),
        method: 'changeAirQ',
        direction: 'today-past',
        startDate: new window.Kalendae.moment('10/19/2017'),
        domId: 'airQ',
        domClass: 'airQ'
      },
      {
        date: new window.Kalendae.moment(),
        method: 'changeMaster',
        direction: 'past',
        startDate: new window.Kalendae.moment('01/01/2013'),
        domId: 'masterDay',
        domClass: 'master-day'
      },
      {
        date: new window.Kalendae.moment(),
        method: 'changeSentinal',
        direction: 'past',
        startDate: new window.Kalendae.moment('01/01/2012'),
        domId: 'sentinal',
        domClass: 'sentinal'
      }
    ]
  },

  upload: {
    portal: 'https://www.arcgis.com/sharing/rest/content/features/generate',
    infoTemplate: {
      content: '<table><tr><td>Name: </td><td>${featureName}</td></tr></table>' +
        '<button>Subscribe</button>' +
        '<button>Remove</button>'
    },
    shapefileParams: (name, spatialReference, extentWidth, mapWidth) => {
      return {
        'name': name,
        'generalize': true,
        'targetSr': spatialReference,
        'maxRecordCount': 1000,
        'reducePrecision': true,
        'numberOfDigitsAfterDecimal': 0,
        'enforceInputFileSizeLimit': true,
        'enforceOutputJsonSizeLimit': true,
        'maxAllowableOffset': extentWidth / mapWidth
      };
    },
    shapefileContent: (params, filetype) => {
      return {
        'publishParameters': params,
        'callback.html': 'textarea',
        'filetype': filetype,
        'f': 'json'
      };
    }
  },

  assetUrls: {
    ionCSS: 'vendors/ion.rangeslider/css/ion.rangeSlider.css',
    ionSkinCSS: 'vendors/ion.rangeslider/css/ion.rangeSlider.skinNice.css',
    highcharts: 'https://code.highcharts.com/highcharts.js',
    highchartsExport: 'https://code.highcharts.com/modules/exporting.js',
    rangeSlider: '../vendors/ion.rangeslider/js/ion.rangeSlider.min.js',
    // rangeSlider: '../../node_modules/ion-rangeslider/js/ion.rangeSlider.min.js',
    chosen: '../vendors/chosen/chosen.jquery.js'
  },

  urls: {
    satelliteImageService: 'https://production-api.globalforestwatch.org/recent-tiles'
  },

  /**
  * Layer Config Options, brackets are optional
  * if type is anything other than graphic and the layer is not disabled, it must have a url
  * id - {string} - layer Id, must be unique
  * [order] - {number} - determines layer order on map, 1 is the bottom and higher numbers on top
  * type - {string} - layer type (dynamic, image, feature, tiled)
  * [label] - {string} - label in the layer list in the UI
  * [group] - {string} - group in the UI, either 'watershed' (curr. Know Your Watershed in UI) or 'watershedRisk (curr. Identifie Watershed Risks in UI)'
  * - No group means it won't show in the UI
  * [className] - {string} - Used for the checkbox so you can give it a background color to match the data
  * [url] - {string} - Url for the map service, if present the app will attempt to add to the map via the LayerFactory,
  * [disabled] - {boolean} - grey the checkbox out in the UI and prevent user from using it
  * - can also be updated dynamically if a layer fails to be added to the map to block the user from interacting with a service that is down
  * [miscellaneous layer params], layerIds, opacity, colormap, inputRange, outputRange
  * - Add any extra layer params as needed, check LayerFactory to see which ones are supported and feel free to add more if necessary
  * - type should be what the layer contructor expects, these are directly passed to Esri JavaScript layer constructors
  */

  shortTermServices: {
    modis24HR: {
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS_24hrs/MapServer',
      id: 21
    },
    modis48HR: {
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS_48hrs/MapServer',
      id: 21
    },
    modis7D: {
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS_7d/MapServer',
      id: 21
    },
    modis1YR: {
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS_1yr/MapServer',
      id: 21
    },
    viirs24HR: {
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS_24hrs/MapServer',
      id: 21
    },
    viirs48HR: {
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS_48hrs/MapServer',
      id: 21
    },
    viirs7D: {
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS_7d/MapServer',
      id: 21
    },
    viirs1YR: {
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS_1yr/MapServer',
      id: 0
    }
  },

  layers: [
    {
      id: KEYS.viirsFires,
      order: 13,
      type: 'feature',
      label: 'VIIRS active fires',
      group: 'fires',
      visible: true,
      layerIds: [21],
      className: 'viirs-fires',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS_24hrs/MapServer',
      metadataId: 'viirs_fires',
      infoTemplate: {
        content: '<table><tr><td class="field-name">BRIGHTNESS: </td><td class="field-value">${BRIGHT_TI5}</td></tr>' +
          '<tr><td class="field-name">CONFIDENCE: </td><td class="field-value">${CONFIDENCE}</td></tr>' +
          '<tr><td class="field-name">LATITUDE: </td><td class="field-value">${LATITUDE}</td></tr>' +
          '<tr><td class="field-name">LONGITUDE: </td><td class="field-value">${LONGITUDE}</td></tr>' +
          '<tr><td class="field-name">ACQUISITION DATE: </td><td class="field-value">${ACQ_DATE}</td></tr>' +
          '<tr><td class="field-name">ACQUISITION TIME: </td><td class="field-value">${ACQ_TIME}</td></tr>'
      },
      calendar: {
        domClass: 'viirs-archive-settings',
        childDomClass: 'viirs-archive-subsettings',
        minLabel: 'From',
        maxLabel: 'To'
      }
    },

    {
      id: KEYS.activeFires,
      order: 12,
      type: 'feature',
      label: 'MODIS active fires',
      group: 'fires',
      visible: true,
      layerIds: [21],
      className: 'active-fires',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS_24hrs/MapServer',
      metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td class="field-name">BRIGHTNESS: </td><td class="field-value">${BRIGHTNESS}</td></tr>' +
          '<tr><td class="field-name">CONFIDENCE: </td><td class="field-value">${CONFIDENCE}</td></tr>' +
          '<tr><td class="field-name">LATITUDE: </td><td class="field-value">${LATITUDE}</td></tr>' +
          '<tr><td class="field-name">LONGITUDE: </td><td class="field-value">${LONGITUDE}</td></tr>' +
          '<tr><td class="field-name">ACQUISITION DATE: </td><td class="field-value">${ACQ_DATE}</td></tr>' +
          '<tr><td class="field-name">ACQUISITION TIME: </td><td class="field-value">${ACQ_TIME}</td></tr>'
      },
      calendar: {
        domClass: 'modis-archive-settings',
        childDomClass: 'modis-archive-subsettings',
        minLabel: 'From',
        maxLabel: 'To'
      }
    },
    {
      id: KEYS.archiveFires,
      order: 12,
      type: 'dynamic',
      label: 'Archive fires for Indonesia',
      sublabel: '(layer starts at 01/01/13)',
      group: 'fires',
      layerIds: [0],
      className: 'archive-fires',
      defaultDefinitionExpression: "ACQ_DATE < date'" + new window.Kalendae.moment().subtract(1, 'w').format('M/D/YYYY') + "' AND ACQ_DATE > date'" + new window.Kalendae.moment().subtract(2, 'w').format('M/D/YYYY') + "'",
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'idn_firms_active_fires_archive',
      infoTemplate: {
        content: '<table><tr><td class="field-name">BRIGHTNESS: </td><td class="field-value">${BRIGHTNESS}</td></tr>' +
        '<tr><td class="field-name">CONFIDENCE: </td><td class="field-value">${CONFIDENCE}</td></tr>' +
        '<tr><td class="field-name">LATITUDE: </td><td class="field-value">${LATITUDE}</td></tr>' +
        '<tr><td class="field-name">LONGITUDE: </td><td class="field-value">${LONGITUDE}</td></tr>' +
        '<tr><td class="field-name">ACQUISITION DATE: </td><td class="field-value">${ACQUISITION DATE}</td></tr>' +
        '<tr><td class="field-name">ACQUISITION TIME: </td><td class="field-value">${ACQUISITION TIME}</td></tr>'
      },
      calendar: {
        domClass: 'archive-settings',
        childDomClass: 'archive-subsettings',
        minLabel: 'From',
        maxLabel: 'To'
      }
    },
    {
      id: KEYS.noaa18Fires,
      order: 12,
      type: 'dynamic',
      label: 'NOAA-18 fires',
      sublabel: '(layer starts at 10/22/14)',
      group: 'fires',
      layerIds: [9],
      className: 'noaa-fires',
      defaultDefinitionExpression: "Date < date'" + new window.Kalendae.moment().format('M/D/YYYY') + "' AND Date > date'" + new window.Kalendae.moment().subtract(1, 'w').format('M/D/YYYY') + "'",
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'noaa18_fires',
      infoTemplate: {
        content: '<table><tr><td class="field-name">DATE: </td><td class="field-value">${Date}</td></tr>' +
          '<tr><td class="field-name">SNo: </td><td class="field-value">${SNo}</td></tr>'
      },
      calendar: {
        domClass: 'noaa-settings',
        childDomClass: 'noaa-subsettings',
        minLabel: 'From',
        maxLabel: 'To'
      }
    },
    {
      id: KEYS.burnScars,
      order: 12,
      type: 'dynamic',
      label: 'Crowdsourced fires, burn scars',
      group: 'fires',
      layerIds: [8],
      className: 'burn-scars',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'idn_crowdsourced_fires_and_burn_scars',
      infoTemplate: {
        content: '<table><span class="name-field">${type_}</span></tr>' +
          '<tr><td>CROWDRANK: </td><td class="field-value">${CrowdRank}</td></tr>' +
          '<tr><td>IMAGE DATE: </td><td class="field-value">${ImageAquisitionDate}</td></tr>'
      }
    },
    {
      id: KEYS.fireHistory,
      order: 8,
      type: 'image',
      label: 'Fire history',
      sublabel: '(Indonesia, 2001-2018)',
      opacity: 0.8,
      group: 'fireRisk',
      className: 'fire-history',
      url: 'https://gfw-staging.wri.org/arcgis/rest/services/image_services/idn_annual_fire_frequency/ImageServer',
      metadataId: 'idn_fire_history',
      definitionExpression: "Name = 'kd2018'",
      calendar: {
        domClass: 'risk-settings',
        childDomClass: 'risk-subsettings',
        label: 'Select a date'
      }
    },
    {
      id: KEYS.fireWeather,
      order: 8,
      type: 'image',
      label: 'Fire weather',
      sublabel: '(Pantropics, 1/2/2015 to presen)',
      opacity: 0.8,
      group: 'fireRisk',
      className: 'fire-risk',
      // disabled: true,
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/fire_risk_pantropics/ImageServer',
      metadataId: 'fire_risk',
      calendar: {
        domClass: 'risk-settings',
        childDomClass: 'risk-subsettings',
        label: 'Select a date'
      }
    },
    {
      id: KEYS.lastRainfall,
      order: 7,
      type: 'image',
      label: 'Days since last rainfall',
      sublabel: '(Pantropics, 1/1/2015 to present)',
      opacity: 0.8,
      group: 'fireRisk',
      className: 'last-rainfall',
      // disabled: true,
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/DSLR_pantropics/ImageServer',
      metadataId: 'idn_mys_days_since_last_rainfall', //todo: find correct
      calendar: {
        domClass: 'rainfall-settings',
        childDomClass: 'rainfall-subsettings',
        label: 'Select a date'
      }
    },
    {
      id: KEYS.forestMoratorium,
      order: 9,
      type: 'dynamic',
      label: 'Forest moratorium',
      // TODO: hookup instructions below
      // instruction: 'The moratorium prohibits new concessions on primary forest or peatlands. Learn More.'
      sublabel: '(Indonesia)',
      group: 'forestUse',
      className: 'forest-moratorium',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/commodities/MapServer',
      metadataId: 'idn_forest_moratorium',
      layerIds: [7]
    },
    {
      id: KEYS.oilPalm,
      order: 10,
      type: 'dynamic',
      label: 'Oil palm',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'oil-palm',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'gfw_oil_palm',
      layerIds: [1],
      infoTemplate: {
        content: '<table><span class="name-field">${Name}</span></tr>' +
        '<tr><td class="field-name">GIS CALCULATED AREA (ha): </td><td class="field-value">${GIS Calculated Area (ha)}</td></tr>' +
        '<tr><td class="field-name">COUNTRY: </td><td class="field-value">${Country}</td></tr>' +
        '<tr><td class="field-name">COMPANY: </td><td class="field-value">${Group}</td></tr>' +
        '<tr><td class="field-name">CERTIFICATION STATUS: </td><td class="field-value">${Certification Status}</td></tr>' +
        '<tr><td class="field-name">SOURCE: </td><td class="field-value">${Source}</td></tr>'
      }
    },
    {
      id: KEYS.rspoOilPalm,
      order: 11,
      type: 'dynamic',
      label: 'RSPO oil palm',
      sublabel: '(May 2013, select countries)',
      group: 'forestUse',
      className: 'rspo-palm',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/commodities/MapServer/',
      metadataId: 'rspo_oil_palm',
      layerIds: [36],
      infoTemplate: {
        content: '<table><span class="name-field">${name}</span></tr>' +
        '<tr><td class="field-name">GIS CALCULATED AREA (ha): </td><td class="field-value">${area_ha}</td></tr>' +
        '<tr><td class="field-name">COUNTRY: </td><td class="field-value">${country}</td></tr>' +
        '<tr><td class="field-name">COMPANY: </td><td class="field-value">${group_comp}</td></tr>' +
        '<tr><td class="field-name">CERTIFICATION STATUS: </td><td class="field-value">${certificat}</td></tr>' +
        '<tr><td class="field-name">SOURCE: </td><td class="field-value">${source}</td></tr>'
      }
    },
    {
      id: KEYS.woodFiber,
      order: 10,
      type: 'dynamic',
      label: 'Wood fiber',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'wood-fiber',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'gfw_wood_fiber',
      layerIds: [0],
      infoTemplate: {
        content: '<table><span class="name-field">${Name}</span></tr>' +
        '<tr><td class="field-name">GROUP/AFFILIATION: </td><td class="field-value">${Group}</td></tr>' +
        '<tr><td class="field-name">COUNTRY: </td><td class="field-value">${Country}</td></tr>' +
        '<tr><td class="field-name">SOURCE: </td><td class="field-value">${Source}</td></tr>' +
        '<tr><td class="field-name">TYPE: </td><td class="field-value">${Concession Type}</td></tr>' +
        '<tr><td class="field-name">LAST UPDATED: </td><td class="field-value">${Last Update}</td></tr>' +
        '<tr><td class="field-name">GIS CALCULATED AREA (ha): </td><td class="field-value">${GIS Calculated Area (ha)}</td></tr>'
      }
    },
    {
      id: KEYS.mining,
      order: 10,
      type: 'dynamic',
      label: 'Mining',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'mining',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'gfw_mining',
      layerIds: [2],
      infoTemplate: {
        content: '<table><span class="name-field">${Name}</span></tr>' +
        '<tr><td class="field-name">GROUP/AFFILIATION: </td><td class="field-value">${Group}</td></tr>' +
        '<tr><td class="field-name">COUNTRY: </td><td class="field-value">${Country}</td></tr>' +
        '<tr><td class="field-name">SOURCE: </td><td class="field-value">${Source}</td></tr>' +
        '<tr><td class="field-name">TYPE: </td><td class="field-value">${Concession Type}</td></tr>' +
        '<tr><td class="field-name">LAST UPDATED: </td><td class="field-value">${Last Update}</td></tr>' +
        '<tr><td class="field-name">GIS CALCULATED AREA (ha): </td><td class="field-value">${GIS Calculated Area (ha)}</td></tr>'
      }
    },
    {
      id: KEYS.gfwLogging,
      order: 10,
      type: 'dynamic',
      label: 'Logging',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'gfw_logging',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'gfw_logging',
      layerIds: [3],
      infoTemplate: {
        content: '<table><span class="name-field">${Name}</span></tr>' +
        '<tr><td class="field-name">GROUP/AFFILIATION: </td><td class="field-value">${Group}</td></tr>' +
        '<tr><td class="field-name">COUNTRY: </td><td class="field-value">${Country}</td></tr>' +
        '<tr><td class="field-name">SOURCE: </td><td class="field-value">${Source}</td></tr>' +
        '<tr><td class="field-name">TYPE: </td><td class="field-value">${Concession Type}</td></tr>' +
        '<tr><td class="field-name">LAST UPDATED: </td><td class="field-value">${Last Update}</td></tr>' +
        '<tr><td class="field-name">GIS CALCULATED AREA (ha): </td><td class="field-value">${GIS Calculated Area (ha)}</td></tr>'
      }
    },
    {
      id: KEYS.loggingConcessions,
      order: 10,
      type: 'dynamic',
      label: 'Managed forests',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'logging-concessions',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'gfw_logging',
      layerIds: [3],
      infoTemplate: {
        content: '<table><span class="name-field">${Name}</span></tr>' +
        '<tr><td class="field-name">GIS CALCULATED AREA (ha): </td><td class="field-value">${GIS Calculated Area (ha)}</td></tr>' +
        '<tr><td class="field-name">COUNTRY: </td><td class="field-value">${Country}</td></tr>' +
        '<tr><td class="field-name">COMPANY: </td><td class="field-value">${Group}</td></tr>' +
        '<tr><td class="field-name">CERTIFICATION STATUS: </td><td class="field-value">${Certification Status}</td></tr>' +
        '<tr><td class="field-name">SOURCE: </td><td class="field-value">${Source}</td></tr>'
      }
    },

    {
      id: KEYS.oilPalmGreenpeace,
      order: 10,
      type: 'dynamic',
      label: 'Oil palm',
      group: 'forestUse',
      className: 'oil-palm-greenpeace',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/partner_requests/greenpeace_en/MapServer',
      metadataId: 'idn_oilpalm_greenpeace',
      layerIds: [0],
      infoTemplate: {
        content: '<table><tr><td>CONCESSION HOLDER: </td><td>${Consession Holder}</td></tr>' +
        '<tr><td>GROUP: </td><td>${Group}</td></tr>' +
        '<tr><td>AREA (ha): </td><td>${Area (ha):NumberFormat(places:0)}</td></tr>' +
        '<tr><td>BUSINESS PERMIT: </td><td>${Business Permit}</td></tr>' +
        '<tr><td>PLANTATION PERMIT: </td><td>${Plantation Permit}</td></tr>' +
        '<tr><td>LOCATION PERMIT: </td><td>${Location Permit}</td></tr>' +
        '<tr><td>PROVINCE: </td><td>${Province}</td></tr></table>'
      }
    },
    {
      id: KEYS.woodFiberGreenpeace,
      order: 10,
      type: 'dynamic',
      label: 'Wood fiber',
      group: 'forestUse',
      className: 'wood-fiber-greenpeace',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/partner_requests/greenpeace_en/MapServer',
      metadataId: 'idn_woodfiber_greenpeace',
      layerIds: [1],
      infoTemplate: {
        content: '<table><tr><td>CONCESSION HOLDER: </td><td>${Consession Holder}</td></tr>' +
        '<tr><td>GROUP: </td><td>${Group}</td></tr>' +
        '<tr><td>AREA (ha): </td><td>${Area (ha):NumberFormat(places:0)}</td></tr>' +
        '<tr><td>PERMIT: </td><td>${Permit}</td></tr>' +
        '<tr><td>PERMIT GRANTED IN: </td><td>${Permit Granted in}</td></tr>' +
        '<tr><td>PROVINCE: </td><td>${Province}</td></tr></table>'
      }
    },
    {
      id: KEYS.loggingGreenpeace,
      order: 10,
      type: 'dynamic',
      label: 'Selective logging',
      group: 'forestUse',
      className: 'logging-concessions-greenpeace',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/partner_requests/greenpeace_en/MapServer',
      metadataId: 'idn_logging_greenpeace',
      layerIds: [2],
      infoTemplate: {
        content: '<table><tr><td>CONCESSION HOLDER: </td><td>${Consession Holder}</td></tr>' +
        '<tr><td>GROUP: </td><td>${Group}</td></tr>' +
        '<tr><td>AREA (ha): </td><td>${Area (ha):NumberFormat(places:0)}</td></tr>' +
        '<tr><td>PERMIT: </td><td>${Permit}</td></tr>' +
        '<tr><td>PROVINCE: </td><td>${Province}</td></tr></table>'
      }
    },
    {
      id: KEYS.coalConcessions,
      order: 10,
      type: 'dynamic',
      label: 'Indonesia Coal mining',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'coal-concessions-greenpeace',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/partner_requests/greenpeace_en/MapServer',
      metadataId: 'idn_coalmining_greenpeace',
      layerIds: [3],
      infoTemplate: {
        content: '<table><tr><td>CONCESSION HOLDER: </td><td>${coal_com}</td></tr>' +
        '<tr><td>GROUP: </td><td>${Group}</td></tr>' +
        '<tr><td>AREA (ha): </td><td>${Area (ha):NumberFormat(places:0)}</td></tr>' +
        '<tr><td>STATUS: </td><td>${Status}</td></tr>' +
        '<tr><td>PROVINCE: </td><td>${Province}</td></tr>' +
        '<tr><td>DISTRICT: </td><td>${District}</td></tr></table>'
      }
    },
    {
      id: KEYS.protectedAreas,
      order: 8,
      type: 'tiled',
      label: 'Protected areas',
      sublabel: '(varies, global)',
      group: 'conservation',
      className: 'protected-areas',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/cached/wdpa_protected_areas/MapServer',
      metadataId: 'wdpa_protected_areas'//,
      // layerIds: [0],
      // infoTemplate: {
      //   content: '<table><span class="name-field">${Name}</span></tr>' +
      //   '<tr><td class="field-name">GIS CALCULATED AREA (ha): </td><td class="field-value">${GIS_AREA}</td></tr>' +
      //   '<tr><td class="field-name">Local Name: </td><td class="field-value">${Local Name}</td></tr>' +
      //   '<tr><td class="field-name">Local Designation: </td><td class="field-value">${Local Designation}</td></tr>' +
      //   '<tr><td class="field-name">WDPA_PID: </td><td class="field-value">${WDPA_PID}</td></tr>'
      // }
    },
    {
      id: KEYS.protectedAreasHelper,
      order: 8,
      type: 'dynamic',
      label: 'Protected areas',
      sublabel: '(varies, global)',
      group: 'conservation',
      className: 'protected-areas',
      maxScale: 0,
      minScale: 0,
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/cached/wdpa_protected_areas/MapServer',
      metadataId: 'wdpa_protected_areas',
      layerIds: [0],
      infoTemplate: {
        content: '<table><span class="name-field">${Name}</span></tr>' +
        '<tr><td class="field-name">LEGAL DESIGNATION: </td><td class="field-value">${Local Designation}</td></tr>' +
        '<tr><td class="field-name">ID: </td><td class="field-value">${WDPA ID}</td></tr>' +
        '<tr><td class="field-name">COUNTRY: </td><td class="field-value">${iso3}</td></tr>' +
        '<tr><td class="field-name">IUCN CATEGORY: </td><td class="field-value">${iucn_cat}</td></tr>'
      }
    },
    {
      id: KEYS.peatlands,
      order: 6,
      type: 'dynamic',
      label: 'Peatlands',
      sublabel: '(year 2000, Indonesia)',
      group: 'landCover',
      className: 'peatlands',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/commodities/MapServer',
      metadataId: 'idn_peat_lands',
      layerIds: [22]
    },
    {
      id: KEYS.treeCoverDensity,
      order: 6,
      type: 'image',
      label: 'Tree cover density',
      sublabel: '(2000, Hansen/UMD/Google/USGS/NASA)',
      group: 'landCover',
      className: 'tree-cover',
      url: 'https://gis-treecover.wri.org/arcgis/rest/services/TreeCover2000/ImageServer',
      metadataId: 'tree_cover',
      colormap: [[50, 14, 204, 14]],
      inputRange: [30, 101],
      outputRange: [50],
      opacity: 0.8
    },
    {
      id: KEYS.primaryForests,
      order: 6,
      type: 'dynamic',
      label: 'Primary forests',
      sublabel: '(2000 - 2012, 30m, Indonesia)',
      group: 'landCover',
      className: 'primary-forests',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/primary_forest_2000to2012/MapServer',
      metadataId: 'idn_primary_forests',
      layerIds: [3]
    },
    {
      id: KEYS.plantationTypes,
      order: 6,
      type: 'dynamic',
      label: 'Plantations',
      // sublabel: '(2000 - 2012, 30m, Indonesia)',
      group: 'landCover',
      className: 'plantation-types',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/forest_cover/MapServer',
      metadataId: 'gfw_plantations',
      layerIds: [5]
    },
    // {
    //   id: KEYS.plantationSpecies, //todo: duplicate for plantationTypes and get a header over them!
    //   order: 5,
    //   type: 'dynamic',
    //   label: 'Plantation by Species',
    //   // sublabel: '(2000 - 2012, 30m, Indonesia)',
    //   group: 'landCover',
    //   className: 'plantation-species',
    //   url: 'https://gis-gfw.wri.org/arcgis/rest/services/forest_cover/MapServer',
    //   metadataId: 'gfw_plantations',
    //   layerIds: [8]
    // },
    {
      id: KEYS.windDirection,
      order: 10,
      type: 'wind',
      label: 'Wind direction',
      sublabel: '(2000, 30m, Daily, NOAA)',
      group: 'airQuality',
      className: 'wind-direction',
      // url: 'https://suitability-mapper.s3.amazonaws.com/wind/wind-surface-level-gfs-1.0.gz.json',
      metadataId: 'wind_direction',
      calendar: {
        domId: 'windDirectionCalendar',
        domClass: 'windDirectionLegend',
        childDomClass: 'wind-direction'
      }
    },
    {
      id: KEYS.airQuality,
      order: 25,
      type: 'dynamic',
      label: 'Air quality (beta)',
      middleLabel: '(OpenAQ, US EPA Air Quality Index)',
      sublabel: '(layer starts at 10/19/2017)',
      group: 'airQuality',
      className: 'air-quality',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/OpenAQI/MapServer',
      metadataId: 'gfw_airquality',
      calendar: {
        domId: 'airQCalendar',
        domClass: 'air-quality'
      },
      layerIds: [0, 1]
    },
    {
      id: KEYS.gfedEmissions,
      order: 1,
      type: 'dynamic',
      label: 'Emission 2015',
      sublabel: '(Global Fire Emissions Database)',
      group: 'airQuality',
      className: 'gfed-emissions',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/GFED_2015_Emissions/MapServer',
      metadataId: 'gfed_emissions',
      layerIds: [0]
    },
    {
      id: KEYS.overlays,
      order: 1,
      type: 'dynamic',
      label: '',
      sublabel: '',
      group: 'imagery',
      className: 'overlays',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'latest_landsat',
      layerIds: [4, 5, 6, 7],
      Provinces: {
        infoTemplate: {
          content: '<table><span class="name-field">${NAME}</span></tr>' +
          '<tr><td class="field-name">ISLAND: </td><td class="field-value">${ISLAND}</td></tr>' +
          '<tr><td class="field-name">TYPE: </td><td class="field-value">${TYPE}</td></tr>'
        }
      },
      Districts: {
        infoTemplate: {
          content: '<table><span class="name-field">${DISTRICT}</span></tr>' +
          '<tr><td class="field-name">PROVINCE: </td><td class="field-value">${PROVINCE}</td></tr>' +
          '<tr><td class="field-name">ISLAND: </td><td class="field-value">${ISLAND}</td></tr>'
        }
      },
      Subdistricts: {
        infoTemplate: {
          content: '<table><span class="name-field">${SUBDISTRIC}</span></tr>' +
          '<tr><td class="field-name">DISTRICT: </td><td class="field-value">${DISTRICT}</td></tr>' +
          '<tr><td class="field-name">PROVINCE: </td><td class="field-value">${PROVINCE}</td></tr>'
        }
      },
      Villages: {
        infoTemplate: {
          content: '<table><span class="name-field">${NAME}</span></tr>' +
          '<tr><td class="field-name">DISTRICT: </td><td class="field-value">${DISTRICT}</td></tr>' +
          '<tr><td class="field-name">SUBDISTRICT: </td><td class="field-value">${SUBDISTRIC}</td></tr>'
        }
      },
      infoTemplate: {
        content: '<table><span class="name-field">${NAME}</span></tr>' +
        '<tr><td class="field-name">IUCN CATEGORY: </td><td class="field-value">${OBJECTID}</td></tr>'
      }
    },
    {
      id: KEYS.landsat8,
      order: 1,
      type: 'image',
      label: 'Latest Landsat 8 Imagery',
      sublabel: '(latest image, 30m, global)',
      group: 'imagery',
      className: 'tree-cover',
      url: 'https://landsat.arcgis.com/arcgis/rest/services/Landsat8_PanSharpened/ImageServer',
      metadataId: 'latest_landsat'
    },
    {
      id: KEYS.boundingBoxes,
      order: 1,
      type: 'feature',
      label: 'Bounding boxes',
      infoTemplate: {
        content: '<table><span class="name-field">${Name}</span></tr>' +
          '<tr><td class="field-name">IMAGE ACQUISITION DATE: </td><td class="field-value">${AcquisitionDate}</td></tr>'
      },
      layerDefinition: {
        'geometryType': 'esriGeometryPolygon',
         'fields': [{
           'name': 'OBJECTID',
           'type': 'esriFieldTypeOID',
           'alias': 'OBJECTID'
         }, {
           'name': 'Name',
           'type': 'esriFieldTypeString',
           'alias': 'NAME'
         }, {
           'name': 'AcquisitionDate',
           'type': 'esriFieldTypeDate',
           'alias': 'ACQUISITION DATE'
         }, {
           'name': 'SensorName',
           'type': 'esriFieldTypeString',
           'alias': 'SENSOR NAME'
         }]
      },
      // group: 'imagery',
      className: 'digital-globe'
    },
    {
      id: KEYS.digitalGlobe,
      order: 5,
      subLayers: [KEYS.digitalGlobe0, KEYS.digitalGlobe1, KEYS.digitalGlobe2, KEYS.digitalGlobe3, KEYS.digitalGlobe4],
      imageServices: [
        { id: 'dg-00', url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/WV01/ImageServer', mosaic: 'WV01' },
        { id: 'dg-01', url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/QB01/ImageServer', mosaic: 'QB01' },
        { id: 'dg-02', url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/WV02/ImageServer', mosaic: 'WV02' },
        { id: 'dg-03', url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/GE01/ImageServer', mosaic: 'GEO1' },
        { id: 'dg-04', url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/WV03/ImageServer', mosaic: 'WV03' },
        { id: 'dg-05', url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/WV03_SWIR/ImageServer', mosaic: 'WV03_SWIR' }
      ],
      type: 'image',
      label: 'DigitalGlobe - FirstLook',
      mosaic: 'WV01',
      // group: 'imagery',
      'minScale': 0,
      'maxScale': 10000,
      className: 'digital-globe',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/WV01/ImageServer',
      metadataId: 'digital_globe',
      calendar: {
        // startDate: new Date('10/19/2015'),
        // currentDate: new Date(),
        // domId: 'imageryCalendar',
        domClass: 'imagery-settings',
        childDomClass: 'imagery-subsettings',
        minLabel: 'ACQUIRED DATE MINIMUM',
        maxLabel: 'ACQUIRED DATE MAXIMUM' //todo: switch these: line ~600
      }
    },
    {
      id: KEYS.digitalGlobe0,
      type: 'image',
      order: 5,
      mosaic: 'QB01',
      'minScale': 0,
      'maxScale': 10000, //zoom level 6 is highest visible
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/QB01/ImageServer'
    },
    {
      id: KEYS.digitalGlobe1,
      type: 'image',
      order: 5,
      mosaic: 'WV02',
      'minScale': 0,
      'maxScale': 10000,
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/WV02/ImageServer'
    },
    {
      id: KEYS.digitalGlobe2,
      type: 'image',
      order: 5,
      mosaic: 'GEO1',
      'minScale': 0,
      'maxScale': 10000,
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/GE01/ImageServer'
    },
    {
      id: KEYS.digitalGlobe3,
      type: 'image',
      order: 5,
      mosaic: 'WV03',
      'minScale': 0,
      'maxScale': 10000,
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/WV03/ImageServer'
    },
    {
      id: KEYS.digitalGlobe4,
      type: 'image',
      order: 5,
      mosaic: 'WV03_SWIR',
      'minScale': 0,
      'maxScale': 10000,
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/image_services/WV03_SWIR/ImageServer'
    },
    {
      id: KEYS.fireStories,
      order: 11,
      type: 'feature',
      label: 'Fire stories',
      group: 'stories',
      layerIds: [10],
      className: 'fire-stories',
      url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'user_stories',
      infoTemplate: app.mobile() === true ? {
        content: '<table class="fire-stories-popup mobile"><span class="name-field">${Title}</span></tr>' +
        '<tr><td class="field-value wide">${Details}</td></tr>' +
        '<tr><td class="field-value wide"><a href="${Video}" target="_blank">Video</a></td></tr>' +
        '<tr><td class="field-value wide">${Date}</td></tr>'
      } : {
        content: '<table class="fire-stories-popup"><span class="name-field">${Title}</span></tr>' +
        '<tr><td class="field-value wide">${Details}</td></tr>' +
        '<tr><td class="field-value wide"><a href="${Video}" target="_blank">Video</a></td></tr>' +
        '<tr><td class="field-value wide">${Date}</td></tr>'
      }
    },
    {
      id: KEYS.planetBasemap,
      metadataId: 'planet_basemaps'
    },
    // {
    //   id: 'imageryGraphicsLayer',
    //   type: 'imagery',
    //   url: 'https://earthengine.googleapis.com/map/',
    //   metadataId: ''
    // }
  ],

  symbol: {
    gfwBlue: [64, 153, 206],
    bbSymbol: [255, 0, 0],
    svgPath: 'M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z',
    pointUrl: 'https://js.arcgis.com/3.14/esri/dijit/Search/images/search-pointer.png'
  },

  alertsModal: {
    requests: {
      fires: {
        url: 'https://gfw-fires.wri.org/subscribe_by_polygon',
        options: {
          method: 'POST',
          handleAs: 'json',
          headers: {
            'X-Requested-With': null
          },
          data: {
            msg_type: 'email',
            msg_addr: null,
            area_name: null,
            features: null
          }
        },
        successMessage: 'subscription successful'
      },
      forma: {
        url: 'https://gfw-apis.appspot.com/subscribe',
        options: {
          method: 'POST',
          data: {
            topic: 'updates/forma',
            geom: null,
            email: null
          }
        }
      }
    }
  },

  firesModal: {
    info: 'GFW employs a recommendation for detecting forest clearing fires (described in Morton and Defries, 2008), identifying fires with a Brightness value greater than or equal to 330 Kelvin and a Confidence value greater than or equal to 30% to indicate fires that have a higher confidence for being forest-clearing fires. Low confidence fires are lower intensity fires that could either be from non-forest-clearing fire activity (clearing fields or grass burning), or could be older fires that have decreased in intensity (smoldering rather than flaming fires). The use of this classification establishes a higher standard for fire detection than using all fire alerts equally.'
  },

  analysis: {
    searchZoomDefault: 10,
    requests: {
      countries: {
        url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer/3/query?returnDistinctValues=true&f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=NAME_0',
        callback: 'callback'
      },
      adm1: {
        url: 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS/MapServer/3/query?returnDistinctValues=true&f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=NAME_0,NAME_1',
        callback: 'callback'
      }
    }
  },

  text: {
    layerInformation: {},
    errors: {
      missingLayerConfig: 'You provided a layer config containing a url but not a type, please specify the layer type in the layer config.',
      incorrectLayerConfig: type => `You provided an invalid type, the application is not configured for type: ${type}. Please use the correct type or implement it in the LayerFactory.`,
      geolocationUnavailable: 'Sorry, it looks like your browser does not support geolocation, please try the latest versions of Safari, Chrome, or Firefox.',
      geolocationFailure: message => `Error retrieving location at this time. ${message}`,
      featureNotFound: 'We could not find a feature available at this point. Please try again.'
    },
    layerPanel: {
      concessions: 'Concessions',
      concessionsGreenpeace: 'Greenpeace Concessions',
      waterStressLegend: {
        min: 'Low',
        max: 'High',
        arid: 'Arid',
        nodata: 'No Data'
      },
      sedimentLegend: {
        min: 'Low',
        max: 'Extreme'
      },
      fireHistoryOptions: [
        {label: 2001, value: 2001},
        {label: 2002, value: 2002},
        {label: 2003, value: 2003},
        {label: 2004, value: 2004},
        {label: 2005, value: 2005},
        {label: 2006, value: 2006},
        {label: 2007, value: 2007},
        {label: 2008, value: 2008},
        {label: 2009, value: 2009},
        {label: 2010, value: 2010},
        {label: 2011, value: 2011},
        {label: 2012, value: 2012},
        {label: 2013, value: 2013},
        {label: 2014, value: 2014},
        {label: 2015, value: 2015},
        {label: 2016, value: 2016},
        {label: 2017, value: 2017},
        {label: 2018, value: 2018}
      ],
      firesOptions: [
        {label: 'Past 24 hours', value: 1},
        {label: 'Past 48 hours', value: 2},
        {label: 'Past 72 hours', value: 3},
        {label: 'Past Week', value: 7},
        {label: 'Active Fires', value: null}
      ],
      plantationOptions: [
        {label: 'by Species', value: 8},
        {label: 'by Type', value: 5}
      ],
      forestOptions: [
        {label: '2000', value: 0},
        {label: '2005', value: 1},
        {label: '2010', value: 2},
        {label: '2012', value: 3}
      ],
      lossOptions: [
        {label: '2001', value: 1},
        {label: '2002', value: 2},
        {label: '2003', value: 3},
        {label: '2004', value: 4},
        {label: '2005', value: 5},
        {label: '2006', value: 6},
        {label: '2007', value: 7},
        {label: '2008', value: 8},
        {label: '2009', value: 9},
        {label: '2010', value: 10},
        {label: '2011', value: 11},
        {label: '2012', value: 12},
        {label: '2013', value: 13},
        {label: '2014', value: 14}
      ],
      treeCover: {
        densityFirst: 'Displaying',
        densitySecond: 'canopy density.'
      },
      calendarValidation: 'Start date cannot be before end date'
    },
    analysisPanel: {
      searchWidgetId: 'esri-search-widget',
      subscriptionTabId: 'areaTab',
      analysisTabId: 'timeframeTab',
      analysisCalendar: {
        // startDate: '4/2/2018',
        // currentDate: new Date('4/2/2019'),
        // domId: 'analysisCalendar',
        domClass: 'analysisLegend',
        childDomClass: 'analysis-child',
        minLabel: 'START DATE',
        minLabelPlus: 'START DATE',
        maxLabel: 'END DATE'
      },
      imageryTabId: 'imageryTab',
      basemapTabId: 'basemapTab',
      // TODO: separate below text out of config for simple locale swapping
      searchPlaceholder: 'Search for a location',
      analysisButtonLabel: 'GENERATE',
      analysisAreaTitle: 'Fire Report',
      indonesiaReportTitle: 'Indonesia Specialty Report',
      globalReportTitle: 'Country Report',
      analysisAreaHeader: 'View global and country fire statistics',
      analysisTimeframeHeader: 'Select any time frame of interest:',
      analysisTabLabel: 'Fire Report',
      analysisCustomize: 'CUSTOMIZE',
      analysisChoose: 'Choose your own custom time period and geographic area.',
      analysisIndonesiaChooseData: 'Analyze concession data from:',
      analysisCountryChooseData: 'Pick a country:',
      analysisInvalidDatesErrorMessage: 'Start date cannot be before end date',
      analysisDateRangeErrorMessage: 'Fire report is available for the last 12 months',
      subscriptionTabLabel: 'Draw or Upload Shape',
      subscriptionButtonLabel: 'START DRAWING',
      subscriptionButtonLabelRemove: 'CLEAR DRAWING',
      drawingDisclaimer: 'Maximum fires returned are 5,000. Reduce the size of your shape or the time range to refine your analysis.',
      subscriptionInstructionsOne: 'Draw or upload a shape to calculate fire counts and subscribe to alerts.',
      subscriptionInstructionsTwo: 'fire alert emails or SMS messages',
      subscriptionInstructionsThree: ' when fires occur.',
      subscriptionShapefile: 'Or drop a zipped shapefile here',
      subscriptionClick: 'Click on drawn or uploaded shapes on the map to subscribe to the area.',
      numberOfViirsPointsInPolygons: ' VIIRS Alerts ',
      numberOfModisPointsInPolygons: ' MODIS Alerts ',
      imageryTabLabel: 'VIEW HIGH-RES IMAGERY',
      imageryArea: 'Imagery',
      basemapTabLabel: 'CHANGE BASE MAP',
      basemapArea: 'Basemaps'
    },
    controlPanel: {
      darkGrayBasemap: 'Dark Gray',
      topoBasemap: 'Topo',
      wriBasemap: 'WRI',
      osmBasemap: 'OSM',
      imageryBasemap: 'Imagery',
      landsat8: 'Landsat',
      zoomInHover: 'ZOOM IN',
      zoomOutHover: 'ZOOM OUT',
      shareHover: 'SHARE',
      searchHover: 'SEARCH',
      showHideHover: 'SHOW/HIDE',
      refreshHover: 'REFRESH APP',
      timeHover: 'TIME SYNC',
      printHover: 'PRINT',
      timeInstructions: 'Sync time enabled layers to any past date:',
      timeWarning: 'No time enabled data available prior to January 1, 2013'
    },
    modals: {
      noInfo: 'No Information Available',
      alerts: {
        title: 'Subscribe to GFW Alerts',
        descriptions: {
          email: 'Your email address',
          subscription: 'Name your subscription area',
          subscriptionTypes: 'Select your subscriptions'
        },
        messages: {
          formaSuccess: 'Thank you for subscribing to Forma Alerts.\nYou should receive a confirmation email soon.',
          formaFail: 'There was an error with your request to subscribe to Forma alerts.\rPlease try again later.',
          fireSuccess: 'Thank you for subscribing to Fires Alerts.\rYou should receive a confirmation email soon.',
          fireFail: 'There was an error with your request to subscribe to Fires alerts.\rPlease try again later.'
        }
      },
      canopy: {
        title: 'Adjust the minimum canopy density for tree cover  and tree cover loss',
        slider: [0, 10, 15, 20, 25, 30, 50, 75, 100]
      },
      subscription: {
        title: 'Subscribe to alerts!',
        emailInstructions: 'Enter your email(s) below to receive fire alerts. Multiple emails must be separated by commas.',
        emailPlaceholder: 'Email',
        verifyInput: 'verifyInput',
        phoneInstructions: 'Enter your phone number below to receive SMS alerts',
        phoneExplanation: 'A confirmation message will be sent to your phone.',
        emailExplanationStart: 'A confirmation email will be sent from ',
        emailExplanationDisplay: 'gfwfires@wri.org',
        emailExplanationAddress: 'mailto:gfwfires@wri.org',
        emailExplanationEnd: ' with a link to complete the sign up process.',
        emailConfirmation: 'Your request has been received. Please check your email for a confirmation message with a link to complete the subscription process.',
        phoneConfirmation: 'Your request has been received. A confirmation message will be sent to your phone.',
        phonePlaceholder: 'Phone number',
        error: 'There was a problem with subscribing. Please try again later.',
        warningTextPoints: 'You must draw or upload a shape!',
        warningTextEmail: 'You must enter a valid email address!',
        warningTextPhone: 'You must enter a valid phone number!',
        subscribeTitle: 'Subscription success!',
        subscribeFailTitle: 'Subscription error',
        successMessage: 'You have successfully subscribed. You will receive an email asking you to verify your subscription. Please be sure to check your SPAM folder. Once verified, you will start receiving alerts for your area.',
        subscribePlaceholder: 'SUBSCRIBE',
        deletePlaceholder: 'DELETE FEATURE'
      },
      share: {
        title: 'Share this view',
        linkInstructions: 'Copy and paste the link to share it or use the buttons below to share on social media.',
        copyFailure: 'Sorry, we were unable to copy this to your clipboard, please press Cmd + c on Mac or Ctrl + c on Windows/Linux.',
        copyButton: 'Copy',
        copiedButton: 'Copied',
        googleUrl: url => `https://plus.google.com/share?url=${url}`,
        twitterUrl: url => `https://twitter.com/share?url=${url}&via=gfw-fires`,
        facebookUrl: url => `https://www.facebook.com/sharer.php?u=${url}`
      },
      imagery: {

        monthsOptions: [
          { label: '4 weeks', value: 4 },
          { label: '3 months', value: 3},
          { label: '6 months', value: 6},
          { label: '12 months', value: 12}
        ],

        cloudCoverageOptions: [
          { label: '0', value: 0 },
          { label: '25', value: 25 },
          { label: '50', value: 50 },
          { label: '75', value: 75 },
          { label: '100', value: 100 }
        ],

        imageStyleOptions: [
          { label: 'Natural Color'},
          { label: 'Vegetation Health'}
        ]
      }
    },
    metadataIds: {
      'forest-change-tree-cover-loss': 'tree_cover_loss',
      'forest-change-tree-cover-gain': 'tree_cover_gain',
      'noaa18Fires': 'noaa18_fires',
      'fireWeather': 'fire_risk',
      'lastRainfall': 'last_rainfall',
      'forest-change-forma-alerts': 'forma',
      'activeFires': 'firms_active_fires',
      'viirsFires': 'viirs_fires',
      'airQuality': 'air_quality_old',
      'treeCoverDensity': 'tree_cover',
      'forest-and-land-cover-intact-forest-landscape': 'intact_forest_landscapes_change',
      'peatlands': 'idn_peat_lands',
      'forest-and-land-cover-carbon-stocks': 'tropical_forest_carbon_stocks',
      'forest-and-land-cover-brazil-biomes': 'bra_biomes',
      'primaryForests': 'idn_primary_forests',
      'forest-and-land-cover-land-cover-global': 'global_landcover',
      'forest-and-land-cover-land-cover-indonesia': 'idn_land_cover_metadata',
      'forest-and-land-cover-land-cover-south-east-asia': 'khm_economic_land_concession',
      'forest-and-land-cover-legal-classifications': 'idn_conservation_areas',
      'oilPalm': 'gfw_oil_palm',
      // 'rspoOilPalm': 'rspo_concessions',
      'rspoOilPalm': 'rspo_oil_palm',
      'land-use-rspo-consessions': 'tree_cover_loss',
      'loggingConcessions': 'gfw_logging',
      'land-use-mining': 'gfw_mining',
      'woodFiber': 'gfw_wood_fiber',
      'landsat8': 'latest_landsat',
      'digitalGlobe': 'digital_globe',
      'dg-00': 'digital_globe',
      'fireStories': 'user_stories',
      'land-use-mill-points': 'oil_palm_mills',
      'land-use-gfw-mill-points': 'rspo_mills',
      'forestMoratorium': 'idn_forest_moratorium',
      'protectedAreas': 'wdpa_protected_areas',
      'protectedAreasHelper': 'wdpa_protected_areas',
      'conservation-biodiversity-hotspots': 'biodiversity_hotspots',
      'suitability-soy-layer': 'tree_cover_loss',
      'windDirection': 'wind_direction',
      'suitability-custom-suitability-mapper': 'tree_cover_loss',
      'suitability-wri-standard-suitability': 'tree_cover_loss',
      'suitability-conservation-areas': 'idn_conservation_areas',
      'suitability-elevation': 'idn_elevation',
      'suitability-slope': 'idn_slope',
      'suitability-rainfall': 'idn_rainfall',
      'suitability-soil-drainage': 'idn_soil_drainage',
      'suitability-soil-idn_soil_depth': 'idn_soil_depth',
      'suitability-soil-acidity': 'idn_soil_acidity',
      'suitability-soil-type': 'idn_soil_type',
      'dark-gray': 'dark-gray',
      'topo': 'topo',
      'wri-basemap': 'wri-basemap',
      'satellite': 'satellite'

    },
    metadataUrl: 'https://production-api.globalforestwatch.org/v1/gfw-metadata/' //todo switch this to proper server
  }

};

// Layer Information

config.text.layerInformation[KEYS.treeCoverDensity] = {
  title: 'Tree Cover',
  subtitle: '(year 2000, 30m global, Hansen/UMD/Google/USGS/NASA)',
  table: [
    {label: 'Function', html: 'Identifies areas of tree cover'},
    {label: 'Resolution/Scale', html: '30 × 30 meters'},
    {label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)'},
    {label: 'Source Data', html: '<a href="https://landsat.usgs.gov/" target="_blank">Landsat 7 ETM+</a>'},
    {label: 'Date of Content', html: '2000'},
    {label: 'Cautions', html: 'For the purpose of this study, “tree cover” was defined as all vegetation taller than 5 meters in height. “Tree cover” is the biophysical presence of trees and may take the form of natural forests or plantations existing over a range of canopy densities.'}
  ],
  overview: [
    'This data set displays tree cover over all global land (except for Antarctica and a number of Arctic islands) for the year 2000 at 30 × 30 meter resolution. “Percent tree cover” is defined as the density of tree canopy coverage of the land surface and is color-coded by density bracket (see legend).',
    'Data in this layer were generated using multispectral satellite imagery from the <a href="https://landsat.usgs.gov/" target="_blank">Landsat 7 thematic mapper plus (ETM+)</a> sensor. The clear surface observations from over 600,000 images were analyzed using Google Earth Engine, a cloud platform for earth observation and data analysis, to determine per pixel tree cover using a supervised learning algorithm.'
  ],
  citation: [
    '<strong>Citation:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “High-Resolution Global Maps of 21st-Century Forest Cover Change.” <em>Science</em> 342 (15 November): 850–53. Data available on-line from: <a href="https://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank">https://earthenginepartners.appspot.com/science-2013-global-forest</a>.',
    '<strong>Suggested citation for data as displayed on GFW:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “Tree Cover.” University of Maryland, Google, USGS, and NASA. Accessed through Global Forest Watch on [date]. <a href="https://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
  ]
};


config.text.layerInformation[KEYS.activeFires] = {
  title: 'Firms Active Fires',
  subtitle: '(daily, 1km, global, NASA)',
  download_data: 'https://www.google.com',
  table: [
    {label: 'Function', html: 'Displays fire alert data for the past 7 days'},
    {label: 'Resolution/Scale', html: '1 × 1 kilometer'},
    {label: 'Geographic Coverage', html: 'Global'},
    {label: 'Source Data', html: '<a href="https://modis.gsfc.nasa.gov/about/" target="_blank">MODIS</a>'},
    {label: 'Date of Content', html: 'Past 7 days'},
    {label: 'Cautions', html: '<p>Not all fires are detected. There are several reasons why MODIS may not have detected a certain fire. The fire may have started and ended between satellite overpasses. The fire may have been too small or too cool to be detected in the (approximately) 1 km<sup>2</sup> pixel. Cloud cover, heavy smoke, or tree canopy may completely obscure a fire.</p><p>It is not recommended to use active fire locations to estimate burned area due to spatial and temporal sampling issues.</p><p>When zoomed out, this data layer displays some degree of inaccuracy because the data points must be collapsed to be visible on a larger scale. Zoom in for greater detail.</p>'}
  ],
  overview: [
    'The Fire Information for Resource Management System (FIRMS) delivers global MODIS-derived hotspots and fire locations. The active fire locations represent the center of a 1-kilometer pixel that is flagged by the MOD14/MYD14 Fire and Thermal Anomalies Algorithm as containing one or more fires within the pixel.',
    'The near real-time active fire locations are processed by the <a href="https://earthdata.nasa.gov/data/near-real-time-data" target="_blank">NASA Land and Atmosphere Near Real-Time Capability for EOS (LANCE)</a> using the standard MODIS Fire and Thermal Anomalies product (MOD14/MYD14). Data older than the past 7 days can be obtained from the <a href="https://earthdata.nasa.gov/data/near-real-time-data/firms/active-fire-data#tab-content-6" target="_blank">Archive Download Tool</a>. The tool provides near real-time data and, as it becomes available and is replaced with the standard NASA (MCD14ML) fire product.',
    'More information on active fire data is available from the <a href="https://earthdata.nasa.gov/data/near-real-time-data/firms" target="_blank">NASA FIRMS website</a>.'
  ],
  citation: [
    '<strong>Citation:</strong>NASA FIRMS. “NASA Fire Information for Resource Management System (FIRMS).” Accessed on [date]. <a href="earthdata.nasa.gov/data/near-real-time-data/firms" target="_blank">earthdata.nasa.gov/data/near-real-time-data/firms</a>.',
    '<strong>Suggested citation for data as displayed on GFW:</strong> “NASA Active Fires.” NASA FIRMS. Accessed through Global Forest Watch on [date]. <a href="https://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
  ]
};

config.text.layerInformation[KEYS.burnScars] = {
  title: 'Burn Scars',
  table: [
    {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
    {label: 'Resolution/Scale', html: '30 meters'},
    {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
    {label: 'Source Data', html: '<a href="https://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
    {label: 'Date of Content', html: 'May 1, 2014 - present'},
    {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
  ],
  overview: [
    'This data layer provides the extent of burn land area, or burn scars, mapped from Landsat satellite imagery, using Google Earth Engine. This analysis was conducted by the Data Lab team (Robin Kraft, Dan Hammer, and Aaron Steele) of the World Resources Institute using Google Earth Engine. This analysis will be updated regularly as additional Landsat imagery becomes available.',
    'This analysis was conducted as an open source project; code is available here:<br><a href="https://gist.github.com/robinkraft/077c14d35a50a8b31581" target="_blank">https://gist.github.com/robinkraft/077c14d35a50a8b31581</a>'
  ],
  citation: [
    '<strong>Citation:</strong>Elvidge, Christopher D. and Kimberly Baugh. 2014. Burn scar mapping from Landsat 8. Presentation at APAN meeting in Bandung, Indonesia. January 20.',
    '<strong>URL:</strong><a href="https://www.apan.net/meetings/Bandung2014/Sessions/EM/Elvidge_L8_burnscar_20140120.pdf" target="_blank">https://www.apan.net/meetings/Bandung2014/Sessions/EM/Elvidge_L8_burnscar_20140120.pdf</a>.'
  ]
};

config.text.layerInformation[KEYS.darkGrayBasemap] = {
  title: 'Dark Gray Canvas',
  table: [
    {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
    {label: 'Resolution/Scale', html: '30 meters'},
    {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
    {label: 'Source Data', html: '<a href="https://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
    {label: 'Date of Content', html: 'May 1, 2014 - present'},
    {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
  ],
  overview: [
    'This web map draws attention to your thematic content by providing a dark, neutral background with minimal colors, labels, and features.'
  ],
  citation: [
    'This work is licensed under the Web Services and API Terms of Use. <a href="https://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="https://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> '
  ]
};

config.text.layerInformation[KEYS.topoBasemap] = {
  title: 'Topographic',
  table: [
    {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
    {label: 'Resolution/Scale', html: '30 meters'},
    {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
    {label: 'Source Data', html: '<a href="https://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
    {label: 'Date of Content', html: 'May 1, 2014 - present'},
    {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
  ],
  overview: [
    'Topographic map which includes boundaries, cities, water features, physiographic features, parks, landmarks, transportation, and buildings.'
  ],
  citation: [
    'This work is licensed under the Web Services and API Terms of Use. <a href="https://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="https://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> '
  ]
};

config.text.layerInformation[KEYS.wriBasemap] = {
  title: 'World Resources Institute',
  overview: [
    'Satellite and high-resolution aerial imagery for the world with political boundaries and place names. You can turn on transportation including street names.'
  ],
  citation: [
    'This work is licensed under the Web Services and API Terms of Use. <a href="https://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="https://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> '
  ]
};

config.text.layerInformation[KEYS.imageryBasemap] = {
  title: 'World Imagery',
  table: [
    {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
    {label: 'Resolution/Scale', html: '30 meters'},
    {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
    {label: 'Source Data', html: '<a href="https://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
    {label: 'Date of Content', html: 'May 1, 2014 - present'},
    {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
  ],
  overview: [
    'Satellite and high-resolution aerial imagery for the world with political boundaries and place names. You can turn on transportation including street names.'
  ],
  citation: [
    'This work is licensed under the Web Services and API Terms of Use. <a href="https://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="https://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> '
  ]
};

// Exports
export const layerPanelText = config.text.layerPanel;
export const analysisPanelText = config.text.analysisPanel;
export const controlPanelText = config.text.controlPanel;
export const modalText = config.text.modals;
export const defaults = config.defaults;
export const uploadConfig = config.upload;
export const layersConfig = config.layers;
export const assetUrls = config.assetUrls;
export const errors = config.text.errors;
export const mapConfig = config.map;
export const symbolConfig = config.symbol;
export const analysisConfig = config.analysis;
export const metadataIds = config.text.metadataIds;
export const metadataUrl = config.text.metadataUrl;
export const alertsModalConfig = config.alertsModal;
export const fireModalConfig = config.firesModal;
export const layerInformation = config.text.layerInformation;
export const shortTermServices = config.shortTermServices;
export const urls = config.urls;
