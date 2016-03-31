define(['exports', 'actions/LayerActions', 'helpers/LayersHelper', 'js/config', 'react'], function (exports, _LayerActions, _LayersHelper, _config, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

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

  var lossOptions = _config.layerPanelText.lossOptions;

  var LossControls = function (_React$Component) {
    _inherits(LossControls, _React$Component);

    function LossControls() {
      _classCallCheck(this, LossControls);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(LossControls).apply(this, arguments));
    }

    _createClass(LossControls, [{
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        if (prevProps.lossFromSelectIndex !== this.props.lossFromSelectIndex || prevProps.lossToSelectIndex !== this.props.lossToSelectIndex) {
          _LayersHelper2.default.updateLossLayerDefinitions(this.props.lossFromSelectIndex, this.props.lossToSelectIndex);
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        // Set the default layer definition when the map has been loaded
        if (!this.props.loaded && nextProps.loaded) {
          _LayersHelper2.default.updateLossLayerDefinitions(this.props.lossFromSelectIndex, this.props.lossToSelectIndex);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var fromItem = lossOptions[this.props.lossFromSelectIndex];
        var toItem = lossOptions[this.props.lossToSelectIndex];

        return _react2.default.createElement(
          'div',
          { className: 'timeline-container loss flex' },
          _react2.default.createElement(
            'div',
            { className: 'loss-from relative' },
            _react2.default.createElement(
              'select',
              { onChange: this.fromChanged, className: 'pointer', value: fromItem.value },
              lossOptions.map(this.optionsMap('from'))
            ),
            _react2.default.createElement(
              'div',
              { className: 'loss-from-button gfw-btn sml white' },
              fromItem.label
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'loss-timeline-spacer' },
            'to'
          ),
          _react2.default.createElement(
            'div',
            { className: 'loss-to relative' },
            _react2.default.createElement(
              'select',
              { onChange: this.toChanged, className: 'pointer', value: toItem.value },
              lossOptions.map(this.optionsMap('to'))
            ),
            _react2.default.createElement(
              'div',
              { className: 'loss-to-button gfw-btn sml white' },
              toItem.label
            )
          )
        );
      }
    }, {
      key: 'optionsMap',
      value: function optionsMap(selectType) {
        // Disable options in the 'from' select that are greater than the selected value in the 'to' select
        // and vice versa, disable 'to' options less than the selected value in the 'from' select
        var fromMax = lossOptions[this.props.lossToSelectIndex].value;
        var toMin = lossOptions[this.props.lossFromSelectIndex].value;
        return function (item, index) {
          var disabled = selectType === 'from' ? item.value >= fromMax : item.value <= toMin;
          return _react2.default.createElement(
            'option',
            { key: index, value: item.value, disabled: disabled },
            item.label
          );
        };
      }
    }, {
      key: 'fromChanged',
      value: function fromChanged(evt) {
        _LayerActions.layerActions.changeLossFromTimeline(evt.target.selectedIndex);
      }
    }, {
      key: 'toChanged',
      value: function toChanged(evt) {
        _LayerActions.layerActions.changeLossToTimeline(evt.target.selectedIndex);
      }
    }]);

    return LossControls;
  }(_react2.default.Component);

  exports.default = LossControls;
});