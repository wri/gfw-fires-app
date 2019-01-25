define(['exports', 'components/LayerPanel/ImagerySettings', 'actions/LayerActions', 'stores/MapStore', 'actions/MapActions', 'helpers/DateHelper', 'helpers/LayersHelper', 'js/constants', 'actions/ModalActions', 'react'], function (exports, _ImagerySettings, _LayerActions, _MapStore, _MapActions, _DateHelper, _LayersHelper, _constants, _ModalActions, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ImagerySettings2 = _interopRequireDefault(_ImagerySettings);

  var _DateHelper2 = _interopRequireDefault(_DateHelper);

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _constants2 = _interopRequireDefault(_constants);

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

  var ImageryComponent = function (_React$Component) {
    _inherits(ImageryComponent, _React$Component);

    function ImageryComponent(props) {
      _classCallCheck(this, ImageryComponent);

      var _this = _possibleConstructorReturn(this, (ImageryComponent.__proto__ || Object.getPrototypeOf(ImageryComponent)).call(this, props));

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = _MapStore.mapStore.getState();
      return _this;
    }

    _createClass(ImageryComponent, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _props = this.props,
            layer = _props.layer,
            active = _props.active;

        if (layer.disabled) {
          return;
        }
        if (!active) {
          _LayerActions.layerActions.removeActiveLayer(layer.id);
        } else {
          _LayerActions.layerActions.addActiveLayer(layer.id);
        }

        if (active) {
          var layerObj = {};
          layerObj.layerId = layer.id;
          layerObj.footprints = this.state.footprints;
          layerObj.fireHistorySelectIndex = this.state.fireHistorySelectIndex;
          _LayersHelper2.default.showLayer(layerObj);
        } else {
          _LayersHelper2.default.hideLayer(layer.id);
        }
      }
    }, {
      key: 'storeUpdated',
      value: function storeUpdated() {
        this.setState(_MapStore.mapStore.getState());
      }
    }, {
      key: 'render',
      value: function render() {

        var startDate = window.Kalendae.moment(this.state.dgStartDate);
        var endDate = window.Kalendae.moment(this.state.dgEndDate);
        var active = this.props.active;


        return _react2.default.createElement(
          'div',
          { className: 'timeline-container ' + this.props.options.domClass + ' ' + (active ? '' : 'hidden') },
          _react2.default.createElement(_ImagerySettings2.default, null),
          _react2.default.createElement(
            'div',
            { id: 'imagery-date-ranges' },
            _react2.default.createElement(
              'span',
              { className: 'imagery-calendar-label' },
              this.props.options.minLabel
            ),
            _react2.default.createElement(
              'button',
              { className: 'gfw-btn white pointer ' + (this.state.calendarVisible === 'imageryStart' ? ' current' : ''), onClick: this.changeStart.bind(this) },
              _DateHelper2.default.getDate(startDate)
            ),
            _react2.default.createElement(
              'span',
              { className: 'imagery-calendar-label' },
              this.props.options.maxLabel
            ),
            _react2.default.createElement(
              'button',
              { className: 'gfw-btn white pointer ' + (this.state.calendarVisible === 'imageryEnd' ? ' current' : ''), onClick: this.changeEnd.bind(this) },
              _DateHelper2.default.getDate(endDate)
            )
          )
        );
      }
    }, {
      key: 'changeStart',
      value: function changeStart(evt) {
        evt.stopPropagation();
        _ModalActions.modalActions.showCalendarModal('start');
        _MapActions.mapActions.setCalendar('imageryStart');
      }
    }, {
      key: 'changeEnd',
      value: function changeEnd() {
        _ModalActions.modalActions.showCalendarModal('end');
        _MapActions.mapActions.setCalendar('imageryEnd');
      }
    }]);

    return ImageryComponent;
  }(_react2.default.Component);

  exports.default = ImageryComponent;
});