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
import { mapActions } from 'actions/MapActions';
import { analysisActions } from 'actions/AnalysisActions';
import {defaults} from 'js/config';
import { loadCSS } from 'utils/loaders';
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
  loadCSS(`../vendors/react-select/dist/react-select.min.css`);
  loadCSS(`https://js.arcgis.com/3.20/esri/css/esri.css`);
 };

const parseTitles = (planetBasemaps, isMonthly) => {
  // Filter out 'Latest Monthly' and 'Latest Quarterly'
  return planetBasemaps.filter(basemap => {
    if (basemap.title === 'Latest Monthly' || basemap.title === 'Latest Quarterly') {
      return false;
    } else {
      return true;
    }
  }).map(basemap => {
    const { url, title } = basemap;
    const label = isMonthly ? parseMonthlyTitle(title) : parseQuarterlyTitle(title);
    return {
      value: url,
      label: label
    };
  });
};

const parseMonthlyTitle = (title) => {
  // ex. formats 'Global Monthly 2016 01 Mosaic'
  const words = title.split(' ');
  const year = words[2];
  const month = words[3];
  const yyyyMM = year + ' ' + month;
  const label = window.Kalendae.moment(yyyyMM, 'YYYY MM').format('MMM YYYY');
  return label;
};

const parseQuarterlyTitle = (title) => {
  const words = title.split(' ');
  const yearQuarter = words[2];

  const dict = {
    1: 'JAN-MAR',
    2: 'APR-JUN',
    3: 'JUL-SEP',
    4: 'OCT-DEC'
  };

  if (yearQuarter === undefined) {
    return title;
  } else {
    const [ year, quarter ] = yearQuarter.split('q');
    const label = `${dict[quarter]} ${year}`;
    return label;
  }
};

const queryPlanet = new Promise((resolve, reject) => {
  // Request XML page
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        const basemaps = [];

        const xmlParser = new DOMParser();
        const htmlString = '<!DOCTYPE html>' + xhttp.responseText.substring(38);

        const xmlDoc = xmlParser.parseFromString(htmlString, 'text/html');

        const contents = xmlDoc.getElementsByTagName('Contents')[0];
        const layerCollection = contents.getElementsByTagName('Layer');
        const layerCollectionLength = layerCollection.length;

        for (let i = 0; i < layerCollectionLength; i++) {
          const currentLayer = layerCollection[i];
          const title = currentLayer.getElementsByTagName('ows:Title')[0].innerHTML;
          const url = currentLayer.getElementsByTagName('ResourceURL')[0].getAttribute('template');
          basemaps.push({ title, url });
        }

        const monthlyBasemaps = [];
        const quarterlyBasemaps = [];
        basemaps.forEach(function(basemap) {
          if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Monthly') >= 0) {
            monthlyBasemaps.push(basemap);
          }
          if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Quarterly') >= 0) {
            quarterlyBasemaps.push(basemap);
          }
        });

        const parsedMonthly = parseTitles(monthlyBasemaps, true).reverse();
        const parsedQuarterly = parseTitles(quarterlyBasemaps, false).reverse();

        analysisActions.saveMonthlyPlanetBasemaps(parsedMonthly);
        analysisActions.saveQuarterlyPlanetBasemaps(parsedQuarterly);
        mapActions.setActivePlanetPeriod(parsedMonthly[0].label);

        resolve(true);
      } else {
        console.log('Error retrieving planet basemaps.');
        reject(false);
      }
    }
  };
  xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=6c3405821fb84e659550848226615428', true);
  xhttp.send();
});

const initializeApp = () => {
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
queryPlanet.then(() => {
  initializeApp();
}, () => {
  initializeApp();
});
