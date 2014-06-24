/* global define */
define({

	mapOptions: {
		darkGrayCanvas: "http://tiles4.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Dark_Gray_Base_Beta/MapServer",
		basemap: "oceans",
		initalZoom: 3
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
		confidenceFiresCheckbox: "Only show high confidence fires.",
		firesWeek: "Past Week",
		fires72: "Past 72 hours",
		fires48: "Past 48 hours",
		fires24: "Past 24 hours"
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