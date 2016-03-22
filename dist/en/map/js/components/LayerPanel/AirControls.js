define(['exports', 'actions/ModalActions', 'stores/MapStore', 'actions/MapActions', 'utils/AppUtils', 'js/config', 'js/constants', 'components/LayerPanel/AirQualityLegend', 'helpers/DateHelper', 'react'], function (exports, _ModalActions, _MapStore, _MapActions, _AppUtils, _config, _constants, _AirQualityLegend, _DateHelper, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _AppUtils2 = _interopRequireDefault(_AppUtils);

  var _constants2 = _interopRequireDefault(_constants);

  var _AirQualityLegend2 = _interopRequireDefault(_AirQualityLegend);

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

  var AirControls = function (_React$Component) {
    _inherits(AirControls, _React$Component);

    function AirControls(props) {
      _classCallCheck(this, AirControls);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AirControls).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(AirControls, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'render',
      value: function render() {

        var date = window.Kalendae.moment(this.state.airQDate);
        var config = _AppUtils2.default.getObject(_config.layersConfig, 'id', _constants2.default.airQuality);

        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(_AirQualityLegend2.default, { url: config.url, layerIds: config.layerIds }),
          _react2.default.createElement(
            'div',
            { id: 'air-date-ranges' },
            _react2.default.createElement(
              'span',
              { className: 'air-calendar-label' },
              this.props.options.label
            ),
            _react2.default.createElement(
              'button',
              { className: 'gfw-btn white pointer ' + (this.state.calendarVisible === 'airQ' ? ' current' : ''), onClick: this.changeAirQ.bind(this) },
              _DateHelper2.default.getDate(date)
            )
          )
        );
      }
    }, {
      key: 'changeAirQ',
      value: function changeAirQ() {
        _ModalActions.modalActions.showCalendarModal('start');
        _MapActions.mapActions.setCalendar('airQ');
      }
    }]);

    return AirControls;
  }(_react2.default.Component);

  exports.default = AirControls;
});