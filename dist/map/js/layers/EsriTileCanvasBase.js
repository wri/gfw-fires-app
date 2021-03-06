define(['exports', 'dojo/_base/declare', 'esri/geometry/Point', 'esri/layers/layer', '../constants'], function (exports, _declare, _Point, _layer, _constants) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _declare2 = _interopRequireDefault(_declare);

  var _Point2 = _interopRequireDefault(_Point);

  var _layer2 = _interopRequireDefault(_layer);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  //- Default settings
  var DEFAULTS = {
    tileSize: 256,
    maxZoom: 12
  };

  //- Tile Settings
  //this is breaking our prerender!
  var TILEINFO = {
    rows: 256,
    cols: 256,
    origin: {
      x: -20037508.34,
      y: 20037508.34
    }
  };

  //- Helper Functions
  /**
  * Test canvas support
  * @return {boolean}
  */
  var supportsCanvas = function supportsCanvas() {
    var canvas = document.createElement('canvas');
    return canvas && canvas.getContext;
  };

  /**
  * @description Simple method to return a valid css translate3d string
  * @return {string} simple valid css rule for transform
  */
  function getTranslate(position) {
    return 'translate3d(' + position.x + 'px, ' + position.y + 'px, 0)';
  }

  /**
  * @description Calculate the tile row this should reside in
  * @return {number} tile coordinate
  */
  function getRow(yValue, resolution) {
    var sizeInMapUnits = TILEINFO.rows * resolution;
    return Math.floor((TILEINFO.origin.y - yValue) / sizeInMapUnits);
  }

  /**
  * @description Calculate the tile column this should reside in
  * @return {number} tile coordinate
  */
  function getColumn(xValue, resolution) {
    var sizeInMapUnits = TILEINFO.cols * resolution;
    return Math.floor((xValue - TILEINFO.origin.x) / sizeInMapUnits);
  }

  /**
  * @description Get an array of tile infos so I know what tiles are needed for this extent
  * @return {object[]} - array of objects containing the x, y, and z properties
  */
  function getTileInfos(rowMin, colMin, rowMax, colMax, level) {
    var infos = [],
        row,
        col;
    for (col = colMin; col <= colMax; col++) {
      for (row = rowMin; row <= rowMax; row++) {
        infos.push({ x: col, y: row, z: level });
      }
    }
    return infos;
  }

  /**
  * Taken from http://gis.stackexchange.com/questions/17278/calculate-lat-lon-bounds-for-individual-tile-generated-from-gdal2tiles
  * @description Get the longitude for the top left corner of the tile
  * @return {number} longitude
  */
  function longitudeFromTile(col, zoom) {
    return col / Math.pow(2, zoom) * 360 - 180;
  }

  /**
  * Taken from http://gis.stackexchange.com/questions/17278/calculate-lat-lon-bounds-for-individual-tile-generated-from-gdal2tiles
  * @description Get the latitude for the top left corner of the tile
  * @return {number} latitude
  */
  function latitudeFromTile(row, zoom) {
    var n = Math.PI - Math.PI * 2 * row / Math.pow(2, zoom);
    return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  /**
  * @class
  * @classdesc Base class for Tiled Canvas layer in the esri platform
  */
  exports.default = (0, _declare2.default)('EsriTileCanvasBase', [_layer2.default], {

    /**
    * @description Override Esri Layer Constructor
    * @param {string} id - Id for this layer
    * @param {object} options - Set of options to use for the layer
    */
    constructor: function constructor(options) {
      //- Mixin options with some defaults
      this.options = Object.assign({}, DEFAULTS, options);
      //- Set some default esri layer properties
      this.visible = this.options.visible !== undefined ? this.options.visible : true;
      this.loaded = true;
      if (this.options.id) {
        this.id = this.options.id;
      }
      //- Create a tile cache to optimize this layer
      this.tiles = {};
      this.opacity = 1;
      this.tileRequests = [];
      //- Store the position of the map, this is used to apply transforms
      this.position = { x: 0, y: 0 };
      //- Create an array of handles for events
      this._handles = [];
      //- Check for mandatory options or features
      if (!supportsCanvas()) {
        throw new Error('Canvas is not supported in this browser.');
      }
      //- Template must be in a specific format for now
      //- Example: http://wri-tiles.s3.amazonaws.com/glad_test/test2/{z}/{x}/{y}.png
      if (!this.options.url) {
        throw new Error('You must provide a \'url\' in your options.');
      }

      //- Trigger the parents onLoad functionality
      this.onLoad(this);
    },

    /**
    * @description Override _setMap method, called when the layer is added to the map
    * @return {Element} must return a HTML element
    */
    _setMap: function _setMap(map) {
      this._map = map;
      //- Create a container element for al the canvas tiles
      this._container = document.createElement('div');
      this._container.style.display = this.visible ? 'block' : 'none';
      this._container.style.transform = getTranslate(this.position);
      this._container.style.position = 'absolute';
      this._container.style.height = '100%';
      this._container.style.width = '100%';
      this._container.style.left = 0;
      this._container.style.top = 0;

      //- Add event listeners
      this._handles.push(this._map.on('extent-change', this._extentChanged.bind(this)));
      this._handles.push(this._map.on('zoom-start', this._onZoomStart.bind(this)));
      this._handles.push(this._map.on('pan-end', this._onPanEnd.bind(this)));
      this._handles.push(this._map.on('pan', this._onPan.bind(this)));

      return this._container;
    },

    /**
    * @description Override _unsetMap method, called when the layer is removed from the map
    */
    _unsetMap: function _unsetMap() {
      this._handles.forEach(function (handle) {
        if (handle.remove) {
          handle.remove();
        }
      });
      this._map = null;
    },

    /**
    * @description Method to start the process for rendering canvases in tile grid
    */
    _extentChanged: function _extentChanged(urlChanged) {
      var _this = this;

      //- If the layer is not visible, bail
      if (!this.visible) {
        return;
      }
      var resolution = this._map.getResolution(),
          level = this._map.getLevel(),
          extent = this._map.extent;

      //- Delete tiles from other zoom levels
      for (var i = 0; i < this.tiles.length; i++) {
        if (this.tiles[i].z !== level) {
          this.tiles[i].canvas.remove();
          delete this.tiles[i];
        }
      }

      //- Get the min and max tile row and column
      var rowMin = getRow(extent.ymax, resolution); // This and the next are flipped, not sure why
      var rowMax = getRow(extent.ymin, resolution);
      var colMin = getColumn(extent.xmin, resolution);
      var colMax = getColumn(extent.xmax, resolution);
      //- Get a range of tiles for this extent, each info contains x, y, z
      var tileInfos = getTileInfos(rowMin, colMin, rowMax, colMax, level);
      //- Fetch the tile and update the map
      tileInfos.forEach(function (tile) {
        return _this._fetchTile(tile, urlChanged);
      });

      var tilesToDelete = [];

      for (var c = 0; c < this._container.children.length; c++) {
        var tileId = this._container.children[c].id;
        tileId = tileId.split('_');
        if (tileId.length > 0) {
          // if (this.id === KEYS.TREE_COVER_LOSS) {
          //   let tileIdLevel = tileId[3];
          //   if (tileIdLevel) {
          //     tileIdLevel = parseInt(tileIdLevel);
          //     if (tileIdLevel !== level) {
          //       // this._container.children[c].remove();
          //       tilesToDelete.push(this._container.children[c]);
          //     }
          //   }
          //   let tileIdThresh = tileId[0];
          //   if (tileIdThresh) {
          //     tileIdThresh = parseInt(tileIdThresh);
          //     if (tileIdThresh !== parseInt(this.options.url.split('tc')[1].substr(0, 2))) {
          //       tilesToDelete.push(this._container.children[c]);
          //     }
          //   }
          // } else {
          tileId = tileId[2];
          if (tileId) {
            tileId = parseInt(tileId);
            if (tileId !== level) {
              tilesToDelete.push(this._container.children[c]);
            }
          }
          // }
        }
      }
      tilesToDelete.forEach(function (tile) {
        tile.remove();
      });
    },

    /**
    * @description Clear out the cache and remove canvas elements from the DOM to prepare for the next zoom level
    */
    _onZoomStart: function _onZoomStart() {
      var _this2 = this;

      //- Delete tiles from other zoom levels in cache and their canvas element
      Object.keys(this.tiles).forEach(function (key) {
        delete _this2.tiles[key];
      });
      //- Reset the position and clear the container contents
      this.position = { x: 0, y: 0 };
      this._container.innerHTML = '';
      this._container.style.transform = getTranslate(this.position);

      for (var c = 0; c < this.tileRequests.length; c++) {
        this.tileRequests[c].abort();
      }
      this.tileRequests = [];
    },

    /**
    * @description Update the position variable for tracking purposes
    */
    _onPanEnd: function _onPanEnd(_ref) {
      var delta = _ref.delta;

      this.position = {
        x: this.position.x + delta.x,
        y: this.position.y + delta.y
      };
    },

    /**
    * @description Update the position of the container via transforms
    */
    _onPan: function _onPan(_ref2) {
      var delta = _ref2.delta;

      this._container.style.transform = getTranslate({
        x: this.position.x + delta.x,
        y: this.position.y + delta.y
      });
    },

    /**
    * @description Get the tile from the cache or from the server if not cached
    * @param
    * @return {object} data
    */
    _fetchTile: function _fetchTile(tile, urlChanged) {
      var _this3 = this;

      var id = this._getId(tile);

      if (urlChanged && Object.keys(this.tiles).length) {
        Object.keys(this.tiles).forEach(function (key) {
          _this3.tiles[key].canvas.remove();
        });
        this.tiles = {};
      }

      var url = void 0;
      //- Don't fetch the image if we already have it
      if (!this.tiles.hasOwnProperty(id)) {
        //- If we are past max zoom, get the parent tile
        if (tile.z > this.options.maxZoom) {
          var steps = this._getZoomSteps(tile.z);
          var x = Math.floor(tile.x / Math.pow(2, steps));
          var y = Math.floor(tile.y / Math.pow(2, steps));
          url = this._getUrl({ x: x, y: y, z: this.options.maxZoom });
        } else {
          url = this._getUrl(tile);
        }

        this._fetchImage(url, function (image) {
          var canvas = document.createElement('canvas');
          canvas.height = _this3.options.tileSize;
          canvas.width = _this3.options.tileSize;
          canvas.style.position = 'absolute';
          canvas.setAttribute('id', id);

          var data = {
            x: tile.x,
            y: tile.y,
            z: tile.z,
            canvas: canvas,
            image: image,
            id: id,
            url: url
          };

          //- Cache the tile
          _this3.tiles[id] = data;
          //- Render the tile
          _this3._drawTile(data);
        });
        return;
      }
      this._drawTile(this.tiles[id]);
    },

    /**
    * @description Create a canvas element for each tile, add it to the container, draw the image, and filter it as necessary
    */
    _drawTile: function _drawTile(data) {
      'use asm';

      var longitude = longitudeFromTile(data.x, data.z),
          latitude = latitudeFromTile(data.y, data.z),
          coords = this._map.toScreen(new _Point2.default(longitude, latitude)),
          tileSize = this.options.tileSize,
          canvas = data.canvas;

      //- Add the element if it is not in the DOM already
      if (!canvas.parentElement) {
        var ctx = canvas.getContext('2d');
        //- Get the current position of the container to offset the tile position
        // canvas.style.transform = getTranslate({
        //   x: this.position.x + coords.x,
        //   y: this.position.y + coords.y
        // });

        var yTransfrom = Math.abs(this.position.y) + coords.y;
        if (this.position.y > 0) {
          yTransfrom = coords.y - this.position.y;
        }
        var xTransfrom = Math.abs(this.position.x) + coords.x;
        if (this.position.x > 0) {
          xTransfrom = coords.x - this.position.x;
        }
        canvas.style.transform = getTranslate({
          x: xTransfrom,
          y: yTransfrom
        });

        if (this.id === 'TREE_COVER_GAIN' && this._map.getZoom() < 12) {
          var hardUrl = 'url(' + data.url + ')';
          ctx.canvas.style.background = hardUrl;

          // ctx.canvas.style.background = 'url(http://earthengine.google.org/static/hansen_2013/gain_alpha/3/7/5.png)';
        } else {
          //- Scale the tile if we are past max zoom
          if (data.z > this.options.maxZoom) {
            var info = this._getSubrectangleInfo(data);
            //- Stop image enhancement
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.drawImage(data.image, info.sX, info.sY, info.sWidth, info.sHeight, 0, 0, tileSize, tileSize);
          } else {
            ctx.drawImage(data.image, 0, 0);
          }

          var imageData = ctx.getImageData(0, 0, tileSize, tileSize);
          imageData.data.set(this.filter(imageData.data, data.z));
          ctx.putImageData(imageData, 0, 0);
        }

        this._container.appendChild(canvas);

        var level = this._map.getLevel();

        if (data.z === level) {
          this._container.appendChild(canvas);
        }
      }
    },

    /**
    * @description Get the image for the tile
    */
    _fetchImage: function _fetchImage(url, callback) {
      var xhr = new XMLHttpRequest();

      xhr.onload = function () {
        var objecturl = URL.createObjectURL(this.response);
        var image = new Image();
        image.onload = function () {
          callback(image);
          URL.revokeObjectURL(objecturl);
        };
        image.src = objecturl;
      };

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.send();
    },

    /**
    * @description Return url for the tile
    * @return {string}
    */
    _getUrl: function _getUrl(tile) {
      return this.options.url.replace('{x}', tile.x).replace('{y}', tile.y).replace('{z}', tile.z);
    },

    /**
    * @description Return unique id for the tile
    * @return {string} id for the tile
    */
    _getId: function _getId(tile) {
      // if (this.id === KEYS.TREE_COVER_LOSS) {
      //   const urlOptions = this.options.url.split('tc');
      //   if (urlOptions[1]) {
      //     const tcd = this.options.url.split('tc')[1].substr(0, 2);
      //     return `${tcd}_${tile.x}_${tile.y}_${tile.z}`;
      //   } else {
      //     return `${tile.x}_${tile.y}_${tile.z}`;
      //   }
      // } else {
      return tile.x + '_' + tile.y + '_' + tile.z;
      // }
    },

    /**
    * Get the number of steps past the max zoom level
    * @return {number} steps
    */
    _getZoomSteps: function _getZoomSteps(level) {
      return level - this.options.maxZoom;
    },

    /**
    * @typedef SubRectangleInfo
    * @type Object
    * @property {number} sX - x coordinate of the sub-rectangle to use for the scaled image
    * @property {number} sY - y coordinate of the sub-rectangle to use for the scaled image
    * @property {number} sWidth - width of the sub-rectangle to use for the scaled image
    * @property {number} sHeight - height of the sub-rectangle to use for the scaled image
    * @description Get the sub-rectangle's x, y, width, and height of the image for this tile
    * @return {object} SubRectangleInfo
    */
    _getSubrectangleInfo: function _getSubrectangleInfo(data) {
      var steps = this._getZoomSteps(data.z),
          tileSize = this.options.tileSize;


      return {
        sX: tileSize / Math.pow(2, steps) * (data.x % Math.pow(2, steps)),
        sY: tileSize / Math.pow(2, steps) * (data.y % Math.pow(2, steps)),
        sWidth: tileSize / Math.pow(2, steps),
        sHeight: tileSize / Math.pow(2, steps)
      };
    },

    //- Methods that can be leveraged by the child class to force interactions
    /**
    * @description Force refresh all tiles in the tilecache
    * @description this should be called anytime any variable used in your filter changes
    */
    refresh: function refresh() {
      var _this4 = this;

      Object.keys(this.tiles).forEach(function (key) {
        var tile = _this4.tiles[key],
            ctx = tile.canvas.getContext('2d'),
            tileSize = _this4.options.tileSize;

        // Scale if necessary
        if (tile.z > _this4.options.maxZoom) {
          var info = _this4._getSubrectangleInfo(tile);
          ctx.imageSmoothingEnabled = false;
          ctx.mozImageSmoothingEnabled = false;
          ctx.drawImage(tile.image, info.sX, info.sY, info.sWidth, info.sHeight, 0, 0, tileSize, tileSize);
        } else {
          ctx.drawImage(tile.image, 0, 0, tileSize, tileSize);
        }

        var imageData = ctx.getImageData(0, 0, tileSize, tileSize);
        imageData.data.set(_this4.filter(imageData.data, tile.z));
        ctx.putImageData(imageData, 0, 0);
      });
    },

    /**
    * @description show the layer
    */
    show: function show() {
      this.visible = true;
      this._container.style.display = 'block';
      //- get the tiles incase they have not been loaded yet
      this._extentChanged();
    },

    /**
    * @description hide the layer
    */
    hide: function hide() {
      this.visible = false;
      this._container.style.display = 'none';
    },

    /**
    * @description set opacity on the layer
    */
    setOpacity: function setOpacity(value) {
      this._container.style.opacity = value;
      this.opacity = value;
    },

    //- Methods that need to be implemented by the child class
    filter: function filter() {
      throw new Error('The filter method must be implemented. It filters image data from context.getImageData().data. and must return an array.');
    }

  });
});