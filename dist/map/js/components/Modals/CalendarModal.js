define(['exports', 'components/Modals/CalendarWrapper', 'stores/MapStore', 'actions/MapActions', 'actions/ModalActions', 'js/constants', 'js/config', 'helpers/LayersHelper', 'esri/tasks/QueryTask', 'esri/tasks/query', 'dojo/Deferred', 'react-dom', 'react'], function (exports, _CalendarWrapper, _MapStore, _MapActions, _ModalActions, _constants, _config, _LayersHelper, _QueryTask, _query, _Deferred, _reactDom, _react) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _CalendarWrapper2 = _interopRequireDefault(_CalendarWrapper);

	var _constants2 = _interopRequireDefault(_constants);

	var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

	var _QueryTask2 = _interopRequireDefault(_QueryTask);

	var _query2 = _interopRequireDefault(_query);

	var _Deferred2 = _interopRequireDefault(_Deferred);

	var _reactDom2 = _interopRequireDefault(_reactDom);

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

	var CalendarModal = function (_Component) {
		_inherits(CalendarModal, _Component);

		function CalendarModal(props) {
			_classCallCheck(this, CalendarModal);

			var _this = _possibleConstructorReturn(this, (CalendarModal.__proto__ || Object.getPrototypeOf(CalendarModal)).call(this, props));

			_MapStore.mapStore.listen(_this.storeUpdated.bind(_this));
			_this.state = _MapStore.mapStore.getState();
			return _this;
		}

		_createClass(CalendarModal, [{
			key: 'storeUpdated',
			value: function storeUpdated() {
				this.setState(_MapStore.mapStore.getState());
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				var _this2 = this;

				this.props.calendars.forEach(function (calendar) {
					if (calendar.method === 'changeRisk' || calendar.method === 'changeRain') {
						_this2.getLatest(calendar.method).then(function (res) {
							if (calendar.date.isAfter(res)) {
								calendar.date = res;
								if (calendar.method === 'changeRisk') {
									_MapActions.mapActions.setRiskDate({
										date: res,
										dest: 'riskDate'
									});
								} else {
									_MapActions.mapActions.setRainDate({
										date: res,
										dest: 'rainDate'
									});
								}
							}

							var calendar_obj = new window.Kalendae(calendar.domId, {
								months: 1,
								mode: 'single',
								direction: calendar.direction,
								blackout: function blackout(date) {
									return date > calendar.date || date.yearDay() < calendar.startDate.yearDay();
								},
								selected: calendar.date
							});
							calendar_obj.subscribe('change', _this2[calendar.method].bind(_this2));
						});
					} else {
						var calendar_obj = new window.Kalendae(calendar.domId, {
							months: 1,
							mode: 'single',
							direction: calendar.direction,
							blackout: function blackout(date) {
								if (date.yearDay() >= calendar.startDate.yearDay()) {
									return false;
								} else {
									return true;
								}
							},
							selected: calendar.date
						});
						calendar_obj.subscribe('change', _this2[calendar.method].bind(_this2));
					}
				});
			}
		}, {
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					_CalendarWrapper2.default,
					null,
					this.props.calendars.map(this.itemMapper, this)
				);
			}
		}, {
			key: 'itemMapper',
			value: function itemMapper(item) {
				return _react2.default.createElement(
					'div',
					{ className: 'modal-content ' + item.domClass + (this.state.calendarVisible === item.domId ? '' : ' hidden') },
					item.domId === 'masterDay' ? _react2.default.createElement(
						'div',
						{ className: 'master-calendar' },
						_config.controlPanelText.timeInstructions
					) : null,
					_react2.default.createElement('div', { id: item.domId })
				);
			}
		}, {
			key: 'close',
			value: function close() {
				_ModalActions.modalActions.hideModal(_reactDom2.default.findDOMNode(this).parentElement);
			}
		}, {
			key: 'changeImageryStart',
			value: function changeImageryStart(date) {
				this.close();
				_MapActions.mapActions.setDGDate({
					date: date,
					dest: 'dgStartDate'
				});
			}
		}, {
			key: 'changeImageryEnd',
			value: function changeImageryEnd(date) {
				this.close();
				_MapActions.mapActions.setDGDate({
					date: date,
					dest: 'dgEndDate'
				});
			}
		}, {
			key: 'changeAnalysisStart',
			value: function changeAnalysisStart(date) {
				this.close();
				_MapActions.mapActions.setAnalysisDate({
					date: date,
					dest: 'analysisStartDate'
				});
			}
		}, {
			key: 'changeAnalysisEnd',
			value: function changeAnalysisEnd(date) {
				this.close();
				_MapActions.mapActions.setAnalysisDate({
					date: date,
					dest: 'analysisEndDate'
				});
			}
		}, {
			key: 'changeArchiveStart',
			value: function changeArchiveStart(date) {
				this.close();
				_MapActions.mapActions.setArchiveDate({
					date: date,
					dest: 'archiveStartDate'
				});
			}
		}, {
			key: 'changeArchiveEnd',
			value: function changeArchiveEnd(date) {
				this.close();
				_MapActions.mapActions.setArchiveDate({
					date: date,
					dest: 'archiveEndDate'
				});
			}
		}, {
			key: 'changeViirsArchiveStart',
			value: function changeViirsArchiveStart(date) {
				this.close();
				_MapActions.mapActions.setViirsArchiveDate({
					date: date,
					dest: 'archiveViirsStartDate'
				});
				_LayersHelper2.default.hideLayer(_constants2.default.viirsFires);
				var layerObj = {};
				layerObj.layerId = _constants2.default.viirsArchive;
				_LayersHelper2.default.showLayer(layerObj);
			}
		}, {
			key: 'changeViirsArchiveEnd',
			value: function changeViirsArchiveEnd(date) {
				this.close();
				_MapActions.mapActions.setViirsArchiveDate({
					date: date,
					dest: 'archiveViirsEndDate'
				});
				_LayersHelper2.default.hideLayer(_constants2.default.viirsFires);
				var layerObj = {};
				layerObj.layerId = _constants2.default.viirsArchive;
				_LayersHelper2.default.showLayer(layerObj);
			}
		}, {
			key: 'changeModisArchiveStart',
			value: function changeModisArchiveStart(date) {
				this.close();
				_MapActions.mapActions.setModisArchiveDate({
					date: date,
					dest: 'archiveModisStartDate'
				});
				_LayersHelper2.default.hideLayer(_constants2.default.activeFires);
				var layerObj = {};
				layerObj.layerId = _constants2.default.modisArchive;
				_LayersHelper2.default.showLayer(layerObj);
			}
		}, {
			key: 'changeModisArchiveEnd',
			value: function changeModisArchiveEnd(date) {
				this.close();
				_MapActions.mapActions.setModisArchiveDate({
					date: date,
					dest: 'archiveModisEndDate'
				});
				_LayersHelper2.default.hideLayer(_constants2.default.activeFires);
				var layerObj = {};
				layerObj.layerId = _constants2.default.modisArchive;
				_LayersHelper2.default.showLayer(layerObj);
			}
		}, {
			key: 'changeNoaaStart',
			value: function changeNoaaStart(date) {
				this.close();
				_MapActions.mapActions.setNoaaDate({
					date: date,
					dest: 'noaaStartDate'
				});
			}
		}, {
			key: 'changeNoaaEnd',
			value: function changeNoaaEnd(date) {
				this.close();
				_MapActions.mapActions.setNoaaDate({
					date: date,
					dest: 'noaaEndDate'
				});
			}
		}, {
			key: 'changeRisk',
			value: function changeRisk(date) {
				this.close();
				_MapActions.mapActions.setRiskDate({
					date: date,
					dest: 'riskDate'
				});
			}
		}, {
			key: 'changeRain',
			value: function changeRain(date) {
				this.close();
				_MapActions.mapActions.setRainDate({
					date: date,
					dest: 'rainDate'
				});
			}
		}, {
			key: 'changeAirQ',
			value: function changeAirQ(date) {
				this.close();
				_MapActions.mapActions.setAirQDate({
					date: date,
					dest: 'airQDate'
				});
			}
		}, {
			key: 'changeWind',
			value: function changeWind(date) {
				this.close();
				_MapActions.mapActions.setWindDate({
					date: date,
					dest: 'windDate'
				});
			}
		}, {
			key: 'changeMaster',
			value: function changeMaster(date) {
				this.close();
				_MapActions.mapActions.setMasterDate({
					date: date,
					dest: 'masterDate'
				});
			}
		}, {
			key: 'getLatest',
			value: function getLatest(method) {
				var deferred = new _Deferred2.default();
				var qLayer = void 0;
				if (method === 'changeRisk') {
					qLayer = _config.layersConfig.filter(function (layer) {
						return layer && layer.id === _constants2.default.fireWeather;
					})[0];
				} else {
					qLayer = _config.layersConfig.filter(function (layer) {
						return layer && layer.id === _constants2.default.lastRainfall;
					})[0];
				}
				var queryTask = new _QueryTask2.default(qLayer.url);
				var query = new _query2.default();
				query.where = '1=1';
				query.returnGeometry = false;
				query.outFields = ['OBJECTID', 'Name'];

				queryTask.execute(query, function (results) {
					var newest = results.features[results.features.length - 1];
					var date = void 0;
					if (method === 'changeRisk') {
						date = newest.attributes.Name.split('_IDN_FireRisk')[0];
					} else {
						date = newest.attributes.Name.split('_IDN')[0];
						date = date.split('DSLR_')[1];
					}

					var currentYear = new Date().getFullYear();
					var dates = date.split(currentYear.toString());
					var julian = new window.Kalendae.moment(currentYear.toString()).add(parseInt(dates[1]), 'd');

					deferred.resolve(julian);
				});
				return deferred;
			}
		}]);

		return CalendarModal;
	}(_react.Component);

	exports.default = CalendarModal;
});