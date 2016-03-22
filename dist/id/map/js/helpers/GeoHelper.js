define(['exports', 'js/config', 'dojo/Deferred', 'esri/geometry/Point', 'esri/SpatialReference', 'esri/tasks/GeometryService', 'esri/geometry/webMercatorUtils', 'esri/geometry/geometryEngine'], function (exports, _config, _Deferred, _Point, _SpatialReference, _GeometryService, _webMercatorUtils, _geometryEngine) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _Deferred2 = _interopRequireDefault(_Deferred);

    var _Point2 = _interopRequireDefault(_Point);

    var _SpatialReference2 = _interopRequireDefault(_SpatialReference);

    var _GeometryService2 = _interopRequireDefault(_GeometryService);

    var _webMercatorUtils2 = _interopRequireDefault(_webMercatorUtils);

    var _geometryEngine2 = _interopRequireDefault(_geometryEngine);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var GeoHelper = function () {
        function GeoHelper() {
            _classCallCheck(this, GeoHelper);

            this.geometryService = null;
            this.spatialReference = null;
        }

        _createClass(GeoHelper, [{
            key: 'getSpatialReference',
            value: function getSpatialReference() {
                this.spatialReference = this.spatialReference || new _SpatialReference2.default(102100);
                return this.spatialReference;
            }
        }, {
            key: 'getGeometryService',
            value: function getGeometryService() {
                this.geometryService = this.geometryService || new _GeometryService2.default(_config.mapConfig.geometryServiceUrl);
                return this.geometryService;
            }
        }, {
            key: 'union',
            value: function union(polygons) {
                if (Object.prototype.toString.call(polygons) !== '[object Array]') {
                    throw new Error('Method expects polygons paramter to be of type Array');
                }

                var deferred = new _Deferred2.default(),
                    geometryService = this.getGeometryService();

                if (polygons.length === 1) {
                    deferred.resolve(polygons[0]);
                } else {
                    geometryService.union(polygons, deferred.resolve, deferred.resolve);
                }
                return deferred;
            }
        }, {
            key: 'convertGeometryToGeometric',
            value: function convertGeometryToGeometric(geometry) {
                var _this = this;

                var geometryArray = [],
                    newRings = [],
                    lngLat,
                    point;

                // Helper function to determine if the coordinate is already in the array
                // This signifies the completion of a ring and means I need to reset the newRings
                // and start adding coordinates to the new newRings array
                function sameCoords(arr, coords) {
                    var result = false;
                    arr.forEach(function (item) {
                        if (item[0] === coords[0] && item[1] === coords[1]) {
                            result = true;
                        }
                    });
                    return result;
                }

                geometry.rings.forEach(function (ringers) {
                    ringers.forEach(function (ring) {
                        point = new _Point2.default(ring, _this.getSpatialReference());
                        lngLat = _webMercatorUtils2.default.xyToLngLat(point.x, point.y);
                        if (sameCoords(newRings, lngLat)) {
                            newRings.push(lngLat);
                            geometryArray.push(newRings);
                            newRings = [];
                        } else {
                            newRings.push(lngLat);
                        }
                    });
                });

                return {
                    geom: geometryArray.length > 1 ? geometryArray : geometryArray[0],
                    type: geometryArray.length > 1 ? 'MultiPolygon' : 'Polygon'
                };
            }
        }, {
            key: 'simplify',
            value: function simplify(geometry) {
                return _geometryEngine2.default.simplify(geometry);
            }
        }]);

        return GeoHelper;
    }();

    exports.default = new GeoHelper();
});