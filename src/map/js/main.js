import babelPolyfill from 'babel-polyfill';
import LayerModal from 'components/Modals/LayerModal';
import CanopyModal from 'components/Modals/CanopyModal';
import BasemapModal from 'components/Modals/BasemapModal';
import GlobeStartModal from 'components/Modals/GlobeStartModal';
import GlobeEndModal from 'components/Modals/GlobeEndModal';
//import AlertsModal from 'components/Modals/AlertsModal';
import {defaults} from 'js/config';
import Map from 'components/Map';
import esriConfig from 'esri/config';
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
};

let initializeApp = () => {
  app.debug('main >>> initializeApp');
  ReactDOM.render(<Map />, document.getElementById('root'));
  ReactDOM.render(<LayerModal />, document.getElementById('layer-modal'));
  ReactDOM.render(<CanopyModal />, document.getElementById('canopy-modal'));
  ReactDOM.render(<BasemapModal />, document.getElementById('basemap-modal'));
  ReactDOM.render(<GlobeStartModal domId='globeStartCalendar' domClass='start-class'/>, document.getElementById('globe-start-modal'));
  ReactDOM.render(<GlobeEndModal domId='globeEndCalendar' domClass='end-class'/>, document.getElementById('globe-end-modal'));
  //ReactDOM.render(<AlertsModal />, document.getElementById('alerts-modal'));
};

configureApp();
initializeApp();
