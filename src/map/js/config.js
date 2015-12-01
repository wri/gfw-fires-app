import KEYS from 'js/constants';

export const config = {

  assets: {
    ionCSS: 'vendor/ion.rangeslider/css/ion.rangeSlider.css',
    ionSkinCSS: 'vendor/ion.rangeslider/css/ion.rangeSlider.skinNice.css',
    highcharts: 'http://code.highcharts.com/highcharts.js',
    highchartsMore: 'http://code.highcharts.com/highcharts-more.js',
    rangeSlider: 'vendor/ion.rangeslider/js/ion.rangeSlider.min.js'
  },

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
        visible: true
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
    activeBasemap: KEYS.wriBasemap
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
    //{
    //  id: KEYS.wetlands,
    //  order: 6,
    //  type: 'dynamic',
    //  label: 'Wetlands',
    //  group: 'watershed',
    //  className: 'wetlands',
    //  url: 'http://gis-gfw.wri.org/arcgis/rest/services/hydrology/MapServer',
    //  layerIds: [2]
    //},
    //{
    //  id: KEYS.treeCover,
    //  order: 5,
    //  type: 'image',
    //  label: 'Tree cover',
    //  sublabel: '(year 2000, 30m global, Hansen/UMD/Google/USGS/NASA)',
    //  group: 'watershed',
    //  className: 'tree-cover',
    //  url: 'http://50.18.182.188:6080/arcgis/rest/services/TreeCover2000/ImageServer',
    //  colormap: [[1, 174, 203, 107]],
    //  inputRange: [30, 101],
    //  outputRange: [1],
    //  opacity: 0.8
    //},
    {
      id: KEYS.protectedAreas,
      order: 5,
      type: 'dynamic',
      label: 'Protected areas',
      sublabel: '(varies, global)',
      group: 'conservation',
      className: 'tree-cover',
      url: 'http://gis-gfw.wri.org/arcgis/rest/services/wdpa_protected_areas_cached/MapServer',
      layerIds: [0]
    },
    {
      id: KEYS.landsat8,
      order: 4,
      type: 'image',
      label: 'Latest Landsat 8 Imagery',
      sublabel: '(latest image, 30m, global)',
      group: 'imagery',
      className: 'tree-cover',
      url: 'http://landsat.arcgis.com/arcgis/rest/services/Landsat8_PanSharpened/ImageServer',
    }
  ],

  symbol: {
    gfwBlue: [64, 153, 206],
    upstreamSymbol: [255, 0, 0],
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
    upstream: {
      url: 'http://utility.arcgis.com/usrsvcs/appservices/epPvpBkwsBSgIYCd/rest/services/Tools/Hydrology/GPServer/Watershed',
      params: {
        f: 'json',
        Generalize: true,
        SnapDistance: 5000,
        SnapDistanceUnits: 'Meters'
      },
      outputSR: 102100,
      jobId: 'WatershedArea'
    }
  },

  text: {
    errors: {
      missingLayerConfig: 'You provided a layer config containing a url but not a type, please specify the layer type in the layer config.',
      incorrectLayerConfig: type => `You provided an invalid type, the application is not configured for type: ${type}. Please use the correct type or implement it in the LayerFactory.`,
      geolocationUnavailable: 'Sorry, it looks like your browser does not support geolocation, please try the latest versions of Safari, Chrome, or Firefox.',
      geolocationFailure: message => `Error retrieving location at this time. ${message}`,
      featureNotFound: 'We could not find a feature available at this point. Please try again.'
    },
    layerPanel: {
      watershed: 'Know your watershed',
      watershedRisk: 'Identify Watershed Risks',
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
        {label: 'Past Week', value: 7},
        {label: 'Past 72 hours', value: 3},
        {label: 'Past 48 hours', value: 2},
        {label: 'Past 24 hours', value: 1}
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
      searchAllPlaceholder: 'Search by river, watershed, or city',
      searchEsriPlaceholder: 'Search by city',
      searchWatershedPlaceholder: 'Search by watershed',
      sourceName: 'Watersheds',
      searchWidgetId: 'esri-search-widget',
      analyzeButton: 'Analyze Watershed',
      watershedTabId: 'currentWatershed', // Can be anything as long as its different from analysisTabId
      watershedTabLabel: 'Current Watershed',
      watershedTabPlaceholder: 'To analyze, use the search bar to find your watershed or click on your watershed via the map.',
      customTabId: 'customWatershed',
      customTabLabel: 'Custom Area',
      clearAnalysisButton: 'Clear Analysis',
      getAlertsButton: 'Get Alerts',
      pointType: 'point',
      lossFootnote: '* Tree cover loss ',
      customAnalysisText: 'To further refine your results go to ',
      customAnalysisLink: 'Custom Area',
      fullReportButton: 'Full Report',
      watershedSummeryInfo: 'Watershed Risk Summary',
      addPointButton: 'Add point',
      latLngInstructions: 'Enter latitude & longitude',
      latLngGoButton: 'Go',
      latPlaceholder: 'Lat',
      lonPlaceholder: 'Lon',
      invalidLatLng: 'You did not provide a valid latitude(-90 to 90) or longitude(-180 to 180). Please try again.',
      customAreaNamePlaceholder: 'Custom Area',
      chartLookup: {
        0: 'No Risk',
        1: 'Low Risk',
        2: 'Low - Medium Risk',
        3: 'Medium Risk',
        4: 'Medium - High Risk',
        5: 'Extreme Risk'
      },
      getWatershedTitle: feature => (feature.attributes && feature.attributes.maj_name) || 'No Name'
    },
    controlPanel: {
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
    // Fill in below so I can use the keys as Ids
    layerInformation: {}
  }

};

