import KEYS from 'js/constants';

export const config = {

  map: {
    id: 'map',
    options: {
      navigationMode: 'css-transforms',
      force3DTransforms: true,
      showAttribution: false,
      center: [-51, 17],
      fadeOnZoom: true,
      basemap: 'topo',
      slider: false,
      logo: false,
      zoom: 3
    },
    customBasemap: {
      url: 'https://api.tiles.mapbox.com/v4/wri.c974eefc/${level}/${col}/${row}.png?access_token=pk.eyJ1Ijoid3JpIiwiYSI6IjU3NWNiNGI4Njc4ODk4MmIyODFkYmJmM2NhNDgxMWJjIn0.v1tciCeBElMdpnrikGDrPg',
      options: {
        id: KEYS.wriBasemap,
        visible: false
      }
    },
    geometryServiceUrl: 'http://gis-gfw.wri.org/arcgis/rest/services/Utilities/Geometry/GeometryServer'
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
    dgStartDate: new window.Kalendae.moment('10/19/2015'),
    analysisStartDate: new window.Kalendae.moment().subtract(7, 'd'),
    corsEnabledServers: [
      'gis-potico.wri.org'
    ],
    calendars: [
      {
        date: new window.Kalendae.moment('10/19/2015'),
        method: 'changeImageryStart',
        domId: 'imageryStart',
        domClass: 'imagery-start'
      },
      {
        date: new window.Kalendae.moment(),
        method: 'changeImageryEnd',
        domId: 'imageryEnd',
        domClass: 'imagery-end'
      },
      {
        date: new window.Kalendae.moment().subtract(7, 'd'),
        method: 'changeAnalysisStart',
        domId: 'analysisStart',
        domClass: 'analysis-start'
      },
      {
        date: new window.Kalendae.moment(),
        method: 'changeAnalysisEnd',
        domId: 'analysisEnd',
        domClass: 'analysis-end'
      }
    ]
  },

  upload: {
    portal: 'http://www.arcgis.com/sharing/rest/content/features/generate',
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
    ionCSS: 'vendor/ion.rangeslider/css/ion.rangeSlider.css',
    ionSkinCSS: 'vendor/ion.rangeslider/css/ion.rangeSlider.skinNice.css',
    highcharts: 'http://code.highcharts.com/highcharts.js',
    highchartsExport: 'http://code.highcharts.com/modules/exporting.js',
    rangeSlider: '../vendor/ion.rangeslider/js/ion.rangeSlider.min.js'
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
  layers: [
    {
      id: KEYS.activeFires,
      order: 1,
      type: 'dynamic',
      label: 'Active Fires',
      group: 'fires',
      layerIds: [0, 1, 2, 3],
      className: 'active-fires',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/Global_Fires/MapServer',
      metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Brightness: </td><td>${BRIGHTNESS}</td></tr>' +
          '<tr><td>Confidence: </td><td>${CONFIDENCE}</td></tr>' +
          '<tr><td>Fire ID: </td><td>${fireID}</td></tr>'
      }
    },
    {
      id: KEYS.archiveFires,
      order: 1,
      type: 'feature',
      label: 'Archive fires for Indonesia',
      group: 'fires',
      layerIds: [0],
      className: 'archive-fires',
      defaultDefinitionExpression: "ACQ_DATE < date'" + new window.Kalendae.moment().subtract(1, 'w').format('M/D/YYYY') + "' AND ACQ_DATE > date'" + new window.Kalendae.moment().subtract(2, 'w').format('M/D/YYYY') + "'",
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Brightness: </td><td>${BRIGHTNESS}</td></tr>' +
          '<tr><td>Confidence: </td><td>${CONFIDENCE}</td></tr>' +
          '<tr><td>Province: </td><td>${PROVINCE}</td></tr>'
      }
    },
    {
      id: KEYS.noaa18Fires,
      order: 1,
      type: 'dynamic',
      label: 'NOAA-18 Fires',
      group: 'fires',
      layerIds: [9],
      className: 'noaa-fires',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Date: </td><td>${Date}</td></tr>' +
          '<tr><td>SNo: </td><td>${SNo}</td></tr>'
      }
    },
    {
      id: KEYS.burnScars,
      order: 1,
      type: 'dynamic',
      label: 'Active fires and burn scars',
      group: 'fires',
      layerIds: [8],
      className: 'burn-scars',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Chip Link: </td><td>${ChipLink}</td></tr>' +
          '<tr><td>Image Aquisition Date: </td><td>${ImageAquisitionDate}</td></tr>'
      }
    },
    {
      id: KEYS.fireRisk,
      order: 1,
      type: 'image',
      label: 'Fire risk',
      sublabel: '(layer starts at 4/2/15)',
      group: 'fires',
      className: 'fire-risk',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/fire_risk/ImageServer',
      metadataId: 'fire_risk',
      calendar: {
        startDate: '4/2/2015',
        currentDate: new Date('4/2/2015'),
        domId: 'fireRiskCalendar',
        domClass: 'fireRiskLegend',
        childDomClass: 'fire-risk'
      }
    },
    // TODO: crowdsourced fires
    {
      id: KEYS.forestMoratorium,
      order: 1,
      type: 'dynamic',
      label: 'Forest Moratorium',
      // TODO: hookup instructions below
      // instruction: 'The moratorium prohibits new concessions on primary forest or peatlands. Learn More.'
      sublabel: '(Indonesia)',
      group: 'forestUse',
      className: 'forest-moratorium',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/commodities/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [7]
    },
    {
      id: KEYS.oilPalm,
      order: 1,
      type: 'dynamic',
      label: 'Oil palm',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'oil-palm',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [1]
    },
    {
      id: KEYS.rspoOilPalm,
      order: 1,
      type: 'dynamic',
      label: 'RSPO oil palm',
      sublabel: '(May 2013, select countries)',
      group: 'forestUse',
      className: 'rspo-palm',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/commodities/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [4]
    },
    {
      id: KEYS.woodFiber,
      order: 1,
      type: 'dynamic',
      label: 'Wood fiber',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'wood-fiber',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [0]
    },
    {
      id: KEYS.loggingConcessions,
      order: 1,
      type: 'dynamic',
      label: 'Managed forests',
      sublabel: '(Indonesia)',
      group: 'forestUse',
      className: 'logging-concessions',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [3]
    },
    {
      id: KEYS.protectedAreas,
      order: 1,
      type: 'dynamic',
      label: 'Protected areas',
      sublabel: '(varies, global)',
      group: 'conservation',
      className: 'tree-cover',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/wdpa_protected_areas_cached/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [0]
    },
    {
      id: KEYS.peatlands,
      order: 1,
      type: 'dynamic',
      label: 'Peatlands',
      sublabel: '(year 2002, Indonesia)',
      group: 'landCover',
      className: 'tree-cover',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/commodities/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [22]
    },
    {
      id: KEYS.treeCoverDensity,
      order: 1,
      type: 'image',
      label: 'Tree cover density',
      sublabel: '(2002, Hansen/UMD/Google/USGS/NASA)',
      group: 'landCover',
      className: 'tree-cover',
      url: 'http://50.18.182.188:6080/arcgis/rest/services/TreeCover2000/ImageServer',
      metadataId: 'firms_active_fires',
      colormap: [[1, 174, 203, 107]],
      inputRange: [30, 101],
      outputRange: [1],
      opacity: 0.8
    },
    {
      id: KEYS.primaryForests,
      order: 1,
      type: 'dynamic',
      label: 'Primary Forests',
      sublabel: '(2000 - 2012, 30m, Indonesia)',
      group: 'landCover',
      className: 'primary-forests',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/primary_forest_2000to2012/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [3]
    },
    {
      id: KEYS.windDirection,
      order: 1,
      type: 'wind',
      label: 'Wind direction',
      sublabel: '(2000, 30m, Indonesia, Daily, NOAA)',
      group: 'airQuality',
      className: 'wind-direction',
      // url: 'http://suitability-mapper.s3.amazonaws.com/wind/wind-surface-level-gfs-1.0.gz.json',
      metadataId: 'wind_direction',
      calendar: {
        startDate: new Date('10/19/2014'),
        currentDate: new Date(),
        domId: 'windDirectionCalendar',
        domClass: 'windDirectionLegend',
        childDomClass: 'wind-direction'
      }
    },
    {
      id: KEYS.airQuality,
      order: 1,
      type: 'feature',
      label: 'Air Quality',
      group: 'airQuality',
      className: 'air-quality',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/AirQuality_sea/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [0]
    },
    {
      id: KEYS.landsat8,
      order: 1,
      type: 'image',
      label: 'Latest Landsat 8 Imagery',
      sublabel: '(latest image, 30m, global)',
      group: 'imagery',
      className: 'tree-cover',
      url: 'http://landsat.arcgis.com/arcgis/rest/services/Landsat8_PanSharpened/ImageServer',
      metadataId: 'firms_active_fires'
    },
    {
      id: KEYS.boundingBoxes,
      order: 1,
      type: 'feature',
      label: 'Bounding boxes',
      infoTemplate: {
        content: '<table><tr><td>Name: </td><td>${Name}</td></tr>' +
          '<tr><td>Image Aquisition Date: </td><td>${AcquisitionDate}</td></tr>'
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
           'alias': 'Name'
         }, {
           'name': 'AcquisitionDate',
           'type': 'esriFieldTypeDate',
           'alias': 'Acquisition Date'
         }, {
           'name': 'SensorName',
           'type': 'esriFieldTypeString',
           'alias': 'Sensor Name'
         }]
      },
      // group: 'imagery',
      className: 'digital-globe'
    },
    {
      id: KEYS.digitalGlobe,
      order: 1,
      subLayers: [KEYS.digitalGlobe0, KEYS.digitalGlobe1, KEYS.digitalGlobe2, KEYS.digitalGlobe3, KEYS.digitalGlobe4],
      imageServices: [
        { id: 'dg-00', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV01/ImageServer', mosaic: 'WV01' },
        { id: 'dg-01', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/QB01/ImageServer', mosaic: 'QB01' },
        { id: 'dg-02', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV02/ImageServer', mosaic: 'WV02' },
        { id: 'dg-03', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/GEO1/ImageServer', mosaic: 'GEO1' },
        { id: 'dg-04', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV03/ImageServer', mosaic: 'WV03' },
        { id: 'dg-05', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV03_SWIR/ImageServer', mosaic: 'WV03_SWIR' }
      ],
      type: 'image',
      label: 'Digital Globe - First Look',
      mosaic: 'WV01',
      // group: 'imagery',
      'minScale': 0,
      'maxScale': 10000,
      className: 'digital-globe',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV01/ImageServer',
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
      mosaic: 'QB01',
      'minScale': 0,
      'maxScale': 10000, //zoom level 6 is highest visible
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/QB01/ImageServer'
    },
    {
      id: KEYS.digitalGlobe1,
      type: 'image',
      mosaic: 'WV02',
      'minScale': 0,
      'maxScale': 10000,
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV02/ImageServer'
    },
    {
      id: KEYS.digitalGlobe2,
      type: 'image',
      mosaic: 'GEO1',
      'minScale': 0,
      'maxScale': 10000,
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/GEO1/ImageServer'
    },
    {
      id: KEYS.digitalGlobe3,
      type: 'image',
      mosaic: 'WV03',
      'minScale': 0,
      'maxScale': 10000,
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV03/ImageServer'
    },
    {
      id: KEYS.digitalGlobe4,
      type: 'image',
      mosaic: 'WV03_SWIR',
      'minScale': 0,
      'maxScale': 10000,
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV03_SWIR/ImageServer'
    },
    {
      id: KEYS.fireStories,
      order: 1,
      type: 'feature',
      label: 'Fire Stories',
      group: 'stories',
      layerIds: [10],
      className: 'tree-cover',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'firms_active_fires'
    },
    {
      id: KEYS.twitter,
      order: 1,
      type: 'feature',
      label: 'Twitter',
      group: 'stories',
      layerIds: [3],
      className: 'tree-cover',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'firms_active_fires'
    }
  ],

  symbol: {
    gfwBlue: [64, 153, 206],
    bbSymbol: [255, 0, 0],
    svgPath: 'M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z',
    pointUrl: 'http://js.arcgis.com/3.14/esri/dijit/Search/images/search-pointer.png'
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
        url: 'http://gfw-apis.appspot.com/subscribe',
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

  analysis: {
    searchZoomDefault: 10,
    requests: {
      islands: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/7/query?returnDistinctValues=true&f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=ISLAND',
        callback: 'callback'
      },
      provinces: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/7/query?returnDistinctValues=true&f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=PROVINCE',
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
      firesOptions: [

        {label: 'Past 24 hours', value: 1},
        {label: 'Past 48 hours', value: 2},
        {label: 'Past 72 hours', value: 3},
        {label: 'Past Week', value: 7}
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
      }
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
        maxLabel: 'END DATE'
      },
      imageryTabId: 'imageryTab',
      basemapTabId: 'basemapTab',
      // TODO: separate below text out of config for simple locale swapping
      searchPlaceholder: 'Search for a location',
      analysisButtonLabel: 'Run Analysis',
      analysisAreaHeader: 'Select area of interest:',
      analysisTimeframeHeader: 'Select timeframe of interest:',
      analysisTabLabel: 'Analyze Fires',
      subscriptionTabLabel: 'Subscribe',
      subscriptionButtonLabel: 'START DRAWING',
      subscriptionInstructionsOne: 'Sign up to receive ',
      subscriptionInstructionsTwo: 'fire alert emails or SMS messages',
      subscriptionInstructionsThree: ' when fires occur',
      subscriptionShapefile: 'Or drop a custom shapefile here',
      subscriptionClick: 'Click on each shape to subscribe to the area.',
      imageryTabLabel: 'View Imagery',
      imageryArea: 'Imagery',
      basemapTabLabel: 'View Basemaps',
      basemapArea: 'Basemaps'
    },
    controlPanel: {
      darkGrayBasemap: 'Dark Gray',
      topoBasemap: 'Topo',
      wriBasemap: 'WRI',
      imageryBasemap: 'Imagery'
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
        phonePlaceholder: 'Phone number',
        warningTextEmail: 'You must enter a valid email address!',
        warningTextPhone: 'You must enter a valid phone number!',
        successMessage: 'You have successfully subscribed. You will receive an email asking you to verify your subscription. Please be sure to check your SPAM folder. Once verified, you will start receiving alerts for your area.',
        subscribePlaceholder: 'Subscribe'
      },
      share: {
        title: 'Share this view',
        linkInstructions: 'Copy and paste the link to share it or use the buttons below to share on social media.',
        copyFailure: 'Sorry, we were unable to copy this to your clipboard, please press Cmd + c on Mac or Ctrl + c on Windows/Linux.',
        copyButton: 'Copy',
        copiedButton: 'Copied',
        googleUrl: url => `https://plus.google.com/share?url=${url}`,
        twitterUrl: url => `https://twitter.com/share?url=${url}&via=gfw-water`,
        facebookUrl: url => `https://www.facebook.com/sharer.php?u=${url}`
      }
    },
    metadataIds: {
      'forest-change-tree-cover-loss': 'tree_cover_loss',
      'forest-change-tree-cover-gain': 'tree_cover_gain',
      'noaa18Fires': 'noaa18_fires',
      'fireRisk': 'fire_risk',
      'forest-change-forma-alerts': 'forma',
      'activeFires': 'firms_active_fires',
      'airQuality': 'air_quality',
      'treeCoverDensity': 'tree_cover',
      'forest-and-land-cover-intact-forest-landscape': 'intact_forest_landscapes_change',
      'peatlands': 'idn_peat_lands',
      'forest-and-land-cover-carbon-stocks': 'tropical_forest_carbon_stocks',
      'forest-and-land-cover-brazil-biomes': 'bra_biomes',
      'forest-and-land-cover-primary-forest': 'idn_primary_forests',
      'forest-and-land-cover-land-cover-global': 'global_landcover',
      'forest-and-land-cover-land-cover-indonesia': 'idn_land_cover_metadata',
      'forest-and-land-cover-land-cover-south-east-asia': 'khm_economic_land_concession',
      'forest-and-land-cover-legal-classifications': 'idn_conservation_areas',
      'oilPalm': 'gfw_oil_palm',
      'land-use-rspo-consessions': 'tree_cover_loss',
      'loggingConcessions': 'gfw_logging',
      'land-use-mining': 'gfw_mining',
      'woodFiber': 'gfw_wood_fiber',
      'landsat8': 'landsat',
      'fireStories': 'user_stories',
      'land-use-mill-points': 'oil_palm_mills',
      'land-use-gfw-mill-points': 'rspo_mills',
      'forestMoratorium': 'idn_forest_moratorium',
      'protectedAreas': 'wdpa_protected_areas',
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
    metadataUrl: 'http://api.globalforestwatch.org/metadata/' //todo switch this to proper server
  }

};

// Layer Information
// // config.text.layerInformation[KEYS.sediment] = {};
//
// config.text.layerInformation[KEYS.landCover] = {
//   title: 'Land Cover',
//   table: [
//     {label: 'Function', html: 'Displays land cover classified by type.'},
//     {label: 'Resolution/Scale', html: '300m'},
//     {label: 'Geographic Coverage', html: 'Global'},
//     {label: 'Source Data', html: 'GlobCover Land Cover v2 2008'},
//     {label: 'Frequency of Updates', html: 'None'},
//     {label: 'Date of Content', html: '2008'},
//     {label: 'Cautions', html: 'Unmasked clouds may remain in the imagery. Additionally some pixels surrounding permanent snow areas may appear as snow even during no-snow periods. Some water masking occurs in which land is clipped in inland water areas, and the process for removing haze leaves some areas with patchy step changes. Last, some bright surface areas that appear as strong reflectors or deserts may be omitted as clouds.'}
//   ],
//   overview: [
//     'At 300 m resolution, GlobCover Land Cover v2 provides high resolution imagery of global land cover. The data contain 22 classes of land cover, drawing on the UN Land Cover Classification System. Satellite imagery comes from the ENVISAT satellite mission’s MERIS sensor, covering the period from December 2004 to June 2006.'
//   ],
//   citation: [
//     '<strong>Citation:</strong>Bontemps, Sophie, Pierre Defourney, Eric Van Bogaert, Olivier Arion, Vasileios Kalogirou, and Jose Ramos Perez. 2009. “GLOBCOVER 2009: Product Description and Validation Report.” Available online at: <a href="http://dup.esrin.esa.int/page_globcover.php" target="_blank">http://dup.esrin.esa.int/page_globcover.php</a>'
//   ]
// };
//
// config.text.layerInformation[KEYS.wetlands] = {
//   title: 'Lakes and Wetlands',
//   table: [
//     {label: 'Function', html: 'This datasets shows global distribution of large lakes and reservoirs, smaller water bodies, and wetlands.'},
//     {label: 'Resolution/Scale', html: '30 x 30 arc second'},
//     {label: 'Geographic Coverage', html: 'Global '},
//     {label: 'Source Data', html: 'WWF Global Lakes and Wetlands Database'},
//     {label: 'Frequency of Updates', html: 'None planned'},
//     {label: 'Date of Content', html: '2004'},
//     {label: 'Cautions', html: 'The extent of wetlands and lakes may vary seasonally. The dataset may serve as an estimate of maximum extents of wetlands and to identify large-scale wetland distribution and important wetland complexes.'},
//     {label: 'License', html: ''}
//   ],
//   overview: [
//     '<a href="https://www.worldwildlife.org/pages/global-lakes-and-wetlands-database" target="_blank" alt="The Global Lakes and Wetlands Database">The Global Lakes and Wetlands Database</a> combines best available sources for lakes and wetlands on a global scale (1:1 to 1:3 million resolution), and the application of GIS functionality enabled the generation of a database on: 3067 large lakes (area >=50 km2) and reservoirs (storage capacity ≥ 0.5 km3), permanent open water bodies with a surface area ≥ 0.1 km2, and maximum extents and types of wetlands.'
//   ],
//   citation: [
//     '<strong>Citation:</strong>Lehner, B. and Döll, P. (2004): Development and validation of a global database of lakes, reservoirs and wetlands. Journal of Hydrology 296/1-4: 1-22.'
//   ]
// };
//
// config.text.layerInformation[KEYS.waterIntake] = {
//   title: 'Urban water intake',
//   table: [
//     {label: 'Function', html: 'Identifies water withdrawal locations for over 250 cities with a population greater than 750,000.'},
//     {label: 'Resolution/Scale', html: 'Varies by country'},
//     {label: 'Geographic Coverage', html: 'This data set is not global. The data is confined to over 250  cities with a population greater than 750,000.'},
//     {label: 'Source Data', html: 'Water withdrawal locations for over 250 cities with population greater than 750,000 were identified, which were surveyed as part of the World Urbanization Prospects (<a href="http://www.un.org/en/development/desa/population/publications/pdf/urbanization/WUP2011_Report.pdf" target="_blank">UNPD, 2011</a>). Water withdrawal locations were identified through research on water utilities or agencies and their annual reports. For each withdrawal location, spatial location was recorded. For freshwater withdrawal points, they were adjusted to match the underlying hydrographic river system.'},
//     {label: 'Frequency of Updates', html: 'As new data becomes available'},
//     {label: 'Date of Content', html: '2014'},
//     {label: 'Cautions', html: 'Information is restricted by availability. Some cases of interbasin transfer for water supply may not be reflected.'},
//     {label: 'License', html: ''}
//   ],
//   overview: [
//     'This data set contains over 1000 water withdrawal locations determined by latitude and longitude coordinates from the first global survey of the water sources for over 250 large cities (population >750,000). The data set was created and published by The Nature Conservancy in 2014. These locations come from research on water utilities and their annual reports. The locations were recorded as accurately as possible and freshwater withdrawal points were adjusted to match the underlying hydrographic river system. Some withdrawal points serve multiple water utilities and cities.'
//   ],
//   citation: [
//     '<strong>Citation:</strong>Robert I. McDonald, Katherine Weber, Julie Padowski, Martina Flörke, Christof Schneider, Pamela A. Green, Thomas Gleeson, Stephanie Eckman, Bernhard Lehner, Deborah Balk, Timothy Boucher, Günther Grill, Mark Montgomery, Water on an urban planet: Urbanization and the reach of urban water infrastructure, Global Environmental Change, Volume 27, July 2014, Pages 96-105, ISSN 0959-3780, <a href="http://dx.doi.org/10.1016/j.gloenvcha.2014.04.022" target="_blank">http://dx.doi.org/10.1016/j.gloenvcha.2014.04.022</a>.<a href="http://www.sciencedirect.com/science/article/pii/S0959378014000880" target="_blank">(http://www.sciencedirect.com/science/article/pii/S0959378014000880)</a>'
//   ]
// };
//
// config.text.layerInformation[KEYS.waterStress] = {
//   title: 'Baseline Water Stress',
//   table: [
//     {label: 'Function', html: 'This dataset measures relative water demand. Higher values indicate more competition among users.'},
//     {label: 'Resolution/Scale', html: ''},
//     {label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)'},
//     {label: 'Source Data', html: '<p>Based on a combination of various sources: Food and Agriculture Organization of the United Nations (FAO) AQUASTAT 2008-2012, National Aeronautics and Space Administration (NASA) GLDAS-2 2012, <a href="http://catdir.loc.gov/catdir/samples/cam034/2002031201.pdf" alt="Shiklomanov and Rodda 2004">Shiklomanov and Rodda 2004</a>, <a href="http://www.sciencedirect.com/science/article/pii/S0959378012001318" alt="Flörke et al. 2012">Flörke et al. 2012</a>, and <a href="http://www.cger.nies.go.jp/db/gdbd/" alt="cger">Matsutomi et al. 2009</a>.</p>'},
//     {label: 'Frequency of Updates', html: 'None planned'},
//     {label: 'Date of Content', html: '2014'},
//     {label: 'Cautions', html: 'The scoring of baseline water stress indicators, based on established guidelines, is subjective. Meanings were assigned to the ratio values. To understand the relationship between raw values and categories, see description below.'},
//     {label: 'License', html: ''}
//   ],
//   overview: [
//     'Baseline water stress (BWS) measures the ratio of total annual water withdrawals (Ut) to total available annual renewable supply (Ba), accounting for upstream consumptive use. A long time series of supply (1950–2010) was used to reduce the effect of multi-year climate cycles and ignore complexities of short-term water storage (e.g., dams, floodplains) for which global operational data is nonexistent. Baseline water stress thus measures chronic stress rather than drought stress. Catchments with less than 0.012 m/m2 /year of withdrawal and 0.03 m/m2 /year of available blue water was masked as “arid and low water use” since catchments with low values were more prone to error in the estimates of baseline water stress. Additionally, although current use in such catchments is low, any new withdrawals could easily push them into higher stress categories.',
//     'The raw indicator value (r) is calculated using the following function:',
//     'r(BWS) = Ut(2010)/mean[1950,2010](Ba)',
//     'The raw indictor values are normalized over a set of thresholds that were chosen to divide raw indicators into five categories. The thresholds for BWS reflect those used by other withdrawal-to-availability indicators. Raw values were normalized to scores x between 0 and 5, using the following continuous function:',
//     'x = max(0, min(5, [(ln(r) – ln(0.1))/ln(2)]+1))',
//     'Raw values of BWS of less than 10% correspond to the lowest category (x=<1) and raw values of greater than 80% correspond to the highest category (x>4).'
//   ],
//   moreContent: [
//     '<p class="read-more"><em><a href="http://www.wri.org/our-work/project/aqueduct" target="_blank">Click to learn more about the Aqueduct Project</a></em></p>'
//   ]
// };
//
// config.text.layerInformation[KEYS.treeCover] = {
//   title: 'Tree Cover',
//   subtitle: '(year 2000, 30m global, Hansen/UMD/Google/USGS/NASA)',
//   table: [
//     {label: 'Function', html: 'Identifies areas of tree cover'},
//     {label: 'Resolution/Scale', html: '30 × 30 meters'},
//     {label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)'},
//     {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/" target="_blank">Landsat 7 ETM+</a>'},
//     {label: 'Date of Content', html: '2000'},
//     {label: 'Cautions', html: 'For the purpose of this study, “tree cover” was defined as all vegetation taller than 5 meters in height. “Tree cover” is the biophysical presence of trees and may take the form of natural forests or plantations existing over a range of canopy densities.'}
//   ],
//   overview: [
//     'This data set displays tree cover over all global land (except for Antarctica and a number of Arctic islands) for the year 2000 at 30 × 30 meter resolution. “Percent tree cover” is defined as the density of tree canopy coverage of the land surface and is color-coded by density bracket (see legend).',
//     'Data in this layer were generated using multispectral satellite imagery from the <a href="http://landsat.usgs.gov/" target="_blank">Landsat 7 thematic mapper plus (ETM+)</a> sensor. The clear surface observations from over 600,000 images were analyzed using Google Earth Engine, a cloud platform for earth observation and data analysis, to determine per pixel tree cover using a supervised learning algorithm.'
//   ],
//   citation: [
//     '<strong>Citation:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “High-Resolution Global Maps of 21st-Century Forest Cover Change.” <em>Science</em> 342 (15 November): 850–53. Data available on-line from: <a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank">http://earthenginepartners.appspot.com/science-2013-global-forest</a>.',
//     '<strong>Suggested citation for data as displayed on GFW:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “Tree Cover.” University of Maryland, Google, USGS, and NASA. Accessed through Global Forest Watch on [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
//   ]
// };
//
// config.text.layerInformation[KEYS.loss] = {
//   title: 'Tree Cover Loss',
//   subtitle: '(annual, 30m, global, Hansen/UMD/Google/USGS/NASA)',
//   table: [
//     {label: 'Function', html: 'Identifies areas of gross tree cover loss'},
//     {label: 'Resolution/Scale', html: '30 × 30 meters'},
//     {label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)'},
//     {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
//     {label: 'Frequency of Updates', html: 'Annual'},
//     {label: 'Date of Content', html: '2001–2014'},
//     {label: 'Cautions', html: '<p>This data layer was updated in January 2015 to extend the tree cover loss analysis to 2013, and in August 2015 to extend the tree cover loss analysis to 2014. The updates include new data for the target year and re-processed data for the previous two years (2011 and 2012 for the 2013 update, 2012 and 2013 for the 2014 update). The re-processing increased the amount of change that could be detected, resulting in some changes in calculated tree cover loss for 2011-2013 compared to the previous versions. Calculated tree cover loss for 2001-2010 remains unchanged. The integrated use of the original 2001-2012 (Version 1.0) data and the updated 2011–2014 (Version 1.1) data should be performed with caution.</p><p>For the purpose of this study, “tree cover” was defined as all vegetation taller than 5 meters in height. “Tree cover” is the biophysical presence of trees and may take the form of natural forests or plantations existing over a range of canopy densities. “Loss” indicates the removal or mortality of tree canopy cover and can be due to a variety of factors, including mechanical harvesting, fire, disease, or storm damage. As such, “loss” does not equate to deforestation.</p><p>When zoomed out (&lt; zoom level 13), pixels of loss are shaded according to the density of loss at the 30 x 30 meter scale. Pixels with darker shading represent areas with a higher concentration of tree cover loss, whereas pixels with lighter shading indicate a lower concentration of tree cover loss. There is no variation in pixel shading when the data is at full resolution (≥ zoom level 13).</p>'}
//   ],
//   overview: [
//     'This data set measures areas of tree cover loss across all global land (except Antarctica and other Arctic islands) at approximately 30 × 30 meter resolution. The data were generated using multispectral satellite imagery from the <a href="http://landsat.usgs.gov/about_landsat5.php" target="_blank">Landsat 5</a> thematic mapper (TM), the <a href="http://landsat.usgs.gov/science_L7_cpf.php" target="_blank">Landsat 7</a> thematic mapper plus (ETM+), and the <a href="" target="_blank">Landsat 8</a> Operational Land Imager (OLI) sensors. Over 1 million satellite images were processed and analyzed, including over 600,000 Landsat 7 images for the 2000-2012 interval, and approximately 400,000 Landsat 5, 7, and 8 images for updates for the 2011-2014 interval. The clear land surface observations in the satellite images were assembled and a supervised learning algorithm was applied to identify per pixel tree cover loss.',
//     'Tree cover loss is defined as “stand replacement disturbance,” or the complete removal of tree cover canopy at the Landsat pixel scale. Tree cover loss may be the result of human activities, including forestry practices such as timber harvesting or deforestation (the conversion of natural forest to other land uses), as well as natural causes such as disease or storm damage. Fire is another widespread cause of tree cover loss, and can be either natural or human-induced.',
//     '<strong>2015 Update (Version 1.1)</strong>',
//     'This data set has been updated twice since its creation, and now includes loss up to 2014. The analysis method has been modified in numerous ways, and the update should be seen as part of a transition to a future “version 2.0” of this data set that is more consistent over the entire 2001 and onward period. Key changes include:',
//     [
//       'The use of Landsat 8 data for 2013-2014 and Landsat 5 data for 2011-2012',
//       'The reprocessing of data from the previous two years in measuring loss (2011 and 2012 for the 2013 update, 2012 and 2013 for the 2014 update)',
//       'Improved training data for calibrating the loss model',
//       'Improved per sensor quality assessment models to filter input data',
//       'Improved input spectral features for building and applying the loss model'
//     ],
//     'These changes lead to a different and improved detection of global tree cover loss. However, the years preceding 2011 have not yet been reprocessed with the revised analysis methods, and users will notice inconsistencies between versions 1.0 (2001-2012) and 1.1 (2011-2014) as a result. It must also be noted that a full validation of the results incorporating Landsat 8 has not been undertaken. Such an analysis may reveal a more sensitive ability to detect and map forest disturbance using Landsat 8 data. If this is the case then there will be a more fundamental limitation to the consistency of this data set before and after the inclusion of Landsat 8 data. Validation of Landsat 8-incorporated loss detection is planned.',
//     'Some examples of improved change detection in the 2011–2014 update include the following:',
//     [
//       'Improved detection of boreal forest loss due to fire',
//       'Improved detection of smallholder rotation agricultural clearing in dry and humid tropical forests',
//       'Improved detection of selective logging'
//     ],
//     'These are examples of dynamics that may be differentially mapped over the 2011-2014 period in Version 1.1. A version 2.0 reprocessing of the 2001 and onward record is planned, but no delivery date is yet confirmed.',
//     'The original version 1.0 data remains available for download <a href="http://earthenginepartners.appspot.com/science-2013-global-forest/download_v1.0.html" target="_blank">here</a>.'
//   ],
//   citation: [
//     '<strong>Citation:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “High-Resolution Global Maps of 21st-Century Forest Cover Change.” Science 342 (15 November): 850–53. Data available online from: <a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank">http://earthenginepartners.appspot.com/science-2013-global-forest</a>.',
//     '<strong>Suggested citation for data as displayed on GFW:</strong>Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “Hansen/UMD/Google/USGS/NASA Tree Cover Loss and Gain Area.” University of Maryland, Google, USGS, and NASA. Accessed through Global Forest Watch on [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
//   ]
// };
//
// config.text.layerInformation[KEYS.gain] = {
//   title: 'Tree Cover Gain',
//   subtitle: '(12 years, 30m, global, Hansen/UMD/Google/USGS/NASA)',
//   table: [
//     {label: 'Function', html: 'Identifies areas of tree cover gain'},
//     {label: 'Resolution/Scale', html: '30 × 30 meters'},
//     {label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)'},
//     {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/" target="_blank">Landsat 7 ETM+</a>'},
//     {label: 'Frequency of Updates', html: 'Every three years'},
//     {label: 'Date of Content', html: '2001 - 2012'},
//     {label: 'Cautions', html: '<p>For the purpose of this study, “tree cover” was defined as all vegetation taller than 5 meters in height. “Tree cover” is the biophysical presence of trees and may take the form of natural forests or plantations existing over a range of canopy densities. “Loss” indicates the removal or mortality of tree canopy cover and can be due to a variety of factors, including mechanical harvesting, fire, disease, or storm damage. As such, “loss” does not equate to deforestation.</p><p>When zoomed out (&lt; zoom level 13), pixels of gain are shaded according to the density of gain at the 30 x 30 meter scale. Pixels with darker shading represent areas with a higher concentration of tree cover gain, whereas pixels with lighter shading indicate a lower concentration of tree cover gain. There is no variation in pixel shading when the data is at full resolution (≥ zoom level 13).</p><p>A validation assessment of the 2000 – 2012 Hansen/UMD/Google/USGS/NASA change data was carried out independently from the mapping exercise at the global and biome (tropical, subtropical, temperate, and boreal) scale. A stratified random sample (for no change, loss, and gain) of 1500 blocks, each 120 × 120 meters, was used as validation data.  The amount of tree cover gain within each block was estimated using Landsat, MODIS, and Google Earth high-resolution imagery and compared to the map. Overall accuracies for gain were over 99.5% globally and for all biomes. However, since the overall accuracy calculations are positively skewed due to the high percentage of no change pixels, it is also important to assess the accuracy of the change predictions. The user’s accuracy (i.e. the percentage of pixels labelled as tree cover gain that actually gained tree cover) was 87.8% at the global level. At the biome level, user’s accuracies were 81.9%, 85.5%, 62.0%, and 76.7% for the tropical, subtropical, temperate, and boreal biomes, respectively.</p>'}
//   ],
//   overview: [
//     'This data set measures areas of tree cover gain across all global land (except Antarctica and other Arctic islands) at 30 × 30 meter resolution, displayed as a 12-year cumulative layer. The data were generated using multispectral satellite imagery from the <a href="http://landsat.usgs.gov/science_L7_cpf.php" target="_blank">Landsat 7 thematic mapper plus (ETM+)</a> sensor. Over 600,000 Landsat 7 images were compiled and analyzed using Google Earth Engine, a cloud platform for earth observation and data analysis. The clear land surface observations (30 × 30 meter pixels) in the satellite images were assembled and a supervised learning algorithm was then applied to identify per pixel tree cover gain.',
//     'Tree cover gain was defined as the establishment of tree canopy at the Landsat pixel scale in an area that previously had no tree cover. Tree cover gain may indicate a number of potential activities, including natural forest growth or the crop rotation cycle of tree plantations.'
//   ],
//   citation: [
//     '<strong>Citation:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “High-Resolution Global Maps of 21st-Century Forest Cover Change.” Science 342 (15 November): 850–53. Data available on-line from: <a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank">http://earthenginepartners.appspot.com/science-2013-global-forest</a>.',
//     '<strong>Suggested citations for data as displayed on GFW:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “Hansen/UMD/Google/USGS/NASA Tree Cover Loss and Gain Area.” University of Maryland, Google, USGS, and NASA. Accessed through Global Forest Watch on  [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
//   ]
// };
//
// config.text.layerInformation[KEYS.activeFires] = {
//   title: 'Firms Active Fires',
//   subtitle: '(daily, 1km, global, NASA)',
//   table: [
//     {label: 'Function', html: 'Displays fire alert data for the past 7 days'},
//     {label: 'Resolution/Scale', html: '1 × 1 kilometer'},
//     {label: 'Geographic Coverage', html: 'Global'},
//     {label: 'Source Data', html: '<a href="http://modis.gsfc.nasa.gov/about/" target="_blank">MODIS</a>'},
//     {label: 'Date of Content', html: 'Past 7 days'},
//     {label: 'Cautions', html: '<p>Not all fires are detected. There are several reasons why MODIS may not have detected a certain fire. The fire may have started and ended between satellite overpasses. The fire may have been too small or too cool to be detected in the (approximately) 1 km<sup>2</sup> pixel. Cloud cover, heavy smoke, or tree canopy may completely obscure a fire.</p><p>It is not recommended to use active fire locations to estimate burned area due to spatial and temporal sampling issues.</p><p>When zoomed out, this data layer displays some degree of inaccuracy because the data points must be collapsed to be visible on a larger scale. Zoom in for greater detail.</p>'}
//   ],
//   overview: [
//     'The Fire Information for Resource Management System (FIRMS) delivers global MODIS-derived hotspots and fire locations. The active fire locations represent the center of a 1-kilometer pixel that is flagged by the MOD14/MYD14 Fire and Thermal Anomalies Algorithm as containing one or more fires within the pixel.',
//     'The near real-time active fire locations are processed by the <a href="https://earthdata.nasa.gov/data/near-real-time-data" target="_blank">NASA Land and Atmosphere Near Real-Time Capability for EOS (LANCE)</a> using the standard MODIS Fire and Thermal Anomalies product (MOD14/MYD14). Data older than the past 7 days can be obtained from the <a href="https://earthdata.nasa.gov/data/near-real-time-data/firms/active-fire-data#tab-content-6" target="_blank">Archive Download Tool</a>. The tool provides near real-time data and, as it becomes available and is replaced with the standard NASA (MCD14ML) fire product.',
//     'More information on active fire data is available from the <a href="https://earthdata.nasa.gov/data/near-real-time-data/firms" target="_blank">NASA FIRMS website</a>.'
//   ],
//   citation: [
//     '<strong>Citation:</strong>NASA FIRMS. “NASA Fire Information for Resource Management System (FIRMS).” Accessed on [date]. <a href="earthdata.nasa.gov/data/near-real-time-data/firms" target="_blank">earthdata.nasa.gov/data/near-real-time-data/firms</a>.',
//     '<strong>Suggested citation for data as displayed on GFW:</strong> “NASA Active Fires.” NASA FIRMS. Accessed through Global Forest Watch on [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
//   ]
// };
//
// config.text.layerInformation[KEYS.burnScars] = {
//   title: 'Burn Scars',
//   table: [
//     {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
//     {label: 'Resolution/Scale', html: '30 meters'},
//     {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
//     {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
//     {label: 'Date of Content', html: 'May 1, 2014 - present'},
//     {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
//   ],
//   overview: [
//     'This data layer provides the extent of burn land area, or burn scars, mapped from Landsat satellite imagery, using Google Earth Engine. This analysis was conducted by the Data Lab team (Robin Kraft, Dan Hammer, and Aaron Steele) of the World Resources Institute using Google Earth Engine. This analysis will be updated regularly as additional Landsat imagery becomes available.',
//     'This analysis was conducted as an open source project; code is available here:<br><a href="https://gist.github.com/robinkraft/077c14d35a50a8b31581" target="_blank">https://gist.github.com/robinkraft/077c14d35a50a8b31581</a>'
//   ],
//   citation: [
//     '<strong>Citation:</strong>Elvidge, Christopher D. and Kimberly Baugh. 2014. Burn scar mapping from Landsat 8. Presentation at APAN meeting in Bandung, Indonesia. January 20.',
//     '<strong>URL:</strong><a href="http://www.apan.net/meetings/Bandung2014/Sessions/EM/Elvidge_L8_burnscar_20140120.pdf" target="_blank">http://www.apan.net/meetings/Bandung2014/Sessions/EM/Elvidge_L8_burnscar_20140120.pdf</a>.'
//   ]
// };

config.text.layerInformation[KEYS.darkGrayBasemap] = {
  title: 'Dark Gray Canvas',
  table: [
    {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
    {label: 'Resolution/Scale', html: '30 meters'},
    {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
    {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
    {label: 'Date of Content', html: 'May 1, 2014 - present'},
    {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
  ],
  overview: [
    'This web map draws attention to your thematic content by providing a dark, neutral background with minimal colors, labels, and features.'
  ],
  citation: [
    'This work is licensed under the Web Services and API Terms of Use. <a href="http://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="http://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> '
  ]
};

config.text.layerInformation[KEYS.topoBasemap] = {
  title: 'Topographic',
  table: [
    {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
    {label: 'Resolution/Scale', html: '30 meters'},
    {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
    {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
    {label: 'Date of Content', html: 'May 1, 2014 - present'},
    {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
  ],
  overview: [
    'Topographic map which includes boundaries, cities, water features, physiographic features, parks, landmarks, transportation, and buildings.'
  ],
  citation: [
    'This work is licensed under the Web Services and API Terms of Use. <a href="http://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="http://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> '
  ]
};

config.text.layerInformation[KEYS.wriBasemap] = {
  title: 'World Resources Institute',
  // table: [
  //   {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
  //   {label: 'Resolution/Scale', html: '30 meters'},
  //   {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
  //   {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
  //   {label: 'Date of Content', html: 'May 1, 2014 - present'},
  //   {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
  // ],
  overview: [
    'Satellite and high-resolution aerial imagery for the world with political boundaries and place names. You can turn on transportation including street names.'
  ],
  citation: [
    'This work is licensed under the Web Services and API Terms of Use. <a href="http://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="http://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> '
  ]
};

config.text.layerInformation[KEYS.imageryBasemap] = {
  title: 'World Imagery',
  table: [
    {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
    {label: 'Resolution/Scale', html: '30 meters'},
    {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
    {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
    {label: 'Date of Content', html: 'May 1, 2014 - present'},
    {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
  ],
  overview: [
    'Satellite and high-resolution aerial imagery for the world with political boundaries and place names. You can turn on transportation including street names.'
  ],
  citation: [
    'This work is licensed under the Web Services and API Terms of Use. <a href="http://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="http://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> '
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
export const layerInformation = config.text.layerInformation;
