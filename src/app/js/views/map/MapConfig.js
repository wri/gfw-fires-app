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
        "http://localhost:": "http://localhost:8080/php/proxy.php"
    },

    mapOptions: {
        darkGrayCanvas: "http://tiles4.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Dark_Gray_Base_Beta/MapServer",
        basemap: "gray",
        minZoom: 3,
        initalZoom: 5,
        center: [115, 0],
        sliderPosition: 'top-right'
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
        oilPalm: 32, // These map to the value of an input in the UI, so oilPalm is the value of a checkbox
        woodFiber: 28, // These map to the value of an input in the UI, so oilPalm is the value of a checkbox
        logging: 10 // These map to the value of an input in the UI, so oilPalm is the value of a checkbox
    },

    conservationLayers: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/moremaps2_EN/MapServer',
        id: 'Conservation',
        defaultLayers: [-1], // Show none by default
        protectedAreas: 25 // These map to the value of an input in the UI, so oilPalm is the value of a checkbox
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
        defaultLayers: [0]
    },

    treeCoverLayer: {
        url: "http://50.18.182.188:6080/arcgis/rest/services/TreeCover2000/ImageServer",
        id: "Tree_Cover_Density"
    },

    landsat8: {
        prefix: "http://landsat.arcgis.com/arcgis/rest/services/",
        url: "http://landsat.arcgis.com/arcgis/rest/services/Landsat8_PanSharpened/ImageServer",
        id: "LandSat_8"
    },

    digitalGlobe: {
        url: 'http://gis-potico.wri.org/arcgis/rest/services/Fires/active_fire_imagery_test/ImageServer',
        id: 'Digital_Globe'
    },

    windData: {
        prefix: "http://suitability-mapper.s3.amazonaws.com/"
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
        firesCheckbox: "Active Fires",
        firesSubLabel: "(past 7 days and archive, 1km, global, NASA)",
        noaaFiresCheckbox: "NOAA-18 Fires (coming soon)",
        confidenceFiresCheckbox: "Only show high confidence fires.",
        firesWeek: "Past Week",
        fires72: "Past 72 hours",
        fires48: "Past 48 hours",
        fires24: "Past 24 hours",
        none: "None",
        oilPalmCheckbox: "Oil Palm concessions",
        woodFiberCheckbox: "Wood Fiber plantations",
        loggingCheckbox: "Logging concessions",
        protectedAreasCheckbox: "Protected Areas",
        peatLandsRadio: "Peat Lands",
        treeCoverDensityRadio: "Tree cover density",
        primaryForestsRadio: "Primary Forests",
        southeastLandCoverRadio: "Land Cover - Southeast Asia",
        peatLandsSubLabel: "(year 2002, Indonesia)",
        treeCoverDensitySubLabel: "(year 2000, 30m, global)",
        primaryForestsSubLabel: "(2000, 30m, Indonesia)",
        southeastLandCoverSubLabel: "(year 2005, Indonesia, Malaysia, Papua New Guinea)",
        forestUseCheckboxSubLabelSelect: "(varies, select countries)",
        conservationCheckboxSubLabelGlobal: "(varies, global)",
        airQuality: "Air Quality (Coming Soon)",
        windDirection: "Wind Direction (Coming Soon)",
        digitalGlobeCheckbox: "Digital Globe - First Look",
        landsatImageCheckbox: "Landsat 8 Pan-sharpened",
        landsatImageSubLabel: "(updated daily, 30m, global)",
        twitterConversationsCheckbox: "Twitter Conversations",
        transparencySliderLabel: "Adjust Layer Transparency:",
        getReportLink: "Get Fires Analysis",
        windyLayerCheckbox: "Wind Direction (beta feature)",
        windySubLabelAdvice: "For best visual appearance, switch to the Dark Gray Canvas Basemap",
        windySubLabel: "(Daily, NOAA)",
        provincesCheckbox: "Provinces",
        districtsCheckbox: "Districts", 
        subDistrictsCheckbox: "Subdistricts", 
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
        }, {
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
            "props": {
                "checked": "checked"
            }
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
        },
        //FOREST USE
        {
            "id": "oil-palm-checkbox",
            "class": "forest-use-layers-option",
            "type": "checkbox",
            "props": {
                "value": "oilPalm"
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
        //PROTECTED AREAS
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
                "name": "land-cover-radios"
            }
        }, {
            "id": "peat-lands-radio",
            "class": "land-cover-layers-option",
            "type": "radio",
            "props": {
                "value": "peatLands",
                "name": "land-cover-radios",
                "checked": "checked"
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
        },
        {
            "id": "windy-layer-checkbox",
            "class": "air-quality-checkbox",
            "type": "checkbox",
            "props": {}
        },
        {
            "id": "air-quality-checkbox",
            "class": "air-quality-checkbox",
            "type": "checkbox",
            "props": {
                "disabled": true
            }
        },
        {
            "id": "provinces-checkbox",
            "class": "overlays-checkbox",
            "type": "checkbox",
            "props": {}
        },
        {
            "id": "districts-checkbox",
            "class": "overlays-checkbox",
            "type": "checkbox",
            "props": {}
        },
        {
            "id": "subdistricts-checkbox",
            "class": "overlays-checkbox",
            "type": "checkbox",
            "props": {}
        },
        {
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
                "name": "primary-forest-radios",
                "checked": true
            }
        },
        {
            "id": "pf2005-radio",
            "type": "radio",
            "class": "primary-forests-option",
            "props": {
                "value": "1",
                "name": "primary-forest-radios"
            }
        },
        {
            "id": "pf2010-radio",
            "type": "radio",
            "class": "primary-forests-option",
            "props": {
                "value": "2",
                "name": "primary-forest-radios"
            }
        },
        {
            "id": "pf2012-radio",
            "type": "radio",
            "class": "primary-forests-option",
            "props": {
                "value": "3",
                "name": "primary-forest-radios"
            }
        }

    ]

});