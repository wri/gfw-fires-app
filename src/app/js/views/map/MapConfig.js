/* global define */
define({

	proxyUrl: "http://rmb/proxy/proxy.php",

	mapOptions: {
		darkGrayCanvas: "http://tiles4.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Dark_Gray_Base_Beta/MapServer",
		basemap: "gray",
		initalZoom: 5,
		center: [115, 0],
		sliderPosition: 'top-right'
	},

	firesLayer: {
		url: "http://gis-potico.wri.org/arcgis/rest/services/Fires/Global_Fires/MapServer",
    id: "Active_Fires",
    defaultLayers: [0,1,2,3],
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

	additionalLayers: {
		url: 'http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/moremaps2_EN/MapServer',
		id: 'Additional_Maps',
		defaultLayers: [-1], // Show none by default
		peatLands: '1',
		landCover: '19',
		protectedAreas: '25',
		logging: '10',
		woodFiber: '28',
		oilPalm: '32'
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
		southeastLandCoverRadio: "Land Cover - Southeast Asia",
		peatLandsSubLabel: "(year 2002, Indonesia)",
		treeCoverDensitySubLabel: "(year 2000, 30m, global)",
		southeastLandCoverSubLabel: "(year 2005, Indonesia, Malaysia, Papua New Guinea)",
		forestUseCheckboxSubLabelSelect: "(varies, select countries)",
		conservationCheckboxSubLabelGlobal: "(varies, global)",
		airQuality: "Air Quality (Coming Soon)",
		windDirection: "Wind Direction (Coming Soon)",
		digitalGlobeCheckbox: "Digital Globe - First Look (Coming Soon)",
		landsatImageCheckbox: "Landsat 8 Pan-sharpened",
		landsatImageSubLabel: "(updated daily, 30m, global)",
		twitterConversationsCheckbox: "Twitter Conversations"
	},

	accordionDijits: [
		{
			"id": "fires-map-accordion",
			"type": "accordion",
			"props":{
				"class":"fires-map-accordion"
			}
		},
		{
			"id": "fires-panel",
			"type": "contentpane",
			"parent": "fires-map-accordion",
			"props": {
				"title": "Fires"
			}
		},
		{
			"id": "forest-use-panel",
			"type": "contentpane",
			"parent": "fires-map-accordion",
			"props": {
				"title": "Forest Use"
			}
		},
		{
			"id": "conservation-panel",
			"type": "contentpane",
			"parent": "fires-map-accordion",
			"props": {
				"title": "Conservation"
			}
		},
		{
			"id": "land-cover-panel",
			"type": "contentpane",
			"parent": "fires-map-accordion",
			"props": {
				"title": "Land Cover"
			}
		},
		{
			"id": "air-quality-panel",
			"type": "contentpane",
			"parent": "fires-map-accordion",
			"props": {
				"title": "Air Quality"
			}
		},
		{
			"id": "imagery-panel",
			"type": "contentpane",
			"parent": "fires-map-accordion",
			"props": {
				"title": "Imagery"
			}
		},
		{
			"id": "social-media-panel",
			"type": "contentpane",
			"parent": "fires-map-accordion",
			"props": {
				"title": "Social Media"
			}
		}
	]

});