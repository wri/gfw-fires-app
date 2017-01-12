define(['exports', 'components/LayerPanel/ModisLegend', 'actions/LayerActions', 'helpers/LayersHelper', 'actions/ModalActions', 'js/config', 'react'], function (exports, _ModisLegend, _LayerActions, _LayersHelper, _ModalActions, _config, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ModisLegend2 = _interopRequireDefault(_ModisLegend);

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

  var firesOptions = _config.layerPanelText.firesOptions;

  var FiresControls = function (_React$Component) {
    _inherits(FiresControls, _React$Component);

    function FiresControls() {
      _classCallCheck(this, FiresControls);

      return _possibleConstructorReturn(this, (FiresControls.__proto__ || Object.getPrototypeOf(FiresControls)).apply(this, arguments));
    }

    _createClass(FiresControls, [{
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        if (prevProps.firesSelectIndex !== this.props.firesSelectIndex) {
          _LayersHelper2.default.updateFiresLayerDefinitions(this.props.firesSelectIndex);
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        // Set the default layer definition when the map has been loaded
        if (!this.props.loaded && nextProps.loaded) {
          _LayersHelper2.default.updateFiresLayerDefinitions(nextProps.firesSelectIndex);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var activeItem = firesOptions[this.props.firesSelectIndex];
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'timeline-container relative fires' },
            _react2.default.createElement(
              'select',
              { className: 'pointer', value: activeItem.value, onChange: this.changeFiresTimeline },
              firesOptions.map(this.optionsMap, this)
            ),
            _react2.default.createElement(
              'div',
              { className: 'active-fires-control gfw-btn sml white' },
              activeItem.label
            )
          )
        );
      }
    }, {
      key: 'showFiresModal',
      value: function showFiresModal() {
        _ModalActions.modalActions.showFiresModal();
      }
    }, {
      key: 'optionsMap',
      value: function optionsMap(item, index) {
        return _react2.default.createElement(
          'option',
          { key: index, value: item.value },
          item.label
        );
      }
    }, {
      key: 'changeFiresTimeline',
      value: function changeFiresTimeline(evt) {
        _LayerActions.layerActions.changeFiresTimeline(evt.target.selectedIndex);
      }
    }]);

    return FiresControls;
  }(_react2.default.Component);

  exports.default = FiresControls;
});