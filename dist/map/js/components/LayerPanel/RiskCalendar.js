define(['exports', 'helpers/LayersHelper', 'components/LayerPanel/FireRiskLegend', 'react'], function (exports, _LayersHelper, _FireRiskLegend, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _FireRiskLegend2 = _interopRequireDefault(_FireRiskLegend);

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

  var RiskCalendar = function (_React$Component) {
    _inherits(RiskCalendar, _React$Component);

    function RiskCalendar() {
      _classCallCheck(this, RiskCalendar);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(RiskCalendar).apply(this, arguments));
    }

    _createClass(RiskCalendar, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var startDate = window.Kalendae.moment(this.props.startDate);
        var currentDate = window.Kalendae.moment(this.props.currentDate);
        var today = window.Kalendae.moment();
        var props = this.props;

        var calendar = new window.Kalendae(this.props.domId, {
          months: 1,
          blackout: function blackout(date) {

            if (props.domId === 'windDirectionCalendar') {
              return date < startDate || date > today;
            } else if (props.domId === 'fireRiskCalendar') {
              return date < startDate || date > today;
            }
          },
          mode: 'single',
          selected: currentDate
        });
        if (this.props.domId === 'fireRiskCalendar') {
          calendar.subscribe('change', this.changeRiskDay);
        } else if (this.props.domId === 'windDirectionCalendar') {
          calendar.subscribe('change', this.changeWindDay);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        //<FireRiskLegend />
        // debugger
        return _react2.default.createElement(
          'div',
          { className: 'timeline-container ' + this.props.domClass },
          _react2.default.createElement('div', { id: this.props.domId }),
          _react2.default.createElement(_FireRiskLegend2.default, { domClass: this.props.childDomClass })
        );
      }
    }, {
      key: 'changeRiskDay',
      value: function changeRiskDay() {
        _LayersHelper2.default.updateFireRisk(this.getSelected());
      }
    }, {
      key: 'changeWindDay',
      value: function changeWindDay() {
        _LayersHelper2.default.updateWindDate(this.getSelected());
      }
    }]);

    return RiskCalendar;
  }(_react2.default.Component);

  exports.default = RiskCalendar;
});