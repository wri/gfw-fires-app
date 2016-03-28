define(['exports', 'components/AnalysisPanel/AnalysisTools', 'components/Mobile/MobileUnderlay', 'components/Mobile/MobileControls', 'components/AnalysisPanel/EsriSearch', 'components/MapControls/ControlPanel', 'components/LayerPanel/LayerPanel', 'components/Timeline/Timeline', 'helpers/ShareHelper', 'actions/MapActions', 'utils/params', 'js/config', 'react'], function (exports, _AnalysisTools, _MobileUnderlay, _MobileControls, _EsriSearch, _ControlPanel, _LayerPanel, _Timeline, _ShareHelper, _MapActions, _params, _config, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _AnalysisTools2 = _interopRequireDefault(_AnalysisTools);

  var _MobileUnderlay2 = _interopRequireDefault(_MobileUnderlay);

  var _MobileControls2 = _interopRequireDefault(_MobileControls);

  var _EsriSearch2 = _interopRequireDefault(_EsriSearch);

  var _ControlPanel2 = _interopRequireDefault(_ControlPanel);

  var _LayerPanel2 = _interopRequireDefault(_LayerPanel);

  var _Timeline2 = _interopRequireDefault(_Timeline);

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

      _this.state = { loaded: false };
      return _this;
    }

    _createClass(Map, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        var urlParams = (0, _params.getUrlParams)(location.search);
        //- Mixin the map config with the url params, make sure to create a new object and not
        //- overwrite the mapConfig, again so reset sets the state back to default and not shared,
        //- TODO: this may not be necessary, remove this if I dont neet to override params, currently I am setting them after load
        var newMapConfig = Object.assign({}, _config.mapConfig);
        _MapActions.mapActions.createMap(newMapConfig).then(function () {
          _this2.setState({ loaded: true });
          _MapActions.mapActions.createLayers();
          //- Use the helper to take the params and use actions to apply shared state, don't set these params
          //- as default state, otherwise the reset button will reset to shared state and not default state
          (0, _ShareHelper.applyStateFromUrl)(urlParams);
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { id: _config.mapConfig.id, className: 'map' },
          _react2.default.createElement(_LayerPanel2.default, { loaded: this.state.loaded }),
          _react2.default.createElement(_EsriSearch2.default, { loaded: this.state.loaded }),
          _react2.default.createElement(_AnalysisTools2.default, null),
          _react2.default.createElement(_ControlPanel2.default, null),
          _react2.default.createElement(_Timeline2.default, null),
          _react2.default.createElement(_MobileUnderlay2.default, null),
          _react2.default.createElement(_MobileControls2.default, null)
        );
      }
    }]);

    return Map;
  }(_react2.default.Component);

  exports.default = Map;
});