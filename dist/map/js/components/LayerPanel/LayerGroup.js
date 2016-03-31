define(['exports', 'react'], function (exports, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

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

  var closeSymbolCode = 9660,
      openSymbolCode = 9650;

  /**
  * Get count of active layers in this group
  * @param {array} activeLayers - array of keys for the active layers
  * @param {array} children - This groups child components, which are layer checkboxes or null
  * @return {number} count
  */
  var getCount = function getCount(activeLayers, children) {
    var count = 0;
    children.forEach(function (layer) {
      if (layer && layer.key && activeLayers.indexOf(layer.key) > -1) {
        ++count;
      }
    });

    return count.toString() + '/' + children.filter(function (c) {
      return c !== null && c.key;
    }).length;
  };

  var LayerGroup = function (_React$Component) {
    _inherits(LayerGroup, _React$Component);

    function LayerGroup(props) {
      _classCallCheck(this, LayerGroup);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LayerGroup).call(this, props));

      _this.state = { open: true };
      return _this;
    }

    _createClass(LayerGroup, [{
      key: 'render',
      value: function render() {
        var styles = { display: this.state.open ? 'block' : 'none' };

        return _react2.default.createElement(
          'div',
          { className: 'layer-category' },
          _react2.default.createElement(
            'div',
            { className: 'layer-category-label pointer', onClick: this.toggle.bind(this) },
            this.props.label,
            _react2.default.createElement(
              'span',
              { className: 'active-layer-count' },
              '(',
              getCount(this.props.activeLayers, this.props.children),
              ')'
            ),
            _react2.default.createElement(
              'span',
              { className: 'layer-category-caret' },
              String.fromCharCode(this.state.open ? closeSymbolCode : openSymbolCode)
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'layer-category-content', style: styles },
            this.props.children
          )
        );
      }
    }, {
      key: 'toggle',
      value: function toggle() {
        this.setState({ open: !this.state.open });
      }
    }]);

    return LayerGroup;
  }(_react2.default.Component);

  exports.default = LayerGroup;


  LayerGroup.propTypes = {
    label: _react2.default.PropTypes.string.isRequired
  };
});