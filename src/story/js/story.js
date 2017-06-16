import Map from 'esri/map';
import BasemapGallery from 'esri/dijit/BasemapGallery';
import parser from 'dojo/parser';
import Search from 'esri/dijit/Search';
import Draw from 'esri/toolbars/draw';
import Graphic from 'esri/graphic';
import FeatureLayer from 'esri/layers/FeatureLayer';
import PictureMarkerSymbol from 'esri/symbols/PictureMarkerSymbol';
import validateWeb from 'dojox/validate/web';
import focusUtil from 'dijit/focus';
import dom from 'dojo/dom';
import domClass from 'dojo/dom-class';
import on from 'dojo/on';
import urlUtils from 'esri/urlUtils';
// import esriConfig from 'esri/config';

parser.parse();

var map;
var basemapGallery;
var search;
var toolbar;
var symbol;
var storyTitle;
var storyAffectedArea;
var storyLocation;
var storyDate;
var storyDetails;
var storyVideo;
//var storyMedia;
var storyName;
var storyEmail;
var storyTitleValid;
var storyEmailValid;
var storyAffectedAreaValid;

urlUtils.addProxyRule({
  urlPrefix: 'http://gfw.blueraster.io',
  proxyUrl: '/map/php/proxy.php'
});

map = new Map('map', {
  basemap: 'satellite',
  showAttribution: false,
  center: [-77.45, 37.75],
  zoom: 4
});

let date = new window.Kalendae.moment().format('M/D/YYYY');

let options = {
  selected: date,
  direction: 'today-past'
};

$('#story-date-input').kalendae(options);


var storiesLayer = new FeatureLayer('http://gfw.blueraster.io/arcgis/rest/services/Fires/fire_stories/FeatureServer/0', {});

map.addLayer(storiesLayer);

basemapGallery = new BasemapGallery({
  showArcGISBasemaps: true,
  map: map
}, 'basemapGallery');
basemapGallery.startup();

search = new Search({
  showInfoWindowOnSelect: false,
  map: map
}, 'search');
search.startup();

function addToMap(evt) {
  if (evt.geometry) {
    symbol = new PictureMarkerSymbol({
      'angle': 0,
      'xoffset': 0,
      'yoffset': 10,
      'type': 'esriPMS',
      'url': 'http://static.arcgis.com/images/Symbols/Shapes/RedPin1LargeB.png',
      'imageData': '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',
      'contentType': 'image/png',
      'width': 24,
      'height': 24
    });

    storyAffectedArea = new Graphic(evt.geometry, symbol, {});
    storiesLayer.clear();
    storiesLayer.add(storyAffectedArea);
    console.log(storiesLayer);
    // map.graphics.clear();
    // map.graphics.add(storyAffectedArea);

    domClass.remove('story-affected-areas-label', 'field-required');
  }
}

map.on('load', function () {
  toolbar = new Draw(map);
  toolbar.on('draw-end', addToMap);
  toolbar.activate(Draw.POINT);
});

on(dom.byId('submit-button'), 'click', function () {

  storyTitle = dom.byId('story-title-input').value;
  storyLocation = dom.byId('story-location-input').value;
  storyDate = dom.byId('story-date-input').value || '';
  storyDetails = dom.byId('story-details-textarea').value;
  storyVideo = dom.byId('story-video-input').value;
  //storyMedia = dom.byId('story-media-input').value;
  storyName = dom.byId('story-title-input').value;
  storyEmail = dom.byId('story-email-input').value;

  storyTitleValid = storyTitle !== '';
  storyAffectedAreaValid = storyAffectedArea !== undefined;
  storyEmailValid = storyEmail !== '' && validateWeb.isEmailAddress(storyEmail) === true;

  if (storyTitleValid) {
    domClass.remove('story-title-label', 'field-required');
  } else {
    domClass.add('story-title-label', 'field-required');
  }

  if (storyAffectedAreaValid) {
    domClass.remove('story-affected-areas-label', 'field-required');
  } else {
    domClass.add('story-affected-areas-label', 'field-required');
  }

  if (storyEmailValid) {
    domClass.remove('story-email-label', 'field-required');
  } else {
    domClass.add('story-email-label', 'field-required');
  }

  if (storyTitleValid === false) {
    focusUtil.focus(dom.byId('story-title-input'));
  } else if (storyAffectedAreaValid === false) {
    dom.byId('story-affected-areas-label').scrollIntoView();
  } else if (storyEmailValid === false) {
    focusUtil.focus(dom.byId('story-email-input'));
  }

  if (storyTitleValid &&
    storyEmailValid &&
    storyAffectedAreaValid) {

    storyAffectedArea.attributes.Title = storyTitle;
    storyAffectedArea.attributes.Location = storyLocation;
    storyAffectedArea.attributes.Date = storyDate;
    storyAffectedArea.attributes.Details = storyDetails;
    storyAffectedArea.attributes.Video = storyVideo;
    storyAffectedArea.attributes.Name = storyName;
    storyAffectedArea.attributes.Email = storyEmail;
    storyAffectedArea.attributes.Publish = 'Y';

    storiesLayer.applyEdits([storyAffectedArea], null, null, function(msg) {
      console.log(msg);
      domClass.remove('success-modal', 'hidden');
    }, function(err) {
      console.log('err');
      console.log(err);
      domClass.remove('failure-modal', 'hidden');
    });
  }
});
