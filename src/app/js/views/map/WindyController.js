/* global define */
define([
	"dojo/Deferred",
	"esri/request",
	"utils/RasterLayer",
	"libs/windy"
], function (Deferred, esriRequest, RasterLayer) {

	var _map,
	_raster,
	_windy,
	_data,
	WIND_CONFIG = {
		id: "Wind_Direction",
		opacity: 0.85
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

			var self = this;

			function createWindLayer() {
				_raster = new RasterLayer(null, {
					opacity: WIND_CONFIG.opacity,
					id: WIND_CONFIG.id
				});

				_map.addLayer(rasterLayer);

				_map.on('extent-change', self.redraw);
				_map.on('zoom-start', self.redraw);
				_map.on('pan-start', self.redraw);

			}

			if (!_data) {
				this.fetchDataForWindLayer().then(createWindLayer);
			} else {
				createWindLayer();
			}
		},

		deactivateWindLayer: function () {
			var layer = _map.getLayer(WIND_CONFIG.id);
			if (layer) {
				_map.removeLayer(layer);
			}

		},

		fetchDataForWindLayer: function () {
			var deferred = new Deferred(),
				req = new esriRequest({
					url: './app/gfs.json',
					content: {},
					handleAs: 'json'
				});

			req.then(function (res) {
				_data = res;
				deferred.resolve(true);
			}, function (err) {
				console.error(err);
				deferred.resolve(false);
			});
			

			return deferred.promise;
		},

		redraw: function () {

			if (_raster) {

				_raster._element.height = _map.height;
				_raster._element.width = _map.width;


			}

		},

		supportsCanvas: function () {
			return !!document.createElement("canvas").getContext;
		}

	};

});