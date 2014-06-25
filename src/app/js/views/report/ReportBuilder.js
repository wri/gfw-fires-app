/* global define, window */
define([
	"dojo/dom",
	"dojo/ready",
	"dojo/Deferred",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/promise/all",
	"esri/map"
], function (dom, ready, Deferred, domStyle, domClass, all, Map) {

	var PRINT_CONFIG = {
		zoom: 5,
		basemap: 'gray',
		slider: false,
		mapcenter: [100, -1]
	};

	return {

		init: function () {
			var self = this;
			ready(function () {
				all([
					self.buildFiresMap(),
					self.buildDistrictFiresMap()
				]).then(function (res) {
					self.showReport();
				});
			});
		},

		buildFiresMap: function () {
			var deferred = new Deferred(),
					map;

			map = new Map("simple-fires-map", {
				basemap: PRINT_CONFIG.basemap,
        zoom: PRINT_CONFIG.zoom,
        center: PRINT_CONFIG.mapcenter,
        slider: PRINT_CONFIG.slider
			});

			map.on('load', function () {
				map.disableMapNavigation();
				deferred.resolve(true);
			});

			return deferred.promise;
		},

		buildDistrictFiresMap: function () {
			var deferred = new Deferred(),
					map;

			map = new Map("district-fires-map", {
				basemap: PRINT_CONFIG.basemap,
        zoom: PRINT_CONFIG.zoom,
        center: PRINT_CONFIG.mapcenter,
        slider: PRINT_CONFIG.slider
			});

			map.on('load', function () {
				map.disableMapNavigation();
				deferred.resolve(true);
			});
			
			return deferred.promise;
		},

		showReport: function () {
			domStyle.set("loading-screen","display","none");
			domStyle.set("report","display","block");
		}

	};

});