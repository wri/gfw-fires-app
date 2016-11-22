define(['exports', 'utils/windy', 'actions/ModalActions', 'dojo/Deferred', 'dojo/dom-style', 'dojo/_base/connect', 'dojo/_base/array', 'dojo/dom-construct', 'esri/lang', 'esri/request', 'helpers/ShareHelper', 'esri/domUtils', 'esri/layers/layer'], function (exports, _windy2, _ModalActions, _Deferred, _domStyle, _connect, _array, _domConstruct, _lang, _request, _ShareHelper, _domUtils, _layer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;

  var _windy3 = _interopRequireDefault(_windy2);

  var _Deferred2 = _interopRequireDefault(_Deferred);

  var _domStyle2 = _interopRequireDefault(_domStyle);

  var _connect2 = _interopRequireDefault(_connect);

  var _array2 = _interopRequireDefault(_array);

  var _domConstruct2 = _interopRequireDefault(_domConstruct);

  var _lang2 = _interopRequireDefault(_lang);

  var _request2 = _interopRequireDefault(_request);

  var _ShareHelper2 = _interopRequireDefault(_ShareHelper);

  var _domUtils2 = _interopRequireDefault(_domUtils);

  var _layer2 = _interopRequireDefault(_layer);

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

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var WIND_CONFIG = {
    dataUrl: 'http://suitability-mapper.s3.amazonaws.com/wind/wind-surface-level-gfs-1.0.gz.json',
    id: 'Wind_Direction',
    opacity: 0.85,
    mapLoaderId: 'map_loader',
    mapLoaderContainer: 'map-container'
  },
      _data = void 0,
      _isSupported = void 0,
      _handles = void 0,
      _raster = void 0,
      _map = void 0,
      _windy = void 0;

  esri.config.defaults.io.corsEnabledServers.push(WIND_CONFIG.dataUrl);

  var RasterLayer = function (_Layer) {
    _inherits(RasterLayer, _Layer);

    function RasterLayer(data, options) {
      _classCallCheck(this, RasterLayer);

      var _this = _possibleConstructorReturn(this, (RasterLayer.__proto__ || Object.getPrototypeOf(RasterLayer)).call(this, data, options));

      _this.data = data;
      _this.loaded = true;
      _this.onLoad(_this);
      return _this;
    }

    _createClass(RasterLayer, [{
      key: '_setMap',
      value: function _setMap(map, container) {
        this._map = map;

        var element = this._element = _domConstruct2.default.create('canvas', {
          id: 'canvas',
          width: map.width + 'px',
          height: map.height + 'px',
          style: 'position: absolute; left: 0px; top: 0px;'
        }, container);

        if (_lang2.default.isDefined(this.opacity)) {
          _domStyle2.default.set(element, 'opacity', this.opacity);
        }

        this._context = element.getContext('2d');
        if (!this._context) {
          console.error('This browser does not support <canvas> elements.');
        }

        this._mapWidth = map.width;
        this._mapHeight = map.height;

        // Event connections
        this._connects = [];
        this._connects.push(_connect2.default.connect(map, "onPan", this, this._panHandler));
        this._connects.push(_connect2.default.connect(map, "onExtentChange", this, this._extentChangeHandler));
        this._connects.push(_connect2.default.connect(map, "onZoomStart", this, this.clear));
        this._connects.push(_connect2.default.connect(this, "onVisibilityChange", this, this._visibilityChangeHandler));

        return element;
      }
    }, {
      key: '_unsetMap',
      value: function _unsetMap(map, container) {
        _array2.default.forEach(this._connects, _connect2.default.disconnect, this);
        if (this._element) {
          container.removeChild(this._element);
        }
        this._map = this._element = this._context = this.data = this._connects = null;
      }
    }, {
      key: 'refresh',
      value: function refresh() {
        if (!this._canDraw()) {
          return;
        }
      }
    }, {
      key: 'clear',
      value: function clear() {
        if (!this._canDraw()) {
          return;
        }

        this._context.clearRect(0, 0, this._mapWidth, this._mapHeight);
      }
    }, {
      key: '_canDraw',
      value: function _canDraw() {
        return this._map && this._element && this._context ? true : false;
      }
    }, {
      key: '_panHandler',
      value: function _panHandler(extent, delta) {
        _domStyle2.default.set(this._element, { left: delta.x + 'px', top: delta.y + 'px' });
      }
    }, {
      key: '_extentChangeHandler',
      value: function _extentChangeHandler(extent, delta, levelChange, lod) {
        if (!levelChange) {
          _domStyle2.default.set(this._element, { left: '0px', top: '0px' });
          this.clear();
        }
      }
    }, {
      key: '_visibilityChangeHandler',
      value: function _visibilityChangeHandler(visible) {
        if (visible) {
          _domUtils2.default.show(this._element);
        } else {
          _domUtils2.default.hide(this._element);
        }
      }
    }]);

    return RasterLayer;
  }(_layer2.default);

  var WindHelper = {

    activateWindLayer: function activateWindLayer(updatedURL) {

      if (updatedURL) {
        this.fetchDataForWindLayer(updatedURL).then(function () {
          this.createWindLayer();
        }.bind(this));
        return;
      }

      if (!_data) {
        this.promptAboutBasemap();
        this.fetchDataForWindLayer().then(function () {
          this.createWindLayer();
        }.bind(this));
      } else {
        this.promptAboutBasemap();
        this.createWindLayer();
      }
    },

    createWindLayer: function createWindLayer() {
      _raster = new RasterLayer(null, {
        opacity: WIND_CONFIG.opacity,
        id: WIND_CONFIG.id
      });

      app.map.addLayer(_raster);

      _handles = [];
      _handles.push(app.map.on('extent-change', this.redraw));
      _handles.push(app.map.on('zoom-start', this.redraw));
      _handles.push(app.map.on('pan-start', this.redraw));

      _windy = new _windy3.default({
        canvas: _raster._element,
        data: _data
      });

      this.redraw();

      _ShareHelper2.default.handleHashChange();
    },
    promptAboutBasemap: function promptAboutBasemap() {
      var currentBM = app.map.getBasemap();

      if (currentBM !== 'dark-gray' && window.location.hash.indexOf('dark-gray') === -1) {
        console.log(currentBM);
        _ModalActions.modalActions.showBasemapModal.defer();
      }
    },


    deactivateWindLayer: function deactivateWindLayer() {
      var layer = app.map.getLayer(WIND_CONFIG.id);
      if (layer) {
        app.map.removeLayer(layer);
        _raster = undefined;
        _windy = undefined;
        for (var i = _handles.length - 1; i >= 0; i--) {
          _handles[i].remove();
        }
      }
      _ShareHelper2.default.handleHashChange();
    },

    fetchDataForWindLayer: function fetchDataForWindLayer(optionalURL) {

      if (optionalURL) {
        WIND_CONFIG.dataUrl = optionalURL;
      }

      console.log(WIND_CONFIG.dataUrl);

      var deferred = new _Deferred2.default(),
          req = new _request2.default({
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

    redraw: function redraw() {
      if (_raster && _raster._element) {

        _raster._element.height = app.map.height;
        _raster._element.width = app.map.width;

        _windy.stop();

        var extent = app.map.geographicExtent;

        setTimeout(function () {
          if (_windy) {
            _windy.start([[0, 0], [app.map.width, app.map.height]], app.map.width, app.map.height, [[extent.xmin, extent.ymin], [extent.xmax, extent.ymax]]);
          }
        }, 500);
      }
    },

    supportsCanvas: function supportsCanvas() {
      return !!document.createElement('canvas').getContext;
    }

  };

  exports.default = WindHelper;
});