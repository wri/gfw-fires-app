define(['exports', 'react', 'actions/MapActions', 'actions/AnalysisActions'], function (exports, _react, _MapActions, _AnalysisActions) {
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

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
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

            _this.handleBasemap = function (evt) {
                var _this$props = _this.props,
                    monthlyBasemaps = _this$props.monthlyBasemaps,
                    quarterlyBasemaps = _this$props.quarterlyBasemaps;
                var activeCategory = _this.state.activeCategory;

                var url = evt.currentTarget.getAttribute('data-basemap');
                var filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
                var choice = filterBasemaps.find(function (basemap) {
                    return basemap.url === url;
                });
                if (choice) {
                    _this.setState({
                        activePlanetBasemap: choice.title
                    }, function () {
                        _MapActions.mapActions.changeBasemap(choice);
                    });
                }
            };

            _this.state = {
                checked: false,
                activeCategory: 'PLANET-MONTHLY',
                activePlanetBasemap: ''
            };
            return _this;
        }

        _createClass(PlanetImagery, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                // Request XML page
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            var basemaps = [];
                            var xmlDoc = $.parseXML(xhttp.responseText);
                            var $xml = $(xmlDoc);
                            $xml.find('Layer').each(function (i, el) {
                                var title = el.firstChild.innerHTML;
                                var url = $(this).find('ResourceURL').attr('template');
                                basemaps.push({ title: title, url: url });
                            });
                            var monthlyBasemaps = basemaps.filter(function (b) {
                                return b.title.includes('Monthly');
                            });
                            var quarterlyBasemaps = basemaps.filter(function (b) {
                                return b.title.includes('Quarterly');
                            });
                            _AnalysisActions.analysisActions.saveMonthlyPlanetBasemaps(monthlyBasemaps);
                            _AnalysisActions.analysisActions.saveQuarterlyPlanetBasemaps(quarterlyBasemaps);
                        } else {
                            console.log('Error retrieving planet basemaps.');
                        }
                    }
                };
                xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=d4d25171b85b4f7f8fde459575cba233', true);
                xhttp.send();
            }
        }, {
            key: 'toggle',
            value: function toggle() {
                var _this2 = this;

                this.setState({
                    checked: !this.state.checked
                }, function () {
                    if (!_this2.state.checked) {
                        _MapActions.mapActions.changeBasemap('topo');
                    } else if (_this2.state.checked && _this2.state.activePlanetBasemap) {
                        var checkMonthly = _this2.props.monthlyBasemaps.find(function (b) {
                            return b.title === _this2.state.activePlanetBasemap;
                        });
                        var checkQuarterly = _this2.props.quarterlyBasemaps.find(function (b) {
                            return b.title === _this2.state.activePlanetBasemap;
                        });
                        if (checkMonthly) {
                            _MapActions.mapActions.changeBasemap(checkMonthly);
                        }
                        if (checkQuarterly) {
                            _MapActions.mapActions.changeBasemap(checkQuarterly);
                        }
                    }
                });
            }
        }, {
            key: 'setCategory',
            value: function setCategory(evt) {
                var id = evt.target.id;
                this.setState({ activeCategory: id });
            }
        }, {
            key: 'createBasemapOptions',
            value: function createBasemapOptions() {
                var _this3 = this;

                var _props = this.props,
                    monthlyBasemaps = _props.monthlyBasemaps,
                    quarterlyBasemaps = _props.quarterlyBasemaps;
                var _state = this.state,
                    activeCategory = _state.activeCategory,
                    activePlanetBasemap = _state.activePlanetBasemap;

                var filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
                return filterBasemaps.map(function (basemap, idx) {
                    var url = basemap.url,
                        title = basemap.title;

                    var pieces = title.split(' ');

                    var content = activeCategory === 'PLANET-MONTHLY' ? pieces[2] + ' ' + pieces[3] : pieces[2];

                    var formattedTitle = '';
                    if (activeCategory === 'PLANET-MONTHLY') {
                        formattedTitle = window.Kalendae.moment(content, 'YYYY MM').format('MMM YYYY');
                    } else {
                        var subpieces = content.split('q');
                        formattedTitle = 'Quarter ' + subpieces[1] + ' ' + subpieces[0];
                    }

                    return _react2.default.createElement(
                        'div',
                        _defineProperty({
                            key: idx,
                            'data-basemap': url,
                            onClick: _this3.handleBasemap,
                            className: 'planet-basemap ' + (activePlanetBasemap === title ? 'active' : '')
                        }, 'onClick', _this3.handleBasemap),
                        formattedTitle
                    );
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _state2 = this.state,
                    checked = _state2.checked,
                    activeCategory = _state2.activeCategory;

                return _react2.default.createElement(
                    'div',
                    { className: 'layer-checkbox relative ' + (checked ? 'active' : '') },
                    _react2.default.createElement(
                        'span',
                        { className: 'toggle-switch pointer', onClick: this.toggle.bind(this) },
                        _react2.default.createElement('span', null)
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'layer-checkbox-label pointer', onClick: this.toggle.bind(this) },
                        'Planet Basemaps'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'layer-content-container flex flex-column justify-center ' + (checked ? '' : 'hidden') },
                        _react2.default.createElement(
                            'div',
                            { className: 'flex' },
                            _react2.default.createElement(
                                'div',
                                {
                                    id: 'PLANET-MONTHLY',
                                    onClick: this.setCategory.bind(this),
                                    className: 'planet-category ' + (activeCategory === 'PLANET-MONTHLY' ? 'active' : '')
                                },
                                'Monthly'
                            ),
                            _react2.default.createElement(
                                'div',
                                {
                                    id: 'PLANET-QUARTERLY',
                                    onClick: this.setCategory.bind(this),
                                    className: 'planet-category ' + (activeCategory === 'PLANET-QUARTERLY' ? 'active' : '')
                                },
                                'Quarterly'
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'flex flex-wrap justify-between' },
                            this.createBasemapOptions()
                        )
                    )
                );
            }
        }]);

        return PlanetImagery;
    }(_react2.default.Component);

    exports.default = PlanetImagery;
});