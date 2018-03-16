define(['exports', 'react', 'actions/AnalysisActions', 'actions/MapActions'], function (exports, _react, _AnalysisActions, _MapActions) {
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

    var PlanetBasemaps = function (_React$Component) {
        _inherits(PlanetBasemaps, _React$Component);

        function PlanetBasemaps(props) {
            _classCallCheck(this, PlanetBasemaps);

            var _this = _possibleConstructorReturn(this, (PlanetBasemaps.__proto__ || Object.getPrototypeOf(PlanetBasemaps)).call(this, props));

            _this.getBasemaps = function () {
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
                            _AnalysisActions.analysisActions.savePlanetBasemaps(basemaps);
                        } else {
                            console.log('Error retrieving planet basemaps.');
                        }
                    }
                };
                xhttp.open('GET', 'https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=d4d25171b85b4f7f8fde459575cba233', true);
                xhttp.send();
            };

            _this.renderBasemapOptions = function () {
                var basemaps = _this.props.basemaps;
                var activePlanetBasemap = _this.state.activePlanetBasemap;

                return basemaps.map(function (basemap, idx) {
                    var url = basemap.url,
                        title = basemap.title;

                    return _react2.default.createElement(
                        'div',
                        {
                            key: idx,
                            className: 'analysis-planet__option ' + (activePlanetBasemap === title ? 'planet__option-active' : ''),
                            'data-basemap': url,
                            onClick: _this.handleBasemap
                        },
                        title
                    );
                });
            };

            _this.handleBasemap = function (evt) {
                var url = evt.currentTarget.getAttribute('data-basemap');
                var choice = _this.props.basemaps.find(function (basemap) {
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
                activePlanetBasemap: ''
            };
            return _this;
        }

        _createClass(PlanetBasemaps, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                this.getBasemaps();
            }
        }, {
            key: 'render',
            value: function render() {
                var visible = this.props.visible;

                return _react2.default.createElement(
                    'div',
                    { className: 'analysis-planet__container ' + (visible ? '' : 'hidden') },
                    this.renderBasemapOptions()
                );
            }
        }]);

        return PlanetBasemaps;
    }(_react2.default.Component);

    exports.default = PlanetBasemaps;
});