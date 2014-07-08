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

            // If Land_Cover Slider was adjusted, set opacity on Tree Cover Image Service and Primary Forests Image Service
            // as well as it is under the same slider in UI and should have it's transparency the same as the other Land_Cover layers
            if (layerId === 'Land_Cover') {
                layer = _map.getLayer(MapConfig.treeCoverLayer.id);
                if (layer) {
                    layer.setOpacity(opaqueValue);
                }
                layer = _map.getLayer(MapConfig.primaryForestsLayer.id);
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
            symbol = new PictureSymbol({
                "angle": 0,
                "xoffset": 0,
                "yoffset": 10,
                "type": "esriPMS",
                "imageData": "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1MzA4NzI3NkQyN0MxMUUwQUU5NUVFMEYwMTY0NzUwNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1MzA4NzI3N0QyN0MxMUUwQUU5NUVFMEYwMTY0NzUwNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjUzMDg3Mjc0RDI3QzExRTBBRTk1RUUwRjAxNjQ3NTA1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjUzMDg3Mjc1RDI3QzExRTBBRTk1RUUwRjAxNjQ3NTA1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQg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",
                "contentType": "image/png",
                "width": 24,
                "height": 24
            });
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