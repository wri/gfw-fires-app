define(['exports', 'components/LayerPanel/ImageryComponent', 'js/config', 'actions/AnalysisActions', 'actions/ModalActions', 'actions/MapActions', 'stores/MapStore', 'helpers/LayersHelper', 'js/constants', 'react', 'components/AnalysisPanel/PlanetImagery'], function (exports, _ImageryComponent, _config, _AnalysisActions, _ModalActions, _MapActions, _MapStore, _LayersHelper, _constants, _react, _PlanetImagery) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ImageryComponent2 = _interopRequireDefault(_ImageryComponent);

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _constants2 = _interopRequireDefault(_constants);

  var _react2 = _interopRequireDefault(_react);

  var _PlanetImagery2 = _interopRequireDefault(_PlanetImagery);

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

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

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

  var ImageryTab = function (_React$Component) {
    _inherits(ImageryTab, _React$Component);

    function ImageryTab(props) {
      _classCallCheck(this, ImageryTab);

      var _this = _possibleConstructorReturn(this, (ImageryTab.__proto__ || Object.getPrototypeOf(ImageryTab)).call(this, props));

      _this.clickedImagery = function (evt) {
        var currImagery = '';
        var activeImagery = _this.state.activeImagery;
        var clickedImagery = evt.currentTarget.dataset.basemap;

        var dgLayer = _config.layersConfig.filter(function (l) {
          return l.id === _constants2.default.digitalGlobe;
        })[0];

        if (activeImagery === clickedImagery) {
          if (clickedImagery === _constants2.default.planetBasemap) {
            _MapActions.mapActions.changeBasemap(app.map.getBasemap());
          } else {
            _LayersHelper2.default.hideLayer(dgLayer.id);
          }
        } else {
          currImagery = clickedImagery;
        }

        _MapActions.mapActions.setImagery(currImagery);
      };

      _this.showInfo = function (evt) {
        evt.stopPropagation();
        var id = evt.currentTarget.parentElement.dataset.basemap === 'planetBasemap' ? evt.currentTarget.parentElement.dataset.basemap : 'dg-00';
        _ModalActions.modalActions.showLayerInfo(id);
      };

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(ImageryTab, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var self = this;
        // Request XML page
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState === 4) {
            if (this.status === 200) {
              var basemaps = [];

              var xmlParser = new DOMParser();
              var htmlString = '<!DOCTYPE html>' + xhttp.responseText.substring(38);

              var xmlDoc = xmlParser.parseFromString(htmlString, 'text/html');

              var contents = xmlDoc.getElementsByTagName('Contents')[0];
              var layerCollection = contents.getElementsByTagName('Layer');
              var layerCollectionLength = layerCollection.length;

              for (var i = 0; i < layerCollectionLength; i++) {
                var currentLayer = layerCollection[i];
                var title = currentLayer.getElementsByTagName('ows:Title')[0].innerHTML;
                var url = currentLayer.getElementsByTagName('ResourceURL')[0].getAttribute('template');
                basemaps.push({ title: title, url: url });
              }

              var monthlyBasemaps = [];
              var quarterlyBasemaps = [];
              basemaps.forEach(function (basemap) {
                if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Monthly') >= 0) {
                  monthlyBasemaps.push(basemap);
                }
                if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Quarterly') >= 0) {
                  quarterlyBasemaps.push(basemap);
                }
              });

              var parsedMonthly = self.parseTitles(monthlyBasemaps, true).reverse();
              var parsedQuarterly = self.parseTitles(quarterlyBasemaps, false).reverse();

              _AnalysisActions.analysisActions.saveMonthlyPlanetBasemaps(parsedMonthly);
              _AnalysisActions.analysisActions.saveQuarterlyPlanetBasemaps(parsedQuarterly);
            } else {
              console.log('Error retrieving planet basemaps.');
            }
          }
        };
        xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=d4d25171b85b4f7f8fde459575cba233', true);
        xhttp.send();
      }
    }, {
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'parseTitles',
      value: function parseTitles(planetBasemaps, isMonthly) {
        var _this2 = this;

        // Filter out 'Latest Monthly' and 'Latest Quarterly'
        return planetBasemaps.filter(function (basemap) {
          if (basemap.title === 'Latest Monthly' || basemap.title === 'Latest Quarterly') {
            return false;
          } else {
            return true;
          }
        }).map(function (basemap) {
          var url = basemap.url,
              title = basemap.title;

          var label = isMonthly ? _this2.parseMonthlyTitle(title) : _this2.parseQuarterlyTitle(title);
          return {
            value: url,
            label: label
          };
        });
      }
    }, {
      key: 'parseMonthlyTitle',
      value: function parseMonthlyTitle(title) {
        // ex. formats 'Global Monthly 2016 01 Mosaic'
        var words = title.split(' ');
        var year = words[2];
        var month = words[3];
        var yyyyMM = year + ' ' + month;
        var label = window.Kalendae.moment(yyyyMM, 'YYYY MM').format('MMM YYYY');
        return label;
      }
    }, {
      key: 'parseQuarterlyTitle',
      value: function parseQuarterlyTitle(title) {
        var words = title.split(' ');
        var yearQuarter = words[2];

        var dict = {
          1: 'JAN-MAR',
          2: 'APR-JUN',
          3: 'JUL-SEP',
          4: 'OCT-DEC'
        };

        if (yearQuarter === undefined) {
          return title;
        } else {
          var _yearQuarter$split = yearQuarter.split('q'),
              _yearQuarter$split2 = _slicedToArray(_yearQuarter$split, 2),
              year = _yearQuarter$split2[0],
              quarter = _yearQuarter$split2[1];

          var label = dict[quarter] + ' ' + year;
          return label;
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var _state = this.state,
            activeImagery = _state.activeImagery,
            iconLoading = _state.iconLoading;
        var _props = this.props,
            monthlyPlanetBasemaps = _props.monthlyPlanetBasemaps,
            quarterlyPlanetBasemaps = _props.quarterlyPlanetBasemaps,
            activeTab = _props.activeTab;
        var planetBasemap = _constants2.default.planetBasemap,
            digitalGlobe = _constants2.default.digitalGlobe,
            digitalGlobeBasemap = _constants2.default.digitalGlobeBasemap;


        var className = 'imagery-tab';
        if (activeTab !== _config.analysisPanelText.imageryTabId) {
          className += ' hidden';
        }
        var dgLayer = _config.layersConfig.filter(function (l) {
          return l.id === digitalGlobe;
        })[0];

        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            'h3',
            null,
            _config.analysisPanelText.imageryArea
          ),
          _react2.default.createElement(
            'div',
            { 'data-basemap': planetBasemap, className: 'basemap-item ' + (activeImagery === planetBasemap ? 'active' : ''), onClick: this.clickedImagery },
            _react2.default.createElement('span', { className: 'basemap-thumbnail dark-gray-basemap ' + (activeImagery === planetBasemap ? 'active' : '') }),
            _react2.default.createElement(
              'div',
              { className: 'basemap-label' },
              'Planet Basemaps'
            ),
            _react2.default.createElement(
              'span',
              { className: 'info-icon pointer info-icon-center ' + (iconLoading === planetBasemap ? 'iconLoading' : ''), onClick: this.showInfo.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
            ),
            activeImagery === planetBasemap && _react2.default.createElement(_PlanetImagery2.default, { monthlyBasemaps: monthlyPlanetBasemaps, quarterlyBasemaps: quarterlyPlanetBasemaps, active: activeImagery === planetBasemap })
          ),
          _react2.default.createElement(
            'div',
            { 'data-basemap': digitalGlobeBasemap, className: 'basemap-item ' + (activeImagery === digitalGlobeBasemap ? 'active' : ''), onClick: this.clickedImagery },
            _react2.default.createElement('span', { className: 'basemap-thumbnail dark-gray-basemap ' + (activeImagery === digitalGlobeBasemap ? 'active' : '') }),
            _react2.default.createElement(
              'div',
              { className: 'basemap-label' },
              'DigitalGlobe - FirstLook'
            ),
            _react2.default.createElement(
              'span',
              { className: 'info-icon pointer info-icon-center ' + (iconLoading === digitalGlobeBasemap ? 'iconLoading' : ''), onClick: this.showInfo.bind(this) },
              _react2.default.createElement('svg', { dangerouslySetInnerHTML: { __html: useSvg } })
            ),
            activeImagery === digitalGlobeBasemap && _react2.default.createElement(_ImageryComponent2.default, _extends({}, this.state, { options: dgLayer.calendar, active: activeImagery === digitalGlobeBasemap, layer: dgLayer }))
          )
        );
      }
    }]);

    return ImageryTab;
  }(_react2.default.Component);

  exports.default = ImageryTab;
});