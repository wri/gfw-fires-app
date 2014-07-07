/* global define */
define([
	"dojo/Deferred",
	"esri/request",
	"utils/RasterLayer",
	"libs/windy"
], function (Deferred, esriRequest, RasterLayer) {

	var _map,
	_handles,
	_raster,
	_windy,
	_data,
	WIND_CONFIG = {
		dataUrl: 'http://suitability-mapper.s3.amazonaws.com/wind/wind-surface-level-gfs-1.0.json.gz',
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

				_map.addLayer(_raster);

				_handles = [];
				_handles.push(_map.on('extent-change', self.redraw));
				_handles.push(_map.on('zoom-start', self.redraw));
				_handles.push(_map.on('pan-start', self.redraw));

				_windy = new Windy({
					canvas: _raster._element,
					data: _data
				});

				self.redraw();

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
				_raster = undefined;
				_windy = undefined;
				for (var i = _handles.length - 1; i >= 0; i--) {
					_handles[i].remove();
				}
			}

		},

		fetchDataForWindLayer: function () {
			var deferred = new Deferred(),
				req = new esriRequest({
					url: WIND_CONFIG.dataUrl,
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

				_windy.stop();

				var extent = _map.geographicExtent;

				setTimeout(function () {
					_windy.start(
						[[0,0], [_map.width, _map.height]],
						_map.width,
						_map.height,
						[[extent.xmin, extent.ymin],[extent.xmax, extent.ymax]]
					);
				}, 500);
			}

		},

		supportsCanvas: function () {
			return !!document.createElement("canvas").getContext;
		}

	};

});