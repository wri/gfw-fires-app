import Windy from 'utils/windy';
import {modalActions} from 'actions/ModalActions';
import Deferred from 'dojo/Deferred';
import domStyle from 'dojo/dom-style';
import connect from 'dojo/_base/connect';
import arrayUtils from 'dojo/_base/array';
import domConstruct from 'dojo/dom-construct';
import esriLang from 'esri/lang';
import esriRequest from 'esri/request';
import ShareHelper from 'helpers/ShareHelper';
import domUtils from 'esri/domUtils';
import Layer from 'esri/layers/layer';

let WIND_CONFIG = {
  dataUrl: 'http://suitability-mapper.s3.amazonaws.com/wind/wind-surface-level-gfs-1.0.gz.json',
  id: 'Wind_Direction',
  opacity: 0.85,
  mapLoaderId: 'map_loader',
  mapLoaderContainer: 'map-container'
}, _data,
  _isSupported,
  _handles,
  _raster,
  _map,
  _windy;

esri.config.defaults.io.corsEnabledServers.push(WIND_CONFIG.dataUrl);

export default class RasterLayer extends Layer {
    constructor(data, options) {
      super(data, options);

      this.data = data;
      this.loaded = true;
      this.onLoad(this);
    }

    _setMap (map, container) {
      this._map = map;

      let element = this._element = domConstruct.create('canvas', {
        id: 'canvas',
        width: map.width + 'px',
        height: map.height + 'px',
        style: 'position: absolute; left: 0px; top: 0px;'
      }, container);

      if (esriLang.isDefined(this.opacity)) {
        domStyle.set(element, 'opacity', this.opacity);
      }

      this._context = element.getContext('2d');
      if (!this._context) {
        console.error('This browser does not support <canvas> elements.');
      }

      this._mapWidth = map.width;
      this._mapHeight = map.height;

      // Event connections
      this._connects = [];
      this._connects.push(connect.connect(map, "onPan", this, this._panHandler));
      this._connects.push(connect.connect(map, "onExtentChange", this, this._extentChangeHandler));
      this._connects.push(connect.connect(map, "onZoomStart", this, this.clear));
      this._connects.push(connect.connect(this, "onVisibilityChange", this, this._visibilityChangeHandler));

      return element;
    }

    _unsetMap (map, container) {
      arrayUtils.forEach(this._connects, connect.disconnect, this);
      if (this._element) {
        container.removeChild(this._element);
      }
      this._map = this._element = this._context = this.data = this._connects = null;
    }

    refresh () {
      if (!this._canDraw()) {
        return;
      }
    }

    clear () {
      if (!this._canDraw()) {
        return;
      }

      this._context.clearRect(0, 0, this._mapWidth, this._mapHeight);
    }

    _canDraw () {
      return (this._map && this._element && this._context) ? true : false;
    }

    _panHandler (extent, delta) {
      domStyle.set(this._element, { left: delta.x + 'px', top: delta.y + 'px' });
    }

    _extentChangeHandler (extent, delta, levelChange, lod) {
      if (!levelChange) {
        domStyle.set(this._element, { left: '0px', top: '0px' });
        this.clear();
      }
    }

    _visibilityChangeHandler (visible) {
      if (visible) {
        domUtils.show(this._element);
      }
      else {
        domUtils.hide(this._element);
      }
    }
}

let WindHelper = {

  activateWindLayer: function(updatedURL) {

    if (updatedURL) {
      this.fetchDataForWindLayer(updatedURL).then(function() {
        this.createWindLayer();
      }.bind(this));
      return;
    }

    if (!_data) {
      this.promptAboutBasemap();
      this.fetchDataForWindLayer().then(function() {
        this.createWindLayer();
      }.bind(this));
    } else {
      this.promptAboutBasemap();
      this.createWindLayer();
    }
  },

  createWindLayer() {
    _raster = new RasterLayer(null, {
      opacity: WIND_CONFIG.opacity,
      id: WIND_CONFIG.id
    });

    app.map.addLayer(_raster);

    _handles = [];
    _handles.push(app.map.on('extent-change', this.redraw));
    _handles.push(app.map.on('zoom-start', this.redraw));
    _handles.push(app.map.on('pan-start', this.redraw));


    _windy = new Windy({
      canvas: _raster._element,
      data: _data
    });

    this.redraw();

    ShareHelper.handleHashChange();

  },

  promptAboutBasemap () {
    let currentBM = app.map.getBasemap();

    if (currentBM !== 'dark-gray' && window.location.hash.indexOf('dark-gray') === -1) {
      console.log(currentBM);
      modalActions.showBasemapModal.defer();
    }

  },

  deactivateWindLayer: function() {
    var layer = app.map.getLayer(WIND_CONFIG.id);
    if (layer) {
      app.map.removeLayer(layer);
      _raster = undefined;
      _windy = undefined;
      for (var i = _handles.length - 1; i >= 0; i--) {
        _handles[i].remove();
      }
    }
    ShareHelper.handleHashChange();
  },

  fetchDataForWindLayer: function(optionalURL) {

    if (optionalURL) {
      WIND_CONFIG.dataUrl = optionalURL;
    }

    console.log(WIND_CONFIG.dataUrl);

    var deferred = new Deferred(),
      req = new esriRequest({
        url: WIND_CONFIG.dataUrl,
        content: {},
        handleAs: 'json'
      });

    req.then(function(res) {
      _data = res;
      deferred.resolve(true);
    }, function(err) {
      console.error(err);
      deferred.resolve(false);
    });

    return deferred.promise;
  },

  redraw: function() {
    if (_raster && _raster._element) {

      _raster._element.height = app.map.height;
      _raster._element.width = app.map.width;

      _windy.stop();

      var extent = app.map.geographicExtent;

      setTimeout(function() {
        if (_windy) {
          _windy.start(
            [
              [0, 0],
              [app.map.width, app.map.height]
            ],
            app.map.width,
            app.map.height, [
              [extent.xmin, extent.ymin],
              [extent.xmax, extent.ymax]
            ]
          );
        }
      }, 500);
    }

  },

  supportsCanvas: function() {
    return !!document.createElement('canvas').getContext;
  }

};

export { WindHelper as default };
