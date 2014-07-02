/* global define */
define([
	"utils/RasterLayer",
	"libs/windy"
], function (RasterLayer) {

	var _map,
	WIND_CONFIG = {
		id: "Wind_Direction"
	};

	return {

		setMap: function (map) {
			_map = map;

			// Check for Canvas Support, if not supported, diasble the checkbox and show a message beneath it
			if (this.supportsCanvas() === false) {
				
			}
		},

		toggleWindLayer: function (checked) {
			if (checked) {
				this.activateWindLayer();
			} else {
				this.deactivateWindLayer();
			}
		},

		activateWindLayer: function () {
			alert("Activate Wind Layer");
		},

		deactivateWindLayer: function () {
			var layer = _map.getLayer(WIND_CONFIG.id);
			if (layer) {
				_map.removeLayer(layer);
			}

		},

		supportsCanvas: function () {
			return !!document.createElement("canvas").getContext;
		}

	};

});