define(['exports', 'js/config', 'utils/svgs', 'esri/geometry/scaleUtils', 'utils/geometryUtils', 'esri/graphicsUtils', 'actions/AnalysisActions', 'actions/ModalActions', 'components/Loader', 'esri/toolbars/draw', 'utils/request', 'react'], function (exports, _config, _svgs, _scaleUtils, _geometryUtils, _graphicsUtils, _AnalysisActions, _ModalActions, _Loader, _draw, _request, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _scaleUtils2 = _interopRequireDefault(_scaleUtils);

  var _geometryUtils2 = _interopRequireDefault(_geometryUtils);

  var _graphicsUtils2 = _interopRequireDefault(_graphicsUtils);

  var _Loader2 = _interopRequireDefault(_Loader);

  var _draw2 = _interopRequireDefault(_draw);

  var _request2 = _interopRequireDefault(_request);

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

  var TYPE = {
    ZIP: 'application/zip',
    JSON: 'application/json',
    SHAPEFILE: 'shapefile',
    GEOJSON: 'geojson'
  };

  var drawSvg = '<use xlink:href="#icon-analysis-draw" />';
  var closeSymbolCode = 9660,
      openSymbolCode = 9650;

  var toolbar = void 0;

  var SubscriptionTab = function (_React$Component) {
    _inherits(SubscriptionTab, _React$Component);

    function SubscriptionTab(props) {
      _classCallCheck(this, SubscriptionTab);

      var _this = _possibleConstructorReturn(this, (SubscriptionTab.__proto__ || Object.getPrototypeOf(SubscriptionTab)).call(this, props));

      _this.draw = function () {
        toolbar.activate(_draw2.default.FREEHAND_POLYGON);
        _this.setState({ drawButtonActive: true });
        //- If the analysis modal is visible, hide it
        _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
        // mapActions.toggleAnalysisModal({ visible: false });
      };

      _this.prevent = function (evt) {
        evt.preventDefault();
        return false;
      };

      _this.enter = function (evt) {
        _this.prevent(evt);
        _this.setState({ dndActive: true });
      };

      _this.leave = function (evt) {
        _this.prevent(evt);
        _this.setState({ dndActive: false });
      };

      _this.drop = function (evt) {
        evt.preventDefault();
        var file = evt.dataTransfer && evt.dataTransfer.files && evt.dataTransfer.files[0];

        if (!file) {
          return;
        }

        //- Update the view
        _this.setState({
          dndActive: false,
          isUploading: true
        });

        //- If the analysis modal is visible, hide it
        // mapActions.toggleAnalysisModal({ visible: false });

        var extent = _scaleUtils2.default.getExtentForScale(app.map, 40000);
        // const type = file.type === TYPE.ZIP ? TYPE.SHAPEFILE : TYPE.GEOJSON;
        var type = TYPE.SHAPEFILE;
        var params = _config.uploadConfig.shapefileParams(file.name, app.map.spatialReference, extent.getWidth(), app.map.width);
        var content = _config.uploadConfig.shapefileContent(JSON.stringify(params), type);

        // the upload input needs to have the file associated to it
        var input = _this.refs.fileInput;
        input.files = evt.dataTransfer.files;

        _request2.default.upload(_config.uploadConfig.portal, content, _this.refs.upload).then(function (response) {
          if (response.featureCollection) {
            var graphics = _geometryUtils2.default.generatePolygonsFromUpload(response.featureCollection);
            // const graphicsExtent = graphicsUtils.graphicsExtent(graphics);
            var uploadedFeats = [];

            response.featureCollection.layers[0].layerDefinition.fields.forEach(function (field) {
              uploadedFeats.push({
                name: field.name,
                id: field.alias
              });
            });

            _this.setState({
              isUploading: false,
              fieldSelectionShown: true,
              fields: uploadedFeats,
              uploadedGraphics: graphics
            });

            // new ComboBox({
            //   id: 'upload-fields-input',
            //   value: '-- Choose name field --',
            //   store: store,
            //   searchAttr: 'name',
            //   onChange: (name) => {
            //     if (name) {
            //       self.addFeaturesToMap(name, response.featureCollection.layers[0].featureSet);
            //       this.resetView();
            //     }
            //   }
            // }, 'upload-fields-input');

            // app.map.setExtent(graphicsExtent, true);
            // graphics.forEach((graphic) => {
            //   graphic.attributes.Layer = 'custom';
            //   graphic.attributes.featureName = 'Custom Feature ' + app.map.graphics.graphics.length;
            //   app.map.graphics.add(graphic);
            // });
          } else {
            _this.setState({
              fieldSelectionShown: false,
              isUploading: false
            });
            console.error('No feature collection present in the file');
          }
        }, function (error) {
          _this.setState({
            isUploading: false,
            fieldSelectionShown: false
          });
          console.error(error);
        });
      };

      _this.selectField = function (evt) {
        _this.setState({
          showFields: false,
          fieldSelectionShown: false
        });

        var nameField = evt.target.id;

        var graphicsExtent = _graphicsUtils2.default.graphicsExtent(_this.state.uploadedGraphics);

        app.map.setExtent(graphicsExtent, true);
        _this.state.uploadedGraphics.forEach(function (graphic) {
          graphic.attributes.Layer = 'custom';
          // graphic.attributes.featureName = 'Custom Feature ' + app.map.graphics.graphics.length;
          graphic.attributes.featureName = graphic.attributes[nameField];
          app.map.graphics.add(graphic);
        });
      };

      _this.toggleFields = function () {
        _this.setState({
          showFields: !_this.state.showFields
        });
      };

      _this.state = {
        dndActive: false,
        drawButtonActive: false,
        isUploading: false,
        fieldSelectionShown: false,
        showFields: false,
        fields: [],
        graphics: []
      };
      return _this;
    }

    _createClass(SubscriptionTab, [{
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps() {
        var _this2 = this;

        // const {map} = this.context;

        if (!toolbar && app.map.loaded) {
          toolbar = new _draw2.default(app.map);
          toolbar.on('draw-end', function (evt) {
            toolbar.deactivate();
            _this2.setState({ drawButtonActive: false });
            if (app.mobile() === false) {
              _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
            }
            var graphic = _geometryUtils2.default.generateDrawnPolygon(evt.geometry);
            graphic.attributes.Layer = 'custom';
            graphic.attributes.featureName = 'Custom Feature ' + app.map.graphics.graphics.length;
            app.map.graphics.add(graphic);
          });
        }
      }
    }, {
      key: 'fieldMap',
      value: function fieldMap(field) {
        return _react2.default.createElement(
          'div',
          { id: field.id, onClick: this.selectField, className: 'generated-field-row' },
          field.name
        );
      }
    }, {
      key: 'render',
      value: function render() {
        var className = ' text-center';
        if (this.props.activeTab !== _config.analysisPanelText.subscriptionTabId) {
          className += ' hidden';
        }

        return _react2.default.createElement(
          'div',
          { id: _config.analysisPanelText.subscriptionTabId, className: 'analysis-instructions__draw ' + className },
          _react2.default.createElement(
            'p',
            null,
            _config.analysisPanelText.subscriptionInstructionsOne,
            _react2.default.createElement(
              'span',
              { className: 'subscribe-link', onClick: this.signUp },
              _config.analysisPanelText.subscriptionInstructionsTwo
            ),
            _config.analysisPanelText.subscriptionInstructionsThree
          ),
          _react2.default.createElement(
            'p',
            null,
            _config.analysisPanelText.subscriptionClick
          ),
          _react2.default.createElement(
            'div',
            { className: 'analysis-instructions__draw-icon-container' },
            _react2.default.createElement('svg', { className: 'analysis-instructions__draw-icon', dangerouslySetInnerHTML: { __html: drawSvg } })
          ),
          _react2.default.createElement(
            'button',
            { onClick: this.draw, className: 'gfw-btn blue subscription-draw ' + (this.state.drawButtonActive ? 'active' : '') },
            _config.analysisPanelText.subscriptionButtonLabel
          ),
          _react2.default.createElement(
            'div',
            { id: 'upload-fields-input', className: 'subscription-field-container ' + (this.state.fieldSelectionShown ? '' : ' hidden') },
            _react2.default.createElement(
              'span',
              { className: 'upload-fields-label' },
              'Choose name field '
            ),
            _react2.default.createElement(
              'span',
              { onClick: this.toggleFields, className: 'layer-category-caret red' },
              String.fromCharCode(!this.state.showFields ? closeSymbolCode : openSymbolCode)
            ),
            _react2.default.createElement(
              'div',
              { className: 'subscription-field-select ' + (this.state.showFields ? '' : ' hidden') },
              this.state.fields.map(this.fieldMap, this)
            )
          ),
          _react2.default.createElement(
            'form',
            {
              className: 'analysis-instructions__upload-container ' + (app.mobile() ? 'hidden ' : '') + (this.state.dndActive ? 'active' : ''),
              encType: 'multipart/form-data',
              onDragEnter: this.enter,
              onDragLeave: this.leave,
              onDragOver: this.prevent,
              onDrop: this.drop,
              name: 'upload',
              ref: 'upload'
            },
            _react2.default.createElement(_Loader2.default, { active: this.state.isUploading }),
            _react2.default.createElement(
              'span',
              { className: 'analysis-instructions__upload' },
              _config.analysisPanelText.subscriptionShapefile
            ),
            _react2.default.createElement('input', { type: 'file', name: 'file', ref: 'fileInput' }),
            _react2.default.createElement('input', { type: 'hidden', name: 'publishParameters', value: '{}' }),
            _react2.default.createElement('input', { type: 'hidden', name: 'filetype', value: 'shapefile' }),
            _react2.default.createElement('input', { type: 'hidden', name: 'f', value: 'json' })
          )
        );
      }
    }, {
      key: 'signUp',
      value: function signUp() {
        _ModalActions.modalActions.showSubscribeModal();
      }
    }]);

    return SubscriptionTab;
  }(_react2.default.Component);

  SubscriptionTab.contextTypes = {
    map: _react.PropTypes.object.isRequired
  };
  exports.default = SubscriptionTab;
});