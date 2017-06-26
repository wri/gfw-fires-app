define(['babel-polyfill', 'components/Modals/LayerModal', 'components/Modals/CanopyModal', 'components/Modals/SearchModal', 'components/Modals/BasemapModal', 'components/Modals/CalendarModal', 'components/Modals/ConfirmationModal', 'components/Modals/SubscriptionModal', 'components/Modals/FiresModal', 'components/Modals/ShareModal', 'js/config', 'utils/loaders', 'components/Map', 'esri/config', 'esri/urlUtils', 'react-dom', 'react'], function (_babelPolyfill, _LayerModal, _CanopyModal, _SearchModal, _BasemapModal, _CalendarModal, _ConfirmationModal, _SubscriptionModal, _FiresModal, _ShareModal, _config, _loaders, _Map, _config2, _urlUtils, _reactDom, _react) {
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

  if (!_babelPolyfill2.default) {
    console.log('Missing Babel Polyfill.  May experience some weirdness in IE < 9.');
  }

  // Shim for rAF with timeout for callback

  //import AlertsModal from 'components/Modals/AlertsModal';
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
      urlPrefix: 'gis-gfw.wri.org/arcgis/rest/services/protected_services/MapServer',
      proxyUrl: '/map/php/proxy.php'
    });

    _urlUtils2.default.addProxyRule({
      urlPrefix: 'gfw-staging.wri.org/arcgis/rest/services/cached/wdpa_protected_areas/MapServer',
      proxyUrl: '/map/php/proxy.php'
    });
  };

  var lazyloadAssets = function lazyloadAssets() {
    // link(rel='stylesheet', href='./css/map.css?#{meta.version}')
    (0, _loaders.loadCSS)('../vendors/kalendae/build/kalendae.css');
    // loadCSS(`./css/map.css?${window.version}`);
    (0, _loaders.loadCSS)('//js.arcgis.com/3.20/esri/css/esri.css');
  };

  var initializeApp = function initializeApp() {
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
  };

  configureApp();
  lazyloadAssets();
  initializeApp();
});