define(['exports', 'actions/LayerActions', 'helpers/LayersHelper', 'js/config', 'components/LayerPanel/FireHistoryLegend', 'react'], function (exports, _LayerActions, _LayersHelper, _config, _FireHistoryLegend, _react) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _LayersHelper2 = _interopRequireDefault(_LayersHelper);

	var _FireHistoryLegend2 = _interopRequireDefault(_FireHistoryLegend);

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

	var fireHistoryOptions = _config.layerPanelText.fireHistoryOptions;
	var playing = false;

	var win = {};
	win.requestAnimationFrame = function () {
		return win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.oRequestAnimationFrame || win.msRequestAnimationFrame || function (callback) {
			window.setTimeout(callback, 1500);
		};
	}();
	var i = 0;

	var FireHistoryTimeline = function (_React$Component) {
		_inherits(FireHistoryTimeline, _React$Component);

		function FireHistoryTimeline() {
			var _ref;

			var _temp, _this, _ret;

			_classCallCheck(this, FireHistoryTimeline);

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FireHistoryTimeline.__proto__ || Object.getPrototypeOf(FireHistoryTimeline)).call.apply(_ref, [this].concat(args))), _this), _this.increaseFireHistoryYear = function () {
				if (_this.props.fireHistorySelectIndex < 14) {
					_LayerActions.layerActions.incrementFireHistoryYear();
				}
			}, _this.decreaseFireHistoryYear = function () {
				if (_this.props.fireHistorySelectIndex > 0) {
					_LayerActions.layerActions.decrementFireHistoryYear();
				}
			}, _temp), _possibleConstructorReturn(_this, _ret);
		}

		_createClass(FireHistoryTimeline, [{
			key: 'componentDidUpdate',
			value: function componentDidUpdate(prevProps) {
				if (prevProps.fireHistorySelectIndex !== this.props.fireHistorySelectIndex) {
					_LayersHelper2.default.updateFireHistoryDefinitions(this.props.fireHistorySelectIndex);
				}
			}
		}, {
			key: 'render',
			value: function render() {
				var activeItem = fireHistoryOptions[this.props.fireHistorySelectIndex];
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(_FireHistoryLegend2.default, null),
					_react2.default.createElement(
						'div',
						{ className: 'timeline-container relative fires-history' },
						_react2.default.createElement(
							'select',
							{ className: 'pointer', value: this.props.fireHistorySelectIndex, onChange: this.updateFireHistoryDefinitions },
							fireHistoryOptions.map(this.optionsMap, this)
						),
						_react2.default.createElement('div', { className: 'history-play backward ' + (this.props.fireHistorySelectIndex === 0 ? 'disable' : ''), onClick: this.decreaseFireHistoryYear }),
						_react2.default.createElement(
							'div',
							{ className: 'fires-history-cover-control gfw-btn sml white' },
							activeItem.label
						),
						_react2.default.createElement('div', { className: 'history-play ' + (this.props.fireHistorySelectIndex === 14 ? 'disable' : ''), onClick: this.increaseFireHistoryYear })
					)
				);
			}
		}, {
			key: 'optionsMap',
			value: function optionsMap(item, index) {
				return _react2.default.createElement(
					'option',
					{ key: index, value: index },
					item.label
				);
			}
		}, {
			key: 'updateFireHistoryDefinitions',
			value: function updateFireHistoryDefinitions(evt) {
				_LayerActions.layerActions.changeFireHistoryTimeline(evt.target.selectedIndex);
			}
		}, {
			key: 'toggleTimeline',
			value: function toggleTimeline(evt) {
				if (evt.target.classList.contains('playing')) {
					evt.target.classList.remove('playing');
					playing = false;
					setTimeout(function () {
						i = 0; //timeout b/c the last requestAnimationFrame is still firing! If we can stop it, we can remove this setTimeout
					}, 1500); //todo: use interval and clearinterval

					return;
				} else {
					var _fade = function _fade() {
						if (i === fireHistoryOptions.length) {
							playing = false;
							document.getElementById('timelinePlayer').classList.remove('playing');
							i = 0;
							return;
						}

						_LayerActions.layerActions.changeFireHistoryTimeline(i);

						if (playing === true) {
							win.requestAnimationFrame(_fade);
						} else {
							document.getElementById('timelinePlayer').classList.remove('playing');
							i = 0;
							return;
						}
						i++;
					};

					evt.target.classList.add('playing');
					playing = true;

					win.requestAnimationFrame(_fade);
				}
			}
		}]);

		return FireHistoryTimeline;
	}(_react2.default.Component);

	exports.default = FireHistoryTimeline;
});