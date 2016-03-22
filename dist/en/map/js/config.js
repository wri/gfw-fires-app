define(['exports', 'js/constants'], function (exports, _constants) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.layerInformation = exports.fireModalConfig = exports.alertsModalConfig = exports.metadataUrl = exports.metadataIds = exports.analysisConfig = exports.symbolConfig = exports.mapConfig = exports.errors = exports.assetUrls = exports.layersConfig = exports.uploadConfig = exports.defaults = exports.modalText = exports.controlPanelText = exports.analysisPanelText = exports.layerPanelText = exports.config = undefined;

  var _constants2 = _interopRequireDefault(_constants);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var config = exports.config = {

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
          id: _constants2.default.wriBasemap,
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
      activeBasemap: _constants2.default.topoBasemap,
      todaysDate: new window.Kalendae.moment(),
      yesterday: new window.Kalendae.moment().subtract(1, 'd'),
      dgStartDate: new window.Kalendae.moment('10/19/2015'),
      archiveStartDate: new window.Kalendae.moment('01/01/2013'),
      archiveInitialDate: new window.Kalendae.moment().subtract(14, 'd'),
      noaaStartDate: new window.Kalendae.moment('10/22/2014'),
      riskStartDate: new window.Kalendae.moment('04/02/2015'),
      riskTempEnd: new window.Kalendae.moment('02/17/2016'),
      airQStartDate: new window.Kalendae.moment('09/25/2015'),
      windStartDate: new window.Kalendae.moment('10/19/2014'),
      analysisStartDate: new window.Kalendae.moment().subtract(7, 'd'),
      corsEnabledServers: ['gis-potico.wri.org'],
      calendars: [{
        date: new window.Kalendae.moment(), //('10/19/2015'),
        method: 'changeImageryStart',
        direction: 'past',
        startDate: new window.Kalendae.moment('10/19/2015'),
        domId: 'imageryStart',
        domClass: 'imagery-start'
      }, {
        date: new window.Kalendae.moment(),
        method: 'changeImageryEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment('10/19/2015'),
        domId: 'imageryEnd',
        domClass: 'imagery-end'
      }, {
        date: new window.Kalendae.moment().subtract(7, 'd'),
        method: 'changeAnalysisStart',
        direction: 'past',
        startDate: new window.Kalendae.moment('01/01/2013'),
        domId: 'analysisStart',
        domClass: 'analysis-start'
      }, {
        date: new window.Kalendae.moment(),
        method: 'changeAnalysisEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment('01/01/2013'),
        domId: 'analysisEnd',
        domClass: 'analysis-end'
      }, {
        date: new window.Kalendae.moment().subtract(14, 'd'), //'01/01/2013'),
        method: 'changeArchiveStart',
        direction: 'past',
        startDate: new window.Kalendae.moment('01/01/2013'),
        domId: 'archiveStart',
        domClass: 'archive-start'
      }, {
        date: new window.Kalendae.moment().subtract(7, 'd'),
        method: 'changeArchiveEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment('01/01/2013'),
        domId: 'archiveEnd',
        domClass: 'archive-end'
      }, {
        date: new window.Kalendae.moment(), //('10/22/2014'),
        method: 'changeNoaaStart',
        direction: 'past',
        startDate: new window.Kalendae.moment('10/22/2014'),
        domId: 'noaaStart',
        domClass: 'noaa-start'
      }, {
        date: new window.Kalendae.moment(),
        method: 'changeNoaaEnd',
        direction: 'past',
        startDate: new window.Kalendae.moment('10/22/2014'),
        domId: 'noaaEnd',
        domClass: 'noaa-end'
      }, {
        date: new window.Kalendae.moment('02/17/2016'),
        method: 'changeRisk',
        direction: 'past',
        startDate: new window.Kalendae.moment('04/02/2015'),
        domId: 'risk',
        domClass: 'risk'
      }, {
        date: new window.Kalendae.moment(), //'10/19/2014'),
        method: 'changeWind',
        direction: 'past',
        startDate: new window.Kalendae.moment('10/19/2014'),
        domId: 'wind',
        domClass: 'wind'
      }, {
        date: new window.Kalendae.moment(), //'09/25/2015'),
        method: 'changeAirQ',
        direction: 'past',
        startDate: new window.Kalendae.moment('09/25/2015'),
        domId: 'airQ',
        domClass: 'airQ'
      }, {
        date: new window.Kalendae.moment(),
        method: 'changeMaster',
        direction: 'past',
        startDate: new window.Kalendae.moment('01/01/2013'),
        domId: 'masterDay',
        domClass: 'master-day'
      }]
    },

    upload: {
      portal: 'http://www.arcgis.com/sharing/rest/content/features/generate',
      infoTemplate: {
        content: '<table><tr><td>Name: </td><td>${featureName}</td></tr></table>' + '<button>Subscribe</button>' + '<button>Remove</button>'
      },
      shapefileParams: function shapefileParams(name, spatialReference, extentWidth, mapWidth) {
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
      shapefileContent: function shapefileContent(params, filetype) {
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
      highcharts: 'http://code.highcharts.com/highcharts.js',
      highchartsExport: 'http://code.highcharts.com/modules/exporting.js',
      rangeSlider: '../vendors/ion.rangeslider/js/ion.rangeSlider.min.js'
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
    layers: [{
      id: _constants2.default.activeFires,
      order: 1,
      type: 'dynamic',
      label: 'Active Fires',
      group: 'fires',
      layerIds: [0, 1, 2, 3],
      className: 'active-fires',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/Global_Fires/MapServer',
      metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Brightness: </td><td>${BRIGHTNESS}</td></tr>' + '<tr><td>Confidence: </td><td>${CONFIDENCE}</td></tr>' + '<tr><td>Fire ID: </td><td>${fireID}</td></tr>'
      }
    }, {
      id: _constants2.default.archiveFires,
      order: 1,
      type: 'dynamic',
      label: 'Archive fires for Indonesia',
      sublabel: '(layer starts at 01/01/13)',
      group: 'fires',
      layerIds: [0],
      className: 'archive-fires',
      defaultDefinitionExpression: "ACQ_DATE < date'" + new window.Kalendae.moment().subtract(1, 'w').format('M/D/YYYY') + "' AND ACQ_DATE > date'" + new window.Kalendae.moment().subtract(2, 'w').format('M/D/YYYY') + "'",
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      // metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Brightness: </td><td>${BRIGHTNESS}</td></tr>' + '<tr><td>Confidence: </td><td>${CONFIDENCE}</td></tr>' + '<tr><td>Province: </td><td>${PROVINCE}</td></tr>'
      },
      calendar: {
        // startDate: new Date('10/19/2015'),
        // currentDate: new Date(),
        // domId: 'imageryCalendar',
        domClass: 'archive-settings',
        childDomClass: 'archive-subsettings',
        minLabel: 'From',
        maxLabel: 'To'
      }
    }, {
      id: _constants2.default.noaa18Fires,
      order: 1,
      type: 'dynamic',
      label: 'NOAA-18 Fires',
      sublabel: '(layer starts at 10/22/14)',
      group: 'fires',
      layerIds: [9],
      className: 'noaa-fires',
      defaultDefinitionExpression: "Date < date'" + new window.Kalendae.moment().format('M/D/YYYY') + "' AND Date > date'" + new window.Kalendae.moment().subtract(1, 'w').format('M/D/YYYY') + "'",
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Date: </td><td>${Date}</td></tr>' + '<tr><td>SNo: </td><td>${SNo}</td></tr>'
      },
      calendar: {
        domClass: 'noaa-settings',
        childDomClass: 'noaa-subsettings',
        minLabel: 'From',
        maxLabel: 'To'
      }
    }, {
      id: _constants2.default.burnScars,
      order: 1,
      type: 'dynamic',
      label: 'Active fires and burn scars',
      group: 'fires',
      layerIds: [8],
      className: 'burn-scars',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      // metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Chip Link: </td><td>${ChipLink}</td></tr>' + '<tr><td>Image Aquisition Date: </td><td>${ImageAquisitionDate}</td></tr>'
      }
    }, {
      id: _constants2.default.fireRisk,
      order: 1,
      type: 'image',
      label: 'Fire risk',
      sublabel: '(layer starts at 4/2/15)',
      group: 'fires',
      className: 'fire-risk',
      disabled: true,
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/fire_risk/ImageServer',
      metadataId: 'fire_risk',
      calendar: {
        domClass: 'risk-settings',
        childDomClass: 'risk-subsettings',
        label: 'Select a date'
      }
    },
    // TODO: crowdsourced fires
    {
      id: _constants2.default.forestMoratorium,
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
    }, {
      id: _constants2.default.oilPalm,
      order: 1,
      type: 'dynamic',
      label: 'Oil palm',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'oil-palm',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [1],
      infoTemplate: {
        content: '<table><tr><td>Name: </td><td>${Name}</td></tr>' + '<tr><td>GIS Calculated Area (ha): </td><td>${GIS Calculated Area (ha)}</td></tr>' + '<tr><td>Country: </td><td>${Country}</td></tr>' + '<tr><td>Certification Status	: </td><td>${Certification Status}</td></tr>' + '<tr><td>Source: </td><td>${Source}</td></tr>'
      }
    }, {
      id: _constants2.default.rspoOilPalm,
      order: 1,
      type: 'dynamic',
      label: 'RSPO oil palm',
      sublabel: '(May 2013, select countries)',
      group: 'forestUse',
      className: 'rspo-palm',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/protected_services/MapServer', //'http://gis-gfw.wri.org/arcgis/rest/services/commodities/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [0],
      infoTemplate: {
        content: '<table><tr><td>Name: </td><td>${name}</td></tr>' + '<tr><td>GIS Calculated Area (ha): </td><td>${area_ha}</td></tr>' + '<tr><td>Country: </td><td>${country}</td></tr>' + '<tr><td>Certification Status	: </td><td>${certificat}</td></tr>' + '<tr><td>Source: </td><td>${source}</td></tr>'
      }
    }, {
      id: _constants2.default.woodFiber,
      order: 1,
      type: 'dynamic',
      label: 'Wood fiber',
      sublabel: '(varies, select countries)',
      group: 'forestUse',
      className: 'wood-fiber',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [0],
      infoTemplate: {
        content: '<table><tr><td>Name: </td><td>${Name}</td></tr>' + '<tr><td>GIS Calculated Area (ha): </td><td>${GIS Calculated Area (ha)}</td></tr>' + '<tr><td>Country: </td><td>${Country}</td></tr>' + '<tr><td>Certification Status	: </td><td>${Certification Status}</td></tr>' + '<tr><td>Source: </td><td>${Source}</td></tr>'
      }
    }, {
      id: _constants2.default.loggingConcessions,
      order: 1,
      type: 'dynamic',
      label: 'Managed forests',
      sublabel: '(Indonesia)',
      group: 'forestUse',
      className: 'logging-concessions',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [3],
      infoTemplate: {
        content: '<table><tr><td>Name: </td><td>${Name}</td></tr>' + '<tr><td>GIS Calculated Area (ha): </td><td>${GIS Calculated Area (ha)}</td></tr>' + '<tr><td>Country: </td><td>${Country}</td></tr>' + '<tr><td>Certification Status	: </td><td>${Certification Status}</td></tr>' + '<tr><td>Source: </td><td>${Source}</td></tr>'
      }
    }, {
      id: _constants2.default.protectedAreas,
      order: 1,
      type: 'dynamic',
      label: 'Protected areas',
      sublabel: '(varies, global)',
      group: 'conservation',
      className: 'protected-areas',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/cached/wdpa_protected_areas/MapServer', //'http://gis-gfw.wri.org/arcgis/rest/services/wdpa_protected_areas_cached/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [0],
      infoTemplate: {
        content: '<table><tr><td>Name: </td><td>${Name}</td></tr>' + '<tr><td>GIS Calculated Area (ha): </td><td>${GIS_AREA}</td></tr>' + '<tr><td>Local Name: </td><td>${Local Name}</td></tr>' + '<tr><td>Local Designation: </td><td>${Local Designation}</td></tr>' + '<tr><td>WDPA_PID: </td><td>${WDPA_PID}</td></tr>'
      }
    }, {
      id: _constants2.default.peatlands,
      order: 1,
      type: 'dynamic',
      label: 'Peatlands',
      sublabel: '(year 2002, Indonesia)',
      group: 'landCover',
      className: 'peatlands',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/commodities/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [22]
    }, {
      id: _constants2.default.treeCoverDensity,
      order: 1,
      type: 'image',
      label: 'Tree cover density',
      sublabel: '(2002, Hansen/UMD/Google/USGS/NASA)',
      group: 'landCover',
      className: 'tree-cover',
      url: 'http://gis-treecover.wri.org/arcgis/rest/services/TreeCover2000/ImageServer',
      metadataId: 'firms_active_fires',
      colormap: [[50, 14, 204, 14]],
      inputRange: [30, 101],
      outputRange: [50],
      opacity: 0.8
    }, {
      id: _constants2.default.primaryForests,
      order: 1,
      type: 'dynamic',
      label: 'Primary Forests',
      sublabel: '(2000 - 2012, 30m, Indonesia)',
      group: 'landCover',
      className: 'primary-forests',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/primary_forest_2000to2012/MapServer',
      metadataId: 'firms_active_fires',
      layerIds: [3]
    }, {
      id: _constants2.default.windDirection,
      order: 1,
      type: 'wind',
      label: 'Wind direction',
      sublabel: '(2000, 30m, Indonesia, Daily, NOAA)',
      group: 'airQuality',
      className: 'wind-direction',
      // url: 'http://suitability-mapper.s3.amazonaws.com/wind/wind-surface-level-gfs-1.0.gz.json',
      metadataId: 'wind_direction',
      calendar: {
        domId: 'windDirectionCalendar',
        domClass: 'windDirectionLegend',
        childDomClass: 'wind-direction'
      }
    }, {
      id: _constants2.default.airQuality,
      order: 1,
      type: 'dynamic',
      label: 'Air Quality',
      sublabel: '(layer starts at 9/25/15)',
      group: 'airQuality',
      className: 'air-quality',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/AirQuality_sea/MapServer',
      metadataId: 'firms_active_fires',
      calendar: {
        domId: 'airQCalendar',
        domClass: 'air-quality'
      },
      layerIds: [1]
    }, {
      id: _constants2.default.landsat8,
      order: 1,
      type: 'image',
      label: 'Latest Landsat 8 Imagery',
      sublabel: '(latest image, 30m, global)',
      group: 'imagery',
      className: 'tree-cover',
      url: 'http://landsat.arcgis.com/arcgis/rest/services/Landsat8_PanSharpened/ImageServer',
      metadataId: 'firms_active_fires'
    }, {
      id: _constants2.default.boundingBoxes,
      order: 1,
      type: 'feature',
      label: 'Bounding boxes',
      infoTemplate: {
        content: '<table><tr><td>Name: </td><td>${Name}</td></tr>' + '<tr><td>Image Aquisition Date: </td><td>${AcquisitionDate}</td></tr>'
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
    }, {
      id: _constants2.default.digitalGlobe,
      order: 1,
      subLayers: [_constants2.default.digitalGlobe0, _constants2.default.digitalGlobe1, _constants2.default.digitalGlobe2, _constants2.default.digitalGlobe3, _constants2.default.digitalGlobe4],
      imageServices: [{ id: 'dg-00', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV01/ImageServer', mosaic: 'WV01' }, { id: 'dg-01', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/QB01/ImageServer', mosaic: 'QB01' }, { id: 'dg-02', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV02/ImageServer', mosaic: 'WV02' }, { id: 'dg-03', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/GEO1/ImageServer', mosaic: 'GEO1' }, { id: 'dg-04', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV03/ImageServer', mosaic: 'WV03' }, { id: 'dg-05', url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV03_SWIR/ImageServer', mosaic: 'WV03_SWIR' }],
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
    }, {
      id: _constants2.default.digitalGlobe0,
      type: 'image',
      mosaic: 'QB01',
      'minScale': 0,
      'maxScale': 10000, //zoom level 6 is highest visible
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/QB01/ImageServer'
    }, {
      id: _constants2.default.digitalGlobe1,
      type: 'image',
      mosaic: 'WV02',
      'minScale': 0,
      'maxScale': 10000,
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV02/ImageServer'
    }, {
      id: _constants2.default.digitalGlobe2,
      type: 'image',
      mosaic: 'GEO1',
      'minScale': 0,
      'maxScale': 10000,
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/GEO1/ImageServer'
    }, {
      id: _constants2.default.digitalGlobe3,
      type: 'image',
      mosaic: 'WV03',
      'minScale': 0,
      'maxScale': 10000,
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV03/ImageServer'
    }, {
      id: _constants2.default.digitalGlobe4,
      type: 'image',
      mosaic: 'WV03_SWIR',
      'minScale': 0,
      'maxScale': 10000,
      url: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/WV03_SWIR/ImageServer'
    }, {
      id: _constants2.default.fireStories,
      order: 1,
      type: 'feature',
      label: 'Fire Stories',
      group: 'stories',
      layerIds: [10],
      className: 'fire-stories',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Title: </td><td>${Title}</td></tr>' + '<tr><td>Name: </td><td>${Name}</td></tr>' + '<tr><td>Details: </td><td>${Details}</td></tr>' + '<tr><td>Date: </td><td>${Date}</td></tr>'
      }
    }, {
      id: _constants2.default.twitter,
      order: 1,
      type: 'feature',
      label: 'Twitter',
      group: 'stories',
      layerIds: [3],
      className: 'twitter',
      url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer',
      metadataId: 'firms_active_fires',
      infoTemplate: {
        content: '<table><tr><td>Text: </td><td>${Text}</td></tr>' + '<tr><td>UserName: </td><td>${UserName}</td></tr>' + '<tr><td>Date: </td><td>${Date}</td></tr>'
      }
    }],

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

    firesModal: {
      info: 'GFW employs a recommendation for detecting forest clearing fires (described in Morton and Defries, 2008), identifying fires with a Brightness value greater than or equal to 330 Kelvin and a Confidence value greater than or equal to 30% to indicate fires that have a higher confidence for being forest-clearing fires. Low confidence fires are lower intensity fires that could either be from non-forest-clearing fire activity (clearing fields or grass burning), or could be older fires that have decreased in intensity (smoldering rather than flaming fires). The use of this classification establishes a higher standard for fire detection than using all fire alerts equally.'
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
        incorrectLayerConfig: function incorrectLayerConfig(type) {
          return 'You provided an invalid type, the application is not configured for type: ' + type + '. Please use the correct type or implement it in the LayerFactory.';
        },
        geolocationUnavailable: 'Sorry, it looks like your browser does not support geolocation, please try the latest versions of Safari, Chrome, or Firefox.',
        geolocationFailure: function geolocationFailure(message) {
          return 'Error retrieving location at this time. ' + message;
        },
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
        firesOptions: [{ label: 'Past 24 hours', value: 1 }, { label: 'Past 48 hours', value: 2 }, { label: 'Past 72 hours', value: 3 }, { label: 'Past Week', value: 7 }],
        lossOptions: [{ label: '2001', value: 1 }, { label: '2002', value: 2 }, { label: '2003', value: 3 }, { label: '2004', value: 4 }, { label: '2005', value: 5 }, { label: '2006', value: 6 }, { label: '2007', value: 7 }, { label: '2008', value: 8 }, { label: '2009', value: 9 }, { label: '2010', value: 10 }, { label: '2011', value: 11 }, { label: '2012', value: 12 }, { label: '2013', value: 13 }, { label: '2014', value: 14 }],
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
        analysisButtonLabel: 'Generate Report',
        analysisAreaTitle: 'Fire Report',
        analysisAreaHeader: 'View Indonesia fire statistics for the last 7 days',
        analysisTimeframeHeader: 'Select timeframe of interest:',
        analysisTabLabel: 'Fire Report',
        analysisCustomize: 'CUSTOMIZE REPORT',
        analysisChoose: 'Choose your own custom time period and geographic area.',
        subscriptionTabLabel: 'SUBSCRIBE TO ALERTS',
        subscriptionButtonLabel: 'START DRAWING',
        subscriptionInstructionsOne: 'Sign up to receive ',
        subscriptionInstructionsTwo: 'fire alert emails or SMS messages',
        subscriptionInstructionsThree: ' when fires occur',
        subscriptionShapefile: 'Or drop a custom shapefile here',
        subscriptionClick: 'Click on each shape to subscribe to the area.',
        imageryTabLabel: 'VIEW HIGH-RES IMAGERY',
        imageryArea: 'Imagery',
        basemapTabLabel: 'CHANGE BASE MAP',
        basemapArea: 'Basemaps'
      },
      controlPanel: {
        darkGrayBasemap: 'Dark Gray',
        topoBasemap: 'Topo',
        wriBasemap: 'WRI',
        imageryBasemap: 'Imagery',
        landsat8: 'Landsat',
        zoomInHover: 'ZOOM IN',
        zoomOutHover: 'ZOOM OUT',
        shareHover: 'SHARE',
        searchHover: 'SEARCH',
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
          phonePlaceholder: 'Phone number',
          warningTextEmail: 'You must enter a valid email address!',
          warningTextPhone: 'You must enter a valid phone number!',
          successMessage: 'You have successfully subscribed. You will receive an email asking you to verify your subscription. Please be sure to check your SPAM folder. Once verified, you will start receiving alerts for your area.',
          subscribePlaceholder: 'Subscribe',
          deletePlaceholder: 'Delete Feature'
        },
        share: {
          title: 'Share this view',
          linkInstructions: 'Copy and paste the link to share it or use the buttons below to share on social media.',
          copyFailure: 'Sorry, we were unable to copy this to your clipboard, please press Cmd + c on Mac or Ctrl + c on Windows/Linux.',
          copyButton: 'Copy',
          copiedButton: 'Copied',
          googleUrl: function googleUrl(url) {
            return 'https://plus.google.com/share?url=' + url;
          },
          twitterUrl: function twitterUrl(url) {
            return 'https://twitter.com/share?url=' + url + '&via=gfw-water';
          },
          facebookUrl: function facebookUrl(url) {
            return 'https://www.facebook.com/sharer.php?u=' + url;
          }
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

  config.text.layerInformation[_constants2.default.treeCoverDensity] = {
    title: 'Tree Cover',
    subtitle: '(year 2000, 30m global, Hansen/UMD/Google/USGS/NASA)',
    table: [{ label: 'Function', html: 'Identifies areas of tree cover' }, { label: 'Resolution/Scale', html: '30 × 30 meters' }, { label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)' }, { label: 'Source Data', html: '<a href="http://landsat.usgs.gov/" target="_blank">Landsat 7 ETM+</a>' }, { label: 'Date of Content', html: '2000' }, { label: 'Cautions', html: 'For the purpose of this study, “tree cover” was defined as all vegetation taller than 5 meters in height. “Tree cover” is the biophysical presence of trees and may take the form of natural forests or plantations existing over a range of canopy densities.' }],
    overview: ['This data set displays tree cover over all global land (except for Antarctica and a number of Arctic islands) for the year 2000 at 30 × 30 meter resolution. “Percent tree cover” is defined as the density of tree canopy coverage of the land surface and is color-coded by density bracket (see legend).', 'Data in this layer were generated using multispectral satellite imagery from the <a href="http://landsat.usgs.gov/" target="_blank">Landsat 7 thematic mapper plus (ETM+)</a> sensor. The clear surface observations from over 600,000 images were analyzed using Google Earth Engine, a cloud platform for earth observation and data analysis, to determine per pixel tree cover using a supervised learning algorithm.'],
    citation: ['<strong>Citation:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “High-Resolution Global Maps of 21st-Century Forest Cover Change.” <em>Science</em> 342 (15 November): 850–53. Data available on-line from: <a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank">http://earthenginepartners.appspot.com/science-2013-global-forest</a>.', '<strong>Suggested citation for data as displayed on GFW:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “Tree Cover.” University of Maryland, Google, USGS, and NASA. Accessed through Global Forest Watch on [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.']
  };

  config.text.layerInformation[_constants2.default.activeFires] = {
    title: 'Firms Active Fires',
    subtitle: '(daily, 1km, global, NASA)',
    table: [{ label: 'Function', html: 'Displays fire alert data for the past 7 days' }, { label: 'Resolution/Scale', html: '1 × 1 kilometer' }, { label: 'Geographic Coverage', html: 'Global' }, { label: 'Source Data', html: '<a href="http://modis.gsfc.nasa.gov/about/" target="_blank">MODIS</a>' }, { label: 'Date of Content', html: 'Past 7 days' }, { label: 'Cautions', html: '<p>Not all fires are detected. There are several reasons why MODIS may not have detected a certain fire. The fire may have started and ended between satellite overpasses. The fire may have been too small or too cool to be detected in the (approximately) 1 km<sup>2</sup> pixel. Cloud cover, heavy smoke, or tree canopy may completely obscure a fire.</p><p>It is not recommended to use active fire locations to estimate burned area due to spatial and temporal sampling issues.</p><p>When zoomed out, this data layer displays some degree of inaccuracy because the data points must be collapsed to be visible on a larger scale. Zoom in for greater detail.</p>' }],
    overview: ['The Fire Information for Resource Management System (FIRMS) delivers global MODIS-derived hotspots and fire locations. The active fire locations represent the center of a 1-kilometer pixel that is flagged by the MOD14/MYD14 Fire and Thermal Anomalies Algorithm as containing one or more fires within the pixel.', 'The near real-time active fire locations are processed by the <a href="https://earthdata.nasa.gov/data/near-real-time-data" target="_blank">NASA Land and Atmosphere Near Real-Time Capability for EOS (LANCE)</a> using the standard MODIS Fire and Thermal Anomalies product (MOD14/MYD14). Data older than the past 7 days can be obtained from the <a href="https://earthdata.nasa.gov/data/near-real-time-data/firms/active-fire-data#tab-content-6" target="_blank">Archive Download Tool</a>. The tool provides near real-time data and, as it becomes available and is replaced with the standard NASA (MCD14ML) fire product.', 'More information on active fire data is available from the <a href="https://earthdata.nasa.gov/data/near-real-time-data/firms" target="_blank">NASA FIRMS website</a>.'],
    citation: ['<strong>Citation:</strong>NASA FIRMS. “NASA Fire Information for Resource Management System (FIRMS).” Accessed on [date]. <a href="earthdata.nasa.gov/data/near-real-time-data/firms" target="_blank">earthdata.nasa.gov/data/near-real-time-data/firms</a>.', '<strong>Suggested citation for data as displayed on GFW:</strong> “NASA Active Fires.” NASA FIRMS. Accessed through Global Forest Watch on [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.']
  };

  config.text.layerInformation[_constants2.default.burnScars] = {
    title: 'Burn Scars',
    table: [{ label: 'Function', html: 'Provides an estimate of the extent of land burned by fire' }, { label: 'Resolution/Scale', html: '30 meters' }, { label: 'Geographic Coverage', html: 'Sumatra, Indonesia' }, { label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>' }, { label: 'Date of Content', html: 'May 1, 2014 - present' }, { label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.' }],
    overview: ['This data layer provides the extent of burn land area, or burn scars, mapped from Landsat satellite imagery, using Google Earth Engine. This analysis was conducted by the Data Lab team (Robin Kraft, Dan Hammer, and Aaron Steele) of the World Resources Institute using Google Earth Engine. This analysis will be updated regularly as additional Landsat imagery becomes available.', 'This analysis was conducted as an open source project; code is available here:<br><a href="https://gist.github.com/robinkraft/077c14d35a50a8b31581" target="_blank">https://gist.github.com/robinkraft/077c14d35a50a8b31581</a>'],
    citation: ['<strong>Citation:</strong>Elvidge, Christopher D. and Kimberly Baugh. 2014. Burn scar mapping from Landsat 8. Presentation at APAN meeting in Bandung, Indonesia. January 20.', '<strong>URL:</strong><a href="http://www.apan.net/meetings/Bandung2014/Sessions/EM/Elvidge_L8_burnscar_20140120.pdf" target="_blank">http://www.apan.net/meetings/Bandung2014/Sessions/EM/Elvidge_L8_burnscar_20140120.pdf</a>.']
  };

  config.text.layerInformation[_constants2.default.darkGrayBasemap] = {
    title: 'Dark Gray Canvas',
    table: [{ label: 'Function', html: 'Provides an estimate of the extent of land burned by fire' }, { label: 'Resolution/Scale', html: '30 meters' }, { label: 'Geographic Coverage', html: 'Sumatra, Indonesia' }, { label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>' }, { label: 'Date of Content', html: 'May 1, 2014 - present' }, { label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.' }],
    overview: ['This web map draws attention to your thematic content by providing a dark, neutral background with minimal colors, labels, and features.'],
    citation: ['This work is licensed under the Web Services and API Terms of Use. <a href="http://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="http://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> ']
  };

  config.text.layerInformation[_constants2.default.topoBasemap] = {
    title: 'Topographic',
    table: [{ label: 'Function', html: 'Provides an estimate of the extent of land burned by fire' }, { label: 'Resolution/Scale', html: '30 meters' }, { label: 'Geographic Coverage', html: 'Sumatra, Indonesia' }, { label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>' }, { label: 'Date of Content', html: 'May 1, 2014 - present' }, { label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.' }],
    overview: ['Topographic map which includes boundaries, cities, water features, physiographic features, parks, landmarks, transportation, and buildings.'],
    citation: ['This work is licensed under the Web Services and API Terms of Use. <a href="http://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="http://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> ']
  };

  config.text.layerInformation[_constants2.default.wriBasemap] = {
    title: 'World Resources Institute',
    overview: ['Satellite and high-resolution aerial imagery for the world with political boundaries and place names. You can turn on transportation including street names.'],
    citation: ['This work is licensed under the Web Services and API Terms of Use. <a href="http://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="http://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> ']
  };

  config.text.layerInformation[_constants2.default.imageryBasemap] = {
    title: 'World Imagery',
    table: [{ label: 'Function', html: 'Provides an estimate of the extent of land burned by fire' }, { label: 'Resolution/Scale', html: '30 meters' }, { label: 'Geographic Coverage', html: 'Sumatra, Indonesia' }, { label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>' }, { label: 'Date of Content', html: 'May 1, 2014 - present' }, { label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.' }],
    overview: ['Satellite and high-resolution aerial imagery for the world with political boundaries and place names. You can turn on transportation including street names.'],
    citation: ['This work is licensed under the Web Services and API Terms of Use. <a href="http://links.esri.com/tou_summary" target="_blank">View Summary</a>  |  <a href="http://links.esri.com/agol_tou" target="_blank">View Terms of Use</a> ']
  };

  // Exports
  var layerPanelText = exports.layerPanelText = config.text.layerPanel;
  var analysisPanelText = exports.analysisPanelText = config.text.analysisPanel;
  var controlPanelText = exports.controlPanelText = config.text.controlPanel;
  var modalText = exports.modalText = config.text.modals;
  var defaults = exports.defaults = config.defaults;
  var uploadConfig = exports.uploadConfig = config.upload;
  var layersConfig = exports.layersConfig = config.layers;
  var assetUrls = exports.assetUrls = config.assetUrls;
  var errors = exports.errors = config.text.errors;
  var mapConfig = exports.mapConfig = config.map;
  var symbolConfig = exports.symbolConfig = config.symbol;
  var analysisConfig = exports.analysisConfig = config.analysis;
  var metadataIds = exports.metadataIds = config.text.metadataIds;
  var metadataUrl = exports.metadataUrl = config.text.metadataUrl;
  var alertsModalConfig = exports.alertsModalConfig = config.alertsModal;
  var fireModalConfig = exports.fireModalConfig = config.firesModal;
  var layerInformation = exports.layerInformation = config.text.layerInformation;
});