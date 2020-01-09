define(["exports", "actions/LayerActions", "actions/ModalActions", "stores/MapStore", "helpers/LayersHelper", "js/constants", "react"], function (exports, _LayerActions, _ModalActions, _MapStore, _LayersHelper, _constants, _react) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _constants2 = _interopRequireDefault(_constants);

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

  // Info Icon Markup for innerHTML
  var useSvg = '<use xlink:href="#shape-info" />';

  var LayerCheckbox = function (_React$Component) {
    _inherits(LayerCheckbox, _React$Component);

    function LayerCheckbox(props) {
      _classCallCheck(this, LayerCheckbox);

      var _this = _possibleConstructorReturn(this, (LayerCheckbox.__proto__ || Object.getPrototypeOf(LayerCheckbox)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(LayerCheckbox, [{
      key: "storeUpdated",
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if (prevProps.checked !== this.props.checked) {
          if (this.props.layer.id === _constants2.default.windDirection) {
            _LayersHelper2.default.toggleWind(this.props.checked);
            return;
          }

          if (this.props.checked) {
            var layerObj = {};
            layerObj.layerId = this.props.layer.id;
            layerObj.footprints = this.state.footprints;
            layerObj.fireHistorySelectIndex = this.state.fireHistorySelectIndex;
            _LayersHelper2.default.showLayer(layerObj);
          } else {
            _LayersHelper2.default.hideLayer(this.props.layer.id);
          }
        }
      }
    }, {
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps) {
        return nextProps.checked !== this.props.checked || this.props.children;
      }
    }, {
      key: "render",
      value: function render() {
        var layer = this.props.layer;
        return _react2.default.createElement(
          "div",
          {
            className: "layer-checkbox relative " + layer.className + (this.props.checked ? " active" : "") + (layer.disabled ? " disabled" : "")
          },
          !layer.disabled ? null : _react2.default.createElement(
            "span",
            { className: "tooltipmap fire" },
            "Coming Soon!"
          ),
          _react2.default.createElement(
            "span",
            {
              onClick: this.toggleLayer.bind(this),
              className: "toggle-switch pointer"
            },
            _react2.default.createElement("span", null)
          ),
          _react2.default.createElement(
            "span",
            {
              onClick: this.toggleLayer.bind(this),
              className: "layer-checkbox-label pointer"
            },
            layer.label
          ),
          !layer.middleLabel ? null : _react2.default.createElement(
            "div",
            { className: "layer-checkbox-label" },
            layer.middleLabel
          ),
          !layer.sublabel ? null : _react2.default.createElement(
            "div",
            { className: "layer-checkbox-sublabel" },
            layer.sublabel
          ),
          !layer.metadataId ? null : _react2.default.createElement(
            "span",
            {
              className: "info-icon pointer " + (this.state.iconLoading === this.props.layer.id ? "iconLoading" : ""),
              onClick: this.showInfo.bind(this)
            },
            _react2.default.createElement("svg", { dangerouslySetInnerHTML: { __html: useSvg } })
          ),
          !this.props.children ? null : _react2.default.createElement(
            "div",
            {
              className: "layer-content-container " + (this.props.checked || this.props.childrenVisible ? "" : "hidden")
            },
            this.props.children
          )
        );
      }
    }, {
      key: "showInfo",
      value: function showInfo() {
        var layer = this.props.layer;
        if (layer.disabled) {
          return;
        }
        _LayerActions.layerActions.showLoading(layer.id);
        _ModalActions.modalActions.showLayerInfo(this.props.layer.id);
      }
    }, {
      key: "toggleLayer",
      value: function toggleLayer() {
        var layer = this.props.layer;
        if (layer.disabled) {
          return;
        }
        if (this.props.checked) {
          _LayerActions.layerActions.removeActiveLayer(layer.id);
          if (layer.id.includes("activeFires")) {
            var modisLayerIds = [_constants2.default.activeFires, _constants2.default.activeFires48, _constants2.default.activeFires72, _constants2.default.activeFires7D, _constants2.default.activeFires1Y];

            var layerToHide = app.map.getLayer(modisLayerIds[this.state.firesSelectIndex]);
            if (layerToHide) {
              layerToHide.hide();
            }
          } else if (layer.id.includes("viirsFires")) {
            var viirsLayerIds = [_constants2.default.viirsFires, _constants2.default.viirsFires48, _constants2.default.viirsFires72, _constants2.default.viirsFires7D, _constants2.default.viirsFires1Y];
            var _layerToHide = app.map.getLayer(viirsLayerIds[this.state.viirsSelectIndex]);
            if (_layerToHide) {
              _layerToHide.hide();
            }
          }
        } else {
          _LayerActions.layerActions.addActiveLayer(layer.id);
          if (layer.id.includes("activeFires")) {
            var _modisLayerIds = [_constants2.default.activeFires, _constants2.default.activeFires48, _constants2.default.activeFires72, _constants2.default.activeFires7D, _constants2.default.activeFires1Y];
            var layerToShow = app.map.getLayer(_modisLayerIds[this.state.firesSelectIndex]);
            if (layerToShow) {
              layerToShow.show();
            }
          } else if (layer.id.includes("viirsFires")) {
            var _viirsLayerIds = [_constants2.default.viirsFires, _constants2.default.viirsFires48, _constants2.default.viirsFires72, _constants2.default.viirsFires7D, _constants2.default.viirsFires1Y];
            var _layerToShow = app.map.getLayer(_viirsLayerIds[this.state.viirsSelectIndex]);
            if (_layerToShow) {
              _layerToShow.show();
            }
          }
        }
      }
    }]);

    return LayerCheckbox;
  }(_react2.default.Component);

  exports.default = LayerCheckbox;
});