// Layer Information
// config.text.layerInformation[KEYS.sediment] = {};

config.text.layerInformation[KEYS.landCover] = {
  title: 'Land Cover',
  table: [
    {label: 'Function', html: 'Displays land cover classified by type.'},
    {label: 'Resolution/Scale', html: '300m'},
    {label: 'Geographic Coverage', html: 'Global'},
    {label: 'Source Data', html: 'GlobCover Land Cover v2 2008'},
    {label: 'Frequency of Updates', html: 'None'},
    {label: 'Date of Content', html: '2008'},
    {label: 'Cautions', html: 'Unmasked clouds may remain in the imagery. Additionally some pixels surrounding permanent snow areas may appear as snow even during no-snow periods. Some water masking occurs in which land is clipped in inland water areas, and the process for removing haze leaves some areas with patchy step changes. Last, some bright surface areas that appear as strong reflectors or deserts may be omitted as clouds.'}
  ],
  overview: [
    'At 300 m resolution, GlobCover Land Cover v2 provides high resolution imagery of global land cover. The data contain 22 classes of land cover, drawing on the UN Land Cover Classification System. Satellite imagery comes from the ENVISAT satellite mission’s MERIS sensor, covering the period from December 2004 to June 2006.'
  ],
  citation: [
    '<strong>Citation:</strong>Bontemps, Sophie, Pierre Defourney, Eric Van Bogaert, Olivier Arion, Vasileios Kalogirou, and Jose Ramos Perez. 2009. “GLOBCOVER 2009: Product Description and Validation Report.” Available online at: <a href="http://dup.esrin.esa.int/page_globcover.php" target="_blank">http://dup.esrin.esa.int/page_globcover.php</a>'
  ]
};

