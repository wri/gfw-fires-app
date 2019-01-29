define(['exports', 'js/config', 'actions/MapActions', 'helpers/DateHelper', 'actions/ModalActions', 'react'], function (exports, _config, _MapActions, _DateHelper, _ModalActions, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _DateHelper2 = _interopRequireDefault(_DateHelper);

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

  var AnalysisComponent = function (_React$Component) {
    _inherits(AnalysisComponent, _React$Component);

    function AnalysisComponent() {
      _classCallCheck(this, AnalysisComponent);

      return _possibleConstructorReturn(this, (AnalysisComponent.__proto__ || Object.getPrototypeOf(AnalysisComponent)).apply(this, arguments));
    }

    _createClass(AnalysisComponent, [{
      key: 'render',
      value: function render() {
        var startDate = window.Kalendae.moment(this.props.analysisStartDate);
        var endDate = window.Kalendae.moment(this.props.analysisEndDate);

        return _react2.default.createElement(
          'div',
          { className: 'timeline-container ' + this.props.options.domClass },
          _react2.default.createElement(
            'div',
            { id: 'analysis-date-ranges' },
            _react2.default.createElement(
              'div',
              { className: 'analysis-date-ranges__range-container' },
              _react2.default.createElement(
                'span',
                { className: 'imagery-calendar-label' },
                this.props.options.minLabelPlus
              ),
              _react2.default.createElement(
                'button',
                { className: 'gfw-btn no-pad white pointer ' + (this.props.calendarVisible === 'analysisStart' ? ' current' : ''), onClick: this.changeStart.bind(this) },
                _DateHelper2.default.getDate(startDate)
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'analysis-date-ranges__range-container' },
              _react2.default.createElement(
                'span',
                { className: 'imagery-calendar-label' },
                this.props.options.maxLabel
              ),
              _react2.default.createElement(
                'button',
                { className: 'gfw-btn no-pad white pointer ' + (this.props.calendarVisible === 'analysisEnd' ? ' current' : ''), onClick: this.changeEnd.bind(this) },
                _DateHelper2.default.getDate(endDate)
              )
            )
          ),
          new Date(this.props.analysisEndDate) < new Date(this.props.analysisStartDate) ? _react2.default.createElement(
            'p',
            { className: 'error-message' },
            _config.analysisPanelText.analysisInvalidDatesErrorMessage
          ) : ''
        );
      }
    }, {
      key: 'changeStart',
      value: function changeStart() {
        _ModalActions.modalActions.showCalendarModal('start');
        _MapActions.mapActions.setCalendar('analysisStart');
      }
    }, {
      key: 'changeEnd',
      value: function changeEnd() {
        _ModalActions.modalActions.showCalendarModal('end');
        _MapActions.mapActions.setCalendar('analysisEnd');
      }
    }]);

    return AnalysisComponent;
  }(_react2.default.Component);

  exports.default = AnalysisComponent;
});