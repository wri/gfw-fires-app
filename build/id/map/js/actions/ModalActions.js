define(['exports', 'js/config', 'esri/request', 'dojo/cookie', 'esri/urlUtils', 'dojo/dom-class', 'js/alt'], function (exports, _config, _request, _cookie, _urlUtils, _domClass, _alt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.modalActions = undefined;

  var _request2 = _interopRequireDefault(_request);

  var _cookie2 = _interopRequireDefault(_cookie);

  var _urlUtils2 = _interopRequireDefault(_urlUtils);

  var _domClass2 = _interopRequireDefault(_domClass);

  var _alt2 = _interopRequireDefault(_alt);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var ModalActions = function () {
    function ModalActions() {
      _classCallCheck(this, ModalActions);
    }

    _createClass(ModalActions, [{
      key: 'showLayerInfo',
      value: function showLayerInfo(layerId) {
        var _this = this;

        app.debug('ModalActions >>> showLayerInfo');

        _urlUtils2.default.addProxyRule({
          urlPrefix: 'http://api.globalforestwatch.org',
          proxyUrl: './php/proxy.php'
        });

        (0, _request2.default)({
          url: _config.metadataUrl + _config.metadataIds[layerId],
          handleAs: 'json',
          callbackParamName: 'callback'
        }, {
          usePost: true
        }).then(function (res) {
          _this.dispatch(res);
          _domClass2.default.remove('layer-modal', 'hidden');
        }, function (err) {
          // this.dispatch({});
          // console.log(layerId)
          _this.dispatch(layerId); //todo: show config's template based on this layerId
          _domClass2.default.remove('layer-modal', 'hidden');
          console.error(err);
        });
      }
    }, {
      key: 'showShareModal',
      value: function showShareModal(params) {
        app.debug('ModalActions >>> showShareModal');
        //TODO: Generate a url from bitly that includes Map Store state, this way we can share params
        var url = document.location.href.split('?')[0];
        this.dispatch(url + '?' + params);
        _domClass2.default.remove('share-modal', 'hidden');
      }
    }, {
      key: 'showCalendarModal',
      value: function showCalendarModal(active) {
        app.debug('ModalActions >>> showCalendarModal');
        _domClass2.default.remove('calendar-modal', 'hidden');
        this.dispatch(active);
      }
    }, {
      key: 'showAlertsModal',
      value: function showAlertsModal() {
        app.debug('ModalActions >>> showAlertsModal');
        _domClass2.default.remove('alerts-modal', 'hidden');
      }
    }, {
      key: 'showFiresModal',
      value: function showFiresModal() {
        app.debug('ModalActions >>> showFiresModal');
        _domClass2.default.remove('fires-modal', 'hidden');
      }
    }, {
      key: 'showSubscribeModal',
      value: function showSubscribeModal(graphic) {
        app.debug('ModalActions >>> showAlertsModal');
        this.dispatch(graphic);
        _domClass2.default.remove('subscription-modal', 'hidden');
      }
    }, {
      key: 'showBasemapModal',
      value: function showBasemapModal() {
        app.debug('ModalActions >>> showBasemapModal');
        var currentCookie = (0, _cookie2.default)('windBasemapDecision');
        if (currentCookie === undefined) {
          _domClass2.default.remove('basemap-modal', 'hidden');
        } else {
          if (currentCookie === 'true') {
            //change basemap
            this.dispatch('dark-gray');
          }
        }
      }
    }, {
      key: 'showCanopyModal',
      value: function showCanopyModal() {
        app.debug('ModalActions >>> showCanopyModal');
        _domClass2.default.remove('canopy-modal', 'hidden');
      }
    }, {
      key: 'hideModal',
      value: function hideModal(node) {
        app.debug('ModalActions >>> hideModal');
        _domClass2.default.add(node, 'hidden');
      }
    }, {
      key: 'updateCanopyDensity',
      value: function updateCanopyDensity(newDensity) {
        app.debug('ModalActions >>> updateCanopyDensity');
        this.dispatch(newDensity);
      }
    }, {
      key: 'removeCustomFeature',
      value: function removeCustomFeature(graphic) {
        app.debug('ModalActions >>> removeCustomFeature');
        this.dispatch(graphic);
      }
    }]);

    return ModalActions;
  }();

  var modalActions = exports.modalActions = _alt2.default.createActions(ModalActions);
});