define(['exports', 'js/config', 'helpers/ShareHelper', 'actions/ModalActions', 'actions/AnalysisActions', 'actions/MapActions', 'stores/MapStore', 'js/constants', 'react'], function (exports, _config, _ShareHelper, _ModalActions, _AnalysisActions, _MapActions, _MapStore, _constants, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

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

  var useSvg = '<use xlink:href="#shape-info" />';

  var BasemapTab = function (_React$Component) {
    _inherits(BasemapTab, _React$Component);

    function BasemapTab(props) {
      _classCallCheck(this, BasemapTab);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BasemapTab).call(this, props));

      _this.childClicked = function (evt) {
        evt.stopPropagation();
        var id = evt.currentTarget.getAttribute('data-id');
        _ModalActions.modalActions.showLayerInfo(id);
      };

      _this.clickedBasemap = function (evt) {
        var id = evt.currentTarget.getAttribute('data-basemap');
        if (id === _constants2.default.landsat8) {
          _MapActions.mapActions.changeBasemap(id);
          _MapActions.mapActions.setBasemap(id);
        } else {
          _MapActions.mapActions.setBasemap(id);
        }
      };

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      var defaultState = _MapStore.mapStore.getState();
      _this.state = {
        basemapGalleryOpen: false,
        activeBasemap: defaultState.activeBasemap
      };
      return _this;
    }

    _createClass(BasemapTab, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        var newState = _MapStore.mapStore.getState();
        if (newState.activeBasemap !== this.state.activeBasemap) {
          this.setState({ activeBasemap: newState.activeBasemap });
          _MapActions.mapActions.changeBasemap(newState.activeBasemap);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var className = 'text-center';
        if (this.props.activeTab !== _config.analysisPanelText.basemapTabId) {
          className += ' hidden';
        }

        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'div',
              { className: 'basemap-holder shadow open' },
              _react2.default.createElement(
                'div',
                { 'data-basemap': _constants2.default.darkGrayBasemap, className: 'basemap-item ' + (this.state.activeBasemap === _constants2.default.darkGrayBasemap ? 'active' : ''), onClick: this.clickedBasemap },
                _react2.default.createElement('span', { className: 'basemap-thumbnail dark-gray-basemap ' + (this.state.activeBasemap === _constants2.default.darkGrayBasemap ? 'active' : '') }),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-label' },
                  _config.controlPanelText.darkGrayBasemap
                ),
                _react2.default.createElement(
                  'span',
                  { onClick: this.childClicked, 'data-id': _constants2.default.darkGrayBasemap, className: 'info-icon pointer' },
                  _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
                )
              ),
              _react2.default.createElement(
                'div',
                { 'data-basemap': _constants2.default.topoBasemap, className: 'basemap-item ' + (this.state.activeBasemap === _constants2.default.topoBasemap ? 'active' : ''), onClick: this.clickedBasemap },
                _react2.default.createElement('span', { className: 'basemap-thumbnail topo-basemap ' + (this.state.activeBasemap === _constants2.default.topoBasemap ? 'active' : '') }),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-label' },
                  _config.controlPanelText.topoBasemap
                ),
                _react2.default.createElement(
                  'span',
                  { onClick: this.childClicked, 'data-id': _constants2.default.topoBasemap, className: 'info-icon pointer' },
                  _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
                )
              ),
              _react2.default.createElement(
                'div',
                { 'data-basemap': _constants2.default.wriBasemap, className: 'basemap-item ' + (this.state.activeBasemap === _constants2.default.wriBasemap ? 'active' : ''), onClick: this.clickedBasemap },
                _react2.default.createElement('span', { className: 'basemap-thumbnail wri-basemap ' + (this.state.activeBasemap === _constants2.default.wriBasemap ? 'active' : '') }),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-label' },
                  _config.controlPanelText.wriBasemap
                ),
                _react2.default.createElement(
                  'span',
                  { onClick: this.childClicked, 'data-id': _constants2.default.wriBasemap, className: 'info-icon pointer' },
                  _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
                )
              ),
              _react2.default.createElement(
                'div',
                { 'data-basemap': _constants2.default.imageryBasemap, className: 'basemap-item ' + (this.state.activeBasemap === _constants2.default.imageryBasemap ? 'active' : ''), onClick: this.clickedBasemap },
                _react2.default.createElement('span', { className: 'basemap-thumbnail imagery-basemap ' + (this.state.activeBasemap === _constants2.default.imageryBasemap ? 'active' : '') }),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-label' },
                  _config.controlPanelText.imageryBasemap
                ),
                _react2.default.createElement(
                  'span',
                  { onClick: this.childClicked, 'data-id': _constants2.default.imageryBasemap, className: 'info-icon pointer' },
                  _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
                )
              ),
              _react2.default.createElement(
                'div',
                { 'data-basemap': _constants2.default.landsat8, className: 'basemap-item ' + (this.state.activeBasemap === _constants2.default.landsat8 ? 'active' : ''), onClick: this.clickedBasemap },
                _react2.default.createElement('span', { className: 'basemap-thumbnail landsat-basemap ' + (this.state.activeBasemap === _constants2.default.landsat8 ? 'active' : '') }),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-label' },
                  _config.controlPanelText.landsat8
                ),
                _react2.default.createElement(
                  'span',
                  { onClick: this.childClicked, 'data-id': _constants2.default.landsat8, className: 'info-icon pointer' },
                  _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
                )
              )
            )
          )
        );
      }
    }]);

    return BasemapTab;
  }(_react2.default.Component);

  exports.default = BasemapTab;
});