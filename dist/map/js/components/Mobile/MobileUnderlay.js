define(['exports', 'react', 'stores/MapStore', 'stores/AnalysisStore', 'actions/LayerActions', 'actions/AnalysisActions'], function (exports, _react, _MapStore, _AnalysisStore, _LayerActions, _AnalysisActions) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _react2 = _interopRequireDefault(_react);

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

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var Map = function (_React$Component) {
    _inherits(Map, _React$Component);

    function Map(props) {
      _classCallCheck(this, Map);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Map).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _AnalysisStore.analysisStore.listen(_this.storeUpdated.bind(_this));
      _this.state = {
        mapStore: _MapStore.mapStore.getState(),
        analysisStore: _AnalysisStore.analysisStore.getState()
      };
      return _this;
    }

    _createClass(Map, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState({
          mapStore: _MapStore.mapStore.getState(),
          analysisStore: _AnalysisStore.analysisStore.getState()
        });
      }
    }, {
      key: 'closeMobileControls',
      value: function closeMobileControls() {
        if (_MapStore.mapStore.getState().layerPanelVisible === true) {
          _LayerActions.layerActions.toggleLayerPanelVisibility();
        }
        if (_AnalysisStore.analysisStore.getState().esriSearchVisible === true) {
          _AnalysisActions.analysisActions.toggleEsriSearchVisibility();
        }
        if (_AnalysisStore.analysisStore.getState().analysisToolsVisible === true) {
          _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var className = 'mobile-underlay mobile-show';
        if (app.mobile() === true) {
          if (this.state.mapStore.layerPanelVisible === false && this.state.analysisStore.esriSearchVisible === false && this.state.analysisStore.analysisToolsVisible === false && this.state.analysisStore.timelineVisible === false) {
            className += ' hidden';
          }
        }

        return _react2.default.createElement('div', { id: 'mobile-underlay', className: className, onClick: this.closeMobileControls });
      }
    }]);

    return Map;
  }(_react2.default.Component);

  exports.default = Map;
});