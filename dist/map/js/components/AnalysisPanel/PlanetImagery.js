define(['exports', 'react', 'react-select', 'actions/MapActions', 'actions/AnalysisActions'], function (exports, _react, _reactSelect, _MapActions, _AnalysisActions) {
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

    var _slicedToArray = function () {
        function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;

            try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                    _arr.push(_s.value);

                    if (i && _arr.length === i) break;
                }
            } catch (err) {
                _d = true;
                _e = err;
            } finally {
                try {
                    if (!_n && _i["return"]) _i["return"]();
                } finally {
                    if (_d) throw _e;
                }
            }

            return _arr;
        }

        return function (arr, i) {
            if (Array.isArray(arr)) {
                return arr;
            } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
        };
    }();

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

            _this.handleBasemap = function (selected) {
                var label = selected.label,
                    value = selected.value;
                var _this$props = _this.props,
                    monthlyBasemaps = _this$props.monthlyBasemaps,
                    quarterlyBasemaps = _this$props.quarterlyBasemaps;
                var activeCategory = _this.state.activeCategory;

                var filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
                var choice = filterBasemaps.find(function (basemap) {
                    return basemap.url === value;
                });
                if (choice) {
                    _this.setState({
                        activePlanetBasemap: selected
                    }, function () {
                        console.log(choice);
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

                            var xmlParser = new DOMParser();
                            var xmlString = xhttp.responseText;
                            var xmlDoc = xmlParser.parseFromString(xmlString, 'text/xml');

                            var contents = xmlDoc.getElementsByTagName('Contents')[0];
                            var layerCollection = contents.getElementsByTagName('Layer');
                            var layerCollectionLength = layerCollection.length;

                            for (var i = 0; i < layerCollectionLength; i++) {
                                var currentLayer = layerCollection[i];
                                var title = currentLayer.getElementsByTagName('ows:Title')[0].innerHTML;
                                var url = currentLayer.getElementsByTagName('ResourceURL')[0].getAttribute('template');
                                basemaps.push({ title: title, url: url });
                            }

                            // const xmlDoc = $.parseXML(xhttp.responseText);
                            // const $xml = $(xmlDoc);
                            // $xml.find('Layer').each(function (i, el) {
                            //     const title = el.firstChild.innerHTML;
                            //     const url = $(this).find('ResourceURL').attr('template');
                            //     basemaps.push({ title, url });
                            // });

                            var monthlyBasemaps = [];
                            var quarterlyBasemaps = [];
                            console.log('hello');
                            basemaps.forEach(function (basemap) {
                                console.log(basemap);
                                if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Monthly') >= 0) {
                                    monthlyBasemaps.push(basemap);
                                }
                                if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Quarterly') >= 0) {
                                    quarterlyBasemaps.push(basemap);
                                }
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
                    } else if (_this2.state.checked) {
                        var defaultBasemap = _this2.createBasemapOptions().reverse()[0];
                        _this2.setState({
                            activePlanetBasemap: defaultBasemap
                        }, function () {
                            _MapActions.mapActions.changeBasemap({
                                title: defaultBasemap.label,
                                url: defaultBasemap.value
                            });
                        });
                    }
                });
            }
        }, {
            key: 'setCategory',
            value: function setCategory(evt) {
                var _this3 = this;

                var id = evt.target.id;
                this.setState({ activeCategory: id }, function () {
                    var defaultBasemap = _this3.createBasemapOptions().reverse()[0];
                    _this3.setState({ activePlanetBasemap: defaultBasemap }, function () {
                        _MapActions.mapActions.changeBasemap({
                            title: defaultBasemap.label,
                            url: defaultBasemap.value
                        });
                    });
                });
            }
        }, {
            key: 'parseMonthlyTitle',
            value: function parseMonthlyTitle(title) {
                // ex. formats 'Global Monthly 2016 01 Mosaic' OR 'Latest Monthly'
                var words = title.split(' ');
                var year = words[2];
                var month = words[3];
                if (year === undefined || month === undefined) {
                    return title;
                } else {
                    var yyyyMM = year + ' ' + month;
                    var label = window.Kalendae.moment(yyyyMM, 'YYYY MM').format('MMM YYYY');
                    return label;
                }
            }
        }, {
            key: 'parseQuarterlyTitle',
            value: function parseQuarterlyTitle(title) {
                var words = title.split(' ');
                var yearQuarter = words[2];
                if (yearQuarter === undefined) {
                    return title;
                } else {
                    var _yearQuarter$split = yearQuarter.split('q'),
                        _yearQuarter$split2 = _slicedToArray(_yearQuarter$split, 2),
                        year = _yearQuarter$split2[0],
                        quarter = _yearQuarter$split2[1];

                    var label = 'Quarter ' + quarter + ' ' + year;
                    return label;
                }
            }
        }, {
            key: 'createBasemapOptions',
            value: function createBasemapOptions() {
                var _this4 = this;

                var _props = this.props,
                    monthlyBasemaps = _props.monthlyBasemaps,
                    quarterlyBasemaps = _props.quarterlyBasemaps;
                var _state = this.state,
                    activeCategory = _state.activeCategory,
                    activePlanetBasemap = _state.activePlanetBasemap;

                var filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
                return filterBasemaps.map(function (basemap) {
                    var url = basemap.url,
                        title = basemap.title;

                    var label = activeCategory === 'PLANET-MONTHLY' ? _this4.parseMonthlyTitle(title) : _this4.parseQuarterlyTitle(title);
                    return {
                        value: url,
                        label: label
                    };
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _state2 = this.state,
                    checked = _state2.checked,
                    activeCategory = _state2.activeCategory,
                    activePlanetBasemap = _state2.activePlanetBasemap;

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
                            { className: 'flex imagery-category-container' },
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
                            { className: 'planet-small-margin flex' },
                            _react2.default.createElement(_reactSelect2.default, {
                                multi: false,
                                value: activePlanetBasemap,
                                options: this.createBasemapOptions().reverse(),
                                onChange: this.handleBasemap.bind(this),
                                style: {
                                    width: '200px'
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