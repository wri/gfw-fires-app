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

  var IndonesiaSpecialtyReport = function (_React$Component) {
    _inherits(IndonesiaSpecialtyReport, _React$Component);

    function IndonesiaSpecialtyReport(props) {
      _classCallCheck(this, IndonesiaSpecialtyReport);

      var _this = _possibleConstructorReturn(this, (IndonesiaSpecialtyReport.__proto__ || Object.getPrototypeOf(IndonesiaSpecialtyReport)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _extends({
        localErrors: false,
        selectedIsland: ''
      }, _MapStore.mapStore.getState());
      return _this;
    }

    _createClass(IndonesiaSpecialtyReport, [{
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
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps, prevState) {
        if (prevProps.provinces.length === 0 && this.props.provinces.length > 0) {
          this.selectAllProvinces();
        }
      }
    }, {
      key: 'selectAllProvinces',
      value: function selectAllProvinces() {
        var provinces = this.props.provinces.map(function (province) {
          return {
            value: province,
            label: province
          };
        });

        this.setState({
          selectedIsland: provinces
        });
      }
    }, {
      key: 'toggleCustomize',
      value: function toggleCustomize() {
        _AnalysisActions.analysisActions.toggleCustomize();
      }
    }, {
      key: 'clearAll',
      value: function clearAll() {
        this.setState({ selectedIsland: '' });
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
      key: 'render',
      value: function render() {
        var className = 'text-center report-width';
        if (this.props.activeTab !== _config.analysisPanelText.analysisTabId) {
          className += ' hidden';
        }

        var islands = this.props.provinces.map(function (province) {
          return {
            value: province,
            label: province
          };
        });
        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            'h4',
            { className: 'indonesia-report__title' },
            _config.analysisPanelText.indonesiaReportTitle
          ),
          _react2.default.createElement(
            'p',
            { className: 'customize-report-label', onClick: this.toggleCustomize },
            _config.analysisPanelText.analysisCustomize,
            _react2.default.createElement(
              'span',
              { className: 'analysis-toggle' },
              this.props.customizeOpen ? ' ▼' : ' ►'
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'customize-options ' + (this.props.customizeOpen === true ? '' : 'hidden') },
            _react2.default.createElement(
              'p',
              null,
              _config.analysisPanelText.analysisChooseData
            ),
            _react2.default.createElement(
              'div',
              { className: 'flex flex-justify-around' },
              _react2.default.createElement(
                'label',
                null,
                _react2.default.createElement('input', { id: 'gfw', onChange: _AnalysisActions.analysisActions.toggleAnalysisSource, checked: this.props.analysisSourceGFW, type: 'radio' }),
                ' GFW'
              ),
              _react2.default.createElement(
                'label',
                null,
                _react2.default.createElement('input', { id: 'greenpeace', onChange: _AnalysisActions.analysisActions.toggleAnalysisSource, checked: !this.props.analysisSourceGFW, type: 'radio' }),
                ' Greenpeace'
              )
            ),
            _react2.default.createElement(
              'p',
              null,
              _config.analysisPanelText.analysisIndonesiaChooseData
            ),
            _react2.default.createElement(
              'div',
              { className: 'flex flex-justify-around' },
              _react2.default.createElement(
                'p',
                null,
                'By Province(s)'
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'padding' },
              _react2.default.createElement(_reactSelect2.default, {
                onChange: this.handleIslandChange.bind(this),
                options: islands,
                multi: false,
                value: this.state.selectedIsland
              })
            ),
            _react2.default.createElement(
              'button',
              { onClick: this.clearAll.bind(this), className: 'gfw-btn blue' },
              _config.analysisPanelText.analysisButtonClear
            ),
            _react2.default.createElement(
              'p',
              null,
              _config.analysisPanelText.analysisTimeframeHeader
            ),
            _react2.default.createElement(_AnalysisComponent2.default, _extends({}, this.state, { options: _config.analysisPanelText.analysisCalendar })),
            _react2.default.createElement(
              'div',
              { id: 'analysisWarning', className: 'analysis-warning ' + (this.state.localErrors === false ? 'hidden' : '') },
              'Please select an island or province'
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'no-shrink analysis-footer text-center' },
            _react2.default.createElement(
              'button',
              { onClick: this.beginAnalysis.bind(this), className: 'gfw-btn blue' },
              _config.analysisPanelText.analysisButtonLabel
            )
          )
        );
      }
    }, {
      key: 'handleIslandChange',
      value: function handleIslandChange(selected) {
        this.setState({ selectedIsland: selected });
      }
    }, {
      key: 'beginAnalysis',
      value: function beginAnalysis() {
        app.debug('AnalysisTab >>> beginAnalysis');

        var aoiType = 'PROVINCE';
        var province = this.state.selectedIsland;

        if (!province) {
          this.setState({
            localErrors: true
          });
          return;
        } else {
          this.setState({
            localErrors: false
          });
        }

        var reportdateFrom = this.state.analysisStartDate.split('/');
        var reportdateTo = this.state.analysisEndDate.split('/');

        var reportdates = {};

        reportdates.fYear = Number(reportdateFrom[2]);
        reportdates.fMonth = Number(reportdateFrom[0]);
        reportdates.fDay = Number(reportdateFrom[1]);
        reportdates.tYear = Number(reportdateTo[2]);
        reportdates.tMonth = Number(reportdateTo[0]);
        reportdates.tDay = Number(reportdateTo[1]);

        var dataSource = this.props.analysisSourceGFW ? 'gfw' : 'greenpeace';

        var hash = this.reportDataToHash(aoiType, reportdates, province, dataSource);
        var win = window.open('../report/index.html' + hash, '_blank', '');

        win.report = true;
        win.reportOptions = {
          'dates': reportdates,
          'aois': province,
          'aoitype': aoiType,
          'dataSource': dataSource
        };

        this.sendAnalytics('analysis', 'request', 'The user ran the Fires Analysis.');
      }
    }, {
      key: 'reportDataToHash',
      value: function reportDataToHash(aoitype, dates, aoi, dataSource) {
        var hash = '#',
            dateargs = [],
            datestring = void 0,
            aoistring = void 0,
            dataSourceString = void 0,
            reportType = 'reporttype=indonesiaspecialtyreport';

        for (var val in dates) {
          if (dates.hasOwnProperty(val)) {
            dateargs.push([val, dates[val]].join('-'));
          }
        }

        datestring = 'dates=' + dateargs.join('!');
        aoistring = 'aois=' + aoi.value;

        dataSourceString = 'dataSource=' + dataSource;

        hash += ['aoitype=' + aoitype, datestring, aoistring, dataSourceString, reportType].join('&');

        return hash;
      }
    }]);

    return IndonesiaSpecialtyReport;
  }(_react2.default.Component);

  exports.default = IndonesiaSpecialtyReport;
});