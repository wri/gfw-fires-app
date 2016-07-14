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

  var AnalysisTab = function (_React$Component) {
    _inherits(AnalysisTab, _React$Component);

    function AnalysisTab(props) {
      _classCallCheck(this, AnalysisTab);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AnalysisTab).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      // this.state = mapStore.getState();
      _this.state = _extends({ localErrors: false }, _MapStore.mapStore.getState());
      return _this;
    }

    _createClass(AnalysisTab, [{
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
        console.log('oooh');
        if (prevProps.islands.length === 0 && this.props.islands.length > 0) {
          $('#islands').chosen();
        } else if (prevProps.areaIslandsActive === false && this.props.areaIslandsActive === true) {
          $('#provinces').chosen('destroy');
          $('#islands').chosen();
        } else if (prevProps.areaIslandsActive === true && this.props.areaIslandsActive === false) {
          $('#islands').chosen('destroy');
          $('#provinces').chosen();
        } else if (this.props.customizeOpen === true && prevProps.customizeOpen === false && this.props.areaIslandsActive === true) {
          $('#islands').chosen('destroy');
          $('#islands').chosen();
        } else if (this.props.customizeOpen === true && prevProps.customizeOpen === false && this.props.areaIslandsActive === false) {
          $('#provinces').chosen('destroy');
          $('#provinces').chosen();
        }
      }
    }, {
      key: 'toggleCustomize',
      value: function toggleCustomize() {
        _AnalysisActions.analysisActions.toggleCustomize();
      }
    }, {
      key: 'clearAll',
      value: function clearAll() {
        if (this.props.areaIslandsActive === true) {
          $('#islands').val('').trigger('chosen:updated');
        } else {
          $('#provinces').val('').trigger('chosen:updated');
        }
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
        var className = 'text-center';
        if (this.props.activeTab !== _config.analysisPanelText.analysisTabId) {
          className += ' hidden';
        }
        console.log(this.props.analysisSourceGFW);
        return _react2.default.createElement(
          'div',
          { className: className },
          _react2.default.createElement(
            'h4',
            null,
            _config.analysisPanelText.analysisAreaTitle
          ),
          _react2.default.createElement(
            'p',
            null,
            _config.analysisPanelText.analysisAreaHeader
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
              _config.analysisPanelText.analysisChoose
            ),
            _react2.default.createElement(
              'div',
              { className: 'flex flex-justify-around' },
              _react2.default.createElement(
                'label',
                null,
                _react2.default.createElement('input', { onChange: _AnalysisActions.analysisActions.toggleAreaIslandsActive, checked: this.props.areaIslandsActive, type: 'radio' }),
                ' By Island(s)'
              ),
              _react2.default.createElement(
                'label',
                null,
                _react2.default.createElement('input', { onChange: _AnalysisActions.analysisActions.toggleAreaIslandsActive, checked: !this.props.areaIslandsActive, type: 'radio' }),
                ' By Province(s)'
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'padding' },
              this.props.islands.length > 0 ? _react2.default.createElement(
                'select',
                { multiple: true, id: 'islands', className: 'chosen-select-no-single fill__wide ' + (this.props.areaIslandsActive === true ? '' : 'hidden'), onChange: this.change, disabled: this.props.islands.length === 0 },
                this.props.islands.map(function (i) {
                  return _react2.default.createElement(
                    'option',
                    { selected: 'true', value: i },
                    i
                  );
                })
              ) : null,
              this.props.islands.length > 0 ? _react2.default.createElement(
                'select',
                { multiple: true, id: 'provinces', className: 'chosen-select-no-single fill__wide ' + (this.props.areaIslandsActive === false ? '' : 'hidden'), onChange: this.change },
                this.props.provinces.map(function (p) {
                  return _react2.default.createElement(
                    'option',
                    { selected: 'true', value: p },
                    p
                  );
                })
              ) : null
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
      key: 'beginAnalysis',
      value: function beginAnalysis() {
        app.debug('AnalysisTab >>> beginAnalysis');
        var provinces = void 0;
        var aoiType = void 0;

        if (this.props.areaIslandsActive) {
          provinces = $('#islands').chosen().val();
          aoiType = 'ISLAND';
        } else {
          provinces = $('#provinces').chosen().val();
          aoiType = 'PROVINCE';
        }

        if (!provinces) {
          this.setState({
            localErrors: true
          });
          return;
        } else {
          this.setState({
            localErrors: false
          });
        }

        this.sendAnalytics('analysis', 'request', 'The user ran the Fires Analysis.');

        var reportdateFrom = this.state.analysisStartDate.split('/');
        var reportdateTo = this.state.analysisEndDate.split('/');

        var reportdates = {};

        reportdates.fYear = Number(reportdateFrom[2]);
        reportdates.fMonth = Number(reportdateFrom[0]);
        reportdates.fDay = Number(reportdateFrom[1]);
        reportdates.tYear = Number(reportdateTo[2]);
        reportdates.tMonth = Number(reportdateTo[0]);
        reportdates.tDay = Number(reportdateTo[1]);

        var hash = this.reportDataToHash(aoiType, reportdates, provinces);
        var win = window.open('../report/index.html' + hash, '_blank', '');

        win.report = true;
        win.reportOptions = {
          'dates': reportdates,
          'aois': provinces,
          'aoitype': aoiType
        };
      }
    }, {
      key: 'reportDataToHash',
      value: function reportDataToHash(aoitype, dates, aois) {
        var hash = '#',
            dateargs = [],
            datestring = void 0,
            aoistring = void 0;

        for (var val in dates) {
          if (dates.hasOwnProperty(val)) {
            dateargs.push([val, dates[val]].join('-'));
          }
        }

        datestring = 'dates=' + dateargs.join('!');

        aoistring = 'aois=' + aois.join('!');

        hash += ['aoitype=' + aoitype, datestring, aoistring].join('&');

        return hash;
      }
    }]);

    return AnalysisTab;
  }(_react2.default.Component);

  exports.default = AnalysisTab;


  AnalysisTab.propTypes = {
    activeTab: _react2.default.PropTypes.string.isRequired,
    areaIslandsActive: _react2.default.PropTypes.bool.isRequired,
    analysisSourceGFW: _react2.default.PropTypes.bool.isRequired,
    customizeOpen: _react2.default.PropTypes.bool.isRequired,
    islands: _react2.default.PropTypes.array.isRequired,
    provinces: _react2.default.PropTypes.array.isRequired
  };
});