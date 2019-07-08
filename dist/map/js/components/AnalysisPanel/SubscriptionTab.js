define(['exports', 'js/config', 'stores/MapStore', 'esri/geometry/scaleUtils', 'utils/geometryUtils', 'esri/tasks/query', 'esri/tasks/QueryTask', 'esri/graphicsUtils', 'actions/AnalysisActions', 'actions/ModalActions', 'components/Loader', 'esri/toolbars/draw', 'utils/request', 'react'], function (exports, _config, _MapStore, _scaleUtils, _geometryUtils, _query, _QueryTask, _graphicsUtils, _AnalysisActions, _ModalActions, _Loader, _draw, _request, _react) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _scaleUtils2 = _interopRequireDefault(_scaleUtils);

  var _geometryUtils2 = _interopRequireDefault(_geometryUtils);

  var _query2 = _interopRequireDefault(_query);

  var _QueryTask2 = _interopRequireDefault(_QueryTask);

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
        if (app.map.graphics.graphics.length > 0) {
          app.map.graphics.clear();
        }

        toolbar.activate(_draw2.default.FREEHAND_POLYGON);
        _this.setState({ drawButtonActive: true });
        //- If the analysis modal is visible, hide it
        _AnalysisActions.analysisActions.toggleAnalysisToolsVisibility();
      };

      _this.removeDrawing = function () {
        if (app.map.graphics.graphics.length > 0) {
          app.map.graphics.clear();
          _this.setState({ showDrawnMapGraphics: !_this.state.showDrawnMapGraphics });
        }
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

        var extent = _scaleUtils2.default.getExtentForScale(app.map, 40000);

        var type = TYPE.SHAPEFILE;
        var params = _config.uploadConfig.shapefileParams(file.name, app.map.spatialReference, extent.getWidth(), app.map.width);
        var content = _config.uploadConfig.shapefileContent(JSON.stringify(params), type);

        // the upload input needs to have the file associated to it
        var input = _this.refs.fileInput;
        input.files = evt.dataTransfer.files;

        _request2.default.upload(_config.uploadConfig.portal, content, _this.refs.upload).then(function (response) {
          if (response.featureCollection) {
            var graphics = _geometryUtils2.default.generatePolygonsFromUpload(response.featureCollection);

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
          graphic.attributes.featureName = graphic.attributes[nameField];
          app.map.graphics.add(graphic);
        });
      };

      _this.toggleFields = function () {
        _this.setState({
          showFields: !_this.state.showFields
        });
      };

      _MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
      _this.state = {
        dndActive: false,
        drawButtonActive: false,
        isUploading: false,
        fieldSelectionShown: false,
        showFields: false,
        fields: [],
        graphics: [],
        numberOfViirsPointsInPolygons: 0,
        numberOfModisPointsInPolygons: 0,
        modisTimePeriod: null,
        viirsTimePeriod: null,
        modisTimeIndex: _MapStore.mapStore.getState().firesSelectIndex,
        viirsTimeIndex: _MapStore.mapStore.getState().viirsSelectIndex,
        geometryOfDrawnShape: null,
        activeLayers: _MapStore.mapStore.getState().activeLayers,
        viirsStartDate: _MapStore.mapStore.getState().archiveViirsStartDate,
        viirsEndDate: _MapStore.mapStore.getState().archiveViirsEndDate,
        modisStartDate: _MapStore.mapStore.getState().archiveModisStartDate,
        modisEndDate: _MapStore.mapStore.getState().archiveModisEndDate,
        showDrawnMapGraphics: false
      };
      return _this;
    }

    _createClass(SubscriptionTab, [{
      key: 'singleViirsQuery',
      value: function singleViirsQuery(query, url, timePeriod, index, queryGeometry) {
        var _this2 = this;

        var viirsQuery = new _QueryTask2.default(url);
        viirsQuery.execute(query).then(function (res) {
          _this2.setState({
            numberOfViirsPointsInPolygons: res.features.length,
            viirsTimePeriod: timePeriod,
            viirsTimeIndex: index,
            geometryOfDrawnShape: queryGeometry
          });
        });
      }
    }, {
      key: 'singleModisQuery',
      value: function singleModisQuery(query, url, timePeriod, index, queryGeometry) {
        var _this3 = this;

        var modisQuery = new _QueryTask2.default(url);
        modisQuery.execute(query).then(function (res) {
          _this3.setState({
            numberOfModisPointsInPolygons: res.features.length,
            modisTimePeriod: timePeriod,
            modisTimeIndex: index,
            geometryOfDrawnShape: queryGeometry
          });
        });
      }
    }, {
      key: 'queryForFires',
      value: function queryForFires(geometry) {
        var _this4 = this;

        var store = _MapStore.mapStore.getState();

        var queryGeometry = geometry === undefined ? this.state.geometryOfDrawnShape : geometry;

        // Setup a query object
        var query = new _query2.default();
        query.returnGeometry = false;
        query.geometry = queryGeometry;

        // To determine the Viirs period, we look at the selected index.
        var viirsTimePeriod = void 0,
            viirsDate = void 0,
            viirsId = void 0;
        if (store.viirsSelectIndex === 4) {
          // If the index is 4, the user is in the calendar mode and selecting a custom range of dates.
          viirsTimePeriod = 'from ' + this.state.viirsStartDate + ' to ' + this.state.viirsEndDate + '.';
          viirsDate = '1yr';
          query.where = 'ACQ_DATE <= date\'' + this.state.viirsEndDate + '\' AND ACQ_DATE >= date\'' + this.state.viirsStartDate + '\'';
          viirsId = _config.shortTermServices.viirs1YR.id;
        } else if (_MapStore.mapStore.state.viirsSelectIndex === 3) {
          viirsTimePeriod = 'in the past week.';
          viirsDate = '7d';
          viirsId = _config.shortTermServices.viirs7D.id;
        } else if (_MapStore.mapStore.state.viirsSelectIndex === 2) {
          viirsTimePeriod = 'in the past 72 hours.';
          viirsDate = '7d';
          viirsId = _config.shortTermServices.viirs7D.id;
        } else if (_MapStore.mapStore.state.viirsSelectIndex === 1) {
          viirsTimePeriod = 'in the past 48 hours.';
          viirsDate = '48hrs';
          viirsId = _config.shortTermServices.viirs48HR.id;
        } else if (_MapStore.mapStore.state.viirsSelectIndex === 0) {
          viirsTimePeriod = 'in the past 24 hours.';
          viirsDate = '24hrs';
          viirsId = _config.shortTermServices.viirs24HR.id;
        }

        var viirsURL = 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS_' + viirsDate + '/MapServer/' + viirsId;

        // To determine the Modis period, we look at the selected index.
        var modisTimePeriod = void 0,
            modisDate = void 0,
            modisID = void 0;
        if (store.firesSelectIndex === 4) {
          // If the index is 4, the user is in the calendar mode and selecting a custom range of dates.
          modisTimePeriod = 'from ' + this.state.modisStartDate + ' to ' + this.state.modisEndDate + '.';
          modisDate = '1yr';
          query.where = 'ACQ_DATE <= date\'' + this.state.modisEndDate + '\' AND ACQ_DATE >= date\'' + this.state.modisStartDate + '\'';
          modisID = _config.shortTermServices.modis1YR.id;
        } else if (_MapStore.mapStore.state.firesSelectIndex === 3) {
          modisTimePeriod = 'in the past week.';
          modisDate = '7d';
          modisID = _config.shortTermServices.modis7D.id;
        } else if (_MapStore.mapStore.state.firesSelectIndex === 2) {
          modisTimePeriod = 'in the past 72 hours.';
          modisDate = '7d';
          modisID = _config.shortTermServices.modis7D.id;
        } else if (_MapStore.mapStore.state.firesSelectIndex === 1) {
          modisTimePeriod = 'in the past 48 hours.';
          modisDate = '48hrs';
          modisID = _config.shortTermServices.modis48HR.id;
        } else if (_MapStore.mapStore.state.firesSelectIndex === 0) {
          modisTimePeriod = 'in the past 24 hours.';
          modisDate = '24hrs';
          modisID = _config.shortTermServices.modis24HR.id;
        }

        var modisURL = 'https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS_' + modisDate + '/MapServer/' + modisID;

        var viirsQuery = new _QueryTask2.default(viirsURL);
        var modisQuery = new _QueryTask2.default(modisURL);

        if (geometry && store.activeLayers.includes('viirsFires') && store.activeLayers.includes('activeFires')) {
          // If both layers on when the initial drawing is made, we want to fire off 2 queries.
          Promise.all([viirsQuery.execute(query), modisQuery.execute(query)]).then(function (res) {
            _this4.setState({
              numberOfModisPointsInPolygons: res[1].features.length,
              numberOfViirsPointsInPolygons: res[0].features.length,
              modisTimePeriod: modisTimePeriod,
              viirsTimePeriod: viirsTimePeriod,
              modisTimeIndex: store.firesSelectIndex,
              viirsTimeIndex: store.viirsSelectIndex,
              geometryOfDrawnShape: queryGeometry
            });
          });
        } else if (geometry && store.activeLayers.includes('viirsFires')) {
          // If viirs layer is on and modis layer is off when the initial drawing is made
          this.singleViirsQuery(query, viirsURL, viirsTimePeriod, store.viirsSelectIndex, queryGeometry);
        } else if (geometry && store.activeLayers.includes('activeFires')) {
          // If modis layer is on and viirs layer is off when the initial drawing is made, we want to fire off 1 query.
          this.singleModisQuery(query, modisURL, modisTimePeriod, store.firesSelectIndex, queryGeometry);
        } else if (store.activeLayers.includes('viirsFires') && (store.viirsSelectIndex !== this.state.viirsTimeIndex || this.state.viirsTimeIndex === 4 && this.state.viirsTimePeriod !== viirsTimePeriod)) {
          // viirs layer on, modis layer off
          this.singleViirsQuery(query, viirsURL, viirsTimePeriod, store.viirsSelectIndex, queryGeometry);
        } else if (store.activeLayers.includes('activeFires') && (store.firesSelectIndex !== this.state.modisTimeIndex || this.state.modisTimeIndex === 4 && this.state.modisTimePeriod !== modisTimePeriod)) {
          // modis layer on, viirs layer off
          this.singleModisQuery(query, modisURL, modisTimePeriod, store.firesSelectIndex, queryGeometry);
        }
      }
    }, {
      key: 'storeUpdated',
      value: function storeUpdated() {
        var state = _MapStore.mapStore.getState();
        // If a user selects the calendar. Only fire off the query function once the dates have changed.
        if (state.firesSelectIndex === 4 && this.state.modisTimeIndex !== 4) {
          if (state.archiveModisStartDate !== this.state.modisStartDate || state.archiveModisEndDate !== this.state.modisEndDate) {
            this.setState({
              modisStartDate: state.archiveModisStartDate,
              modisEndDate: state.archiveModisEndDate
            });
            this.queryForFires();
          }
        } else if (state.viirsSelectIndex === 4 && this.state.viirsTimeIndex !== 4) {
          if (state.archiveViirsStartDate !== this.state.viirsStartDate || state.archiveViirsEndDate !== this.state.viirsEndDate) {
            this.setState({
              viirsStartDate: state.archiveViirsStartDate,
              viirsEndDate: state.archiveViirsEndDate
            });
            this.queryForFires();
          }
        } else if (this.state.modisTimeIndex === 4 && (state.archiveModisStartDate !== this.state.modisStartDate || state.archiveModisEndDate !== this.state.modisEndDate)) {
          // If the user is changing one of the dates of the modis calendar while still on the calendar.
          this.setState({
            modisStartDate: state.archiveModisStartDate,
            modisEndDate: state.archiveModisEndDate
          });
          this.queryForFires();
        } else if (this.state.viirsTimeIndex === 4 && (state.archiveViirsStartDate !== this.state.viirsStartDate || state.archiveViirsEndDate !== this.state.viirsEndDate)) {
          // If the user is changing one of the dates of the viirs calendar while still on the calendar...
          this.setState({
            viirsStartDate: state.archiveViirsStartDate,
            viirsEndDate: state.archiveViirsEndDate
          });
          this.queryForFires();
        } else if (
        // If the user changed either the Modis or Viirs date, and there is a shape on the map, fire off new queries
        (state.firesSelectIndex !== this.state.modisTimeIndex || // Checks if the modis dates changed
        state.viirsSelectIndex !== this.state.viirsTimeIndex) && ( // Checks if the viirs dates changed
        state.activeLayers.includes('activeFires') === true || state.activeLayers.includes('viirsFires') === true) && // Checks if the modis or viirs layers were toggled (and at least one is on)
        state.drawnMapGraphics === true // Checks if a shape has been drawn on the map.
        ) {
            this.queryForFires();
          }

        // If only the activeLayers changed, we update state but don't run new queries.
        if (state.activeLayers !== this.state.activeLayers) {
          this.setState({
            activeLayers: state.activeLayers
          });
        }

        if (state.drawnMapGraphics !== this.state.showDrawnMapGraphics) {
          this.setState({ showDrawnMapGraphics: state.drawnMapGraphics });
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps() {
        var _this5 = this;

        if (!toolbar && app.map.loaded) {
          toolbar = new _draw2.default(app.map);
          toolbar.on('draw-complete', function (evt) {
            /******************************************** NOTE ********************************************
              * When a user draws a polygon, we want to capture the following data:
                * The number of Viirs and Modis Fires contained within the polygon
                * The time period which is being displayed for Viirs and Modis.
              * We will query the Viirs and Modis REST endpoints and pass in the geometry of the polygon as the input geometry.
              * We will then save the count of features returned from each query, and save the counts on state.
              * We also save the phrase associated with the time period based on the index selected from the dropdown options.
            ***********************************************************************************************/

            _this5.queryForFires(evt.geometry);

            _ModalActions.modalActions.addCustomFeature();
            toolbar.deactivate();
            _this5.setState({ drawButtonActive: false });
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
        var _state = this.state,
            numberOfViirsPointsInPolygons = _state.numberOfViirsPointsInPolygons,
            numberOfModisPointsInPolygons = _state.numberOfModisPointsInPolygons,
            viirsTimePeriod = _state.viirsTimePeriod,
            modisTimePeriod = _state.modisTimePeriod;


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
          numberOfViirsPointsInPolygons > 0 && this.state.activeLayers.includes('viirsFires') && this.state.showDrawnMapGraphics === true ? _react2.default.createElement(
            'p',
            null,
            numberOfViirsPointsInPolygons,
            ' ',
            _config.analysisPanelText.numberOfViirsPointsInPolygons,
            ' ',
            viirsTimePeriod,
            ' '
          ) : null,
          numberOfModisPointsInPolygons > 0 && this.state.activeLayers.includes('activeFires') && this.state.showDrawnMapGraphics === true ? _react2.default.createElement(
            'p',
            null,
            numberOfModisPointsInPolygons,
            ' ',
            _config.analysisPanelText.numberOfModisPointsInPolygons,
            ' ',
            modisTimePeriod
          ) : null,
          _react2.default.createElement(
            'div',
            { className: 'analysis-instructions__draw-icon-container' },
            _react2.default.createElement('svg', { className: 'analysis-instructions__draw-icon', dangerouslySetInnerHTML: { __html: drawSvg } })
          ),
          this.state.showDrawnMapGraphics ? _react2.default.createElement(
            'button',
            { onClick: this.removeDrawing, className: 'gfw-btn blue subscription-draw ' + (this.state.drawButtonActive ? 'active' : '') },
            _config.analysisPanelText.subscriptionButtonLabelRemove
          ) : _react2.default.createElement(
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

  exports.default = SubscriptionTab;
});