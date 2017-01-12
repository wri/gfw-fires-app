define(['exports', 'components/Modals/ModalWrapper', 'stores/ModalStore', 'react'], function (exports, _ModalWrapper, _ModalStore, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ModalWrapper2 = _interopRequireDefault(_ModalWrapper);

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

  var LayerModal = function (_Component) {
    _inherits(LayerModal, _Component);

    function LayerModal(props) {
      _classCallCheck(this, LayerModal);

      var _this = _possibleConstructorReturn(this, (LayerModal.__proto__ || Object.getPrototypeOf(LayerModal)).call(this, props));

      _ModalStore.modalStore.listen(_this.storeUpdated.bind(_this));
      var defaultState = _ModalStore.modalStore.getState();
      _this.state = {
        layerInfo: defaultState.modalLayerInfo
      };
      return _this;
    }

    _createClass(LayerModal, [{
      key: 'storeUpdated',
      value: function storeUpdated() {
        var currentState = _ModalStore.modalStore.getState();
        this.setState({ layerInfo: currentState.modalLayerInfo });
      }
    }, {
      key: 'render',
      value: function render() {
        var layerInfo = [];
        for (var layer in this.state.layerInfo) {
          layerInfo.push(this.state.layerInfo[layer]);
        }
        return _react2.default.createElement(
          _ModalWrapper2.default,
          { downloadData: this.state.layerInfo.download_data },
          !this.state.layerInfo.title ? _react2.default.createElement(
            'div',
            { className: 'no-info-available' },
            'No information available'
          ) : _react2.default.createElement(
            'div',
            { className: 'modal-content' },
            _react2.default.createElement(
              'div',
              { className: 'modal-source' },
              _react2.default.createElement(
                'h2',
                { className: 'modal-title' },
                this.state.layerInfo.title
              ),
              _react2.default.createElement(
                'h3',
                { className: 'modal-subtitle' },
                this.state.layerInfo.subtitle
              ),
              _react2.default.createElement(
                'div',
                { className: 'modal-table' },
                !this.state.layerInfo.function ? null : this.tableMap(this.state.layerInfo.function, 'function'),
                !this.state.layerInfo.resolution ? null : this.tableMap(this.state.layerInfo.resolution, 'RESOLUTION/SCALE'),
                !this.state.layerInfo.geographic_coverage ? null : this.tableMap(this.state.layerInfo.geographic_coverage, 'GEOGRAPHIC COVERAGE'),
                !this.state.layerInfo.source ? null : this.tableMap(this.state.layerInfo.source, 'source data'),
                !this.state.layerInfo.frequency_of_updates ? null : this.tableMap(this.state.layerInfo.frequency_of_updates, 'FREQUENCY OF UPDATES'),
                !this.state.layerInfo.date_of_content ? null : this.tableMap(this.state.layerInfo.date_of_content, 'DATE OF CONTENT'),
                !this.state.layerInfo.cautions ? null : this.tableMap(this.state.layerInfo.cautions, 'cautions'),
                !this.state.layerInfo.other ? null : this.tableMap(this.state.layerInfo.other, 'other'),
                !this.state.layerInfo.license ? null : this.tableMap(this.state.layerInfo.license, 'license')
              ),
              _react2.default.createElement(
                'div',
                { className: 'modal-overview' },
                _react2.default.createElement(
                  'h3',
                  null,
                  'Overview'
                ),
                !this.state.layerInfo.overview ? null : this.summaryMap(this.state.layerInfo.overview)
              ),
              _react2.default.createElement(
                'div',
                { className: 'modal-credits' },
                _react2.default.createElement(
                  'h3',
                  null,
                  'Citation'
                ),
                !this.state.layerInfo.citation ? null : this.summaryMap(this.state.layerInfo.citation)
              )
            )
          )
        );
      }
    }, {
      key: 'tableMap',
      value: function tableMap(item, label) {
        return _react2.default.createElement(
          'dl',
          { className: 'source-row' },
          _react2.default.createElement(
            'dt',
            null,
            label
          ),
          _react2.default.createElement('dd', { dangerouslySetInnerHTML: { __html: item } })
        );
      }
    }, {
      key: 'summaryMap',
      value: function summaryMap(item) {
        return _react2.default.createElement('d', { dangerouslySetInnerHTML: { __html: item } });
      }
    }, {
      key: 'paragraphMap',
      value: function paragraphMap(item) {
        return _react2.default.createElement('p', { dangerouslySetInnerHTML: { __html: item } });
      }
    }, {
      key: 'htmlContentMap',
      value: function htmlContentMap(item) {
        return _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: item } });
      }
    }]);

    return LayerModal;
  }(_react.Component);

  exports.default = LayerModal;
});