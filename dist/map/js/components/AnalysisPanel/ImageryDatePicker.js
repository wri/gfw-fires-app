define(['exports', 'react', 'actions/ModalActions', 'stores/MapStore', 'actions/MapActions', 'helpers/DateHelper'], function (exports, _react, _ModalActions, _MapStore, _MapActions, _DateHelper) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _react2 = _interopRequireDefault(_react);

  var _DateHelper2 = _interopRequireDefault(_DateHelper);

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

  var AnalysisDatePicker = function (_Component) {
    _inherits(AnalysisDatePicker, _Component);

    function AnalysisDatePicker(props) {
      _classCallCheck(this, AnalysisDatePicker);

      var _this = _possibleConstructorReturn(this, (AnalysisDatePicker.__proto__ || Object.getPrototypeOf(AnalysisDatePicker)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(AnalysisDatePicker, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'render',
      value: function render() {
        var date = window.Kalendae.moment(this.state.sentinalDate);

        return _react2.default.createElement(
          'div',
          { className: 'analysis-results__select-form-item-container' },
          _react2.default.createElement(
            'div',
            { id: 'modis-archive-date-ranges' },
            _react2.default.createElement(
              'button',
              { className: 'gfw-btn sml white pointer ' + (this.state.calendarVisible === 'changeSentinal' ? ' current' : ''), onClick: this.changeSentinal.bind(this) },
              _DateHelper2.default.getDate(date)
            ),
            ' '
          )
        );
      }
    }, {
      key: 'changeSentinal',
      value: function changeSentinal() {
        _ModalActions.modalActions.showCalendarModal('start');
        _MapActions.mapActions.setCalendar('sentinal');
      }
    }]);

    return AnalysisDatePicker;
  }(_react.Component);

  exports.default = AnalysisDatePicker;
});