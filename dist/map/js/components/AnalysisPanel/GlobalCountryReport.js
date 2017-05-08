define(['exports', 'js/config', 'actions/AnalysisActions', 'stores/MapStore', 'components/LayerPanel/AnalysisComponent', 'react', 'chosen'], function (exports, _config, _AnalysisActions, _MapStore, _AnalysisComponent, _react, _chosen) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _AnalysisComponent2 = _interopRequireDefault(_AnalysisComponent);

  var _react2 = _interopRequireDefault(_react);

  var _chosen2 = _interopRequireDefault(_chosen);

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
        currentCountry: null
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
        var _this2 = this;

        var calendar = new window.Kalendae(this.refs.date, {
          mode: 'range'
        });
        calendar.subscribe('change', function (date) {
          console.debug(date);
        });

        $('#countries').on('change', function (evt) {
          _this2.applyCountryFilter(evt);
        });
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps, prevState) {
        $('#global-adm1').chosen('destroy');
        $('#global-adm1').chosen();
        if (prevProps.countries.length === 0 && this.props.countries.length > 0) {
          $('#countries').chosen();
        } else if (this.props.customizeCountryOpen === true && prevProps.customizeCountryOpen === false) {
          $('#countries').chosen('destroy');
          $('#countries').chosen();
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var _this3 = this;

        var className = 'text-center';
        var adm1Units = null;
        var adm1Classes = 'hidden';

        var countriesList = null;
        if (this.props.countries.length > 0) {
          countriesList = this.props.countries.map(function (country) {
            return _react2.default.createElement(
              'option',
              { value: country },
              country
            );
          });
        }

        if (this.state.currentCountry) {
          adm1Classes = 'padding';
          var adm1Areas = this.props.adm1.filter(function (o) {
            return o.NAME_0 === _this3.state.currentCountry;
          });
          adm1Areas.sort();
          adm1Units = adm1Areas.map(function (adm1) {
            return _react2.default.createElement(
              'option',
              { selected: 'true', value: adm1.NAME_1 },
              adm1.NAME_1
            );
          });
        }

        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            'h4',
            null,
            _config.analysisPanelText.globalReportTitle
          ),
          _react2.default.createElement(
            'div',
            { className: 'padding' },
            _react2.default.createElement(
              'select',
              { id: 'countries', className: 'chosen-select-no-single fill__wide' },
              _react2.default.createElement(
                'option',
                { disabled: true, selected: true, value: 'default' },
                'Select a Country'
              ),
              countriesList
            )
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
              { className: adm1Classes },
              _react2.default.createElement(
                'p',
                null,
                'Select ',
                this.state.currentCountry,
                '\'s subregions: '
              ),
              _react2.default.createElement(
                'select',
                { id: 'global-adm1', multiple: true, className: 'chosen-select-no-single fill__wide' },
                adm1Units
              )
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
      key: 'applyCountryFilter',
      value: function applyCountryFilter(evt) {
        var country = this.props.countries[evt.target.selectedIndex - 1];
        this.setState({ currentCountry: country });
        //Select All subregions by default
        $('#global-adm1 option').prop('selected', true);
        $('#global-adm1').trigger('chosen:updated');
      }
    }, {
      key: 'toggleCustomize',
      value: function toggleCustomize() {
        _AnalysisActions.analysisActions.toggleCountryCustomize();
      }
    }, {
      key: 'clearSubregions',
      value: function clearSubregions() {
        $('#global-adm1').val('').trigger('chosen:updated');
      }
    }, {
      key: 'countryAnalysis',
      value: function countryAnalysis() {
        app.debug('AnalysisTab >>> countryAnalysis');

        var reportType = 'globalcountryreport',
            countries = $('#countries').chosen().val(),
            regions = $('#global-adm1').chosen().val(),
            reportdateFrom = this.state.analysisStartDate.split('/'),
            reportdateTo = this.state.analysisEndDate.split('/'),
            reportdates = {};
        reportdates.fYear = Number(reportdateFrom[2]);
        reportdates.fMonth = Number(reportdateFrom[0]);
        reportdates.fDay = Number(reportdateFrom[1]);
        reportdates.tYear = Number(reportdateTo[2]);
        reportdates.tMonth = Number(reportdateTo[0]);
        reportdates.tDay = Number(reportdateTo[1]);

        var hash = this.reportDataToHash(reportType, reportdates, countries, regions);
        var win = window.open('../report/index.html' + hash, '_blank', '');

        win.report = true;
        win.reportOptions = {
          'dates': reportdates,
          'country': countries,
          'aois': regions,
          'aoitype': 'GLOBAL',
          'type': 'GLOBAL',
          'reportType': reportType
        };
      }
    }, {
      key: 'reportDataToHash',
      value: function reportDataToHash(reportType, dates, country, countryRegions) {
        var hash = '#';
        var reportTypeString = 'reporttype=' + reportType;
        var countryString = 'country=' + country;

        var countryRegionString = 'aois=' + countryRegions.join('!');

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


  GlobalCountryReport.propTypes = {
    customizeCountryOpen: _react2.default.PropTypes.bool.isRequired,
    countries: _react2.default.PropTypes.array
  };
});