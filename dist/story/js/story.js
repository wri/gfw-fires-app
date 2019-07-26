define(['esri/map', 'esri/dijit/BasemapGallery', 'dojo/parser', 'esri/dijit/Search', 'esri/toolbars/draw', 'esri/graphic', 'esri/layers/FeatureLayer', 'esri/symbols/PictureMarkerSymbol', 'dojox/validate/web', 'dijit/focus', 'dojo/dom', 'dojo/dom-class', 'dojo/on', 'esri/urlUtils'], function (_map, _BasemapGallery, _parser, _Search, _draw, _graphic, _FeatureLayer, _PictureMarkerSymbol, _web, _focus, _dom, _domClass, _on, _urlUtils) {
  'use strict';

  var _map2 = _interopRequireDefault(_map);

  var _BasemapGallery2 = _interopRequireDefault(_BasemapGallery);

  var _parser2 = _interopRequireDefault(_parser);

  var _Search2 = _interopRequireDefault(_Search);

  var _draw2 = _interopRequireDefault(_draw);

  var _graphic2 = _interopRequireDefault(_graphic);

  var _FeatureLayer2 = _interopRequireDefault(_FeatureLayer);

  var _PictureMarkerSymbol2 = _interopRequireDefault(_PictureMarkerSymbol);

  var _web2 = _interopRequireDefault(_web);

  var _focus2 = _interopRequireDefault(_focus);

  var _dom2 = _interopRequireDefault(_dom);

  var _domClass2 = _interopRequireDefault(_domClass);

  var _on2 = _interopRequireDefault(_on);

  var _urlUtils2 = _interopRequireDefault(_urlUtils);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  // import esriConfig from 'esri/config';

  _parser2.default.parse();

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

  _urlUtils2.default.addProxyRule({
    urlPrefix: 'https://gis-gfw.wri.org',
    proxyUrl: '/map/php/proxy.php'
  });

  map = new _map2.default('map', {
    basemap: 'satellite',
    showAttribution: false,
    center: [-77.45, 37.75],
    zoom: 4
  });

  var date = new window.Kalendae.moment().format('M/D/YYYY');

  var options = {
    selected: date,
    direction: 'today-past'
  };

  $('#story-date-input').kalendae(options);

  var storiesLayer = new _FeatureLayer2.default('https://gis-gfw.wri.org/arcgis/rest/services/Fires/fire_stories/FeatureServer/0', {});

  map.addLayer(storiesLayer);

  basemapGallery = new _BasemapGallery2.default({
    showArcGISBasemaps: true,
    map: map
  }, 'basemapGallery');
  basemapGallery.startup();

  search = new _Search2.default({
    showInfoWindowOnSelect: false,
    map: map
  }, 'search');
  search.startup();

  function addToMap(evt) {
    if (evt.geometry) {
      symbol = new _PictureMarkerSymbol2.default({
        'angle': 0,
        'xoffset': 0,
        'yoffset': 10,
        'type': 'esriPMS',
        'url': '//static.arcgis.com/images/Symbols/Shapes/RedPin1LargeB.png',
        'imageData': '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',
        'contentType': 'image/png',
        'width': 24,
        'height': 24
      });

      storyAffectedArea = new _graphic2.default(evt.geometry, symbol, {});
      storiesLayer.clear();
      storiesLayer.add(storyAffectedArea);

      _domClass2.default.remove('story-affected-areas-label', 'field-required');
    }
  }

  map.on('load', function () {
    toolbar = new _draw2.default(map);
    toolbar.on('draw-end', addToMap);
    toolbar.activate(_draw2.default.POINT);
  });

  (0, _on2.default)(_dom2.default.byId('submit-button'), 'click', function () {

    storyTitle = _dom2.default.byId('story-title-input').value;
    storyLocation = _dom2.default.byId('story-location-input').value;
    storyDate = _dom2.default.byId('story-date-input').value || '';
    storyDetails = _dom2.default.byId('story-details-textarea').value;
    storyVideo = _dom2.default.byId('story-video-input').value;
    //storyMedia = dom.byId('story-media-input').value;
    storyName = _dom2.default.byId('story-title-input').value;
    storyEmail = _dom2.default.byId('story-email-input').value;

    storyTitleValid = storyTitle !== '';
    storyAffectedAreaValid = storyAffectedArea !== undefined;
    storyEmailValid = storyEmail !== '' && _web2.default.isEmailAddress(storyEmail) === true;

    if (storyTitleValid) {
      _domClass2.default.remove('story-title-label', 'field-required');
    } else {
      _domClass2.default.add('story-title-label', 'field-required');
    }

    if (storyAffectedAreaValid) {
      _domClass2.default.remove('story-affected-areas-label', 'field-required');
    } else {
      _domClass2.default.add('story-affected-areas-label', 'field-required');
    }

    if (storyEmailValid) {
      _domClass2.default.remove('story-email-label', 'field-required');
    } else {
      _domClass2.default.add('story-email-label', 'field-required');
    }

    if (storyTitleValid === false) {
      _focus2.default.focus(_dom2.default.byId('story-title-input'));
    } else if (storyAffectedAreaValid === false) {
      _dom2.default.byId('story-affected-areas-label').scrollIntoView();
    } else if (storyEmailValid === false) {
      _focus2.default.focus(_dom2.default.byId('story-email-input'));
    }

    if (storyTitleValid && storyEmailValid && storyAffectedAreaValid) {

      storyAffectedArea.attributes.Title = storyTitle;
      storyAffectedArea.attributes.Location = storyLocation;
      storyAffectedArea.attributes.Date = storyDate;
      storyAffectedArea.attributes.Details = storyDetails;
      storyAffectedArea.attributes.Video = storyVideo;
      storyAffectedArea.attributes.Name = storyName;
      storyAffectedArea.attributes.Email = storyEmail;
      storyAffectedArea.attributes.Publish = 'Y';

      storiesLayer.applyEdits([storyAffectedArea], null, null, function (msg) {
        console.log(msg);
        _domClass2.default.remove('success-modal', 'hidden');
      }, function (err) {
        console.log('err');
        console.log(err);
        _domClass2.default.remove('failure-modal', 'hidden');
      });
    }
  });
});