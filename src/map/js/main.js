import babelPolyfill from 'babel-polyfill';
import LayerModal from 'components/Modals/LayerModal';
import ShareModal from 'components/Modals/ShareModal';
//import AlertsModal from 'components/Modals/AlertsModal';
import CanopyModal from 'components/Modals/CanopyModal';
import {loadCSS, loadJS} from 'utils/loaders';
import {assetUrls} from 'js/config';
import Map from 'components/Map';
import ReactDOM from 'react-dom';
import React from 'react';

// import GeoProcessor from 'esri/tasks/Geoprocessor';
// import SR from 'esri/SpatialReference';

if (!babelPolyfill) { console.log('Missing Babel Polyfill.  May experience some weirdness in IE < 9.'); }

// Set up globals
window.app = {
  debugEnabled: true,
  debug: function (message) {
    if (this.debugEnabled) {
      var print = typeof message === 'string' ? console.log : console.dir;
      print.apply(console, [message]);
    }
  }
};

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
};

let initializeApp = () => {
  app.debug('main >>> initializeApp');
  ReactDOM.render(<Map />, document.getElementById('root'));
  //ReactDOM.render(<LayerModal />, document.getElementById('layer-modal'));
  //ReactDOM.render(<ShareModal />, document.getElementById('share-modal'));
  //ReactDOM.render(<AlertsModal />, document.getElementById('alerts-modal'));
  //ReactDOM.render(<CanopyModal />, document.getElementById('canopy-modal'));
};

configureApp();
initializeApp();
lazyloadAssets();


// let test = () => {
//   let params = {
//     'SnapDistance': '5000',
//     'SnapDistanceUnits': 'Meters',
//     'DataSourceResolution': '90m',
//     'Generalize': 'True',
//     'f': 'json',
//     'InputPoints': '{"geometryType":"esriGeometryPoint","features":[{"geometry":{"x":11058950.018714607,"y":192244.0469047035,"spatialReference":{"wkid":102100,"latestWkid":3857}}}],"sr":{"wkid":102100,"latestWkid":3857}}'
//   };
//
//   let geoprocessor = new GeoProcessor('http://utility.arcgis.com/usrsvcs/appservices/epPvpBkwsBSgIYCd/rest/services/Tools/Hydrology/GPServer/Watershed');
//   geoprocessor.setOutputSpatialReference(new SR(102100));
//   geoprocessor.submitJob(params, results => {
//     console.log(results);
//     geoprocessor.getResultData(results.jobId, 'WatershedArea', data => {
//       console.log('getResultData');
//       console.log(data);
//     });
//   }, status => {
//     console.log(status);
//   });
//
// };

// test();
