define(['exports', 'actions/ModalActions', 'stores/MapStore', 'actions/MapActions', 'components/LayerPanel/FireRiskLegend', 'helpers/DateHelper', 'react'], function (exports, _ModalActions, _MapStore, _MapActions, _FireRiskLegend, _DateHelper, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _FireRiskLegend2 = _interopRequireDefault(_FireRiskLegend);

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

  var RiskControls = function (_React$Component) {
    _inherits(RiskControls, _React$Component);

    function RiskControls(props) {
      _classCallCheck(this, RiskControls);

      var _this = _possibleConstructorReturn(this, (RiskControls.__proto__ || Object.getPrototypeOf(RiskControls)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(RiskControls, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'render',
      value: function render() {
        var date = window.Kalendae.moment(this.state.riskDate);
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { id: 'risk-date-ranges' },
            _react2.default.createElement(
              'span',
              { className: 'imagery-calendar-label' },
              this.props.options.label
            ),
            _react2.default.createElement(
              'button',
              { className: 'gfw-btn white pointer ' + (this.state.calendarVisible === 'risk' ? ' current' : ''), onClick: this.changeRisk.bind(this) },
              _DateHelper2.default.getDate(date)
            ),
            _react2.default.createElement(_FireRiskLegend2.default, { domClass: this.props.childDomClass })
          )
        );
      }
    }, {
      key: 'changeRisk',
      value: function changeRisk() {
        _ModalActions.modalActions.showCalendarModal('start');
        _MapActions.mapActions.setCalendar('risk');
      }
    }]);

    return RiskControls;
  }(_react2.default.Component);

  exports.default = RiskControls;
});