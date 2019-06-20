define(['exports', 'js/alt'], function (exports, _alt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.layerActions = undefined;

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

  var LayerActions = function () {
    function LayerActions() {
      _classCallCheck(this, LayerActions);
    }

    _createClass(LayerActions, [{
      key: 'addActiveLayer',
      value: function addActiveLayer(layerId) {
        this.dispatch(layerId);
      }
    }, {
      key: 'removeActiveLayer',
      value: function removeActiveLayer(layerId) {
        this.dispatch(layerId);
      }
    }, {
      key: 'showLoading',
      value: function showLoading(layerId) {
        this.dispatch(layerId);
      }
    }, {
      key: 'changeFiresTimeline',
      value: function changeFiresTimeline(selectedIndex) {
        this.dispatch(selectedIndex);
      }
    }, {
      key: 'incrementFireHistoryYear',
      value: function incrementFireHistoryYear() {
        this.dispatch();
      }
    }, {
      key: 'decrementFireHistoryYear',
      value: function decrementFireHistoryYear() {
        this.dispatch();
      }
    }, {
      key: 'changeViirsTimeline',
      value: function changeViirsTimeline(selectedIndex) {
        this.dispatch(selectedIndex);
      }
    }, {
      key: 'changePlantations',
      value: function changePlantations(selectedIndex) {
        this.dispatch(selectedIndex);
      }
    }, {
      key: 'changeForestTimeline',
      value: function changeForestTimeline(selectedIndex) {
        this.dispatch(selectedIndex);
      }
    }, {
      key: 'changeFireHistoryTimeline',
      value: function changeFireHistoryTimeline(selectedIndex) {
        this.dispatch(selectedIndex);
      }
    }, {
      key: 'setFootprints',
      value: function setFootprints(footprints) {
        this.dispatch(footprints);
      }
    }, {
      key: 'toggleLayerPanelVisibility',
      value: function toggleLayerPanelVisibility() {
        this.dispatch();
      }
    }, {
      key: 'toggleFootprintsVisibility',
      value: function toggleFootprintsVisibility() {
        this.dispatch();
      }
    }, {
      key: 'showFootprints',
      value: function showFootprints() {
        this.dispatch();
      }
    }]);

    return LayerActions;
  }();

  var layerActions = exports.layerActions = _alt2.default.createActions(LayerActions);
});