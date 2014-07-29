/* global define */
define({

    robProxyUrl: "http://rmbp/proxy/proxy.php",
    calumProxyUrl: "http://localhost/~calumbutler/proxy/proxy.php",

    stagingProxyUrl: 'http://staging.blueraster.com/proxy/proxy.php',
    proxies: {
        "http://rmbp/": "http://rmbp/proxy/proxy.php",
        "http://localhost/~calumbutler/": "http://localhost/~calumbutler/proxy/proxy.php",
        "http://staging.blueraster.com/": "http://staging.blueraster.com/proxy/proxy.php",
        "http://shj.blueraster.com/": "http://shj.blueraster.com/proxy/proxy.ashx",
        "http://shj/": "http://shj/proxy/proxy.ashx",
        "http://localhost:": "http://localhost:8080/php/proxy.php",
        "http://fires.globalforestwatch.org":"http://www.wri.org/applications/maps/proxy/proxy.php"
    },

    mapOptions: {
        darkGrayCanvas: "http://tiles4.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Dark_Gray_Base_Beta/MapServer",
        basemap: "topo",
        minZoom: 3,
        initalZoom: 5,
        center: [115, 0],
        sliderPosition: 'top-right'
    },

    printOptions: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/GFWFiresPrintMap/GPServer/Export%20Web%20Map',
        template: 'GFWFires'
    },

    firesLayer: {
        url: "http://gis-potico.wri.org/arcgis/rest/services/Fires/Global_Fires/MapServer",
        id: "Active_Fires",
        defaultLayers: [0, 1, 2, 3],
        query: {
            layerId: 0,
            outfields: ["*"],
            fields: [{
                'name': 'LATITUDE',
                'label': 'LATITUDE'
            }, {
                'name': 'LONGITUDE',
                'label': 'LONGITDUE'
            }, {
                'name': 'BRIGHTNESS',
                'label': 'BRIGHTNESS'
            }, {
                'name': 'CONFIDENCE',
                'label': 'CONFIDENCE'
            }, {
                'name': 'ACQ_DATE',
                'label': 'ACQUISITION DATE'
            }, {
                'name': 'ACQ_TIME',
                'label': 'ACQUISITION TIME'
            }]
        }
    },

    tweetLayer: {
        url: "http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/4",
        id: "Fire_Tweets"
    },

    forestUseLayers: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/moremaps2_EN/MapServer',
        id: 'Forest_Use',
        defaultLayers: [-1], // Show none by default
        rspoOilPalm: 27, // These map to the value of an input in the UI, so rspoOilPalm is the value of a checkbox
        oilPalm: 32, // These map to the value of an input in the UI, so oilPalm is the value of a checkbox
        woodFiber: 28, // These map to the value of an input in the UI, so woodFiber is the value of a checkbox
        logging: 10 // These map to the value of an input in the UI, so logging is the value of a checkbox
    },

    // burnedAreaLayers: {
    //     url: 'http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/moremaps2_EN/MapServer',
    //     id: 'Burned_Area',
    //     defaultLayers: [-1], // Show none by default
    //     burnedAreas: 25 // These map to the value of an input in the UI, so burnedAreas is the value of a checkbox
    // },

    conservationLayers: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/moremaps2_EN/MapServer',
        id: 'Conservation',
        defaultLayers: [-1], // Show none by default
        protectedAreas: 25 // These map to the value of an input in the UI, so protectedAreas is the value of a checkbox
    },

    landCoverLayers: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/moremaps2_EN/MapServer',
        id: 'Land_Cover',
        defaultLayers: [1], // Show peatLands by default
        peatLands: 1 // These map to the value of an input in the UI, so peatLands is the value of a checkbox
    },

    overlaysLayer: {
        url: "http://gis-potico.wri.org/arcgis/rest/services/Fires/Village_Fires/MapServer",
        id: "Overlays_Layer"
    },

    primaryForestsLayer: {
        url: "http://gis-potico.wri.org/arcgis/rest/services/Fires/primary_forest_2000to2012/MapServer",
        id: "Primary_Forest",
        defaultLayers: [3]
    },

    treeCoverLayer: {
        url: "http://50.18.182.188:6080/arcgis/rest/services/TreeCover2000/ImageServer",
        id: "Tree_Cover_Density"
    },

    burnScarLayer: {
        url: "https://earthbuilder.googleapis.com/06900458292272798243-05939008152464994523-4/maptile/maps?authToken=CghZPyHDmV2R8BCzubqeBQ==",
        id: "Burn_Scar"
    },

    landsat8: {
        prefix: "http://landsat.arcgis.com/arcgis/rest/services/",
        url: "http://landsat.arcgis.com/arcgis/rest/services/Landsat8_PanSharpened/ImageServer",
        id: "LandSat_8"
    },

    digitalGlobe: {
        queryUrl: 'http://gis-potico.wri.org/arcgis/rest/services/dg_imagery/dg_footprints/MapServer/0',
        tileUrl: 'http://suitability-mapper.blueraster.com/dg_imagery/',
        id: 'Digital_Globe',
        graphicsLayerId: 'Digital_Globe_Bounding_Boxes'
    },

    windData: {
        prefix: "http://suitability-mapper.s3.amazonaws.com/",
        domain: "suitability-mapper.s3.amazonaws.com"
    },

    airQualityLayer: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/AirQuality/MapServer',
        id: 'Air_Quality'
    },

    layerForDistrictQuery: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/Village_Fires/MapServer/2',
        outFields: ['DISTRICT']
    },

    layerForSubDistrictQuery: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/Village_Fires/MapServer/1',
        outFields: ['SUBDISTRIC','ID_KEC']
    },

    digitalGlobeTiledExtents: {
        'dg_053748166010_01_wm_ImageServer': {'xmin': 11423064.809700001, 'xmax': 11461920.043065228,'ymin': 25681.09138384004, 'ymax': 51959.281700001426},
        'dg_053748166020_01_wm_ImageServer': {'xmin': 11307262.711800002, 'xmax': 11333449.531070601,'ymin': -40776.7840007848, 'ymax': 5310.887800000797},
        'dg_053748166030_01_wm_ImageServer': {'xmin': 11297272.8169, 'xmax': 11320116.177475661,'ymin': -36313.05295946365, 'ymax': 11266.611600000033},
        'dg_053748166040_01_wm_ImageServer': {'xmin': 11303228.1107, 'xmax': 11363081.650831264,'ymin': -40285.32983358677, 'ymax': -10812.65980000133},
        'dg_053748166050_01_wm_ImageServer': {'xmin': 11227264.5673, 'xmax': 11247780.370912714,'ymin': 208832.68983864193, 'ymax': 256114.79740000155},
        'dg_053748166060_01_wm_ImageServer': {'xmin': 11158483.556699999, 'xmax': 11204353.420720316,'ymin': 210346.4121365949, 'ymax': 239288.08819999933},
        'dg_053748166070_01_wm_ImageServer': {'xmin': 11413928.036899999, 'xmax': 11447978.275764622,'ymin': 6488.202793674875, 'ymax': 27819.13229999963},
        'dg_053748166080_01_wm_ImageServer': {'xmin': 11405195.531, 'xmax': 11437627.240128234,'ymin': -5138.3676402936835, 'ymax': 32095.83130000064},
        'dg_053748166090_01_wm_ImageServer': {'xmin': 11296730.9633, 'xmax': 11320829.473451713,'ymin': -34966.171717882935, 'ymax': 11643.276799999294},
    },

    // Key: LayerID
    // Value: Assoicated Checkbox
    // If has multiple checkboxes per layer, value is an object and layerID is lookup for checkbox
    layersCheckboxes: {
        'Active_Fires': {
            'id': "fires-checkbox",
            'type': 'checkbox'
        },
        'Fire_Tweets': {
            'id': "twitter-conversations-checkbox",
            'type': 'checkbox'
        },
        'Forest_Use': {
            32: {
                'id': 'oil-palm-checkbox',
                'type': 'checkbox'
            },
            28: {
                'id': 'wood-fiber-checkbox',
                'type': 'checkbox'
            },
            10: {
                'id': 'logging-checkbox',
                'type': 'checkbox'
            },
            27: {
                'id': 'rspo-oil-palm-checkbox',
                'type': 'checkbox'
            }
        },
        'Burn_Scar': {
            'id': "burned-scars-checkbox",
            'type': 'checkbox'
        },
        'Conservation': {
            25: {
                'id': "protected-areas-checkbox",
                'type': 'checkbox'
            }
        },
        'Land_Cover': {
            1: {
                'id': "peat-lands-radio",
                'type': 'radio'
            }
        },
        'Overlays_Layer': {
            1: {
                'id': 'villages-checkbox',
                'type': 'checkbox'
            },
            2: {
                'id': 'subdistricts-checkbox',
                'type': 'checkbox'
            },
            3: {
                'id': 'districts-checkbox',
                'type': 'checkbox'
            },
            4: {
                'id': 'provinces-checkbox',
                'type': 'checkbox'
            }
        },
        'Primary_Forest': {
            0: {
                'id': ['primary-forests-radio', 'pf2000-radio'],
                'type': 'radio'
            },
            1: {
                'id': ['primary-forests-radio', 'pf2005-radio'],
                'type': 'radio'
            },
            2: {
                'id': ['primary-forests-radio', 'pf2010-radio'],
                'type': 'radio'
            },
            3: {
                'id': ['primary-forests-radio', 'pf2012-radio'],
                'type': 'radio'
            }
        },
        'Tree_Cover_Density': {
            'id': "tree-cover-density-radio",
            'type': 'radio'
        },
        'LandSat_8': {
            'id': "landsat-image-checkbox",
            'type': 'checkbox'
        },
        'Digital_Globe': {
            'id': "digital-globe-checkbox",
            'type': 'checkbox'
        },
        'Air_Quality': {
            'id': "air-quality-checkbox",
            'type': 'checkbox'
        },
        'Wind_Direction': {
            'id': "windy-layer-checkbox",
            'type': 'checkbox'
        }
    },

    text: {
        locatorContainerHeader: "Locator",
        locatorSearchLabel: "Or, go to an area",
        dmsSearch: "Degrees/Minutes/Seconds",
        latLongSearch: "Latitude/Longitude",
        degreesLabel: "Degrees",
        minutesLabel: "Minutes",
        secondsLabel: "Seconds",
        latitudeLabel: "Latitude",
        longitudeLabel: "Longitude",
        searchOptionGoButton: "GO",
        clearSearchPins: "Clear Pins",
        legend: "Legend",
        firesCheckbox: "Active fires",
        firesSubLabel: "(past 7 days and archive, 1km, global, NASA)",
        noaaFiresCheckbox: "NOAA-18 fires (coming soon)",
        confidenceFiresCheckbox: "Only show high confidence fires.",
        firesWeek: "Past Week",
        fires72: "Past 72 hours",
        fires48: "Past 48 hours",
        fires24: "Past 24 hours",
        none: "None",
        oilPalmCheckbox: "Oil palm concessions",
        rspoOilPalmCheckbox: "RSPO oil palm concessions",
        woodFiberCheckbox: "Wood fiber plantations",
        loggingCheckbox: "Logging concessions",
        protectedAreasCheckbox: "Protected areas",
        burnedScarsCheckbox: "Burn scars mapped by Google Earth Engine",
        peatLandsRadio: "Peatlands",
        treeCoverDensityRadio: "Tree cover density",
        primaryForestsRadio: "Primary forests",
        southeastLandCoverRadio: "Land Cover - Southeast Asia",
        peatLandsSubLabel: "(year 2002, Indonesia)",
        treeCoverDensitySubLabel: "(year 2000, 30m, global)",
        primaryForestsSubLabel: "(2000 - 2012, 30m, Indonesia)",
        southeastLandCoverSubLabel: "(year 2005, Indonesia, Malaysia, Papua New Guinea)",
        forestUseCheckboxSubLabelSelect: "(varies, select countries)",
        rspoOilPalmCheckboxSubLabel: "(May 2013, select countries)",
        conservationCheckboxSubLabelGlobal: "(varies, global)",
        airQuality: "Air quality",
        windDirection: "Wind direction",
        digitalGlobeCheckbox: "Digital Globe - First Look",
        landsatImageCheckbox: "Latest Landsat 8 imagery",
        landsatImageSubLabel: "(latest image, 30m, global)",
        twitterConversationsCheckbox: "Twitter conversations",
        transparencySliderLabel: "Adjust Layer Transparency:",
        getReportLink: "Get Fires Analysis",
        windyLayerCheckbox: "Wind direction",
        windySubLabelAdvice: "For best visual appearance, switch to Dark Gray Canvas basemap option on the right",
        windySubLabel: "(Daily, NOAA)",
        provincesCheckbox: "Provinces",
        districtsCheckbox: "Districts",
        subDistrictsCheckbox: "Subdistricts",
        digitalGlobeSubLabel: "Click inside a footprint to display the image",
        villagesCheckbox: "Villages",
        pf2000Radio: "2000",
        pf2005Radio: "2005",
        pf2010Radio: "2010",
        pf2012Radio: "2012",
    },

    accordionDijits: [{
            "id": "fires-map-accordion",
            "type": "accordion",
            "props": {
                "class": "fires-map-accordion"
            },
            "children": [{
                "id": "fires-panel",
                "props": {
                    "title": "Fires"
                }
            }, {
                "id": "forest-use-panel",
                "props": {
                    "title": "Forest Use"
                }
            }, {
                "id": "conservation-panel",
                "props": {
                    "title": "Conservation"
                }
            }, {
                "id": "land-cover-panel",
                "props": {
                    "title": "Land Cover"
                }
            }, {
                "id": "air-quality-panel",
                "props": {
                    "title": "Air Quality"
                }
            }, {
                "id": "imagery-panel",
                "props": {
                    "title": "Imagery"
                }
            }, {
                "id": "social-media-panel",
                "props": {
                    "title": "Social Media"
                }
            }]
        },
        //sliders
        {
            "id": "forest-transparency-slider",
            "type": "horizontal-slider",
            "props": {
                "value": 100,
                "minimum": 0,
                "maximum": 100,
                "intermediateChanges": false
            }
        }, {
            "id": "conservation-transparency-slider",
            "type": "horizontal-slider",
            "props": {
                "value": 100,
                "minimum": 0,
                "maximum": 100,
                "intermediateChanges": false
            }
        }, {
            "id": "land-cover-transparency-slider",
            "type": "horizontal-slider",
            "props": {
                "value": 100,
                "minimum": 0,
                "maximum": 100,
                "intermediateChanges": false
            }
        },
        //FIRES
        {
            "id": "fires-checkbox",
            "type": "checkbox",
            "props": {}
        }, {
            "id": "confidence-fires-checkbox",
            "class": "fires-confidence-checkbox",
            "type": "checkbox",
            "props": {}
        }, {
            "id": "noaa-fires-18",
            "class": "noaa-checkbox",
            "type": "checkbox",
            "props": {
                "disabled": "disabled"
            }
        }, {
            "id": "burned-scars-checkbox",
            "class": "burned-area-layers-option",
            "type": "checkbox",
            "props": {
                "value": "burnedAreas"
            }
        },

        //FOREST USE
        {
            "id": "oil-palm-checkbox",
            "class": "forest-use-layers-option",
            "type": "checkbox",
            "props": {
                "value": "oilPalm"
            }
        },{
            "id": "rspo-oil-palm-checkbox",
            "class": "forest-use-layers-option",
            "type": "checkbox",
            "props": {
                "value": "rspoOilPalm"
            }
        }, {
            "id": "wood-fiber-checkbox",
            "class": "forest-use-layers-option",
            "type": "checkbox",
            "props": {
                "value": "woodFiber"
            }
        }, {
            "id": "logging-checkbox",
            "class": "forest-use-layers-option",
            "type": "checkbox",
            "props": {
                "value": "logging"
            }
        },
        //CONSERVATION
        {
            "id": "protected-areas-checkbox",
            "class": "conservation-layers-option",
            "type": "checkbox",
            "props": {
                "value": "protectedAreas"
            }
        },
        //LAND COVER
        {
            "id": "no-land-cover-radio",
            "class": "land-cover-layers-option",
            "type": "radio",
            "props": {
                "value": "none",
                "name": "land-cover-radios",
                "checked": true
            }
        }, {
            "id": "peat-lands-radio",
            "class": "land-cover-layers-option",
            "type": "radio",
            "props": {
                "value": "peatLands",
                "name": "land-cover-radios"
            }
        }, {
            "id": "tree-cover-density-radio",
            "class": "land-cover-layers-option",
            "type": "radio",
            "props": {
                "value": "treeCoverDensity",
                "name": "land-cover-radios",
            }
        }, //{
        //     "id": "se-land-cover-radio",
        //     "class": "land-cover-layers-option",
        //     "type": "radio",
        //     "props": {
        //         "value": "landCover",
        //         "name": "land-cover-radios",
        //     }
        // },
        //IMAGERY

        {
            "id": "primary-forests-radio",
            "type": "radio",
            "class": "land-cover-layers-option",
            "props": {
                "value": "primaryForests",
                "name": "land-cover-radios",
            }
        }, {
            "id": "digital-globe-checkbox",
            "class": "imagery-checkbox",
            "type": "checkbox",
            "props": {}
        }, {
            "id": "landsat-image-checkbox",
            "class": "imagery-checkbox",
            "type": "checkbox",
            "props": {}
        },
        //TWITTER
        {
            "id": "twitter-conversations-checkbox",
            "class": "twitter-checkbox",
            "type": "checkbox",
            "props": {}
        }, {
            "id": "windy-layer-checkbox",
            "class": "air-quality-checkbox",
            "type": "checkbox",
            "props": {}
        }, {
            "id": "air-quality-checkbox",
            "class": "air-quality-checkbox",
            "type": "checkbox",
            "props": {}
        }, {
            "id": "provinces-checkbox",
            "class": "overlays-checkbox",
            "type": "checkbox",
            "props": {}
        }, {
            "id": "districts-checkbox",
            "class": "overlays-checkbox",
            "type": "checkbox",
            "props": {}
        }, {
            "id": "subdistricts-checkbox",
            "class": "overlays-checkbox",
            "type": "checkbox",
            "props": {}
        }, {
            "id": "villages-checkbox",
            "class": "overlays-checkbox",
            "type": "checkbox",
            "props": {}
        },

        {
            "id": "pf2000-radio",
            "type": "radio",
            "class": "primary-forests-option",
            "props": {
                "value": "0",
                "name": "primary-forest-radios"
            }
        }, {
            "id": "pf2005-radio",
            "type": "radio",
            "class": "primary-forests-option",
            "props": {
                "value": "1",
                "name": "primary-forest-radios"
            }
        }, {
            "id": "pf2010-radio",
            "type": "radio",
            "class": "primary-forests-option",
            "props": {
                "value": "2",
                "name": "primary-forest-radios"
            }
        }, {
            "id": "pf2012-radio",
            "type": "radio",
            "class": "primary-forests-option",
            "props": {
                "value": "3",
                "name": "primary-forest-radios",
                "checked": true
            }
        }

    ]

});