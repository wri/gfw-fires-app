define(['exports', 'actions/LayerActions', 'helpers/LayersHelper', 'actions/ModalActions', 'js/config', 'react'], function (exports, _LayerActions, _LayersHelper, _ModalActions, _config, _react) {
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

  var firesOptions = _config.layerPanelText.firesOptions;

  var ViirsControls = function (_React$Component) {
    _inherits(ViirsControls, _React$Component);

    function ViirsControls() {
      _classCallCheck(this, ViirsControls);

      return _possibleConstructorReturn(this, (ViirsControls.__proto__ || Object.getPrototypeOf(ViirsControls)).apply(this, arguments));
    }

    _createClass(ViirsControls, [{
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        if (prevProps.viiirsSelectIndex !== this.props.viiirsSelectIndex) {
          _LayersHelper2.default.updateViirsDefinitions(this.props.viiirsSelectIndex);
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        // Set the default layer definition when the map has been loaded
        if (!this.props.loaded && nextProps.loaded) {
          _LayersHelper2.default.updateViirsDefinitions(nextProps.viiirsSelectIndex);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        //<input onChange={this.toggleConfidence} type='checkbox' /><span className='fires-confidence-wrapper'>Only show <span className='fires-confidence' onClick={this.showFiresModal}>high confidence fires</span></span>
        var activeItem = firesOptions[this.props.viiirsSelectIndex];
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'timeline-container relative fires' },
            _react2.default.createElement(
              'select',
              { className: 'pointer', value: activeItem.value, onChange: this.changeViirsTimeline },
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
      key: 'toggleConfidence',
      value: function toggleConfidence(evt) {
        _LayersHelper2.default.toggleConfidence(evt.target.checked);
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
      key: 'changeViirsTimeline',
      value: function changeViirsTimeline(evt) {
        _LayerActions.layerActions.changeViirsTimeline(evt.target.selectedIndex);
      }
    }]);

    return ViirsControls;
  }(_react2.default.Component);

  exports.default = ViirsControls;
});