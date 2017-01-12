define(['exports', 'actions/ModalActions', 'stores/MapStore', 'actions/MapActions', 'helpers/DateHelper', 'react'], function (exports, _ModalActions, _MapStore, _MapActions, _DateHelper, _react) {
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

  var WindControls = function (_React$Component) {
    _inherits(WindControls, _React$Component);

    function WindControls(props) {
      _classCallCheck(this, WindControls);

      var _this = _possibleConstructorReturn(this, (WindControls.__proto__ || Object.getPrototypeOf(WindControls)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(WindControls, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'render',
      value: function render() {

        var date = window.Kalendae.moment(this.state.windDate);

        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement('div', { id: 'windLegendNode', className: 'windLegendNode windLayerLegendColorRamp' }),
          _react2.default.createElement(
            'div',
            { id: 'windLegendLabels' },
            _react2.default.createElement(
              'span',
              null,
              '0 m/s'
            ),
            _react2.default.createElement(
              'span',
              { className: 'rightWindLabel' },
              '40 m/s'
            )
          ),
          _react2.default.createElement(
            'div',
            { id: 'wind-date-ranges' },
            _react2.default.createElement(
              'span',
              { className: 'imagery-calendar-label' },
              this.props.options.label
            ),
            _react2.default.createElement(
              'button',
              { className: 'gfw-btn white pointer ' + (this.state.calendarVisible === 'wind' ? ' current' : ''), onClick: this.changeWind.bind(this) },
              _DateHelper2.default.getDate(date)
            )
          )
        );
      }
    }, {
      key: 'changeWind',
      value: function changeWind() {
        _ModalActions.modalActions.showCalendarModal('start');
        _MapActions.mapActions.setCalendar('wind');
      }
    }]);

    return WindControls;
  }(_react2.default.Component);

  exports.default = WindControls;
});