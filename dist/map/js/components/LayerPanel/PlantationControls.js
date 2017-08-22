define(['exports', 'actions/LayerActions', 'helpers/LayersHelper', 'js/config', 'components/LayerPanel/LandCoverLegend', 'react'], function (exports, _LayerActions, _LayersHelper, _config, _LandCoverLegend, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _LandCoverLegend2 = _interopRequireDefault(_LandCoverLegend);

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

  var plantationOptions = _config.layerPanelText.plantationOptions;

  var PlantationControls = function (_React$Component) {
    _inherits(PlantationControls, _React$Component);

    function PlantationControls() {
      _classCallCheck(this, PlantationControls);

      return _possibleConstructorReturn(this, (PlantationControls.__proto__ || Object.getPrototypeOf(PlantationControls)).apply(this, arguments));
    }

    _createClass(PlantationControls, [{
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        if (prevProps.plantationSelectIndex !== this.props.plantationSelectIndex) {
          _LayersHelper2.default.updatePlantationLayerDefinitions(plantationOptions[this.props.plantationSelectIndex].value);
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        // Set the default layer definition when the map has been loaded
        if (!this.props.loaded && nextProps.loaded) {
          _LayersHelper2.default.updatePlantationLayerDefinitions(nextProps.plantationSelectIndex);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var activeItem = plantationOptions[this.props.plantationSelectIndex];

        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'timeline-container relative plantations' },
            _react2.default.createElement(
              'select',
              { className: 'pointer', value: activeItem.value, onChange: this.changePlantations },
              plantationOptions.map(this.optionsMap, this)
            ),
            _react2.default.createElement(
              'div',
              { className: 'active-plantations-control gfw-btn sml white' },
              activeItem.label
            ),
            _react2.default.createElement(
              'div',
              { className: 'plantations-legend-container-type ' + (this.props.plantationSelectIndex === 1 ? '' : ' hidden') },
              _react2.default.createElement(_LandCoverLegend2.default, { url: 'https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer', layerIds: [plantationOptions[1].value] })
            ),
            _react2.default.createElement(
              'div',
              { className: 'plantations-legend-container ' + (this.props.plantationSelectIndex === 0 ? '' : ' hidden') },
              _react2.default.createElement(_LandCoverLegend2.default, { url: 'https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer', layerIds: [plantationOptions[0].value] })
            )
          )
        );
      }
    }, {
      key: 'optionsMap',
      value: function optionsMap(item, index) {
        return _react2.default.createElement(
          'option',
          { key: index, value: item.value },
          item.label
        );
      }
    }, {
      key: 'changePlantations',
      value: function changePlantations(evt) {
        _LayerActions.layerActions.changePlantations(evt.target.selectedIndex);
      }
    }]);

    return PlantationControls;
  }(_react2.default.Component);

  exports.default = PlantationControls;
});