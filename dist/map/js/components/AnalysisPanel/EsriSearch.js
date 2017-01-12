define(['exports', 'actions/AnalysisActions', 'actions/MapActions', 'stores/AnalysisStore', 'js/config', 'esri/dijit/Search', 'react'], function (exports, _AnalysisActions, _MapActions, _AnalysisStore, _config, _Search, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _Search2 = _interopRequireDefault(_Search);

  var _react2 = _interopRequireDefault(_react);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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

  var magnifierSvg = '<use xlink:href="#icon-magnifier" />';
  var locateSvg = '<use xlink:href="#icon-locate" />';
  var generateSearchWidget = function generateSearchWidget(component) {

    var searchWidget = new _Search2.default({
      map: app.map,
      autoNavigate: true,
      enableHighlight: false,
      showInfoWindowOnSelect: false,
      enableSourcesMenu: false
    }, _config.analysisPanelText.searchWidgetId);

    searchWidget.startup();

    searchWidget.on('suggest-results', function () {
      component.setState({ suggestResults: searchWidget.suggestResults === null ? [] : searchWidget.suggestResults[0].map(function (r) {
          return r.text;
        }) });
    });

    return searchWidget;
  };

  var tabs = ['Address', 'Coordinates', 'Decimal Degrees'];

  // REFERENCE: http://stackoverflow.com/a/5971628
  function dms2Deg(s) {
    // Determine if south latitude or west longitude
    var sw = /[sw]/i.test(s);

    // Determine sign based on sw (south or west is -ve)
    var f = sw ? -1 : 1;

    // Get into numeric parts
    var bits = s.match(/[\d.]+/g);

    var result = 0;

    // Convert to decimal degrees
    for (var i = 0, iLen = bits.length; i < iLen; i++) {

      // String conversion to number is done by division
      // To be explicit (not necessary), use
      //   result += Number(bits[i])/f
      result += bits[i] / f;

      // Divide degrees by +/- 1, min by +/- 60, sec by +/-3600
      f *= 60;
    }

    return result;
  }

  var EsriSearch = function (_React$Component) {
    _inherits(EsriSearch, _React$Component);

    function EsriSearch(props) {
      _classCallCheck(this, EsriSearch);

      var _this = _possibleConstructorReturn(this, (EsriSearch.__proto__ || Object.getPrototypeOf(EsriSearch)).call(this, props));

      _this.state = {
        value: '',
        visibleTab: 0,
        searchWidget: null,
        suggestResults: [],
        esriSearchVisible: _AnalysisStore.analysisStore.getState().esriSearchVisible
      };
      _AnalysisStore.analysisStore.listen(_this.onUpdate.bind(_this));
      _this.keyDown = _this.keyDown.bind(_this);
      _this.suggestionSearch = _this.suggestionSearch.bind(_this);
      _this.suggestionKeyDown = _this.suggestionKeyDown.bind(_this);
      return _this;
    }

    _createClass(EsriSearch, [{
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        if (!this.props.loaded && nextProps.loaded) {
          this.setState({ searchWidget: generateSearchWidget(this) });
        }
      }
    }, {
      key: 'onUpdate',
      value: function onUpdate() {
        this.setState({ esriSearchVisible: _AnalysisStore.analysisStore.getState().esriSearchVisible });
      }
    }, {
      key: 'change',
      value: function change(evt) {
        var value = evt.target.value,
            suggestResults = value.length === 0 ? [] : this.state.suggestResults;

        this.state.searchWidget.suggest(value);
        this.setState({ value: value, suggestResults: suggestResults });
      }
    }, {
      key: 'enter',
      value: function enter(evt) {
        if (evt.key === 'Enter' && this.state.value.length > 0) {
          this.state.searchWidget.search(this.state.value);
          _AnalysisActions.analysisActions.toggleEsriSearchVisibility();
        }
      }
    }, {
      key: 'keyDown',
      value: function keyDown(evt) {
        if (evt.key === 'Enter' && this.state.value.length > 0) {
          this.enter(evt);
        }
        if (evt.key === 'ArrowDown' && this.state.suggestResults.length > 0) {
          this.refs.searchResults.childNodes[0].querySelector('button').focus();
        }
      }
    }, {
      key: 'suggestionKeyDown',
      value: function suggestionKeyDown(evt) {
        if (['ArrowUp', 'ArrowDown'].indexOf(evt.key) > -1 && this.state.value.length > 0) {
          var arrowUp = evt.key === 'ArrowUp';
          var suggestionIndex = JSON.parse(evt.target.getAttribute('data-suggestion-index'));
          var nextSibling = this.refs.searchResults.childNodes[suggestionIndex + (arrowUp === true ? -1 : 1)];
          if (suggestionIndex === 0 && arrowUp === true) {
            this.refs.searchInput.focus();return;
          }
          if (nextSibling !== undefined) {
            nextSibling.querySelector('button').focus();
          }
        }
      }
    }, {
      key: 'suggestionSearch',
      value: function suggestionSearch(evt) {
        var suggestionIndex = JSON.parse(evt.target.getAttribute('data-suggestion-index'));
        this.state.searchWidget.search(this.state.searchWidget.suggestResults[0][suggestionIndex]);
        this.state.searchWidget.clear();
        this.setState({ value: '', suggestResults: [] });
        _AnalysisActions.analysisActions.toggleEsriSearchVisibility();
      }
    }, {
      key: 'coordinateSearch',
      value: function coordinateSearch() {
        var dmsA = Array.apply({}, this.refs.coordinatesA.querySelectorAll('input')).map(function (i) {
          return i.value;
        }).map(function (v) {
          return parseInt(v);
        }).map(Math.abs);
        var directionA = this.refs.directionA.value;
        var dmsB = Array.apply({}, this.refs.coordinatesB.querySelectorAll('input')).map(function (i) {
          return i.value;
        }).map(function (v) {
          return parseInt(v);
        }).map(Math.abs);
        var directionB = this.refs.directionB.value;
        var lat = dms2Deg(directionA + ' ' + dmsA[0] + ' ' + dmsA[1] + '\' ' + dmsA[2] + '"');
        var lng = dms2Deg(directionB + ' ' + dmsB[0] + ' ' + dmsB[1] + '\' ' + dmsB[2] + '"');
        _MapActions.mapActions.centerAndZoomLatLng(lat, lng, _config.analysisConfig.searchZoomDefault);
      }
    }, {
      key: 'decimalDegreeSearch',
      value: function decimalDegreeSearch() {
        var values = [this.refs.decimalDegreeLat.value, this.refs.decimalDegreeLng.value].map(parseFloat);

        var _values = _slicedToArray(values, 2),
            lat = _values[0],
            lng = _values[1];

        if (values.map(isNaN).indexOf(true) > -1) {
          throw Error('Invalid input(s)');
        }
        _MapActions.mapActions.centerAndZoomLatLng(lat, lng, _config.analysisConfig.searchZoomDefault);
        _AnalysisActions.analysisActions.toggleEsriSearchVisibility();
      }
    }, {
      key: 'locateMe',
      value: function locateMe() {
        _MapActions.mapActions.zoomToUserLocation();
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var className = 'search-tools map-component';
        // NOTE: searchInput is mounted & unmounted visible to take advantage of keyboard autoFocus
        var searchInput = this.state.esriSearchVisible === false ? undefined : _react2.default.createElement('input', { ref: 'searchInput', className: 'search-input fill__wide', type: 'text', placeholder: _config.analysisPanelText.searchPlaceholder, value: this.state.value, onChange: this.change.bind(this), onKeyDown: this.keyDown, autoFocus: true });
        if (this.state.esriSearchVisible === false) {
          className += ' hidden';
        }
        if (app.mobile() === true) {
          className += ' isSearchMobile';
          tabs[2] = 'Decimal D.';
        }

        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            'div',
            { className: 'search-tab-container' },
            tabs.map(function (t, i) {
              return _react2.default.createElement(
                'button',
                { className: 'search-tab ' + (i === _this2.state.visibleTab ? 'active' : ''), onClick: function onClick() {
                    return _this2.setState({ visibleTab: i });
                  } },
                t
              );
            })
          ),
          _react2.default.createElement(
            'div',
            { className: this.state.visibleTab === 0 ? '' : 'hidden' },
            _react2.default.createElement(
              'div',
              { className: 'search-input-container' },
              searchInput,
              _react2.default.createElement(
                'button',
                { className: 'border-right padding back-white' },
                _react2.default.createElement('svg', { className: 'search-magnifier vertical-middle', dangerouslySetInnerHTML: { __html: magnifierSvg } })
              ),
              _react2.default.createElement(
                'div',
                { className: 'locate-me pointer', title: 'Locate Me', onClick: this.locateMe },
                _react2.default.createElement('svg', { className: 'panel-icon', dangerouslySetInnerHTML: { __html: locateSvg } })
              )
            ),
            _react2.default.createElement(
              'div',
              { ref: 'searchResults', className: 'search-results custom-scroll' },
              this.state.suggestResults.map(function (r, i) {
                return _react2.default.createElement(
                  'div',
                  null,
                  _react2.default.createElement(
                    'button',
                    { 'data-suggestion-index': i, onClick: _this2.suggestionSearch, onKeyDown: _this2.suggestionKeyDown },
                    r
                  )
                );
              }, this)
            )
          ),
          _react2.default.createElement(
            'div',
            { className: this.state.visibleTab === 1 ? '' : 'hidden' },
            _react2.default.createElement(
              'div',
              { ref: 'coordinatesA', className: 'search-coordinates back-white' },
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('input', { className: 'search-input', type: 'number', min: '0', step: '1', placeholder: '00' }),
                '\xBA'
              ),
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('input', { className: 'search-input', type: 'number', min: '0', step: '1', placeholder: '00' }),
                "'"
              ),
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('input', { className: 'search-input', type: 'number', min: '0', step: '1', placeholder: '00' }),
                '"'
              ),
              _react2.default.createElement(
                'select',
                { ref: 'directionA' },
                _react2.default.createElement(
                  'option',
                  null,
                  'N'
                ),
                _react2.default.createElement(
                  'option',
                  null,
                  'S'
                )
              )
            ),
            _react2.default.createElement(
              'div',
              { ref: 'coordinatesB', className: 'search-coordinates back-white' },
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('input', { className: 'search-input', type: 'number', min: '0', step: '1', placeholder: '00' }),
                '\xBA'
              ),
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('input', { className: 'search-input', type: 'number', min: '0', step: '1', placeholder: '00' }),
                "'"
              ),
              _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('input', { className: 'search-input', type: 'number', min: '0', step: '1', placeholder: '00' }),
                '"'
              ),
              _react2.default.createElement(
                'select',
                { ref: 'directionB' },
                _react2.default.createElement(
                  'option',
                  null,
                  'W'
                ),
                _react2.default.createElement(
                  'option',
                  null,
                  'E'
                )
              )
            ),
            _react2.default.createElement(
              'div',
              { id: 'coordinateSearch' },
              _react2.default.createElement(
                'button',
                { className: 'search-submit-button gfw-btn green', onClick: this.coordinateSearch.bind(this) },
                'Search'
              )
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'search-box degrees ' + (this.state.visibleTab === 2 ? '' : 'hidden') },
            _react2.default.createElement(
              'div',
              { className: 'deg-box' },
              _react2.default.createElement(
                'span',
                null,
                'Lat:'
              ),
              _react2.default.createElement('input', { ref: 'decimalDegreeLat', type: 'number', className: 'deg-input', id: 'deg-lat', name: 'deg-lat' })
            ),
            _react2.default.createElement(
              'div',
              { className: 'deg-box' },
              _react2.default.createElement(
                'span',
                null,
                'Lon:'
              ),
              _react2.default.createElement('input', { ref: 'decimalDegreeLng', type: 'number', className: 'deg-input', id: 'deg-lng', name: 'deg-lng' })
            ),
            _react2.default.createElement(
              'button',
              { className: 'search-submit-button gfw-btn green', onClick: this.decimalDegreeSearch.bind(this) },
              'Search'
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'hidden' },
            _react2.default.createElement('div', { id: _config.analysisPanelText.searchWidgetId })
          )
        );
      }
    }]);

    return EsriSearch;
  }(_react2.default.Component);

  exports.default = EsriSearch;
});