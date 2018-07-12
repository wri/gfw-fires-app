define(['exports', 'react', 'react-select', 'js/constants', 'actions/MapActions', 'actions/AnalysisActions', 'actions/ModalActions'], function (exports, _react, _reactSelect, _constants, _MapActions, _AnalysisActions, _ModalActions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _react2 = _interopRequireDefault(_react);

    var _reactSelect2 = _interopRequireDefault(_reactSelect);

    var _constants2 = _interopRequireDefault(_constants);

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
                var value = selected.value;
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
                        _MapActions.mapActions.changeBasemap(choice);
                    });
                }
            };

            _this.showInfo = function () {
                _ModalActions.modalActions.showLayerInfo(_constants2.default.planetBasemap);
            };

            _this.state = {
                checked: false,
                activeCategory: 'PLANET-MONTHLY',
                activePlanetBasemap: '',
                activePlanetCategory: { value: 'PLANET-MONTHLY', label: 'Monthly' }
            };
            return _this;
        }

        _createClass(PlanetImagery, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var self = this;
                // Request XML page
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            var basemaps = [];

                            var xmlParser = new DOMParser();
                            var htmlString = '<!DOCTYPE html>' + xhttp.responseText.substring(38);

                            var xmlDoc = xmlParser.parseFromString(htmlString, 'text/html');

                            var contents = xmlDoc.getElementsByTagName('Contents')[0];
                            var layerCollection = contents.getElementsByTagName('Layer');
                            var layerCollectionLength = layerCollection.length;

                            for (var i = 0; i < layerCollectionLength; i++) {
                                var currentLayer = layerCollection[i];
                                var title = currentLayer.getElementsByTagName('ows:Title')[0].innerHTML;
                                var url = currentLayer.getElementsByTagName('ResourceURL')[0].getAttribute('template');
                                basemaps.push({ title: title, url: url });
                            }

                            var monthlyBasemaps = [];
                            var quarterlyBasemaps = [];
                            basemaps.forEach(function (basemap) {
                                if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Monthly') >= 0) {
                                    monthlyBasemaps.push(basemap);
                                }
                                if (basemap && basemap.hasOwnProperty('title') && basemap.title.indexOf('Quarterly') >= 0) {
                                    quarterlyBasemaps.push(basemap);
                                }
                            });

                            _AnalysisActions.analysisActions.saveMonthlyPlanetBasemaps(monthlyBasemaps);
                            _AnalysisActions.analysisActions.saveQuarterlyPlanetBasemaps(quarterlyBasemaps);
                            self.getPlanetBasemaps();
                        } else {
                            console.log('Error retrieving planet basemaps.');
                        }
                    }
                };
                xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=d4d25171b85b4f7f8fde459575cba233', true);
                xhttp.send();
            }
        }, {
            key: 'setCategory',
            value: function setCategory(selected) {
                var _this2 = this;

                var value = selected.value;

                this.setState({ activeCategory: value }, function () {
                    var defaultBasemap = _this2.createBasemapOptions().reverse()[0];
                    _this2.setState({ activePlanetBasemap: defaultBasemap, activePlanetCategory: selected }, function () {
                        _MapActions.mapActions.changeBasemap({
                            title: defaultBasemap.label,
                            url: defaultBasemap.value
                        });
                    });
                });
            }
        }, {
            key: 'getPlanetBasemaps',
            value: function getPlanetBasemaps() {
                var defaultBasemap = this.createBasemapOptions().reverse()[0];
                this.setState({ activePlanetBasemap: defaultBasemap }, function () {
                    _MapActions.mapActions.changeBasemap({
                        title: defaultBasemap.label,
                        url: defaultBasemap.value
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

                var dict = {
                    1: 'JAN-MAR',
                    2: 'APR-JUN',
                    3: 'JUL-SEP',
                    4: 'OCT-DEC'
                };

                if (yearQuarter === undefined) {
                    return title;
                } else {
                    var _yearQuarter$split = yearQuarter.split('q'),
                        _yearQuarter$split2 = _slicedToArray(_yearQuarter$split, 2),
                        year = _yearQuarter$split2[0],
                        quarter = _yearQuarter$split2[1];

                    var label = dict[quarter] + ' ' + year;
                    return label;
                }
            }
        }, {
            key: 'createBasemapOptions',
            value: function createBasemapOptions() {
                var _this3 = this;

                var _props = this.props,
                    monthlyBasemaps = _props.monthlyBasemaps,
                    quarterlyBasemaps = _props.quarterlyBasemaps;
                var activeCategory = this.state.activeCategory;

                var filterBasemaps = activeCategory === 'PLANET-MONTHLY' ? monthlyBasemaps : quarterlyBasemaps;
                return filterBasemaps.map(function (basemap) {
                    var url = basemap.url,
                        title = basemap.title;

                    var label = activeCategory === 'PLANET-MONTHLY' ? _this3.parseMonthlyTitle(title) : _this3.parseQuarterlyTitle(title);
                    return {
                        value: url,
                        label: label
                    };
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _state = this.state,
                    activePlanetBasemap = _state.activePlanetBasemap,
                    activePlanetCategory = _state.activePlanetCategory;
                var active = this.props.active;


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
                                value: activePlanetCategory,
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
                                options: this.createBasemapOptions().reverse(),
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