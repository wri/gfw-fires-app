define(['exports', 'helpers/ShareHelper', 'actions/ModalActions', 'actions/AnalysisActions', 'esri/geometry/webMercatorUtils', 'esri/dijit/Scalebar', 'js/config', 'actions/MapActions', 'stores/MapStore', 'react'], function (exports, _ShareHelper, _ModalActions, _AnalysisActions, _webMercatorUtils, _Scalebar, _config, _MapActions, _MapStore, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ShareHelper2 = _interopRequireDefault(_ShareHelper);

  var _webMercatorUtils2 = _interopRequireDefault(_webMercatorUtils);

  var _Scalebar2 = _interopRequireDefault(_Scalebar);

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

  var zoomInSvg = '<use xlink:href="#icon-plus" />';
  var zoomOutSvg = '<use xlink:href="#icon-minus" />';
  var shareSvg = '<use xlink:href="#icon-share" />';
  var magnifierSvg = '<use xlink:href="#icon-magnifier" />';
  var timelineSvg = '<use xlink:href="#icon-timeline" />';
  var printSvg = '<use xlink:href="#icon-print" />';
  var showSvg = '<use xlink:href="#icon-controlstoggle__on" />';
  var refreshSvg = '<use xlink:href="#icon-reset" />';

  var ControlPanel = function (_React$Component) {
    _inherits(ControlPanel, _React$Component);

    function ControlPanel(props) {
      _classCallCheck(this, ControlPanel);

      var _this = _possibleConstructorReturn(this, (ControlPanel.__proto__ || Object.getPrototypeOf(ControlPanel)).call(this, props));

      _this.displayCoordinates = function (evt) {
        var mp = _webMercatorUtils2.default.webMercatorToGeographic(evt.mapPoint);
        _this.setState({
          lat: mp.x.toFixed(2),
          lng: mp.y.toFixed(2)
        });
      };

      _this.share = function () {
        _this.sendAnalytics('map', 'share', 'The is prepping the application to share.');
        _ModalActions.modalActions.showShareModal(_ShareHelper2.default.prepareStateForUrl());
      };

      _this.printMap = function () {
        _this.sendAnalytics('map', 'print', 'The user printed the map.');
        window.print();
      };

      _this.state = {
        lat: '',
        lng: ''
      };
      return _this;
    }

    _createClass(ControlPanel, [{
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        if (prevProps.map.loaded !== this.props.map.loaded) {
          this.props.map.on('mouse-move', this.displayCoordinates);
          var scalebar = new _Scalebar2.default({
            map: this.props.map,
            // "dual" displays both miles and kilometers
            // "english" is the default, which displays miles
            // use "metric" for kilometers
            attachTo: 'bottom-right',
            scalebarUnit: 'metric'
          });
          console.log(scalebar);
        }
      }
    }, {
      key: 'zoomIn',
      value: function zoomIn() {
        app.map.setZoom(app.map.getZoom() + 1);
      }
    }, {
      key: 'zoomOut',
      value: function zoomOut() {
        app.map.setZoom(app.map.getZoom() - 1);
      }
    }, {
      key: 'reset',
      value: function reset() {
        _MapActions.mapActions.reset();
      }
    }, {
      key: 'toggleMasterCalendar',
      value: function toggleMasterCalendar() {
        _ModalActions.modalActions.showCalendarModal('start');
        _MapActions.mapActions.setCalendar('masterDay');
      }
    }, {
      key: 'clickedBasemap',
      value: function clickedBasemap(id) {
        _MapActions.mapActions.setBasemap(id);
      }
    }, {
      key: 'sendAnalytics',
      value: function sendAnalytics(eventType, action, label) {
        //todo: why is this request getting sent so many times?
        ga('A.send', 'event', eventType, action, label);
        ga('B.send', 'event', eventType, action, label);
        ga('C.send', 'event', eventType, action, label);
      }
    }, {
      key: 'toggleShow',
      value: function toggleShow() {
        _MapActions.mapActions.togglePanels();
        _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
      }
    }, {
      key: 'refresh',
      value: function refresh() {
        _MapActions.mapActions.reset();
      }
    }, {
      key: 'locateMe',
      value: function locateMe() {
        _MapActions.mapActions.zoomToUserLocation();
      }
    }, {
      key: 'toggleSearch',
      value: function toggleSearch() {
        // analysisActions.toggleEsriSearchVisibility();
        _ModalActions.modalActions.showSearchModal();
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'control-panel map-component shadow' },
          _react2.default.createElement('div', { id: 'scalebar-container' }),
          _react2.default.createElement(
            'span',
            { className: 'lat-lng-display ' + (this.state.lat ? '' : ' hidden') },
            _react2.default.createElement(
              'span',
              null,
              this.state.lat
            ),
            _react2.default.createElement(
              'span',
              null,
              ', '
            ),
            _react2.default.createElement(
              'span',
              null,
              this.state.lng
            )
          ),
          _react2.default.createElement(
            'ul',
            null,
            _react2.default.createElement(
              'li',
              { className: 'zoom-in pointer', onClick: this.zoomIn },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: zoomInSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap top left' },
                _config.controlPanelText.zoomInHover
              )
            ),
            _react2.default.createElement(
              'li',
              { className: 'zoom-out pointer', onClick: this.zoomOut },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: zoomOutSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap top right' },
                _config.controlPanelText.zoomOutHover
              )
            ),
            _react2.default.createElement(
              'li',
              { className: 'share-map pointer', onClick: this.share },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: shareSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap middle left' },
                _config.controlPanelText.shareHover
              )
            ),
            _react2.default.createElement(
              'li',
              { className: 'search-map pointer', onClick: this.toggleSearch },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: magnifierSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap middle right' },
                _config.controlPanelText.searchHover
              )
            ),
            app.mobile() === true ? null : _react2.default.createElement(
              'li',
              { className: 'show-hide pointer', onClick: this.toggleShow },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: showSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap low-mid left' },
                _config.controlPanelText.showHideHover
              )
            ),
            app.mobile() === true ? null : _react2.default.createElement(
              'li',
              { className: 'refresh pointer', onClick: this.refresh },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: refreshSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap low-mid right' },
                _config.controlPanelText.refreshHover
              )
            ),
            _react2.default.createElement(
              'li',
              { className: 'timeline-sync pointer', onClick: this.toggleMasterCalendar.bind(this) },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: timelineSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap low left' },
                _config.controlPanelText.timeHover
              )
            ),
            app.mobile() === true ? null : _react2.default.createElement(
              'li',
              { className: 'print pointer', onClick: this.printMap },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: printSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap low right' },
                _config.controlPanelText.printHover
              )
            )
          )
        );
      }
    }]);

    return ControlPanel;
  }(_react2.default.Component);

  exports.default = ControlPanel;
});