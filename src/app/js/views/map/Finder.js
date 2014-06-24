/* global define, alert */
define([
	"dojo/dom",
	"dojo/_base/array",
	"esri/graphic",
	"esri/geometry/Point",
  "esri/geometry/webMercatorUtils",
	"esri/symbols/PictureMarkerSymbol",
	"views/map/MapConfig",
	"views/map/MapModel"
], function (dom, arrayUtils, Graphic, Point, webMercatorUtils, PictureSymbol, MapConfig, MapModel) {

	return {

		searchAreaByCoordinates: function (map) {
				var values = {},
	          latitude, longitude,
	          invalidValue = false,
	          invalidMessage = "You did not enter a valid value.  Please check that your location values are all filled in and nubmers only.",
	          symbol = new PictureSymbol('app/images/RedStickPin.png', 32, 32),
	          attributes = {},
	          point,
	          graphic,
	          getValue = function (value) {
	              if (!invalidValue) {
	                  invalidValue = isNaN(parseInt(value));
	              }
	              return isNaN(parseInt(value)) ? 0 : parseInt(value);
	          },
	          nextAvailableId = function () {
	              var value = 0;
	              arrayUtils.forEach(map.graphics.graphics, function (g) {
	                  if (g.attribtues) {
	                      if (g.attributes.locatorValue) {                            
	                          value = Math.max(value, parseInt(g.attributes.locatorValue));
	                      }
	                  }
	              });
	              return value;
	          };

	      // If the DMS Coords View is present, get the appropriate corrdinates and convert them
	      if (MapModel.get('showDMSInputs')) {
	          values.dlat = getValue(dom.byId('degreesLatInput').value);
	          values.mlat = getValue(dom.byId('minutesLatInput').value);
	          values.slat = getValue(dom.byId('secondsLatInput').value);
	          values.dlon = getValue(dom.byId('degreesLonInput').value);
	          values.mlon = getValue(dom.byId('minutesLonInput').value);
	          values.slon = getValue(dom.byId('secondsLonInput').value);
	          latitude = values.dlat + (values.mlat / 60) + (values.slat / 3600);
	          longitude = values.dlon + (values.mlon / 60) + (values.slon / 3600);
	      } else { // Else, get LatLong Coordinates and Zoom to them
	          latitude = getValue(dom.byId('latitudeInput').value);
	          longitude = getValue(dom.byId('longitudeInput').value);
	      }

	      if (invalidValue) {
	          alert(invalidMessage);
	      } else {
	          point = webMercatorUtils.geographicToWebMercator(new Point(longitude, latitude));
	          attributes.locatorValue = nextAvailableId();
	          attributes.id = 'LOCATOR_' + attributes.locatorValue;
	          graphic = new Graphic(point, symbol, attributes);
	          map.graphics.add(graphic);
	          map.centerAndZoom(point, 7);
	          MapModel.set('showClearPinsOption', true);
	      }
		},

		fetchTwitterData: function (evt) {
			var target = evt.target ? evt.target : evt.srcElement;
			if (!target.checked) {
				return;
			}

			
			
		}

	};

});