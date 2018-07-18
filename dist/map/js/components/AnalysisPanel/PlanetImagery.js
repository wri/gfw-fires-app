define(['exports', 'react', 'react-select', 'stores/MapStore', 'actions/MapActions'], function (exports, _react, _reactSelect, _MapStore, _MapActions) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react2 = _interopRequireDefault(_react);

	var _reactSelect2 = _interopRequireDefault(_reactSelect);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _extends = Object.assign || function (target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];

			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}

		return target;
	};

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

	var PlanetImagery = function (_React$Component) {
		_inherits(PlanetImagery, _React$Component);

		function PlanetImagery(props) {
			_classCallCheck(this, PlanetImagery);

			var _this = _possibleConstructorReturn(this, (PlanetImagery.__proto__ || Object.getPrototypeOf(PlanetImagery)).call(this, props));

			_this.setCategory = function (selected) {
				var value = selected.value;
				var _this$props = _this.props,
				    monthlyBasemaps = _this$props.monthlyBasemaps,
				    quarterlyBasemaps = _this$props.quarterlyBasemaps;


				var defaultBasemap = value === 'PLANET-MONTHLY' ? monthlyBasemaps[0] : quarterlyBasemaps[0];

				_MapActions.mapActions.setActivePlanetBasemap.defer(defaultBasemap);
				_MapActions.mapActions.setActivePlanetPeriod.defer(defaultBasemap.label);
				_MapActions.mapActions.setActivePlanetCategory.defer(value);

				_MapActions.mapActions.changeBasemap.defer(defaultBasemap);
			};

			_this.handleBasemap = function (selected) {
				var value = selected.value;
				var _this$props2 = _this.props,
				    monthlyBasemaps = _this$props2.monthlyBasemaps,
				    quarterlyBasemaps = _this$props2.quarterlyBasemaps;
				var activeCategory = _this.state.activeCategory;

				var filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
				var choice = filterBasemaps.find(function (basemap) {
					return basemap.value === value;
				});

				if (choice) {
					_MapActions.mapActions.setActivePlanetBasemap.defer(selected);
					_MapActions.mapActions.setActivePlanetPeriod.defer(selected.label);
					_MapActions.mapActions.changeBasemap.defer(choice);
				}
			};

			_MapStore.mapStore.listen(_this.storeUpdated.bind(_this));

			_this.state = _extends({}, _MapStore.mapStore.getState(), {
				checked: false
			});
			return _this;
		}

		_createClass(PlanetImagery, [{
			key: 'storeUpdated',
			value: function storeUpdated() {
				this.setState(_MapStore.mapStore.getState());
			}
		}, {
			key: 'shouldComponentUpdate',
			value: function shouldComponentUpdate(nextProps, nextState) {
				if (nextState.activePlanetBasemap === '' && this.state.activePlanetPeriod !== nextState.activePlanetPeriod && nextState.activePlanetPeriod !== '' && nextState.activePlanetPeriod !== 'null') {
					this.getPlanetBasemaps(nextState.activePlanetPeriod, true);
				}

				if (nextState.activePlanetPeriod !== '' && this.state.activePlanetPeriod !== nextState.activePlanetPeriod && nextState.activePlanetPeriod !== 'null' && this.state.activeCategory !== nextState.activeCategory) {
					this.getPlanetBasemaps(nextState.activePlanetPeriod, true);
					return true;
				} else if (nextState.activeCategory !== '' && this.state.activeCategory !== nextState.activeCategory && nextState.activeCategory !== 'null' && nextState.activePlanetPeriod !== 'null' && nextState.activePlanetPeriod !== '') {
					return true;
				} else if (nextState.activePlanetPeriod !== '' && this.state.activePlanetPeriod !== nextState.activePlanetPeriod && nextState.activePlanetPeriod !== 'null') {
					return true;
				} else if (nextState.activePlanetBasemap !== '' && this.state.activePlanetBasemap !== nextState.activePlanetBasemap && nextState.activePlanetBasemap !== 'null') {
					return true;
				}
				return false;
			}
		}, {
			key: 'getPlanetBasemaps',
			value: function getPlanetBasemaps(period, updateStore) {
				var _this2 = this;

				var _props = this.props,
				    monthlyBasemaps = _props.monthlyBasemaps,
				    quarterlyBasemaps = _props.quarterlyBasemaps;


				var basemaps = this.state.activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;

				var defaultBasemap = basemaps.find(function (item) {
					return item.label === period ? period : _this2.state.activePlanetPeriod;
				});

				if (updateStore) {
					_MapActions.mapActions.setActivePlanetBasemap.defer(defaultBasemap);
					_MapActions.mapActions.setActivePlanetPeriod.defer(defaultBasemap.label);
					_MapActions.mapActions.setActivePlanetCategory.defer(this.state.activeCategory);
				}
				_MapActions.mapActions.changeBasemap.defer(defaultBasemap);
			}
		}, {
			key: 'render',
			value: function render() {
				var tmpActiveBasemap = void 0;
				var _state = this.state,
				    activePlanetBasemap = _state.activePlanetBasemap,
				    activeCategory = _state.activeCategory;
				var _props2 = this.props,
				    active = _props2.active,
				    monthlyBasemaps = _props2.monthlyBasemaps,
				    quarterlyBasemaps = _props2.quarterlyBasemaps;


				if (activePlanetBasemap === '' && activeCategory !== 'null') {
					tmpActiveBasemap = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps[0] : quarterlyBasemaps[0];
					this.getPlanetBasemaps(tmpActiveBasemap.label, false);
				}

				return _react2.default.createElement(
					'div',
					{ className: 'relative ' + (active ? 'active' : 'hidden'), onClick: function onClick(evt) {
							return evt.stopPropagation();
						} },
					_react2.default.createElement(
						'div',
						{ className: 'layer-content-container flex select-container ' + (active ? '' : 'hidden') },
						_react2.default.createElement(
							'div',
							{ className: 'flex imagery-category-container' },
							_react2.default.createElement(_reactSelect2.default, {
								multi: false,
								clearable: false,
								value: activeCategory,
								options: [{ value: 'PLANET-MONTHLY', label: 'Monthly' }, { value: 'PLANET-QUARTERLY', label: 'Quarterly' }],
								onChange: this.setCategory.bind(this),
								style: {
									width: '175px'
								}
							})
						),
						_react2.default.createElement(
							'div',
							null,
							_react2.default.createElement(_reactSelect2.default, {
								multi: false,
								clearable: false,
								value: activePlanetBasemap === '' ? tmpActiveBasemap : activePlanetBasemap,
								options: activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps,
								onChange: this.handleBasemap.bind(this),
								style: {
									width: '175px'
								}
							})
						)
					)
				);
			}
		}]);

		return PlanetImagery;
	}(_react2.default.Component);

	exports.default = PlanetImagery;
});