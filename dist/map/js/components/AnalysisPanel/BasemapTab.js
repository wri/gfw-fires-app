define(['exports', 'js/config', 'actions/MapActions', 'stores/MapStore', 'js/constants', 'react'], function (exports, _config, _MapActions, _MapStore, _constants, _react) {
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

  var BasemapTab = function (_React$Component) {
    _inherits(BasemapTab, _React$Component);

    function BasemapTab(props) {
      _classCallCheck(this, BasemapTab);

      var _this = _possibleConstructorReturn(this, (BasemapTab.__proto__ || Object.getPrototypeOf(BasemapTab)).call(this, props));

      _this.clickedBasemap = function (evt) {
        var id = evt.currentTarget.getAttribute('data-basemap');
        _MapActions.mapActions.changeBasemap(id);
      };

      _this.handleCheckToggle = function (evt) {
        _MapActions.mapActions.updateOverlays(evt.target.id);
      };

      _this.displayPlanetBasemaps = function () {
        _this.setState({ showPlanetBasemaps: true });
      };

      _this.hidePlanetBasemaps = function () {
        _this.setState({ showPlanetBasemaps: false });
      };

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      var defaultState = _MapStore.mapStore.getState();
      _this.state = {
        showPlanetBasemaps: false,
        basemapGalleryOpen: false,
        activeBasemap: defaultState.activeBasemap,
        overlaysVisible: defaultState.overlaysVisible
      };
      return _this;
    }

    _createClass(BasemapTab, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        var newState = _MapStore.mapStore.getState();
        if (newState.activeBasemap !== this.state.activeBasemap) {
          this.setState({
            activeBasemap: newState.activeBasemap
          });
          _MapActions.mapActions.changeBasemap(newState.activeBasemap);
        }

        if (newState.overlaysVisible !== this.state.overlaysVisible) {
          this.setState({
            overlaysVisible: newState.overlaysVisible
          });
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
                { className: 'basemap-item' },
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-admin' },
                  _react2.default.createElement('input', { checked: this.state.overlaysVisible.indexOf('provinces') > -1, onChange: this.handleCheckToggle, type: 'checkbox', id: 'provinces' }),
                  _react2.default.createElement(
                    'span',
                    null,
                    'Provinces'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-admin' },
                  _react2.default.createElement('input', { checked: this.state.overlaysVisible.indexOf('districts') > -1, onChange: this.handleCheckToggle, type: 'checkbox', id: 'districts' }),
                  _react2.default.createElement(
                    'span',
                    null,
                    'Districts'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-admin' },
                  _react2.default.createElement('input', { checked: this.state.overlaysVisible.indexOf('subdistricts') > -1, onChange: this.handleCheckToggle, type: 'checkbox', id: 'subdistricts' }),
                  _react2.default.createElement(
                    'span',
                    null,
                    'Subdistricts'
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-admin' },
                  _react2.default.createElement('input', { checked: this.state.overlaysVisible.indexOf('villages') > -1, onChange: this.handleCheckToggle, type: 'checkbox', id: 'villages' }),
                  _react2.default.createElement(
                    'span',
                    null,
                    'Villages'
                  )
                )
              ),
              _react2.default.createElement(
                'div',
                { 'data-basemap': _constants2.default.darkGrayBasemap, className: 'basemap-item ' + (this.state.activeBasemap === _constants2.default.darkGrayBasemap ? 'active' : ''), onClick: this.clickedBasemap },
                _react2.default.createElement('span', { className: 'basemap-thumbnail dark-gray-basemap ' + (this.state.activeBasemap === _constants2.default.darkGrayBasemap ? 'active' : '') }),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-label' },
                  _config.controlPanelText.darkGrayBasemap
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
                )
              ),
              _react2.default.createElement(
                'div',
                { 'data-basemap': _constants2.default.osmBasemap, className: 'basemap-item ' + (this.state.activeBasemap === _constants2.default.osmBasemap ? 'active' : ''), onClick: this.clickedBasemap },
                _react2.default.createElement('span', { className: 'basemap-thumbnail osm-basemap ' + (this.state.activeBasemap === _constants2.default.osmBasemap ? 'active' : '') }),
                _react2.default.createElement(
                  'div',
                  { className: 'basemap-label' },
                  _config.controlPanelText.osmBasemap
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