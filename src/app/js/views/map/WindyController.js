/* global define */
define([
    "dojo/on",
    "dojo/dom",
    "dojo/cookie",
    "dojo/Deferred",
    "dijit/Dialog",
    "dijit/form/CheckBox",
    "dijit/registry",
    "esri/request",
    "utils/Helper",
    "utils/RasterLayer",
    "views/map/MapModel",
    "modules/ErrorController",
    "views/map/LayerController",
    "libs/windy"
], function(on, dom, cookie, Deferred, Dialog, CheckBox, registry, esriRequest, Helper, RasterLayer, MapModel, ErrorController, LayerController) {

    var _map,
        _isSupported,
        _handles,
        _raster,
        _windy,
        _data,
        WIND_CONFIG = {
            dataUrl: 'http://suitability-mapper.s3.amazonaws.com/wind/wind-surface-level-gfs-1.0.gz.json',
            id: "Wind_Direction",
            opacity: 0.85,
            mapLoaderId: 'map_loader',
            mapLoaderContainer: 'map-container'
        };

    return {

        setMap: function(map) {
            _map = map;
        },

        toggleWindLayer: function(checked) {

            if (_isSupported === undefined) {
                _isSupported = this.supportsCanvas();
                // Check for Canvas Support, if not supported, diasble the checkbox and show a message beneath it
                if (_isSupported === false) {
                    registry.byId("windy-layer-checkbox").set('checked', false);
                    registry.byId("windy-layer-checkbox").set('disabled', true);
                    ErrorController.show(10, "This browser does not support this feature. " +
                        "Visit <a target='_blank' href='http://www.caniuse.com/#search=canvas'>caniuse.com</a> for supported browsers.");
                }
            }

            if (checked) {
                /*console.log("initial call!");
                var dates = MapModel.vm.windObserv();
                var reportdates = dates.split("/");
                var datesFormatted = reportdates[2].toString() + reportdates[0].toString() + reportdates[1].toString();
                console.log(datesFormatted);

                //WindyController.WIND_CONFIG.dataUrl = "http://suitability-mapper.s3.amazonaws.com/wind/wind-surface-level-gfs-" + datesFormatted + "1.0.gz.json";
                var updatedURL = "http://suitability-mapper.s3.amazonaws.com/wind/archive/wind-surface-level-gfs-" + datesFormatted + ".1-0.gz.json";

                this.activateWindLayer(updatedURL);*/
                this.activateWindLayer();
                LayerController.updateLayersInHash('add', WIND_CONFIG.id, WIND_CONFIG.id);
            } else {
                this.deactivateWindLayer();
                LayerController.updateLayersInHash('remove', WIND_CONFIG.id, WIND_CONFIG.id);
            }
        },

        activateWindLayer: function(updatedURL) {

            var self = this;

            function createWindLayer() {
                _raster = new RasterLayer(null, {
                    opacity: WIND_CONFIG.opacity,
                    id: WIND_CONFIG.id
                });

                _map.addLayer(_raster);

                _handles = [];
                _handles.push(_map.on('extent-change', self.redraw));
                _handles.push(_map.on('zoom-start', self.redraw));
                _handles.push(_map.on('pan-start', self.redraw));

                _windy = new Windy({
                    canvas: _raster._element,
                    data: _data
                });

                self.redraw();
                self.toggleLegend(true);

            }

            if (updatedURL) {
                // TODO: If we're calling the INITIAL data fetch WITH an updatedURL parameter, we need to then also add the promptAboutBasemap.then() statement per 5 lines down.
                this.promptAboutBasemap().then(function() {
                    self.fetchDataForWindLayer(updatedURL).then(createWindLayer);
                });
                return;
            }

            if (!_data) {
                console.log("fetching data then creating");
                this.promptAboutBasemap().then(function() {
                    self.fetchDataForWindLayer().then(createWindLayer);
                });
            } else {
                console.log("just promptinggg then creating");
                this.promptAboutBasemap().then(createWindLayer);
            }
        },

        promptAboutBasemap: function() {
            if (registry.byId("windLayerBasemapDialog")) {
                registry.byId("windLayerBasemapDialog").destroy();
            }
            var dialog = new Dialog({
                    title: "Would you like to change basemaps?",
                    style: "width: 350px",
                    id: "windLayerBasemapDialog",
                    content: "This layer is best visualized with the Dark Gray Canvas basemap." +
                        "  Would you like to switch to it now.<div class='dijitDialogPaneActionBar'>" +
                        "<button id='acceptBasemapChange'>Yes</button><button id='denyBasemapChange'>No</button></div>" +
                        "<div class='dialogCheckbox'><input type='checkbox' id='rememberBasemapDecision' />" +
                        "<label for='rememberBasemapDecision'>Remember my decision</label></div>"
                }),
                deferred = new Deferred(),
                changeBasemaps,
                destroyDialog,
                currentCookie,
                setCookie,
                yesHandle,
                noHandle,
                cancel,
                cbox;

            setCookie = function(cookieValue) {
                if (dom.byId("rememberBasemapDecision")) {
                    if (dom.byId("rememberBasemapDecision").checked && cookieValue) {
                        cookie("windBasemapDecision", cookieValue, {
                            expires: 7
                        });
                    }
                }
            };

            destroyDialog = function(cancelFromButtons) {
                if (cbox) {
                    cbox.destroy();
                }
                if (yesHandle) {
                    yesHandle.remove();
                }
                if (noHandle) {
                    noHandle.remove();
                }
                if (cancelFromButtons) {
                    dialog.destroy();
                }
            };

            cancel = function(set) {
                if (set) {
                    setCookie("dontChange");
                }
                destroyDialog(set);
                deferred.resolve();
            };

            changeBasemaps = function() {
                setCookie("changeBasemap");
                destroyDialog(true);
                deferred.resolve();
                var currentBasemap = registry.byId("basemap-gallery").getSelected();
                debugger;
                if (currentBasemap) {

                    if (currentBasemap.id !== "galleryNode_basemap_6") {
                        registry.byId("basemap-gallery").select("basemap_6");
                    }
                } else {
                    registry.byId("basemap-gallery").select("basemap_6");
                }
            };

            currentCookie = cookie("windBasemapDecision");

            var currentSelectedBasemap;
            if (registry.byId("basemap-gallery").getSelected()) {

                currentSelectedBasemap = registry.byId("basemap-gallery").getSelected().id;
            } else {
                currentSelectedBasemap = "topo";
            }

            if (currentCookie === undefined && (currentSelectedBasemap !== "basemap_6")) {
                dialog.show();
                cbox = new CheckBox({
                    checked: false,
                }, "rememberBasemapDecision");
                yesHandle = on(dom.byId("acceptBasemapChange"), "click", changeBasemaps);
                noHandle = on(dom.byId("denyBasemapChange"), "click", function() {
                    cancel(true);
                });
                dialog.on('cancel', function() {
                    cancel(false);
                });
            } else if (currentCookie === "changeBasemap") {
                changeBasemaps();
            } else {
                cancel(false);
            }

            return deferred.promise;
        },

        deactivateWindLayer: function() {
            var layer = _map.getLayer(WIND_CONFIG.id);
            if (layer) {
                _map.removeLayer(layer);
                _raster = undefined;
                _windy = undefined;
                for (var i = _handles.length - 1; i >= 0; i--) {
                    _handles[i].remove();
                }
            }
            this.toggleLegend(false);
        },

        fetchDataForWindLayer: function(optionalURL) {

            Helper.showLoader(WIND_CONFIG.mapLoaderContainer, WIND_CONFIG.mapLoaderId);
            if (optionalURL) {
                WIND_CONFIG.dataUrl = optionalURL;
                //console.log(WIND_CONFIG.dataUrl);
            }

            console.log(WIND_CONFIG.dataUrl);

            var deferred = new Deferred(),
                req = new esriRequest({
                    url: WIND_CONFIG.dataUrl,
                    content: {},
                    handleAs: 'json'
                });

            req.then(function(res) {
                _data = res;
                deferred.resolve(true);
                Helper.hideLoader(WIND_CONFIG.mapLoaderId);
            }, function(err) {
                console.error(err);
                deferred.resolve(false);
                Helper.hideLoader(WIND_CONFIG.mapLoaderId);
            });


            return deferred.promise;
        },

        redraw: function() {

            if (_raster) {

                _raster._element.height = _map.height;
                _raster._element.width = _map.width;

                _windy.stop();

                var extent = _map.geographicExtent;

                setTimeout(function() {
                    _windy.start(
                        [
                            [0, 0],
                            [_map.width, _map.height]
                        ],
                        _map.width,
                        _map.height, [
                            [extent.xmin, extent.ymin],
                            [extent.xmax, extent.ymax]
                        ]
                    );
                }, 500);
            }

        },

        toggleLegend: function(show) {
            if (show) {
                MapModel.set('showWindLegend', true);
            } else {
                MapModel.set('showWindLegend', false);
            }
        },

        supportsCanvas: function() {
            return !!document.createElement("canvas").getContext;
        }

    };

});