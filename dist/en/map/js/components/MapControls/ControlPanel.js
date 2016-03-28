define(['exports', 'helpers/ShareHelper', 'actions/ModalActions', 'actions/AnalysisActions', 'js/config', 'actions/MapActions', 'stores/MapStore', 'react'], function (exports, _ShareHelper, _ModalActions, _AnalysisActions, _config, _MapActions, _MapStore, _react) {
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

  var zoomInSvg = '<use xlink:href="#icon-plus" />';
  var zoomOutSvg = '<use xlink:href="#icon-minus" />';
  var shareSvg = '<use xlink:href="#icon-share" />';
  var magnifierSvg = '<use xlink:href="#icon-magnifier" />';
  // let basemapSvg = '<use xlink:href="#icon-basemap" />';
  var locateSvg = '<use xlink:href="#icon-locate" />';
  var timelineSvg = '<use xlink:href="#icon-timeline" />';
  var printSvg = '<use xlink:href="#icon-print" />';

  var ControlPanel = function (_React$Component) {
    _inherits(ControlPanel, _React$Component);

    function ControlPanel(props) {
      _classCallCheck(this, ControlPanel);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ControlPanel).call(this, props));

      // mapStore.listen(this.storeUpdated.bind(this));
      var defaultState = _MapStore.mapStore.getState();
      _this.state = {
        pannelsHidden: false,
        activeBasemap: defaultState.activeBasemap
      };
      return _this;
    }

    _createClass(ControlPanel, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        var newState = _MapStore.mapStore.getState();
        if (newState.pannelsHidden !== this.state.pannelsHidden) {
          //todo: figure out how this is triggering when they are both false
          console.log(newState.pannelsHidden);
          console.log(this.state.pannelsHidden);
          console.log('would hide panels..');
          // debugger
          // this.setState({ pannelsHidden: newState.pannelsHidden });
          // mapActions.togglePanels(newState.pannelsHidden);
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
      key: 'share',
      value: function share() {
        _ModalActions.modalActions.showShareModal((0, _ShareHelper.prepareStateForUrl)());
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
      key: 'togglePanels',
      value: function togglePanels() {
        this.setState({ panelsHidden: !this.state.panelsHidden });
      }
    }, {
      key: 'clickedBasemap',
      value: function clickedBasemap(id) {
        _MapActions.mapActions.setBasemap(id);
      }
    }, {
      key: 'print',
      value: function print() {
        window.print();
      }
    }, {
      key: 'locateMe',
      value: function locateMe() {
        _MapActions.mapActions.zoomToUserLocation();
      }
    }, {
      key: 'toggleSearch',
      value: function toggleSearch() {
        _AnalysisActions.analysisActions.toggleEsriSearchVisibility();
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(
          'div',
          { className: 'control-panel map-component shadow' },
          _react2.default.createElement(
            'ul',
            null,
            _react2.default.createElement(
              'li',
              { className: 'zoom-in pointer', title: 'Zoom In', onClick: this.zoomIn },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: zoomInSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap top left' },
                _config.controlPanelText.zoomInHover
              )
            ),
            _react2.default.createElement(
              'li',
              { className: 'zoom-out pointer', title: 'Zoom Out', onClick: this.zoomOut },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: zoomOutSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap top right' },
                _config.controlPanelText.zoomOutHover
              )
            ),
            _react2.default.createElement(
              'li',
              { className: 'share-map pointer', title: 'Share', onClick: this.share },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: shareSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap middle left' },
                _config.controlPanelText.shareHover
              )
            ),
            app.mobile() === true ? _react2.default.createElement(
              'li',
              { className: 'locate-me mobs pointer', title: 'Locate Me', onClick: this.locateMe },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: locateSvg } })
            ) : _react2.default.createElement(
              'li',
              { className: 'search-map pointer', title: 'Search', onClick: this.toggleSearch },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: magnifierSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap middle right' },
                _config.controlPanelText.searchHover
              )
            ),
            _react2.default.createElement(
              'li',
              { className: 'timeline-sync pointer', title: 'Time sync', onClick: this.toggleMasterCalendar.bind(this) },
              _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: timelineSvg } }),
              _react2.default.createElement(
                'span',
                { className: 'tooltipmap low left' },
                _config.controlPanelText.timeHover
              )
            ),
            _react2.default.createElement(
              'li',
              { className: 'print pointer', title: 'Print', onClick: this.print },
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