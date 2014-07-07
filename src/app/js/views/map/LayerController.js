/* global define */
define([
    "dojo/on",
    "dojo/dom",
    "dojo/query",
    "dojo/_base/array",
    "dijit/registry",
    "views/map/MapConfig",
    "esri/layers/LayerDrawingOptions",
    // Temporary Modules to add Graphic to Map
    "esri/graphic",
    "esri/geometry/Point",
    "esri/symbols/PictureMarkerSymbol"

], function(on, dom, dojoQuery, arrayUtils, registry, MapConfig, LayerDrawingOptions, Graphic, Point, PictureSymbol) {

    var _map;

    return {

        setMap: function(map) {
            _map = map;
        },

        refreshLegend: function() {
            var legendLayer = _map.getLayer(MapConfig.landCoverLayers.id),
                visibleLayers = legendLayer.visibleLayers,
                layerDrawingOption = new esri.layers.LayerDrawingOptions(),
                optionsArray = [],
                numArray = [29, 33],
                num;
            layerDrawingOption.transparency = 0;

            if (_map.getLayer(MapConfig.treeCoverLayer.id).visible) {
                num = 29;
            }
            if (_map.getLayer(MapConfig.primaryForestsLayer.id).visible) {
                num = 33;
            }

            arrayUtils.forEach(numArray, function(n) {
                if (visibleLayers.indexOf(n) > -1) {
                    visibleLayers.splice(visibleLayers.indexOf(n), 1);
                    legendLayer.setVisibleLayers(visibleLayers);
                }
            });

            if (_map.getLayer(MapConfig.treeCoverLayer.id).visible || _map.getLayer(MapConfig.primaryForestsLayer.id).visible) {
                visibleLayers.push(num);
                optionsArray[num] = layerDrawingOption;
                legendLayer.setVisibleLayers(visibleLayers);
                legendLayer.setLayerDrawingOptions(optionsArray);
            }

            registry.byId("legend").refresh();
        },

        setTransparency: function(layerId, value) {
            var opaqueValue = Math.floor(value) / 100,
                layer = _map.getLayer(layerId);

            if (layer) {
                layer.setOpacity(opaqueValue);
            }

            // If Land_Cover Slider was adjusted, set opacity on Tree Cover Image Service as well as it is under
            // the same slider in UI and should have it's transparency the same as the other Land_Cover layers
            if (layerId === 'Land_Cover') {
                layer = _map.getLayer(MapConfig.treeCoverLayer.id);
                if (layer) {
                    layer.setOpacity(opaqueValue);
                }
            }
        },

        toggleLayerVisibility: function(layerId, visibility) {
            var layer = _map.getLayer(layerId);
            if (layer) {
                if (layer.visible !== visibility) {
                    layer.setVisibility(visibility);
                }
            }
            this.refreshLegend();
        },

        updateFiresLayer: function(updateVisibleLayers) {
            var node = dojoQuery(".selected-fire-option")[0],
                checkboxStatus = dom.byId("confidence-fires-checkbox").checked,
                defs = [],
                where = "",
                visibleLayers,
                layer;

            var today = new Date();
            var backdate = new Date();

            switch (node.id) {
                case "fires72":
                    backdate.setDate(today.getDate() - 3);

                    break;

                case "fires48":
                    backdate.setDate(today.getDate() - 2);

                    break;

                case "fires24":
                    backdate.setDate(today.getDate() - 1);

                    break;
                default:
                    where = "1 = 1";
                    break;
            }

            if (arrayUtils.indexOf(["fires72", "fires48", "fires24"], node.id) > -1) {

                var yyyy = backdate.getFullYear();

                var mm = "00" + (backdate.getMonth() + 1).toString();
                mm = mm.substr(mm.length - 2);

                var dd = "00" + backdate.getDate().toString();
                dd = dd.substr(dd.length - 2);

                var hh = backdate.getHours();
                var min = backdate.getMinutes();
                var ss = backdate.getSeconds();


                var dateString = yyyy.toString() + "-" + mm + "-" + dd + " " + hh + ":" + min + ":" + ss;
                where += "ACQ_DATE > date '" + dateString + "'";

            }

            for (var i = 0, length = MapConfig.firesLayer.defaultLayers.length; i < length; i++) {
                defs[i] = where;
            }

            layer = _map.getLayer(MapConfig.firesLayer.id);

            if (layer) {
                layer.setLayerDefinitions(defs);
                if (!updateVisibleLayers) {
                    this.refreshLegend();
                }
            }

            if (updateVisibleLayers) {
                if (checkboxStatus) {
                    visibleLayers = [0, 1];
                } else {
                    visibleLayers = [0, 1, 2, 3];
                }
                if (layer) {
                    layer.setVisibleLayers(visibleLayers);
                }
                this.refreshLegend();
            }
        },

        updateAdditionalVisibleLayers: function(queryClass, configObject) {
            var layer = _map.getLayer(configObject.id),
                treeCoverLayer = _map.getLayer(MapConfig.treeCoverLayer.id),
                primaryForestsLayer = _map.getLayer(MapConfig.primaryForestsLayer.id),
                treeCoverVisible = false,
                priamryForestsVisible = false,
                visibleLayers = [],
                layerID;

            dojoQuery("." + queryClass).forEach(function(node) {
                if (node.checked) {
                    layerID = configObject[node.value];
                    if (layerID) {
                        visibleLayers.push(layerID);
                    }
                }
                if (node.id === "tree-cover-density-radio") {
                    treeCoverVisible = node.checked;
                }
                if (node.id === "primary-forests-radio") {
                    primaryForestsVisible = node.checked;
                }
            });

            if (visibleLayers.length === 0) {
                // If nothing checked, turn all layers off
                visibleLayers.push(-1);
            }

            if (layer) {
                layer.setVisibleLayers(visibleLayers);
                if (!layer.visible) {
                    this.toggleLayerVisibility(configObject.id, true);
                }
            }

            if (treeCoverVisible !== treeCoverLayer.visible) {
                this.updateTreeCoverLayer(treeCoverVisible);
            }

            if (primaryForestsVisible !== primaryForestsLayer.visible) {
                this.updatePrimaryForestsLayer(primaryForestsVisible);
            }

            this.refreshLegend();

        },

        // updateForestUseLayers: function (evt) {
        // 	var layer = _map.getLayer(MapConfig.forestUseLayers.id),
        // 			visibleLayers = [],
        // 			layerID;

        // 	dojoQuery(".forest-use-layers-option").forEach(function (node) {
        // 		if (node.checked) {
        // 			layerID = MapConfig.forestUseLayers[node.value];
        // 			if (layerID) {
        // 				visibleLayers.push(layerID);
        // 			}
        // 		}
        // 	});

        // 	if (visibleLayers.length === 0) {
        // 		// If nothing checked, turn all layers off
        // 		visibleLayers.push(-1);
        // 	}

        // 	if (layer) {
        // 		layer.setVisibleLayers(visibleLayers);
        // 		if (!layer.visible) {
        // 			this.toggleLayerVisibility(MapConfig.forestUseLayers.id, true);
        // 		}
        // 	}

        // },

        // updateConservationLayers: function (evt) {
        // 	var layer = _map.getLayer(MapConfig.conservationLayers.id),					
        // 			visibleLayers = [],
        // 			layerID;

        // 	dojoQuery(".conservation-layers-option").forEach(function (node) {
        // 		if (node.checked) {
        // 			layerID = MapConfig.conservationLayers[node.value];
        // 			if (layerID) {
        // 				visibleLayers.push(layerID);
        // 			}
        // 		}
        // 	});

        // 	if (visibleLayers.length === 0) {
        // 		// If nothing checked, turn all layers off
        // 		visibleLayers.push(-1);
        // 	}

        // 	if (layer) {
        // 		layer.setVisibleLayers(visibleLayers);
        // 		if (!layer.visible) {
        // 			this.toggleLayerVisibility(MapConfig.conservationLayers.id, true);
        // 		}
        // 	}

        // },

        // updateLandCoverLayers: function (evt) {
        // 	var layer = _map.getLayer(MapConfig.landCoverLayers.id),
        // 			treeCoverLayer = _map.getLayer(MapConfig.treeCoverLayer.id),
        // 			treeCoverVisible = false,
        // 			visibleLayers = [],
        // 			layerID;

        // 	dojoQuery(".land-cover-layers-option").forEach(function (node) {
        // 		if (node.checked) {
        // 			layerID = MapConfig.treeCoverLayer[node.value];
        // 			if (layerID) {
        // 				visibleLayers.push(layerID);
        // 			}
        // 		}
        // 		if (node.id === "tree-cover-density-radio") {
        // 			treeCoverVisible = node.checked;
        // 		}
        // 	});

        // 	if (visibleLayers.length === 0) {
        // 		// If nothing checked, turn all layers off
        // 		visibleLayers.push(-1);
        // 	}

        // 	if (layer) {
        // 		layer.setVisibleLayers(visibleLayers);
        // 		if (!layer.visible) {
        // 			this.toggleLayerVisibility(MapConfig.forestUseLayers.id, true);
        // 		}
        // 	}

        // 	if (treeCoverVisible !== treeCoverLayer.visible) {
        // 		this.updateTreeCoverLayer(treeCoverVisible);
        // 	}

        // },

        toggleDigitalGlobeLayer: function (visibility) {
            this.toggleLayerVisibility(MapConfig.digitalGlobe.id, visibility);
            if (visibility) {
                this.addTemporaryGraphicForDigitalGlobe();
            } else {
                this.removeDigitalGlobeTemporaryGraphic();
            }
        },

        updateTreeCoverLayer: function(visibility) {
            this.toggleLayerVisibility(MapConfig.treeCoverLayer.id, visibility);
        },

        updatePrimaryForestsLayer: function(visibility) {
            this.toggleLayerVisibility(MapConfig.primaryForestsLayer.id, visibility);
        },

        addTemporaryGraphicForDigitalGlobe: function () {
            var graphic, point, symbol;

            point = new Point(100.45, 2.015);
            symbol = new PictureSymbol('app/images/map-pin.png', 15 , 30);
            graphic = new Graphic(point, symbol, {
                id: 'temp_graphic'
            });
            _map.graphics.add(graphic);
        },

        removeDigitalGlobeTemporaryGraphic: function () {
            arrayUtils.forEach(_map.graphics.graphics, function (g) {
                if (g.attributes) {
                    if (g.attributes.id === 'temp_graphic') {
                        _map.graphics.remove(g);
                    }
                }
            });
        },

        updateLegend: function(layer, title) {

        }

    };

});