import babelPolyfill from 'babel-polyfill';
import LayerModal from 'components/Modals/LayerModal';
import CanopyModal from 'components/Modals/CanopyModal';
import SearchModal from 'components/Modals/SearchModal';
import BasemapModal from 'components/Modals/BasemapModal';
import CalendarModal from 'components/Modals/CalendarModal';
import ConfirmationModal from 'components/Modals/ConfirmationModal';
import SubscriptionModal from 'components/Modals/SubscriptionModal';
import FiresModal from 'components/Modals/FiresModal';
import ShareModal from 'components/Modals/ShareModal';
//import AlertsModal from 'components/Modals/AlertsModal';
import {defaults} from 'js/config';
import {loadJS, loadCSS } from 'utils/loaders';
import Map from 'components/Map';
import esriConfig from 'esri/config';
import urlUtils from 'esri/urlUtils';
import ReactDOM from 'react-dom';
import React from 'react';

if (!babelPolyfill) { console.log('Missing Babel Polyfill.  May experience some weirdness in IE < 9.'); }

// Shim for rAF with timeout for callback
window.requestAnimationFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60); };
})();

let configureApp = () => {
  app.debug('main >>> configureApp');
  defaults.corsEnabledServers.forEach((server) => { esriConfig.defaults.io.corsEnabledServers.push(server); });

  urlUtils.addProxyRule({
    urlPrefix: 'https://gis-gfw.wri.org/arcgis/rest/services/protected_services/MapServer',
    proxyUrl: '/map/php/proxy.php'
  });

  urlUtils.addProxyRule({
    urlPrefix: 'https://gis-gfw.wri.org/arcgis/rest/services/cached/wdpa_protected_areas/MapServer',
    proxyUrl: '/map/php/proxy.php'
  });

};

let lazyloadAssets = () => {
  loadCSS(`../vendors/kalendae/build/kalendae.css`);
  loadCSS(`https://js.arcgis.com/3.20/esri/css/esri.css`);
 };

let initializeApp = () => {
  app.debug('main >>> initializeApp');
  ReactDOM.render(<Map />, document.getElementById('root'));
  ReactDOM.render(<LayerModal />, document.getElementById('layer-modal'));
  ReactDOM.render(<CanopyModal />, document.getElementById('canopy-modal'));
  ReactDOM.render(<SearchModal />, document.getElementById('search-modal'));
  ReactDOM.render(<BasemapModal />, document.getElementById('basemap-modal'));
  ReactDOM.render(<CalendarModal calendars={defaults.calendars}/>, document.getElementById('calendar-modal'));
  ReactDOM.render(<SubscriptionModal />, document.getElementById('subscription-modal'));
  ReactDOM.render(<ConfirmationModal />, document.getElementById('confirmation-modal'));
  ReactDOM.render(<FiresModal />, document.getElementById('fires-modal'));
  ReactDOM.render(<ShareModal />, document.getElementById('share-modal'));
};

configureApp();
lazyloadAssets();
initializeApp();
