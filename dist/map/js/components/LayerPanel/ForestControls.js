define(['exports', 'actions/LayerActions', 'helpers/LayersHelper', 'js/config', 'js/constants', 'utils/AppUtils', 'components/LayerPanel/ForestryLegend', 'react'], function (exports, _LayerActions, _LayersHelper, _config, _constants, _AppUtils, _ForestryLegend, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _constants2 = _interopRequireDefault(_constants);

  var _AppUtils2 = _interopRequireDefault(_AppUtils);

  var _ForestryLegend2 = _interopRequireDefault(_ForestryLegend);

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

  var forestOptions = _config.layerPanelText.forestOptions;

  var ForestControls = function (_React$Component) {
    _inherits(ForestControls, _React$Component);

    function ForestControls() {
      _classCallCheck(this, ForestControls);

      return _possibleConstructorReturn(this, (ForestControls.__proto__ || Object.getPrototypeOf(ForestControls)).apply(this, arguments));
    }

    _createClass(ForestControls, [{
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        if (prevProps.forestSelectIndex !== this.props.forestSelectIndex) {
          _LayersHelper2.default.updateForestDefinitions(this.props.forestSelectIndex);
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        // Set the default layer definition when the map has been loaded
        if (!this.props.loaded && nextProps.loaded) {
          _LayersHelper2.default.updateForestDefinitions(nextProps.forestSelectIndex);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.primaryForests);
        var activeItem = forestOptions[this.props.forestSelectIndex];
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(_ForestryLegend2.default, { url: config.url, layerIds: config.layerIds }),
          _react2.default.createElement(
            'div',
            { className: 'timeline-container relative forest' },
            _react2.default.createElement(
              'select',
              { className: 'pointer', value: activeItem.value, onChange: this.changeForestTimeline },
              forestOptions.map(this.optionsMap, this)
            ),
            _react2.default.createElement(
              'div',
              { className: 'active-forest-control gfw-btn sml white' },
              activeItem.label
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
      key: 'changeForestTimeline',
      value: function changeForestTimeline(evt) {
        _LayerActions.layerActions.changeForestTimeline(evt.target.selectedIndex);
      }
    }]);

    return ForestControls;
  }(_react2.default.Component);

  exports.default = ForestControls;
});