config.text.layerInformation[KEYS.wetlands] = {
  title: 'Lakes and Wetlands',
  table: [
    {label: 'Function', html: 'This datasets shows global distribution of large lakes and reservoirs, smaller water bodies, and wetlands.'},
    {label: 'Resolution/Scale', html: '30 x 30 arc second'},
    {label: 'Geographic Coverage', html: 'Global '},
    {label: 'Source Data', html: 'WWF Global Lakes and Wetlands Database'},
    {label: 'Frequency of Updates', html: 'None planned'},
    {label: 'Date of Content', html: '2004'},
    {label: 'Cautions', html: 'The extent of wetlands and lakes may vary seasonally. The dataset may serve as an estimate of maximum extents of wetlands and to identify large-scale wetland distribution and important wetland complexes.'},
    {label: 'License', html: ''}
  ],
  overview: [
    '<a href="https://www.worldwildlife.org/pages/global-lakes-and-wetlands-database" target="_blank" alt="The Global Lakes and Wetlands Database">The Global Lakes and Wetlands Database</a> combines best available sources for lakes and wetlands on a global scale (1:1 to 1:3 million resolution), and the application of GIS functionality enabled the generation of a database on: 3067 large lakes (area >=50 km2) and reservoirs (storage capacity ≥ 0.5 km3), permanent open water bodies with a surface area ≥ 0.1 km2, and maximum extents and types of wetlands.'
  ],
  citation: [
    '<strong>Citation:</strong>Lehner, B. and Döll, P. (2004): Development and validation of a global database of lakes, reservoirs and wetlands. Journal of Hydrology 296/1-4: 1-22.'
  ]
};

config.text.layerInformation[KEYS.waterIntake] = {
  title: 'Urban water intake',
  table: [
    {label: 'Function', html: 'Identifies water withdrawal locations for over 250 cities with a population greater than 750,000.'},
    {label: 'Resolution/Scale', html: 'Varies by country'},
    {label: 'Geographic Coverage', html: 'This data set is not global. The data is confined to over 250  cities with a population greater than 750,000.'},
    {label: 'Source Data', html: 'Water withdrawal locations for over 250 cities with population greater than 750,000 were identified, which were surveyed as part of the World Urbanization Prospects (<a href="http://www.un.org/en/development/desa/population/publications/pdf/urbanization/WUP2011_Report.pdf" target="_blank">UNPD, 2011</a>). Water withdrawal locations were identified through research on water utilities or agencies and their annual reports. For each withdrawal location, spatial location was recorded. For freshwater withdrawal points, they were adjusted to match the underlying hydrographic river system.'},
    {label: 'Frequency of Updates', html: 'As new data becomes available'},
    {label: 'Date of Content', html: '2014'},
    {label: 'Cautions', html: 'Information is restricted by availability. Some cases of interbasin transfer for water supply may not be reflected.'},
    {label: 'License', html: ''}
  ],
  overview: [
    'This data set contains over 1000 water withdrawal locations determined by latitude and longitude coordinates from the first global survey of the water sources for over 250 large cities (population >750,000). The data set was created and published by The Nature Conservancy in 2014. These locations come from research on water utilities and their annual reports. The locations were recorded as accurately as possible and freshwater withdrawal points were adjusted to match the underlying hydrographic river system. Some withdrawal points serve multiple water utilities and cities.'
  ],
  citation: [
    '<strong>Citation:</strong>Robert I. McDonald, Katherine Weber, Julie Padowski, Martina Flörke, Christof Schneider, Pamela A. Green, Thomas Gleeson, Stephanie Eckman, Bernhard Lehner, Deborah Balk, Timothy Boucher, Günther Grill, Mark Montgomery, Water on an urban planet: Urbanization and the reach of urban water infrastructure, Global Environmental Change, Volume 27, July 2014, Pages 96-105, ISSN 0959-3780, <a href="http://dx.doi.org/10.1016/j.gloenvcha.2014.04.022" target="_blank">http://dx.doi.org/10.1016/j.gloenvcha.2014.04.022</a>.<a href="http://www.sciencedirect.com/science/article/pii/S0959378014000880" target="_blank">(http://www.sciencedirect.com/science/article/pii/S0959378014000880)</a>'
  ]
};

