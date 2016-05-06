define(['exports', 'components/Modals/CalendarWrapper', 'stores/MapStore', 'actions/MapActions', 'actions/ModalActions', 'js/config', 'react-dom', 'react'], function (exports, _CalendarWrapper, _MapStore, _MapActions, _ModalActions, _config, _reactDom, _react) {
		'use strict';

		Object.defineProperty(exports, "__esModule", {
				value: true
		});

		var _CalendarWrapper2 = _interopRequireDefault(_CalendarWrapper);

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

						var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CalendarModal).call(this, props));

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
								console.log(date);
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
								// mapActions.setDGDate(date);
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
				}]);

				return CalendarModal;
		}(_react.Component);

		exports.default = CalendarModal;
});