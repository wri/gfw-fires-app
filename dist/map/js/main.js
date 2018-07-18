define(['babel-polyfill', 'components/Modals/LayerModal', 'components/Modals/CanopyModal', 'components/Modals/SearchModal', 'components/Modals/BasemapModal', 'components/Modals/CalendarModal', 'components/Modals/ConfirmationModal', 'components/Modals/SubscriptionModal', 'components/Modals/FiresModal', 'components/Modals/ShareModal', 'actions/AnalysisActions', 'js/config', 'utils/loaders', 'components/Map', 'esri/config', 'esri/urlUtils', 'react-dom', 'react'], function (_babelPolyfill, _LayerModal, _CanopyModal, _SearchModal, _BasemapModal, _CalendarModal, _ConfirmationModal, _SubscriptionModal, _FiresModal, _ShareModal, _AnalysisActions, _config, _loaders, _Map, _config2, _urlUtils, _reactDom, _react) {
  'use strict';

  var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

  var _LayerModal2 = _interopRequireDefault(_LayerModal);

  var _CanopyModal2 = _interopRequireDefault(_CanopyModal);

  var _SearchModal2 = _interopRequireDefault(_SearchModal);

  var _BasemapModal2 = _interopRequireDefault(_BasemapModal);

  var _CalendarModal2 = _interopRequireDefault(_CalendarModal);

  var _ConfirmationModal2 = _interopRequireDefault(_ConfirmationModal);

  var _SubscriptionModal2 = _interopRequireDefault(_SubscriptionModal);

  var _FiresModal2 = _interopRequireDefault(_FiresModal);

  var _ShareModal2 = _interopRequireDefault(_ShareModal);

  var _Map2 = _interopRequireDefault(_Map);

  var _config3 = _interopRequireDefault(_config2);

  var _urlUtils2 = _interopRequireDefault(_urlUtils);

  var _reactDom2 = _interopRequireDefault(_reactDom);

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  if (!_babelPolyfill2.default) {
    console.log('Missing Babel Polyfill.  May experience some weirdness in IE < 9.');
  }

  // Shim for rAF with timeout for callback
  window.requestAnimationFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  }();

  var configureApp = function configureApp() {
    app.debug('main >>> configureApp');
    _config.defaults.corsEnabledServers.forEach(function (server) {
      _config3.default.defaults.io.corsEnabledServers.push(server);
    });

    _urlUtils2.default.addProxyRule({
      urlPrefix: 'https://gis-gfw.wri.org/arcgis/rest/services/protected_services/MapServer',
      proxyUrl: '/map/php/proxy.php'
    });

    _urlUtils2.default.addProxyRule({
      urlPrefix: 'https://gis-gfw.wri.org/arcgis/rest/services/cached/wdpa_protected_areas/MapServer',
      proxyUrl: '/map/php/proxy.php'
    });
  };

  var lazyloadAssets = function lazyloadAssets() {
    (0, _loaders.loadCSS)('../vendors/kalendae/build/kalendae.css');
    (0, _loaders.loadCSS)('https://js.arcgis.com/3.20/esri/css/esri.css');
  };

  var parseTitles = function parseTitles(planetBasemaps, isMonthly) {
    // Filter out 'Latest Monthly' and 'Latest Quarterly'
    return planetBasemaps.filter(function (basemap) {
      if (basemap.title === 'Latest Monthly' || basemap.title === 'Latest Quarterly') {
        return false;
      } else {
        return true;
      }
    }).map(function (basemap) {
      var url = basemap.url,
          title = basemap.title;

      var label = isMonthly ? parseMonthlyTitle(title) : parseQuarterlyTitle(title);
      return {
        value: url,
        label: label
      };
    });
  };

  var parseMonthlyTitle = function parseMonthlyTitle(title) {
    // ex. formats 'Global Monthly 2016 01 Mosaic'
    var words = title.split(' ');
    var year = words[2];
    var month = words[3];
    var yyyyMM = year + ' ' + month;
    var label = window.Kalendae.moment(yyyyMM, 'YYYY MM').format('MMM YYYY');
    return label;
  };

  var parseQuarterlyTitle = function parseQuarterlyTitle(title) {
    var words = title.split(' ');
    var yearQuarter = words[2];

    var dict = {
      1: 'JAN-MAR',
      2: 'APR-JUN',
      3: 'JUL-SEP',
      4: 'OCT-DEC'
    };

    if (yearQuarter === undefined) {
      return title;
    } else {
      var _yearQuarter$split = yearQuarter.split('q'),
          _yearQuarter$split2 = _slicedToArray(_yearQuarter$split, 2),
          year = _yearQuarter$split2[0],
          quarter = _yearQuarter$split2[1];

      var label = dict[quarter] + ' ' + year;
      return label;
    }
  };

  var newPromise = new Promise(function (resolve, reject) {
    // Request XML page
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          var basemaps = [];

          var xmlParser = new DOMParser();
          var htmlString = '<!DOCTYPE html>' + xhttp.responseText.substring(38);

          var xmlDoc = xmlParser.parseFromString(htmlString, 'text/html');

          var contents = xmlDoc.getElementsByTagName('Contents')[0];
          var layerCollection = contents.getElementsByTagName('Layer');
          var layerCollectionLength = layerCollection.length;

          for (var i = 0; i < layerCollectionLength; i++) {
            var currentLayer = layerCollection[i];
            var title = currentLayer.getElementsByTagName('ows:Title')[0].innerHTML;
            var url = currentLayer.getElementsByTagName('ResourceURL')[0].getAttribute('template');
            basemaps.push({ title: title, url: url });
          }

          var monthlyBasemaps = [];
          var quarterlyBasemaps = [];
          basemaps.forEach(function (basemap) {
            if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Monthly') >= 0) {
              monthlyBasemaps.push(basemap);
            }
            if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Quarterly') >= 0) {
              quarterlyBasemaps.push(basemap);
            }
          });

          var parsedMonthly = parseTitles(monthlyBasemaps, true).reverse();
          var parsedQuarterly = parseTitles(quarterlyBasemaps, false).reverse();

          _AnalysisActions.analysisActions.saveMonthlyPlanetBasemaps(parsedMonthly);
          _AnalysisActions.analysisActions.saveQuarterlyPlanetBasemaps(parsedQuarterly);

          resolve(true);
        } else {
          console.log('Error retrieving planet basemaps.');
          reject(false);
        }
      }
    };
    xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=d4d25171b85b4f7f8fde459575cba233', true);
    xhttp.send();
  });

  var initializeApp = function initializeApp() {
    newPromise.then(function (done) {
      if (done) {
        app.debug('main >>> initializeApp');
        _reactDom2.default.render(_react2.default.createElement(_Map2.default, null), document.getElementById('root'));
        _reactDom2.default.render(_react2.default.createElement(_LayerModal2.default, null), document.getElementById('layer-modal'));
        _reactDom2.default.render(_react2.default.createElement(_CanopyModal2.default, null), document.getElementById('canopy-modal'));
        _reactDom2.default.render(_react2.default.createElement(_SearchModal2.default, null), document.getElementById('search-modal'));
        _reactDom2.default.render(_react2.default.createElement(_BasemapModal2.default, null), document.getElementById('basemap-modal'));
        _reactDom2.default.render(_react2.default.createElement(_CalendarModal2.default, { calendars: _config.defaults.calendars }), document.getElementById('calendar-modal'));
        _reactDom2.default.render(_react2.default.createElement(_SubscriptionModal2.default, null), document.getElementById('subscription-modal'));
        _reactDom2.default.render(_react2.default.createElement(_ConfirmationModal2.default, null), document.getElementById('confirmation-modal'));
        _reactDom2.default.render(_react2.default.createElement(_FiresModal2.default, null), document.getElementById('fires-modal'));
        _reactDom2.default.render(_react2.default.createElement(_ShareModal2.default, null), document.getElementById('share-modal'));
      }
    });
  };

  configureApp();
  lazyloadAssets();
  initializeApp();
});