config.text.layerInformation[KEYS.waterStress] = {
  title: 'Baseline Water Stress',
  table: [
    {label: 'Function', html: 'This dataset measures relative water demand. Higher values indicate more competition among users.'},
    {label: 'Resolution/Scale', html: ''},
    {label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)'},
    {label: 'Source Data', html: '<p>Based on a combination of various sources: Food and Agriculture Organization of the United Nations (FAO) AQUASTAT 2008-2012, National Aeronautics and Space Administration (NASA) GLDAS-2 2012, <a href="http://catdir.loc.gov/catdir/samples/cam034/2002031201.pdf" alt="Shiklomanov and Rodda 2004">Shiklomanov and Rodda 2004</a>, <a href="http://www.sciencedirect.com/science/article/pii/S0959378012001318" alt="Flörke et al. 2012">Flörke et al. 2012</a>, and <a href="http://www.cger.nies.go.jp/db/gdbd/" alt="cger">Matsutomi et al. 2009</a>.</p>'},
    {label: 'Frequency of Updates', html: 'None planned'},
    {label: 'Date of Content', html: '2014'},
    {label: 'Cautions', html: 'The scoring of baseline water stress indicators, based on established guidelines, is subjective. Meanings were assigned to the ratio values. To understand the relationship between raw values and categories, see description below.'},
    {label: 'License', html: ''}
  ],
  overview: [
    'Baseline water stress (BWS) measures the ratio of total annual water withdrawals (Ut) to total available annual renewable supply (Ba), accounting for upstream consumptive use. A long time series of supply (1950–2010) was used to reduce the effect of multi-year climate cycles and ignore complexities of short-term water storage (e.g., dams, floodplains) for which global operational data is nonexistent. Baseline water stress thus measures chronic stress rather than drought stress. Catchments with less than 0.012 m/m2 /year of withdrawal and 0.03 m/m2 /year of available blue water was masked as “arid and low water use” since catchments with low values were more prone to error in the estimates of baseline water stress. Additionally, although current use in such catchments is low, any new withdrawals could easily push them into higher stress categories.',
    'The raw indicator value (r) is calculated using the following function:',
    'r(BWS) = Ut(2010)/mean[1950,2010](Ba)',
    'The raw indictor values are normalized over a set of thresholds that were chosen to divide raw indicators into five categories. The thresholds for BWS reflect those used by other withdrawal-to-availability indicators. Raw values were normalized to scores x between 0 and 5, using the following continuous function:',
    'x = max(0, min(5, [(ln(r) – ln(0.1))/ln(2)]+1))',
    'Raw values of BWS of less than 10% correspond to the lowest category (x=<1) and raw values of greater than 80% correspond to the highest category (x>4).'
  ],
  moreContent: [
    '<p class="read-more"><em><a href="http://www.wri.org/our-work/project/aqueduct" target="_blank">Click to learn more about the Aqueduct Project</a></em></p>'
  ]
};

config.text.layerInformation[KEYS.majorDams] = {
  title: 'Major Dams',
  table: [
    {label: 'Function', html: 'Identifies dam locations for the world’s 50 major river basins.'},
    {label: 'Resolution/Scale', html: 'Varies by country'},
    {label: 'Geographic Coverage', html: 'This data set is not global. The data is confined to the world’s 50 major river basins.'},
    {label: 'Source Data', html: 'Dams data are compiled from various sources, including: the <a href="http://atlas.gwsp.org/index.php?option=com_content&amp;task=view&amp;id=207&amp;Itemid=68">Global Reservoir and Dam (GRanD) Database</a>, the <a href="http://waterandfood.org/">Consultative Group on International Agricultural Research (CGIAR) Challenge Program on Water and Food - Mekong</a> (for Mekong basin dams only), the <a href="http://geo.usace.army.mil/pgis/f?p=397:101:32175502090367::NO:::">United States National Inventory of Dams (NID)</a>, other government dam inventories, and original data collection by International Rivers.'},
    {label: 'Frequency of Updates', html: 'As new data becomes available'},
    {label: 'Date of Content', html: '2014'},
    {label: 'Cautions', html: 'Data results are biased towards public available data, so gaps may exist.'}
  ],
  overview: [
    'The <a href="http://www.v-c-s.org">State of the World\'s Rivers</a> is an interactive web database that illustrates data on ecological health in the world’s 50 major river basins. Indicators of ecosystem health are grouped into the categories of river fragmentation, biodiversity, and water quality. The database was created and published by International Rivers in 2014.',
    'The Dam Hotspots data contains over 5,000 dam locations determined by latitude and longitude coordinates. These locations were confined to the world’s 50 major river basins. The data set comes from multiple sources, and was corrected for location errors by International Rivers. The “project status”—a moving target—was determined by acquiring official government data, as well as through primary research from Berkeley and five International Rivers’ regional offices.'
  ],
  customContent: [
    '<div class="layer-details layer-details-dam_hotspots"><ul class="layer-colors"><li><i class="circle" style="color:#F78300;"></i>Operational: Already existing dams.</li><li><i class="circle" style="color:#D5CB12;"></i>Under construction: Dams which are currently being constructed.</li><li><i class="circle" style="color:#1F78B4;"></i>Planned: Dams whose studies or licensing have been completed, but construction has yet to begin.</li><li><i class="circle" style="color:#85AB63;"></i>Inventoried: Dams whose potential site has been selected, but neither studies nor licensing have occurred.</li><li><i class="circle" style="color:#E31A1C;"></i>Suspended: Dams which have been temporarily or permanently suspended, deactivated, cancelled, or revoked.</li><li><i class="circle" style="color:#746969;"></i>Unknown: No data are currently available.</li></ul></div>'
  ],
  citation: [
    '<strong>Citation:</strong>International Rivers, The State of the World’s Rivers, August 2014 available at <a href="http://tryse.net/googleearth/irivers-dev3/">http://tryse.net/googleearth/irivers-dev3/</a>.'
  ],
  moreContent: [
    '<p class="read-more"><em><a href="http://data.globalforestwatch.org/datasets/537361e2df59486e898cd4e024af57ea_0" class="download-mobile-link" target="_blank">Learn more or download data.</a></em></p>'
  ]
};

