define(['exports', 'actions/LayerActions', 'react'], function (exports, _LayerActions, _react) {
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

  var ImageryRow = function (_React$Component) {
    _inherits(ImageryRow, _React$Component);

    function ImageryRow() {
      _classCallCheck(this, ImageryRow);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(ImageryRow).apply(this, arguments));
    }

    _createClass(ImageryRow, [{
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps) {
        return nextProps.checked !== this.props.checked || this.props.children;
      }
    }, {
      key: 'render',
      value: function render() {
        var layer = this.props.layer;

        return _react2.default.createElement(
          'tr',
          { className: 'imagery-row ' + (this.props.clicked ? ' active' : '') },
          _react2.default.createElement(
            'td',
            { onClick: this.toggleFeature.bind(this), className: 'toggle-switch pointer' },
            this.props.dateData
          ),
          _react2.default.createElement(
            'td',
            { onClick: this.toggleFeature.bind(this), className: 'toggle-switch pointer' },
            this.props.satelliteData
          )
        );
      }
    }, {
      key: 'toggleFeature',
      value: function toggleFeature() {
        debugger;
        // let layer = this.props.layer;
        // if (layer.disabled) { return; }
        // if (this.props.checked) {
        //   layerActions.removeActiveLayer(layer.id);
        // } else {
        //   layerActions.addActiveLayer(layer.id);
        // }
      }
    }]);

    return ImageryRow;
  }(_react2.default.Component);

  exports.default = ImageryRow;


  ImageryRow.propTypes = {
    dateData: _react2.default.PropTypes.string.isRequired,
    satelliteData: _react2.default.PropTypes.string.isRequired
  };
});