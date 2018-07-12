define(['exports', 'js/config', 'actions/AnalysisActions', 'stores/MapStore', 'components/LayerPanel/AnalysisComponent', 'react', 'react-select'], function (exports, _config, _AnalysisActions, _MapStore, _AnalysisComponent, _react, _reactSelect) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _AnalysisComponent2 = _interopRequireDefault(_AnalysisComponent);

  var _react2 = _interopRequireDefault(_react);

  var _reactSelect2 = _interopRequireDefault(_reactSelect);

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

  var GlobalCountryReport = function (_React$Component) {
    _inherits(GlobalCountryReport, _React$Component);

    function GlobalCountryReport(props) {
      _classCallCheck(this, GlobalCountryReport);

      var _this = _possibleConstructorReturn(this, (GlobalCountryReport.__proto__ || Object.getPrototypeOf(GlobalCountryReport)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _extends({
        localErrors: false,
        currentCountry: null,
        selectedGlobalCoutry: '',
        selectedSubRegion: ''
      }, _MapStore.mapStore.getState());
      return _this;
    }

    _createClass(GlobalCountryReport, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        var calendar = new window.Kalendae(this.refs.date, {
          mode: 'range'
        });
        calendar.subscribe('change', function (date) {
          console.debug(date);
        });
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var countriesList = this.props.countries.map(function (country) {
          return {
            value: country,
            label: country
          };
        });
        // A default select option
        countriesList.unshift({
          value: '',
          label: 'Select a Country'
        });

        var countrySubRegions = this.props.adm1.filter(function (o) {
          return o.NAME_0 === _this2.state.selectedGlobalCoutry;
        });
        countrySubRegions.sort(function (a, b) {
          if (a.NAME_1 < b.NAME_1) {
            return -1;
          }
          if (a.NAME_1 > b.NAME_1) {
            return 1;
          }
          return 0;
        });

        var countrySubRegionsList = countrySubRegions.map(function (state) {
          return {
            value: state.NAME_1,
            label: state.NAME_1
          };
        });

        return _react2.default.createElement(
          'div',
          { className: 'report-width' },
          _react2.default.createElement(
            'h4',
            { className: 'country-report__title' },
            _config.analysisPanelText.globalReportTitle
          ),
          _react2.default.createElement(
            'div',
            { className: 'padding' },
            _react2.default.createElement(_reactSelect2.default, {
              value: this.state.selectedGlobalCoutry,
              onChange: this.handleGlobalCountryChange.bind(this),
              multi: false,
              options: countriesList
            })
          ),
          _react2.default.createElement(
            'p',
            { className: 'customize-report-label', onClick: this.toggleCustomize },
            _config.analysisPanelText.analysisCustomize,
            _react2.default.createElement(
              'span',
              { className: 'analysis-toggle' },
              this.props.customizeCountryOpen ? ' ▼' : ' ►'
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'customize-options ' + (this.props.customizeCountryOpen === true ? '' : 'hidden') },
            _react2.default.createElement(
              'div',
              { className: 'padding' },
              _react2.default.createElement(
                'p',
                null,
                'Select ',
                this.state.currentCountry,
                '\'s subregions: '
              ),
              _react2.default.createElement(_reactSelect2.default, {
                placeholder: 'Select a Country',
                onChange: this.handleSubRegionChange.bind(this),
                options: countrySubRegionsList,
                multi: true,
                value: this.state.selectedSubRegion
              })
            ),
            _react2.default.createElement(
              'button',
              { onClick: this.clearSubregions.bind(this), className: 'gfw-btn blue' },
              _config.analysisPanelText.analysisButtonClear
            ),
            _react2.default.createElement(
              'p',
              null,
              _config.analysisPanelText.analysisTimeframeHeader
            ),
            _react2.default.createElement(_AnalysisComponent2.default, _extends({}, this.state, { options: _config.analysisPanelText.analysisCalendar }))
          ),
          _react2.default.createElement(
            'div',
            { className: 'no-shrink analysis-footer text-center' },
            _react2.default.createElement(
              'button',
              { onClick: this.countryAnalysis.bind(this), className: 'gfw-btn blue' },
              _config.analysisPanelText.analysisButtonLabel
            )
          )
        );
      }
    }, {
      key: 'handleSubRegionChange',
      value: function handleSubRegionChange(selected) {
        this.setState({ selectedSubRegion: selected });
      }
    }, {
      key: 'handleGlobalCountryChange',
      value: function handleGlobalCountryChange(selected) {
        var _this3 = this;

        if (selected) {
          this.setState({ selectedGlobalCoutry: selected.value }, function () {
            var countrySubRegions = _this3.props.adm1.filter(function (o) {
              return o.NAME_0 === selected.value;
            });
            countrySubRegions.sort(function (a, b) {
              if (a.NAME_1 < b.NAME_1) {
                return -1;
              }
              if (a.NAME_1 > b.NAME_1) {
                return 1;
              }
              return 0;
            });

            var countrySubRegionsList = countrySubRegions.map(function (state) {
              return {
                value: state.NAME_1,
                label: state.NAME_1
              };
            });

            _this3.setState({ selectedSubRegion: countrySubRegionsList });
          });
        } else {
          this.setState({ selectedGlobalCoutry: '' });
        }
      }
    }, {
      key: 'toggleCustomize',
      value: function toggleCustomize() {
        _AnalysisActions.analysisActions.toggleCountryCustomize();
      }
    }, {
      key: 'clearSubregions',
      value: function clearSubregions() {
        this.setState({ selectedSubRegion: '' });
      }
    }, {
      key: 'countryAnalysis',
      value: function countryAnalysis() {
        app.debug('AnalysisTab >>> countryAnalysis');

        var reportType = 'globalcountryreport',
            countries = this.state.selectedGlobalCoutry,
            regions = this.state.selectedSubRegion,
            reportdateFrom = this.state.analysisStartDate.split('/'),
            reportdateTo = this.state.analysisEndDate.split('/'),
            reportdates = {};

        if (!countries) {
          return;
        }

        reportdates.fYear = Number(reportdateFrom[2]);
        reportdates.fMonth = Number(reportdateFrom[0]);
        reportdates.fDay = Number(reportdateFrom[1]);
        reportdates.tYear = Number(reportdateTo[2]);
        reportdates.tMonth = Number(reportdateTo[0]);
        reportdates.tDay = Number(reportdateTo[1]);

        var hash = this.reportDataToHash(reportType, reportdates, countries, regions);
        window.open('../report/index.html' + hash, '_blank', '');
      }
    }, {
      key: 'reportDataToHash',
      value: function reportDataToHash(reportType, dates, country, countryRegions) {
        var hash = '#';
        var reportTypeString = 'reporttype=' + reportType;
        var countryString = 'country=' + country;

        var countryRegionString = 'aois=' + countryRegions.map(function (region) {
          return region.value;
        }).join('!');

        var dateArgs = [];
        var dateString = 'dates=';
        for (var val in dates) {
          if (dates.hasOwnProperty(val)) {
            dateArgs.push([val, dates[val]].join('-'));
          }
        }
        dateString += dateArgs.join('!');

        hash += ['aoitype=GLOBAL', reportTypeString, countryString, countryRegionString, dateString].join('&');
        return hash;
      }
    }]);

    return GlobalCountryReport;
  }(_react2.default.Component);

  exports.default = GlobalCountryReport;
});