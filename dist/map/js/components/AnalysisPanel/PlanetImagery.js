define(['exports', 'react', 'react-select', 'helpers/ShareHelper', 'actions/MapActions'], function (exports, _react, _reactSelect, _ShareHelper, _MapActions) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _react2 = _interopRequireDefault(_react);

	var _reactSelect2 = _interopRequireDefault(_reactSelect);

	var _ShareHelper2 = _interopRequireDefault(_ShareHelper);

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

	var PlanetImagery = function (_React$Component) {
		_inherits(PlanetImagery, _React$Component);

		function PlanetImagery(props) {
			_classCallCheck(this, PlanetImagery);

			var _this = _possibleConstructorReturn(this, (PlanetImagery.__proto__ || Object.getPrototypeOf(PlanetImagery)).call(this, props));

			_this.setCategory = function (selected) {
				var value = selected.value;
				var _this$props = _this.props,
				    monthlyBasemaps = _this$props.monthlyBasemaps,
				    quarterlyBasemaps = _this$props.quarterlyBasemaps,
				    activeImagery = _this$props.activeImagery;


				var defaultBasemap = value === 'PLANET-MONTHLY' ? monthlyBasemaps[0] : quarterlyBasemaps[0];

				if (defaultBasemap) {
					_MapActions.mapActions.setActivePlanetBasemap.defer(defaultBasemap);
					_MapActions.mapActions.setActivePlanetPeriod.defer(defaultBasemap.label);
					_MapActions.mapActions.setActivePlanetCategory.defer(value);

					_MapActions.mapActions.changeBasemap.defer(defaultBasemap);

					_ShareHelper2.default.handleHashChange(undefined, activeImagery, value, defaultBasemap.label);
				}
			};

			_this.handleBasemap = function (selected) {
				var value = selected.value;
				var _this$props2 = _this.props,
				    monthlyBasemaps = _this$props2.monthlyBasemaps,
				    quarterlyBasemaps = _this$props2.quarterlyBasemaps,
				    activeCategory = _this$props2.activeCategory,
				    activeImagery = _this$props2.activeImagery;

				var filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
				var choice = filterBasemaps.find(function (basemap) {
					return basemap.value === value;
				});

				if (choice) {
					_MapActions.mapActions.setActivePlanetBasemap.defer(selected);
					_MapActions.mapActions.setActivePlanetPeriod.defer(selected.label);
					_MapActions.mapActions.changeBasemap.defer(choice);
					_ShareHelper2.default.handleHashChange(undefined, activeImagery, activeCategory, selected.label);
				}
			};

			return _this;
		}

		_createClass(PlanetImagery, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				var activePlanetPeriod = this.props.activePlanetPeriod;

				if (activePlanetPeriod && activePlanetPeriod !== '' && activePlanetPeriod !== 'null') {
					this.getPlanetBasemaps();
				}
			}
		}, {
			key: 'componentDidUpdate',
			value: function componentDidUpdate(prevProps) {
				var _props = this.props,
				    activePlanetPeriod = _props.activePlanetPeriod,
				    activeCategory = _props.activeCategory;

				if (prevProps.activePlanetBasemap === '' && activePlanetPeriod !== prevProps.activePlanetPeriod && prevProps.activePlanetPeriod !== '' && prevProps.activePlanetPeriod !== 'null' || prevProps.activePlanetPeriod !== '' && activePlanetPeriod !== prevProps.activePlanetPeriod && prevProps.activePlanetPeriod !== 'null' && activeCategory !== prevProps.activeCategory) {
					this.getPlanetBasemaps();
				}
			}
		}, {
			key: 'getPlanetBasemaps',
			value: function getPlanetBasemaps() {
				var _props2 = this.props,
				    monthlyBasemaps = _props2.monthlyBasemaps,
				    quarterlyBasemaps = _props2.quarterlyBasemaps,
				    activeImagery = _props2.activeImagery,
				    activeCategory = _props2.activeCategory,
				    activePlanetPeriod = _props2.activePlanetPeriod;


				var basemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;

				var defaultBasemap = basemaps.find(function (item) {
					return item.label === activePlanetPeriod;
				});

				if (defaultBasemap) {
					_MapActions.mapActions.setActivePlanetBasemap.defer(defaultBasemap);
					_MapActions.mapActions.setActivePlanetPeriod.defer(defaultBasemap.label);
					_MapActions.mapActions.setActivePlanetCategory.defer(activeCategory);

					_MapActions.mapActions.changeBasemap.defer(defaultBasemap);

					_ShareHelper2.default.handleHashChange(undefined, activeImagery, activeCategory, defaultBasemap.label);
				}
			}
		}, {
			key: 'render',
			value: function render() {
				var _props3 = this.props,
				    active = _props3.active,
				    monthlyBasemaps = _props3.monthlyBasemaps,
				    quarterlyBasemaps = _props3.quarterlyBasemaps,
				    activeCategory = _props3.activeCategory,
				    activePlanetBasemap = _props3.activePlanetBasemap;


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
								value: activePlanetBasemap,
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