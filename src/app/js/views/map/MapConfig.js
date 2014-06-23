/* global define */
define({

	mapOptions: {
		darkGrayCanvas: "http://tiles4.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Dark_Gray_Base_Beta/MapServer",
		basemap: "oceans",
		initalZoom: 3
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
		clearSearchPins: "Clear Pins"
	},

	accordionDijit: [
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