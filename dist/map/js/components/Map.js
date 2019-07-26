define(['exports', 'components/AnalysisPanel/AnalysisTools', 'components/Mobile/MobileUnderlay', 'components/Mobile/MobileControls', 'components/MapControls/ControlPanel', 'components/LayerPanel/LayerPanel', 'components/AnalysisPanel/ImageryHoverModal', 'components/Timeline/Timeline', 'components/AnalysisPanel/SentinalImagery', 'actions/MapActions', 'stores/MapStore', 'utils/params', 'js/constants', 'js/config', 'helpers/ShareHelper', 'utils/svgs', 'esri/geometry/ScreenPoint', 'react'], function (exports, _AnalysisTools, _MobileUnderlay, _MobileControls, _ControlPanel, _LayerPanel, _ImageryHoverModal, _Timeline, _SentinalImagery, _MapActions, _MapStore, _params, _constants, _config, _ShareHelper, _svgs, _ScreenPoint, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _AnalysisTools2 = _interopRequireDefault(_AnalysisTools);

  var _MobileUnderlay2 = _interopRequireDefault(_MobileUnderlay);

  var _MobileControls2 = _interopRequireDefault(_MobileControls);

  var _ControlPanel2 = _interopRequireDefault(_ControlPanel);

  var _LayerPanel2 = _interopRequireDefault(_LayerPanel);

  var _ImageryHoverModal2 = _interopRequireDefault(_ImageryHoverModal);

  var _Timeline2 = _interopRequireDefault(_Timeline);

  var _SentinalImagery2 = _interopRequireDefault(_SentinalImagery);

  var _constants2 = _interopRequireDefault(_constants);

  var _ShareHelper2 = _interopRequireDefault(_ShareHelper);

  var _ScreenPoint2 = _interopRequireDefault(_ScreenPoint);

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

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

  var Map = function (_Component) {
    _inherits(Map, _Component);

    function Map(props) {
      _classCallCheck(this, Map);

      var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, props));

      _this.storeDidUpdate = function () {
        _this.setState(_MapStore.mapStore.getState());
      };

      _this.getUpdatedSatelliteImagery = function () {
        var imageryLayer = app.map.getLayer(_constants2.default.RECENT_IMAGERY);

        if (imageryLayer) {
          imageryLayer.setUrl('');
        }
        _MapActions.mapActions.setSelectedImagery(null);

        var imageryParams = _this.state.imageryParams;

        var params = imageryParams ? imageryParams : {};

        var xVal = window.innerWidth / 2;
        var yVal = window.innerHeight / 2;

        // Create new screen point at center;
        var screenPt = new _ScreenPoint2.default(xVal, yVal);

        // Convert screen point to map point and zoom to point;
        var mapPt = app.map.toMap(screenPt);

        // Note: Lat and lon are intentionally reversed until imagery api is fixed.
        // The imagery API only returns the correct image for that lat/lon if they are reversed.
        // params.lon = mapPt.getLatitude();
        // params.lat = mapPt.getLongitude();
        params.lon = mapPt.getLongitude();
        params.lat = mapPt.getLatitude();
        console.log('lat/long', params.lat, params.lon);

        _MapActions.mapActions.getSatelliteImagery(params);
      };

      _this.state = _extends({
        loaded: false,
        map: {}
      }, _MapStore.mapStore.getState());
      return _this;
    }

    _createClass(Map, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        _MapStore.mapStore.listen(this.storeDidUpdate);
        var urlParams = (0, _params.getUrlParams)(window.location.hash);
        //- Mixin the map config with the url params, make sure to create a new object and not
        //- overwrite the mapConfig, again so reset sets the state back to default and not shared,
        //- TODO: this may not be necessary, remove this if I dont neet to override params, currently I am setting them after load
        var newMapConfig = Object.assign({}, _config.mapConfig);
        _MapActions.mapActions.createMap(newMapConfig).then(function () {
          _this2.setState({
            loaded: true,
            map: app.map
          });
          _MapActions.mapActions.createLayers();
          _MapActions.mapActions.connectLayerEvents();
          //- Use the helper to take the params and use actions to apply shared state, don't set these params
          //- as default state, otherwise the reset button will reset to shared state and not default state
          if (urlParams.activeBasemap) {
            _ShareHelper2.default.applyStateFromUrl(urlParams);
          } else {
            _ShareHelper2.default.applyInitialState();
          }
        });
      }
    }, {
      key: 'render',
      value: function render() {
        var _state = this.state,
            imageryModalVisible = _state.imageryModalVisible,
            imageryError = _state.imageryError;

        return _react2.default.createElement(
          'div',
          { id: _config.mapConfig.id, className: 'map' },
          _react2.default.createElement(_LayerPanel2.default, { loaded: this.state.loaded }),
          _react2.default.createElement(_AnalysisTools2.default, { imageryModalVisible: imageryModalVisible }),
          _react2.default.createElement(_ControlPanel2.default, { map: this.state.map }),
          _react2.default.createElement(_Timeline2.default, null),
          _react2.default.createElement(_MobileUnderlay2.default, null),
          _react2.default.createElement(_MobileControls2.default, null),
          _react2.default.createElement(
            'div',
            { className: 'imagery-modal-container ' + (imageryModalVisible ? '' : 'collapse') },
            _react2.default.createElement(
              'svg',
              { className: 'map__viewfinder' },
              _react2.default.createElement(_svgs.ViewFinderSvg, null)
            ),
            _react2.default.createElement(_SentinalImagery2.default, {
              imageryData: this.state.imageryData,
              loadingImagery: this.state.loadingImagery,
              imageryModalVisible: imageryModalVisible,
              imageryError: imageryError,
              getNewSatelliteImages: this.getUpdatedSatelliteImagery,
              imageryHoverVisible: this.state.imageryHoverVisible,
              selectedImagery: this.state.selectedImagery
            }),
            this.state.imageryHoverInfo && this.state.imageryHoverInfo.visible && this.state.selectedImagery && _react2.default.createElement(_ImageryHoverModal2.default, {
              selectedImagery: this.state.selectedImagery,
              top: this.state.imageryHoverInfo.top,
              left: this.state.imageryHoverInfo.left
            })
          )
        );
      }
    }]);

    return Map;
  }(_react.Component);

  exports.default = Map;
});