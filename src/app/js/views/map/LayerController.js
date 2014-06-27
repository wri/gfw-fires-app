/* global define */
define([
    "dojo/on",
    "dojo/dom",
    "dojo/query",
    "dijit/registry",
    "views/map/MapConfig",
    "esri/layers/LayerDrawingOptions"
], function(on, dom, dojoQuery, registry, MapConfig, LayerDrawingOptions) {

    var _map;

    return {

        setMap: function(map) {
            _map = map;
        },

        refreshLegend: function() {
            var legendLayer = _map.getLayer(MapConfig.landCoverLayers.id),
                visibleLayers = legendLayer.visibleLayers,
                layerDrawingOption = new esri.layers.LayerDrawingOptions(),
                optionsArray = [];
            layerDrawingOption.transparency = 0;

            if (_map.getLayer(MapConfig.treeCoverLayer.id).visible) {
                visibleLayers.push(29);
                optionsArray[29] = layerDrawingOption;
                legendLayer.setVisibleLayers(visibleLayers);
                legendLayer.setLayerDrawingOptions(optionsArray);
            } else {
                if (visibleLayers.indexOf(29) > -1) {
                    visibleLayers.splice(visibleLayers.indexOf(29), 1);
                    legendLayer.setVisibleLayers(visibleLayers);
                }
                legendLayer.setVisibleLayers(visibleLayers);
            }

            if (_map.getLayer(MapConfig.primaryForestsLayer.id).visible) {
                visibleLayers.push(33);
                optionsArray[33] = layerDrawingOption;
                legendLayer.setVisibleLayers(visibleLayers);
                legendLayer.setLayerDrawingOptions(optionsArray);
            } else {
                if (visibleLayers.indexOf(33) > -1) {
                    visibleLayers.splice(visibleLayers.indexOf(33), 1);
                    legendLayer.setVisibleLayers(visibleLayers);
                }
                legendLayer.setVisibleLayers(visibleLayers);
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
                time = new Date(),
                checkboxStatus = dom.byId("confidence-fires-checkbox").checked,
                defs = [],
                dateString = "",
                where = "",
                visibleLayers,
                layer;

            switch (node.id) {
                case "fires72":
                    dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate() - 3) + " " +
                        time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
                    where += "ACQ_DATE > date '" + dateString + "'";
                    break;
                case "fires48":
                    dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate() - 2) + " " +
                        time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
                    where += "ACQ_DATE > date '" + dateString + "'";
                    break;
                case "fires24":
                    dateString = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + (time.getDate() - 1) + " " +
                        time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
                    where += "ACQ_DATE > date '" + dateString + "'";
                    break;
                default:
                    where = "1 = 1";
                    break;
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

        updateTreeCoverLayer: function(visibility) {
            this.toggleLayerVisibility(MapConfig.treeCoverLayer.id, visibility);
            this.refreshLegend();
        },

        updatePrimaryForestsLayer: function(visibility) {
            this.toggleLayerVisibility(MapConfig.primaryForestsLayer.id, visibility);
            this.refreshLegend();
        },

        updateLegend: function(layer, title) {

        }

    };

});