config.text.layerInformation[KEYS.treeCover] = {
  title: 'Tree Cover',
  subtitle: '(year 2000, 30m global, Hansen/UMD/Google/USGS/NASA)',
  table: [
    {label: 'Function', html: 'Identifies areas of tree cover'},
    {label: 'Resolution/Scale', html: '30 × 30 meters'},
    {label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)'},
    {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/" target="_blank">Landsat 7 ETM+</a>'},
    {label: 'Date of Content', html: '2000'},
    {label: 'Cautions', html: 'For the purpose of this study, “tree cover” was defined as all vegetation taller than 5 meters in height. “Tree cover” is the biophysical presence of trees and may take the form of natural forests or plantations existing over a range of canopy densities.'}
  ],
  overview: [
    'This data set displays tree cover over all global land (except for Antarctica and a number of Arctic islands) for the year 2000 at 30 × 30 meter resolution. “Percent tree cover” is defined as the density of tree canopy coverage of the land surface and is color-coded by density bracket (see legend).',
    'Data in this layer were generated using multispectral satellite imagery from the <a href="http://landsat.usgs.gov/" target="_blank">Landsat 7 thematic mapper plus (ETM+)</a> sensor. The clear surface observations from over 600,000 images were analyzed using Google Earth Engine, a cloud platform for earth observation and data analysis, to determine per pixel tree cover using a supervised learning algorithm.'
  ],
  citation: [
    '<strong>Citation:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “High-Resolution Global Maps of 21st-Century Forest Cover Change.” <em>Science</em> 342 (15 November): 850–53. Data available on-line from: <a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank">http://earthenginepartners.appspot.com/science-2013-global-forest</a>.',
    '<strong>Suggested citation for data as displayed on GFW:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “Tree Cover.” University of Maryland, Google, USGS, and NASA. Accessed through Global Forest Watch on [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
  ]
};

config.text.layerInformation[KEYS.loss] = {
  title: 'Tree Cover Loss',
  subtitle: '(annual, 30m, global, Hansen/UMD/Google/USGS/NASA)',
  table: [
    {label: 'Function', html: 'Identifies areas of gross tree cover loss'},
    {label: 'Resolution/Scale', html: '30 × 30 meters'},
    {label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)'},
    {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
    {label: 'Frequency of Updates', html: 'Annual'},
    {label: 'Date of Content', html: '2001–2014'},
    {label: 'Cautions', html: '<p>This data layer was updated in January 2015 to extend the tree cover loss analysis to 2013, and in August 2015 to extend the tree cover loss analysis to 2014. The updates include new data for the target year and re-processed data for the previous two years (2011 and 2012 for the 2013 update, 2012 and 2013 for the 2014 update). The re-processing increased the amount of change that could be detected, resulting in some changes in calculated tree cover loss for 2011-2013 compared to the previous versions. Calculated tree cover loss for 2001-2010 remains unchanged. The integrated use of the original 2001-2012 (Version 1.0) data and the updated 2011–2014 (Version 1.1) data should be performed with caution.</p><p>For the purpose of this study, “tree cover” was defined as all vegetation taller than 5 meters in height. “Tree cover” is the biophysical presence of trees and may take the form of natural forests or plantations existing over a range of canopy densities. “Loss” indicates the removal or mortality of tree canopy cover and can be due to a variety of factors, including mechanical harvesting, fire, disease, or storm damage. As such, “loss” does not equate to deforestation.</p><p>When zoomed out (&lt; zoom level 13), pixels of loss are shaded according to the density of loss at the 30 x 30 meter scale. Pixels with darker shading represent areas with a higher concentration of tree cover loss, whereas pixels with lighter shading indicate a lower concentration of tree cover loss. There is no variation in pixel shading when the data is at full resolution (≥ zoom level 13).</p>'}
  ],
  overview: [
    'This data set measures areas of tree cover loss across all global land (except Antarctica and other Arctic islands) at approximately 30 × 30 meter resolution. The data were generated using multispectral satellite imagery from the <a href="http://landsat.usgs.gov/about_landsat5.php" target="_blank">Landsat 5</a> thematic mapper (TM), the <a href="http://landsat.usgs.gov/science_L7_cpf.php" target="_blank">Landsat 7</a> thematic mapper plus (ETM+), and the <a href="" target="_blank">Landsat 8</a> Operational Land Imager (OLI) sensors. Over 1 million satellite images were processed and analyzed, including over 600,000 Landsat 7 images for the 2000-2012 interval, and approximately 400,000 Landsat 5, 7, and 8 images for updates for the 2011-2014 interval. The clear land surface observations in the satellite images were assembled and a supervised learning algorithm was applied to identify per pixel tree cover loss.',
    'Tree cover loss is defined as “stand replacement disturbance,” or the complete removal of tree cover canopy at the Landsat pixel scale. Tree cover loss may be the result of human activities, including forestry practices such as timber harvesting or deforestation (the conversion of natural forest to other land uses), as well as natural causes such as disease or storm damage. Fire is another widespread cause of tree cover loss, and can be either natural or human-induced.',
    '<strong>2015 Update (Version 1.1)</strong>',
    'This data set has been updated twice since its creation, and now includes loss up to 2014. The analysis method has been modified in numerous ways, and the update should be seen as part of a transition to a future “version 2.0” of this data set that is more consistent over the entire 2001 and onward period. Key changes include:',
    [
      'The use of Landsat 8 data for 2013-2014 and Landsat 5 data for 2011-2012',
      'The reprocessing of data from the previous two years in measuring loss (2011 and 2012 for the 2013 update, 2012 and 2013 for the 2014 update)',
      'Improved training data for calibrating the loss model',
      'Improved per sensor quality assessment models to filter input data',
      'Improved input spectral features for building and applying the loss model'
    ],
    'These changes lead to a different and improved detection of global tree cover loss. However, the years preceding 2011 have not yet been reprocessed with the revised analysis methods, and users will notice inconsistencies between versions 1.0 (2001-2012) and 1.1 (2011-2014) as a result. It must also be noted that a full validation of the results incorporating Landsat 8 has not been undertaken. Such an analysis may reveal a more sensitive ability to detect and map forest disturbance using Landsat 8 data. If this is the case then there will be a more fundamental limitation to the consistency of this data set before and after the inclusion of Landsat 8 data. Validation of Landsat 8-incorporated loss detection is planned.',
    'Some examples of improved change detection in the 2011–2014 update include the following:',
    [
      'Improved detection of boreal forest loss due to fire',
      'Improved detection of smallholder rotation agricultural clearing in dry and humid tropical forests',
      'Improved detection of selective logging'
    ],
    'These are examples of dynamics that may be differentially mapped over the 2011-2014 period in Version 1.1. A version 2.0 reprocessing of the 2001 and onward record is planned, but no delivery date is yet confirmed.',
    'The original version 1.0 data remains available for download <a href="http://earthenginepartners.appspot.com/science-2013-global-forest/download_v1.0.html" target="_blank">here</a>.'
  ],
  citation: [
    '<strong>Citation:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “High-Resolution Global Maps of 21st-Century Forest Cover Change.” Science 342 (15 November): 850–53. Data available online from: <a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank">http://earthenginepartners.appspot.com/science-2013-global-forest</a>.',
    '<strong>Suggested citation for data as displayed on GFW:</strong>Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “Hansen/UMD/Google/USGS/NASA Tree Cover Loss and Gain Area.” University of Maryland, Google, USGS, and NASA. Accessed through Global Forest Watch on [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
  ]
};

config.text.layerInformation[KEYS.gain] = {
  title: 'Tree Cover Gain',
  subtitle: '(12 years, 30m, global, Hansen/UMD/Google/USGS/NASA)',
  table: [
    {label: 'Function', html: 'Identifies areas of tree cover gain'},
    {label: 'Resolution/Scale', html: '30 × 30 meters'},
    {label: 'Geographic Coverage', html: 'Global land (excluding Antarctica and Arctic islands)'},
    {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/" target="_blank">Landsat 7 ETM+</a>'},
    {label: 'Frequency of Updates', html: 'Every three years'},
    {label: 'Date of Content', html: '2001 - 2012'},
    {label: 'Cautions', html: '<p>For the purpose of this study, “tree cover” was defined as all vegetation taller than 5 meters in height. “Tree cover” is the biophysical presence of trees and may take the form of natural forests or plantations existing over a range of canopy densities. “Loss” indicates the removal or mortality of tree canopy cover and can be due to a variety of factors, including mechanical harvesting, fire, disease, or storm damage. As such, “loss” does not equate to deforestation.</p><p>When zoomed out (&lt; zoom level 13), pixels of gain are shaded according to the density of gain at the 30 x 30 meter scale. Pixels with darker shading represent areas with a higher concentration of tree cover gain, whereas pixels with lighter shading indicate a lower concentration of tree cover gain. There is no variation in pixel shading when the data is at full resolution (≥ zoom level 13).</p><p>A validation assessment of the 2000 – 2012 Hansen/UMD/Google/USGS/NASA change data was carried out independently from the mapping exercise at the global and biome (tropical, subtropical, temperate, and boreal) scale. A stratified random sample (for no change, loss, and gain) of 1500 blocks, each 120 × 120 meters, was used as validation data.  The amount of tree cover gain within each block was estimated using Landsat, MODIS, and Google Earth high-resolution imagery and compared to the map. Overall accuracies for gain were over 99.5% globally and for all biomes. However, since the overall accuracy calculations are positively skewed due to the high percentage of no change pixels, it is also important to assess the accuracy of the change predictions. The user’s accuracy (i.e. the percentage of pixels labelled as tree cover gain that actually gained tree cover) was 87.8% at the global level. At the biome level, user’s accuracies were 81.9%, 85.5%, 62.0%, and 76.7% for the tropical, subtropical, temperate, and boreal biomes, respectively.</p>'}
  ],
  overview: [
    'This data set measures areas of tree cover gain across all global land (except Antarctica and other Arctic islands) at 30 × 30 meter resolution, displayed as a 12-year cumulative layer. The data were generated using multispectral satellite imagery from the <a href="http://landsat.usgs.gov/science_L7_cpf.php" target="_blank">Landsat 7 thematic mapper plus (ETM+)</a> sensor. Over 600,000 Landsat 7 images were compiled and analyzed using Google Earth Engine, a cloud platform for earth observation and data analysis. The clear land surface observations (30 × 30 meter pixels) in the satellite images were assembled and a supervised learning algorithm was then applied to identify per pixel tree cover gain.',
    'Tree cover gain was defined as the establishment of tree canopy at the Landsat pixel scale in an area that previously had no tree cover. Tree cover gain may indicate a number of potential activities, including natural forest growth or the crop rotation cycle of tree plantations.'
  ],
  citation: [
    '<strong>Citation:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “High-Resolution Global Maps of 21st-Century Forest Cover Change.” Science 342 (15 November): 850–53. Data available on-line from: <a href="http://earthenginepartners.appspot.com/science-2013-global-forest" target="_blank">http://earthenginepartners.appspot.com/science-2013-global-forest</a>.',
    '<strong>Suggested citations for data as displayed on GFW:</strong> Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013. “Hansen/UMD/Google/USGS/NASA Tree Cover Loss and Gain Area.” University of Maryland, Google, USGS, and NASA. Accessed through Global Forest Watch on  [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
  ]
};

config.text.layerInformation[KEYS.activeFires] = {
  title: 'Firms Active Fires',
  subtitle: '(daily, 1km, global, NASA)',
  table: [
    {label: 'Function', html: 'Displays fire alert data for the past 7 days'},
    {label: 'Resolution/Scale', html: '1 × 1 kilometer'},
    {label: 'Geographic Coverage', html: 'Global'},
    {label: 'Source Data', html: '<a href="http://modis.gsfc.nasa.gov/about/" target="_blank">MODIS</a>'},
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
    '<strong>Suggested citation for data as displayed on GFW:</strong> “NASA Active Fires.” NASA FIRMS. Accessed through Global Forest Watch on [date]. <a href="http://www.globalforestwatch.org" target="_blank">www.globalforestwatch.org</a>.'
  ]
};

config.text.layerInformation[KEYS.burnScars] = {
  title: 'Burn Scars',
  table: [
    {label: 'Function', html: 'Provides an estimate of the extent of land burned by fire'},
    {label: 'Resolution/Scale', html: '30 meters'},
    {label: 'Geographic Coverage', html: 'Sumatra, Indonesia'},
    {label: 'Source Data', html: '<a href="http://landsat.usgs.gov/index.php" target="_blank">Landsat</a>'},
    {label: 'Date of Content', html: 'May 1, 2014 - present'},
    {label: 'Cautions', html: 'This data layer is provided as a beta analysis product and should be used for visual purposes only.'}
  ],
  overview: [
    'This data layer provides the extent of burn land area, or burn scars, mapped from Landsat satellite imagery, using Google Earth Engine. This analysis was conducted by the Data Lab team (Robin Kraft, Dan Hammer, and Aaron Steele) of the World Resources Institute using Google Earth Engine. This analysis will be updated regularly as additional Landsat imagery becomes available.',
    'This analysis was conducted as an open source project; code is available here:<br><a href="https://gist.github.com/robinkraft/077c14d35a50a8b31581" target="_blank">https://gist.github.com/robinkraft/077c14d35a50a8b31581</a>'
  ],
  citation: [
    '<strong>Citation:</strong>Elvidge, Christopher D. and Kimberly Baugh. 2014. Burn scar mapping from Landsat 8. Presentation at APAN meeting in Bandung, Indonesia. January 20.',
    '<strong>URL:</strong><a href="http://www.apan.net/meetings/Bandung2014/Sessions/EM/Elvidge_L8_burnscar_20140120.pdf" target="_blank">http://www.apan.net/meetings/Bandung2014/Sessions/EM/Elvidge_L8_burnscar_20140120.pdf</a>.'
  ]
};

// Exports
export const layerPanelText = config.text.layerPanel;
export const analysisPanelText = config.text.analysisPanel;
export const controlPanelText = config.text.controlPanel;
export const modalText = config.text.modals;
export const assetUrls = config.assets;
export const defaults = config.defaults;
export const layersConfig = config.layers;
export const errors = config.text.errors;
export const mapConfig = config.map;
export const symbolConfig = config.symbol;
export const analysisConfig = config.analysis;
export const layerInformation = config.text.layerInformation;
export const alertsModalConfig = config.alertsModal;
