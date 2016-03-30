define(['exports', 'actions/ModalActions', 'js/config', 'js/alt'], function (exports, _ModalActions, _config, _alt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.modalStore = undefined;

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

  var ModalStore = function () {
    function ModalStore() {
      _classCallCheck(this, ModalStore);

      this.bitlyUrl = '';
      this.modalLayerInfo = {};
      this.shareBy = 'embed';

      this.bindListeners({
        showLayerInfo: _ModalActions.modalActions.showLayerInfo,
        updateBitlyUrl: _ModalActions.modalActions.showShareModal,
        switchEmbed: _ModalActions.modalActions.switchEmbed,
        switchLink: _ModalActions.modalActions.switchLink
      });
    }

    _createClass(ModalStore, [{
      key: 'showLayerInfo',
      value: function showLayerInfo(layerInfo) {
        if (typeof layerInfo === 'string') {
          layerInfo = _config.layerInformation[layerInfo] ? _config.layerInformation[layerInfo] : {};
        }

        this.modalLayerInfo = layerInfo;
      }
    }, {
      key: 'updateBitlyUrl',
      value: function updateBitlyUrl(bitlyUrl) {
        this.bitlyUrl = bitlyUrl;
      }
    }, {
      key: 'switchEmbed',
      value: function switchEmbed() {
        this.shareBy = 'embed';
      }
    }, {
      key: 'switchLink',
      value: function switchLink() {
        this.shareBy = 'link';
      }
    }]);

    return ModalStore;
  }();

  var modalStore = exports.modalStore = _alt2.default.createStore(ModalStore, 'ModalStore');
});