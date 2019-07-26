define(['exports', 'components/Modals/DraggableModalWrapper', 'actions/MapActions', 'react', 'components/AnalysisPanel/ImageryDatePicker', 'esri/geometry/ScreenPoint', 'components/Loader', 'js/layers/GFWImageryLayer', 'utils/svgs', 'esri/graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Polygon', 'utils/symbols', 'js/constants', 'esri/tasks/ProjectParameters', 'esri/tasks/GeometryService', 'esri/SpatialReference', 'js/config'], function (exports, _DraggableModalWrapper, _MapActions, _react, _ImageryDatePicker, _ScreenPoint, _Loader, _GFWImageryLayer, _svgs, _graphic, _GraphicsLayer, _Polygon, _symbols, _constants, _ProjectParameters, _GeometryService, _SpatialReference, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _DraggableModalWrapper2 = _interopRequireDefault(_DraggableModalWrapper);

  var _react2 = _interopRequireDefault(_react);

  var _ImageryDatePicker2 = _interopRequireDefault(_ImageryDatePicker);

  var _ScreenPoint2 = _interopRequireDefault(_ScreenPoint);

  var _Loader2 = _interopRequireDefault(_Loader);

  var _GFWImageryLayer2 = _interopRequireDefault(_GFWImageryLayer);

  var _graphic2 = _interopRequireDefault(_graphic);

  var _GraphicsLayer2 = _interopRequireDefault(_GraphicsLayer);

  var _Polygon2 = _interopRequireDefault(_Polygon);

  var _symbols2 = _interopRequireDefault(_symbols);

  var _constants2 = _interopRequireDefault(_constants);

  var _ProjectParameters2 = _interopRequireDefault(_ProjectParameters);

  var _GeometryService2 = _interopRequireDefault(_GeometryService);

  var _SpatialReference2 = _interopRequireDefault(_SpatialReference);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
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

  var ImageryModal = function (_Component) {
    _inherits(ImageryModal, _Component);

    function ImageryModal(props) {
      _classCallCheck(this, ImageryModal);

      var _this = _possibleConstructorReturn(this, (ImageryModal.__proto__ || Object.getPrototypeOf(ImageryModal)).call(this, props));

      _this.renderDropdownOptions = function (option, index) {
        return _react2.default.createElement(
          'option',
          { key: index, value: option.label },
          option.label
        );
      };

      _this.renderThumbnails = function (tileObj, i) {

        var reloadCount = 0;

        var handleError = function handleError(event) {
          if (reloadCount < 20) {
            event.persist();
            event.target.src = '';
            reloadCount++;
            setTimeout(function () {
              event.target.src = tileObj.thumbUrl;
              event.target.classList.remove('hidden');
            }, 1000);
          } else {
            event.target.classList.add('hidden');
          }
        };
        if (!tileObj.tileUrl) {
          return _react2.default.createElement(
            'div',
            {
              className: 'thumbnail disabled',
              key: 'thumb-' + i },
            _react2.default.createElement(_Loader2.default, { active: _this.props.loadingImagery, type: 'imagery' }),
            !_this.props.loadingImagery && _react2.default.createElement(
              'div',
              { className: 'imagery-alert-thumb' },
              _react2.default.createElement(_svgs.AlertsSvg, null)
            )
          );
        } else {
          return _react2.default.createElement(
            'div',
            {
              onClick: function onClick() {
                return _this.selectThumbnail(tileObj, i);
              },
              onMouseEnter: function onMouseEnter() {
                return _this.hoverThumbnail(tileObj);
              },
              onMouseLeave: function onMouseLeave() {
                return _this.hoverThumbnail(null);
              },
              className: 'thumbnail ' + (_this.state.selectedThumb && _this.state.selectedThumb.index === i ? 'selected' : ''),
              key: 'thumb-' + i },
            _react2.default.createElement('img', { src: tileObj.thumbUrl, onError: handleError })
          );
        }
      };

      _this.renderThumbText = function () {
        var _this$state = _this.state,
            hoveredThumb = _this$state.hoveredThumb,
            selectedThumb = _this$state.selectedThumb;


        var thumbnailText = hoveredThumb || selectedThumb.tileObj;

        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'p',
            null,
            window.Kalendae.moment(thumbnailText.attributes.date_time).format('DD MMM YYYY')
          ),
          _react2.default.createElement(
            'p',
            null,
            thumbnailText.attributes.cloud_score.toFixed(0) + '% cloud coverage'
          ),
          _react2.default.createElement(
            'p',
            null,
            thumbnailText.attributes.instrument.replace('_', ' ')
          )
        );
      };

      _this.close = function () {
        _MapActions.mapActions.toggleImageryVisible(false);
      };

      _this.onChangeStart = function (event) {
        if (event.currentTarget.dataset.type === 'cloudMin') {
          var cloudScoreCloned = [].concat(_toConsumableArray(_this.state.cloudScore));
          if (Number(event.target.value) > cloudScoreCloned[1]) {
            cloudScoreCloned.splice(0, 1);
            cloudScoreCloned.push(Number(event.target.value));
          } else {
            cloudScoreCloned[0] = Number(event.target.value);
          }
          _this.setState({ cloudScore: cloudScoreCloned }, _this.updateImagery);
        } else if (event.currentTarget.dataset.type === 'cloudMax') {
          var _cloudScoreCloned = [].concat(_toConsumableArray(_this.state.cloudScore));
          if (Number(event.target.value) < _cloudScoreCloned[0]) {
            _cloudScoreCloned.splice(1, 1);
            _cloudScoreCloned.unshift(Number(event.target.value));
          } else {
            _cloudScoreCloned[1] = Number(event.target.value);
          }
          _this.setState({ cloudScore: _cloudScoreCloned }, _this.updateImagery);
        } else {
          var value = parseInt(event.target.value.split(' ')[0]);
          var type = value === 4 ? 'weeks' : 'months';

          var end = _this.state.end ? window.Kalendae.moment(_this.state.end) : window.Kalendae.moment();
          var start = end.subtract(value, type).format('YYYY-MM-DD');

          _this.setState({ start: start, monthsVal: event.target.value, selectedThumb: null }, _this.updateImagery);
        }
      };

      _this.onChangeImageStyle = function (event) {
        var value = event.target.value;
        _this.setState({ imageStyleVal: value, selectedThumb: null }, _this.updateImagery);
      };

      _this.getSatelliteImagery = function (params) {
        _MapActions.mapActions.getSatelliteImagery(params);
      };

      _this.updateImagery = function () {
        var map = app.map;

        if (map.toMap === undefined) {
          return;
        }

        var _this$state2 = _this.state,
            start = _this$state2.start,
            end = _this$state2.end,
            imageStyleVal = _this$state2.imageStyleVal;


        var xVal = window.innerWidth / 2;
        var yVal = window.innerHeight / 2;

        // Create new screen point at center;
        var screenPt = new _ScreenPoint2.default(xVal, yVal);

        // Convert screen point to map point and zoom to point;
        var mapPt = map.toMap(screenPt);

        // Note: Lat and lon are intentionally reversed until imagery api is fixed.
        // The imagery API only returns the correct image for that lat/lon if they are reversed.
        var lon = mapPt.getLongitude();
        var lat = mapPt.getLatitude();

        var params = { lat: lat, lon: lon, start: start, end: end };

        if (imageStyleVal === 'Vegetation Health') {
          params.bands = '[B8,B11,B2]';
        }
        if (map.getZoom() < 8) {
          map.setZoom(8);
        }

        _this.getSatelliteImagery(params);

        //Reset state
        _this.setState({
          selectedThumb: null,
          hoveredThumb: null
        });
      };

      _this.state = {
        monthsVal: _config.modalText.imagery.monthsOptions[1].label,
        imageStyleVal: _config.modalText.imagery.imageStyleOptions[0].label,
        cloudScore: [0, 25],

        selectedThumb: null,
        hoveredThumb: null
      };
      return _this;
    }

    _createClass(ImageryModal, [{
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps, prevState) {
        // When panning while modal is open, we want to update selectedThumb state if no imagery is there
        if (prevProps.selectedImagery && !this.props.selectedImagery) {
          this.setState({ selectedThumb: null });
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        if (nextProps.imageryModalVisible && !this.props.imageryModalVisible && !nextProps.imageryData.length) {
          this.updateImagery();
        }
      }
    }, {
      key: 'selectThumbnail',
      value: function selectThumbnail(tileObj, i) {
        var map = app.map;
        var imageryLayer = map.getLayer(_constants2.default.RECENT_IMAGERY);

        if (imageryLayer) {
          imageryLayer.setUrl(tileObj.tileUrl || tileObj.attributes.tile_url);
        } else {
          var options = {
            id: _constants2.default.RECENT_IMAGERY,
            url: tileObj.tileUrl || tileObj.attributes.tile_url,
            visible: true
          };

          imageryLayer = new _GFWImageryLayer2.default(options);
          map.addLayer(imageryLayer);
          map.reorderLayer(_constants2.default.RECENT_IMAGERY, 1); // Should be underneath all other layers
          imageryLayer._extentChanged();
        }

        this.setState({ selectedThumb: { index: i, tileObj: tileObj } });
        _MapActions.mapActions.setSelectedImagery(tileObj);

        // Add graphic to the map for hover effect on tile.
        var imageryGraphicsLayer = map.getLayer('imageryGraphicsLayer');

        if (imageryGraphicsLayer) {
          imageryGraphicsLayer.clear();
        } else {
          imageryGraphicsLayer = new _GraphicsLayer2.default({
            id: 'imageryGraphicsLayer',
            visible: true
          });
          map.addLayer(imageryGraphicsLayer);

          imageryGraphicsLayer.on('mouse-out', function () {
            _MapActions.mapActions.setImageryHoverInfo({ visible: false });
          });

          imageryGraphicsLayer.on('mouse-move', function (evt) {
            if (imageryGraphicsLayer.graphics.length) {
              _MapActions.mapActions.setImageryHoverInfo({ visible: true, top: evt.clientY, left: evt.clientX });
            }
          });
        }

        var geometry = new _Polygon2.default({ rings: [tileObj.attributes.bbox.geometry.coordinates], type: 'polygon' });
        var registeredGraphic = new _graphic2.default(new _Polygon2.default(geometry), _symbols2.default.getImagerySymbol());
        var geometryService = new _GeometryService2.default('https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');
        var params = new _ProjectParameters2.default();

        // Set the projection of the geometry for the image server
        params.outSR = new _SpatialReference2.default(102100);
        params.geometries = [geometry];

        // update the graphics geometry with the new projected geometry
        var successfullyProjected = function successfullyProjected(geometries) {
          registeredGraphic.geometry = geometries[0];
          imageryGraphicsLayer.add(registeredGraphic);
        };
        var failedToProject = function failedToProject(err) {
          console.log('Failed to project the geometry: ', err);
        };
        geometryService.project(params).then(successfullyProjected, failedToProject);
      }
    }, {
      key: 'hoverThumbnail',
      value: function hoverThumbnail(tileObj) {
        this.setState({ hoveredThumb: tileObj });
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var _state = this.state,
            monthsVal = _state.monthsVal,
            imageStyleVal = _state.imageStyleVal,
            cloudScore = _state.cloudScore,
            hoveredThumb = _state.hoveredThumb,
            selectedThumb = _state.selectedThumb;
        var _props = this.props,
            imageryData = _props.imageryData,
            loadingImagery = _props.loadingImagery,
            imageryError = _props.imageryError;

        var filteredImageryData = imageryData.filter(function (data) {
          return data.attributes.cloud_score >= cloudScore[0] && data.attributes.cloud_score <= cloudScore[1];
        });
        return _react2.default.createElement(
          _DraggableModalWrapper2.default,
          { onClose: this.close, onDragEnd: this.onDragEnd },
          _react2.default.createElement(
            'div',
            { className: 'imagery-modal__wrapper' },
            _react2.default.createElement(
              'div',
              { className: 'imagery-modal__title' },
              'Recent Hi-Res Satellite Imagery'
            ),
            _react2.default.createElement(
              'div',
              { className: 'imagery-modal__section filters flex' },
              _react2.default.createElement(
                'div',
                { className: 'imagery-modal__item' },
                _react2.default.createElement(
                  'div',
                  { className: 'imagery-modal_section-title' },
                  'Aquisition Date'
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'flex' },
                  _react2.default.createElement(
                    'div',
                    { className: 'relative' },
                    _react2.default.createElement(
                      'select',
                      {
                        'data-type': 'date',
                        value: monthsVal,
                        onChange: this.onChangeStart },
                      _config.modalText.imagery.monthsOptions.map(this.renderDropdownOptions)
                    ),
                    _react2.default.createElement(
                      'div',
                      { className: 'gfw-btn sml white pointer' },
                      monthsVal
                    )
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'imagery-modal_section-text' },
                    'before'
                  ),
                  _react2.default.createElement(_ImageryDatePicker2.default, {
                    minDate: '2012-01-01',
                    calendarCallback: this.onChangeEnd })
                )
              ),
              _react2.default.createElement(
                'div',
                { className: 'imagery-modal__item' },
                _react2.default.createElement(
                  'div',
                  { className: 'imagery-modal_section-title' },
                  'Maximum Cloud Cover Percentage'
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'flex' },
                  _react2.default.createElement(
                    'div',
                    { className: 'imagery-modal_section-text' },
                    'Min'
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'relative' },
                    _react2.default.createElement(
                      'select',
                      {
                        'data-type': 'cloudMin',
                        value: cloudScore[0],
                        onChange: this.onChangeStart },
                      _config.modalText.imagery.cloudCoverageOptions.map(this.renderDropdownOptions)
                    ),
                    _react2.default.createElement(
                      'div',
                      { className: 'gfw-btn sml white pointer' },
                      cloudScore[0]
                    )
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'imagery-modal_section-text' },
                    'Max'
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'relative' },
                    _react2.default.createElement(
                      'select',
                      {
                        'data-type': 'cloudMax',
                        value: cloudScore[1],
                        onChange: this.onChangeStart },
                      _config.modalText.imagery.cloudCoverageOptions.map(this.renderDropdownOptions)
                    ),
                    _react2.default.createElement(
                      'div',
                      { className: 'gfw-btn sml white pointer' },
                      cloudScore[1]
                    )
                  )
                )
              )
            ),
            _react2.default.createElement('hr', null),
            _react2.default.createElement(
              'div',
              { className: 'imagery-modal__section flex secondary-filters' },
              _react2.default.createElement(
                'div',
                {
                  onClick: function onClick() {
                    return _this2.props.getNewSatelliteImages();
                  },
                  className: 'imagery-modal__update-images' },
                'Search Area For Imagery'
              ),
              _react2.default.createElement(
                'div',
                { className: 'thumbnail-text' },
                hoveredThumb || selectedThumb ? this.renderThumbText() : null
              ),
              _react2.default.createElement(
                'div',
                { className: 'relative' },
                _react2.default.createElement(
                  'select',
                  {
                    style: { cursor: 'pointer' } // Needs inline styling to override defaults
                    , value: imageStyleVal,
                    onChange: this.onChangeImageStyle },
                  _config.modalText.imagery.imageStyleOptions.map(this.renderDropdownOptions)
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'gfw-btn sml white pointer' },
                  imageStyleVal
                )
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'imagery-modal__section thumbnail_container flex' },
              imageryError && _react2.default.createElement(
                'div',
                { className: 'imagery-modal__error' },
                _react2.default.createElement(
                  'div',
                  { className: 'imagery-alert-thumb' },
                  _react2.default.createElement(_svgs.AlertsSvg, null)
                ),
                _react2.default.createElement(
                  'p',
                  null,
                  'Error loading recent imagery.'
                )
              ),
              _react2.default.createElement(_Loader2.default, { active: loadingImagery && !filteredImageryData.length, type: 'imagery-modal-width' }),
              !loadingImagery && !filteredImageryData.length && _react2.default.createElement(
                'div',
                { className: 'imagery-modal__error' },
                _react2.default.createElement(
                  'p',
                  null,
                  'No results match the selected critria.'
                )
              ),
              filteredImageryData.map(this.renderThumbnails.bind(this))
            )
          )
        );
      }
    }]);

    return ImageryModal;
  }(_react.Component);

  exports.default = ImageryModal;
});