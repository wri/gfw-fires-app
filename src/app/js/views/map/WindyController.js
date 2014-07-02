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

		}

	};

});