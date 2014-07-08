/* global define */
define([
	"dojo/Deferred",
	"dijit/registry",
	"esri/request",
	"utils/Helper",
	"utils/RasterLayer",
	"modules/ErrorController",
	"libs/windy"
], function (Deferred, registry, esriRequest, Helper, RasterLayer, ErrorController) {

	var _map,
	_isSupported,
	_handles,
	_raster,
	_windy,
	_data,
	WIND_CONFIG = {
		dataUrl: 'http://suitability-mapper.s3.amazonaws.com/wind/wind-surface-level-gfs-1.0.json.gz',
		id: "Wind_Direction",
		opacity: 0.85,
		mapLoaderId: 'map_loader',
		mapLoaderContainer: 'map-container'
	};

	return {

		setMap: function (map) {
			_map = map;
		},

		toggleWindLayer: function (checked) {

			if (_isSupported === undefined) {
				_isSupported = this.supportsCanvas();
				// Check for Canvas Support, if not supported, diasble the checkbox and show a message beneath it
				if (_isSupported === false) {
					registry.byId("windy-layer-checkbox").set('checked', false);
					registry.byId("windy-layer-checkbox").set('disabled', true);
					ErrorController.show(10, "This browser does not support this feature. " + 
						"Visit <a target='_blank' href='http://www.caniuse.com/#search=canvas'>caniuse.com</a> for supported browsers.");
				}
			}

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

			Helper.showLoader(WIND_CONFIG.mapLoaderContainer, WIND_CONFIG.mapLoaderId);

			var deferred = new Deferred(),
				req = new esriRequest({
					url: WIND_CONFIG.dataUrl,
					content: {},
					handleAs: 'json'
				});

			req.then(function (res) {
				_data = res;
				deferred.resolve(true);
				Helper.hideLoader(WIND_CONFIG.mapLoaderId);
			}, function (err) {
				console.error(err);
				deferred.resolve(false);
				Helper.hideLoader(WIND_CONFIG.mapLoaderId);
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