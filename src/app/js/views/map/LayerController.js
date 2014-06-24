/* global define */
define([
	"dojo/on",
	"dojo/dom",
	"dojo/query",
	"dijit/registry",
	"views/map/MapConfig"
], function (on, dom, dojoQuery, registry, MapConfig) {

	var _map;

	return {

		setMap: function (map) {
			_map = map;
		},

		toggleLayerVisibility: function (layerId, visibility) {
				var layer = _map.getLayer(layerId);
      	if (layer) {
      			if (layer.visible !== visibility) {
      				  layer.setVisibility(visibility);
      			}
      	}
		},

		updateFiresLayer: function (updateVisibleLayers) {
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
	      }

	      if (updateVisibleLayers) {
	          if (checkboxStatus) {
	              visibleLayers = [0,1];
	          } else {
	              visibleLayers = [0,1,2,3];
	          }
	          if (layer) {
	              layer.setVisibleLayers(visibleLayers);
	          }
	      }
		},

		updateAdditionalVisibleLayers: function (queryClass, configObject) {
			var layer = _map.getLayer(configObject.id),
					treeCoverLayer = _map.getLayer(MapConfig.treeCoverLayer.id),
					treeCoverVisible = false,
					visibleLayers = [],
					layerID;

			dojoQuery("." + queryClass).forEach(function (node) {
				if (node.checked) {
					layerID = configObject[node.value];
					if (layerID) {
						visibleLayers.push(layerID);
					}
				}
				if (node.id === "tree-cover-density-radio") {
					treeCoverVisible = node.checked;
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

		updateTreeCoverLayer: function (visibility) {
			this.toggleLayerVisibility(MapConfig.treeCoverLayer.id, visibility);
		},

		updateLegend: function (layer, title) {

		}

	};

});