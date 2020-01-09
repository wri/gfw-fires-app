define(["exports", "actions/LayerActions", "helpers/LayersHelper", "actions/ModalActions", "js/config", "helpers/DateHelper", "actions/MapActions", "js/constants", "react"], function (exports, _LayerActions, _LayersHelper, _ModalActions, _config, _DateHelper, _MapActions, _constants, _react) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

  var _DateHelper2 = _interopRequireDefault(_DateHelper);

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

  var firesOptions = _config.layerPanelText.firesOptions;

  var FiresControls = function (_React$Component) {
    _inherits(FiresControls, _React$Component);

    function FiresControls(props) {
      _classCallCheck(this, FiresControls);

      var _this = _possibleConstructorReturn(this, (FiresControls.__proto__ || Object.getPrototypeOf(FiresControls)).call(this, props));

      _this.state = {
        modisArchiveVisible: false
      };
      return _this;
    }

    _createClass(FiresControls, [{
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if (prevProps.firesSelectIndex !== this.props.firesSelectIndex && this.props.firesSelectIndex !== firesOptions.length - 1) {
          _LayersHelper2.default.updateFiresLayerDefinitions(this.props.firesSelectIndex);
        }
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        // Set the default layer definition when the map has been loaded
        if (!this.props.loaded && nextProps.loaded) {
          _LayersHelper2.default.updateFiresLayerDefinitions(nextProps.firesSelectIndex);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var activeItem = firesOptions[this.props.firesSelectIndex];
        var startDate = window.Kalendae.moment(this.props.archiveModisStartDate);
        var endDate = window.Kalendae.moment(this.props.archiveModisEndDate);
        var showModisArchive = this.state.modisArchiveVisible ? "" : "hidden";

        return _react2.default.createElement(
          "div",
          null,
          _react2.default.createElement(
            "div",
            { className: "timeline-container relative fires" },
            _react2.default.createElement(
              "select",
              {
                id: "modis-select",
                className: "pointer select-modis " + (this.state.modisArchiveVisible === true ? "" : "darken"),
                value: activeItem.value,
                onChange: this.changeFiresTimeline.bind(this)
              },
              firesOptions.map(this.optionsMap, this)
            ),
            _react2.default.createElement(
              "div",
              {
                id: "modis-time-options",
                className: "active-fires-control gfw-btn sml white " + (this.state.modisArchiveVisible === true ? "" : "darken")
              },
              activeItem.label
            ),
            _react2.default.createElement(
              "div",
              {
                id: "modis-custom-range-btn",
                className: "active-fires-control gfw-btn sml white pointer " + (this.state.modisArchiveVisible === true ? "darken" : ""),
                onClick: this.toggleModisArchive.bind(this)
              },
              "Custom Range"
            )
          ),
          _react2.default.createElement(
            "div",
            { id: "modis-archive-date-ranges", className: showModisArchive },
            _react2.default.createElement(
              "span",
              { className: "imagery-calendar-label" },
              this.props.options.minLabel
            ),
            _react2.default.createElement(
              "button",
              {
                className: "gfw-btn white pointer " + (this.props.calendarVisible === "archiveStart" ? " current" : ""),
                onClick: this.changeStart.bind(this)
              },
              _DateHelper2.default.getDate(startDate)
            ),
            _react2.default.createElement(
              "span",
              { className: "imagery-calendar-label" },
              this.props.options.maxLabel
            ),
            _react2.default.createElement(
              "button",
              {
                className: "gfw-btn white pointer " + (this.props.calendarVisible === "archiveEnd" ? " current" : ""),
                onClick: this.changeEnd.bind(this)
              },
              _DateHelper2.default.getDate(endDate)
            ),
            new Date(this.props.archiveModisEndDate) < new Date(this.props.archiveModisStartDate) ? _react2.default.createElement(
              "p",
              { className: "error-message" },
              _config.layerPanelText.calendarValidation
            ) : ""
          )
        );
      }
    }, {
      key: "toggleModisArchive",
      value: function toggleModisArchive() {
        this.setState({ modisArchiveVisible: !this.state.modisArchiveVisible });
        _LayerActions.layerActions.changeFiresTimeline(firesOptions.length - 1); //change to disabled option of Active fires
        document.getElementById("modis-select").selectedIndex = firesOptions.length - 1;
      }
    }, {
      key: "optionsMap",
      value: function optionsMap(item, index) {
        if (item.label === "Active Fires") {
          return _react2.default.createElement(
            "option",
            { key: index, value: item.value, disabled: true },
            item.label
          );
        } else {
          return _react2.default.createElement(
            "option",
            { key: index, value: item.value },
            item.label
          );
        }
      }
    }, {
      key: "changeFiresTimeline",
      value: function changeFiresTimeline(evt) {
        _LayerActions.layerActions.changeFiresTimeline(evt.target.selectedIndex);

        if (this.state.modisArchiveVisible === true) {
          this.setState({ modisArchiveVisible: false });
        }
      }
    }, {
      key: "changeStart",
      value: function changeStart() {
        _ModalActions.modalActions.showCalendarModal("start");
        _MapActions.mapActions.setCalendar("archiveModisStart");
      }
    }, {
      key: "changeEnd",
      value: function changeEnd() {
        _ModalActions.modalActions.showCalendarModal("end");
        _MapActions.mapActions.setCalendar("archiveModisEnd");
      }
    }]);

    return FiresControls;
  }(_react2.default.Component);

  exports.default = FiresControls;
});