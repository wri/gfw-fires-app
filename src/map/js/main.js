import babelPolyfill from 'babel-polyfill';
import LayerModal from 'components/Modals/LayerModal';
import ShareModal from 'components/Modals/ShareModal';
//import AlertsModal from 'components/Modals/AlertsModal';
import CanopyModal from 'components/Modals/CanopyModal';
import {loadCSS, loadJS} from 'utils/loaders';
import {assetUrls, defaults} from 'js/config';
import Map from 'components/Map';
import esriConfig from 'esri/config';
import ReactDOM from 'react-dom';
import React from 'react';

// import GeoProcessor from 'esri/tasks/Geoprocessor';
// import SR from 'esri/SpatialReference';

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

let lazyloadAssets = () => {
  app.debug('main >>> lazyloadAssets');
  // This was causing issues so leave this out unless we get bad pagespeed scores
  //loadCSS(assetUrls.ionCSS);
  //loadCSS(assetUrls.ionSkinCSS);
  //loadJS(assetUrls.highcharts);
  //loadJS(assetUrls.highchartsMore);
};

let configureApp = () => {
  app.debug('main >>> configureApp');
  defaults.corsEnabledServers.forEach((server) => {esriConfig.defaults.io.corsEnabledServers.push(server)});
};

let initializeApp = () => {
  app.debug('main >>> initializeApp');
  ReactDOM.render(<Map />, document.getElementById('root'));
  ReactDOM.render(<LayerModal />, document.getElementById('layer-modal'));
  //ReactDOM.render(<ShareModal />, document.getElementById('share-modal'));
  //ReactDOM.render(<AlertsModal />, document.getElementById('alerts-modal'));
  //ReactDOM.render(<CanopyModal />, document.getElementById('canopy-modal'));
};

configureApp();
initializeApp();
lazyloadAssets();
